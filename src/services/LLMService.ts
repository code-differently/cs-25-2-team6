/**
 * LLMService: Core service for OpenAI interactions
 * Implements singleton pattern for efficient API client management
 */

import { OpenAI } from 'openai';
import { validateEnvironment, getRAGSystemPrompt } from '../utils/environment';
import { LLMServiceConfig, DEFAULT_CONFIG, loadConfigFromEnvironment } from './LLMServiceConfig';
import { sanitizeQuery, isHarmfulQuery } from './QuerySanitizer';
import { validateLLMResponse, sanitizeLLMResponse, extractLLMResponseFromText } from './LLMResponseValidator';
import { retryAsync } from '../utils/retry';
import { 
  DEFAULT_LLM_TIMEOUT,
  createErrorResponse as createStandardErrorResponse
} from '../utils/context-management';
import { 
  formatLLMResponse, 
  LLM_REQUEST_TIMEOUT 
} from '../utils/response-formatter';
import { 
  LLMError, 
  LLMErrorCategory, 
  handleOpenAIError, 
  getFallbackResponse
} from '../utils/llm-error-handler';
import { RAGResponse, SuggestedAction } from './RAGService';

// Response type definitions
export interface LLMResponse {
  naturalLanguageAnswer: string;
  structuredData: any;
  suggestedActions: string[];
  confidence: number;
}

// Request type definitions
export interface LLMRequest {
  query: string;
  context?: string;       // Context information for the query
  queryContext?: string;  // Context identifier for selecting the appropriate system prompt
  attendanceData?: any[];
  alertData?: any[];
  options?: {
    priority?: 'high' | 'normal' | 'low';  // Priority for processing
    bypassSanitization?: boolean;          // Whether to bypass query sanitization
    maxTokens?: number;                    // Override default max tokens
    temperature?: number;                  // Override default temperature
  };
}

// Message history interfaces
export interface MessageHistoryEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * LLMService - Singleton service for OpenAI interactions
 */
export class LLMService {
  private static instance: LLMService;
  private client!: OpenAI; // Using definite assignment assertion
  private messageHistory: MessageHistoryEntry[] = [];
  private initialized: boolean = false;
  private config!: LLMServiceConfig; // Using definite assignment assertion

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    try {
      // Validate environment before initializing
      const { isValid, message, useFallback } = validateEnvironment();
      
      // Load configuration even if environment is invalid
      this.config = loadConfigFromEnvironment();
      
      if (!isValid) {
        console.warn(`LLMService initialization warning: ${message}`);
        
        // If in mock mode or fallback is explicitly enabled, continue without API key
        if (process.env.ENABLE_MOCK_LLM === 'true' || useFallback) {
          console.log('[LLM] Running in mock mode - OpenAI API will not be called');
          this.initialized = true;
          this.initializeSystemPrompt();
          return; // Exit constructor early, leaving client undefined
        }
      }
  
      // Get the API key from environment
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error('Missing OpenAI API key. Set OPENAI_API_KEY in your environment.');
        throw new Error('OpenAI API key is required');
      }
      
      // Initialize OpenAI client
      this.client = new OpenAI({
        apiKey: apiKey,
      });
  
      if (this.config.debug) {
        console.log('[LLM] Service initialized with config:', {
          model: this.config.openai.model,
          temperature: this.config.openai.temperature,
          maxTokens: this.config.openai.maxTokens
        });
      }
  
      // Initialize system prompt
      this.initializeSystemPrompt();
      this.initialized = true;
      
      console.log('[LLM] Service successfully initialized');
    } catch (error) {
      console.error('Error initializing LLMService:', error);
      // Set initialized to false to indicate failure
      this.initialized = false;
      // The API route will handle this gracefully
      throw error;
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Initialize system prompt
   * @param context Optional context to select the appropriate system prompt
   */
  private initializeSystemPrompt(context: string = 'general'): void {
    const systemPrompt = getRAGSystemPrompt(context);
    
    const systemMessage: MessageHistoryEntry = {
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now()
    };

    // Clear any existing history and set system prompt
    this.messageHistory = [systemMessage];
  }
  
  /**
   * Update system prompt based on context
   * @param context Context identifier to select appropriate system prompt
   */
  public updateSystemPrompt(context: string): void {
    // Get the first message which should be the system prompt
    const firstMessage = this.messageHistory[0];
    
    if (firstMessage && firstMessage.role === 'system') {
      // Replace the existing system prompt
      firstMessage.content = getRAGSystemPrompt(context);
      firstMessage.timestamp = Date.now();
    } else {
      // No system prompt found, initialize it
      this.initializeSystemPrompt(context);
    }
  }

  /**
   * Process a natural language query
   * @param request LLMRequest object containing query and optional context
   * @returns Promise resolving to LLMResponse
   */
  public async processQuery(request: LLMRequest): Promise<LLMResponse> {
    try {
      if (!this.initialized) {
        throw new Error('LLMService not properly initialized');
      }

      // Sanitize input query
      const sanitizedQuery = sanitizeQuery(request.query);
      
      // Check for harmful content
      if (isHarmfulQuery(sanitizedQuery)) {
        return this.createErrorResponse('I cannot process queries that may have harmful intent.');
      }

      if (this.config.debug) {
        console.log('[LLM] Processing query:', sanitizedQuery);
      }
      
      // Check if we're in mock mode
      if (process.env.ENABLE_MOCK_LLM === 'true' || !this.client) {
        console.log('[LLM] Using mock response mode - OpenAI API will not be called');
        return this.generateMockResponse(request);
      }

      // If a specific query context is provided, update the system prompt
      if (request.queryContext) {
        if (this.config.debug) {
          console.log(`[LLM] Updating system prompt with context: ${request.queryContext}`);
        }
        this.updateSystemPrompt(request.queryContext);
      }

      // Build context-enhanced prompt with sanitized query
      const modifiedRequest = { ...request, query: sanitizedQuery };
      const userMessage = this.buildContextualPrompt(modifiedRequest);
      
      // Add to message history
      this.addMessage('user', userMessage);

      // Prepare messages for API call
      const messages = this.messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create API call options
      const apiRequestOptions: any = {
        model: this.config.openai.model,
        messages,
        temperature: this.config.openai.temperature,
        max_tokens: this.config.openai.maxTokens,
        top_p: this.config.openai.topP,
        frequency_penalty: this.config.openai.frequencyPenalty,
        presence_penalty: this.config.openai.presencePenalty,
      };
      
      // Only add response_format for models that support it
      // GPT-4 Turbo and newer models support JSON response format
      const supportsJsonFormat = (
        this.config.openai.model.includes('gpt-4-turbo') || 
        this.config.openai.model.includes('gpt-4-0125') ||
        this.config.openai.model.includes('gpt-4-1106') ||
        this.config.openai.model.includes('gpt-3.5-turbo-1106')
      );
      
      if (supportsJsonFormat) {
        apiRequestOptions.response_format = { type: "json_object" };
        if (this.config.debug) {
          console.log(`[LLM] Using JSON response format with model: ${this.config.openai.model}`);
        }
      } else {
        if (this.config.debug) {
          console.log(`[LLM] Model ${this.config.openai.model} doesn't support JSON response format, using default format`);
        }
      }

      // Create a promise that will resolve with the API response
      const apiResponsePromise = retryAsync(
        async () => this.client.chat.completions.create(apiRequestOptions),
        {
          maxRetries: this.config.openai.maxRetries,
          baseDelay: this.config.openai.retryDelay,
          onRetry: (attempt, delay, error) => {
            console.warn(`[LLM] Retry attempt ${attempt} after ${delay}ms delay:`, error.message);
          }
        }
      );

      // Process the raw response with our formatting and validation utilities
      const formattedResponse = await formatLLMResponse(
        // This promise will extract and process the content from the API response
        apiResponsePromise.then(completion => {
          const responseContent = completion.choices[0].message.content;
          
          if (!responseContent) {
            throw new Error('Empty response from OpenAI API');
          }
          
          // Add assistant response to history
          this.addMessage('assistant', responseContent);
          
          // Return the raw content for further processing
          return responseContent;
        }),
        {
          timeout: this.config.openai.timeout || LLM_REQUEST_TIMEOUT,
          defaultConfidence: 0.7
        }
      );
      
      if (this.config.debug) {
        console.log('[LLM] Response processed successfully with confidence:', formattedResponse.confidence);
      }
      
      // Convert RAGResponse to LLMResponse format
      // Ensure we have a valid confidence score (>0)
      let confidenceScore = formattedResponse.confidence;
      
      // If confidence is 0, missing, or invalid, provide a sensible default
      if (confidenceScore === undefined || 
          confidenceScore === null || 
          confidenceScore === 0 || 
          isNaN(confidenceScore)) {
        // Calculate confidence based on response quality
        confidenceScore = this.calculateConfidenceScore(formattedResponse);
        console.log(`[LLM] Fixed invalid confidence score to: ${confidenceScore}`);
      }
      
      const llmResponse: LLMResponse = {
        naturalLanguageAnswer: formattedResponse.naturalLanguageAnswer,
        structuredData: formattedResponse.structuredData || null,
        suggestedActions: formattedResponse.actions ? 
          formattedResponse.actions.map(action => action.label) : 
          [],
        confidence: confidenceScore
      };
      
      return llmResponse;

    } catch (error) {
      console.error('[LLM] Error processing query:', error);
      
      // Create a standardized error response
      let llmError: LLMError;
      
      if (error instanceof LLMError) {
        llmError = error;
      } else if (error instanceof Error && error.cause && typeof error.cause === 'object') {
        // Handle OpenAI API errors
        llmError = handleOpenAIError(error.cause);
      } else {
        // Generic error handling
        llmError = new LLMError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          LLMErrorCategory.UNKNOWN
        );
      }
      
      // Get appropriate fallback message
      const userMessage = getFallbackResponse(llmError);
      
      // Log the error for monitoring but don't expose sensitive details
      if (this.config.debug) {
        console.log(`[LLM] Providing fallback response for error category: ${llmError.category}`);
      }
      
      // Return formatted error response
      return this.createErrorResponse(userMessage);
    }
  }

  /**
   * Add message to history with timestamp
   */
  private addMessage(role: 'system' | 'user' | 'assistant', content: string): void {
    this.messageHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Keep message history from growing too large
    this.trimMessageHistoryIfNeeded();
  }

  /**
   * Trim message history if it exceeds max length
   * Keeps the system prompt and most recent messages
   */
  private trimMessageHistoryIfNeeded(): void {
    const maxMessages = this.config.maxHistoryMessages;
    
    if (this.messageHistory.length > maxMessages) {
      if (this.config.debug) {
        console.log(`[LLM] Trimming message history from ${this.messageHistory.length} to ${maxMessages} messages`);
      }
      
      const systemMessage = this.messageHistory.find(msg => msg.role === 'system');
      const recentMessages = this.messageHistory
        .filter(msg => msg.role !== 'system')
        .slice(-(maxMessages - 1));
      
      this.messageHistory = systemMessage 
        ? [systemMessage, ...recentMessages] 
        : recentMessages;
    }
  }

  /**
   * Build contextual prompt from request
   */
  private buildContextualPrompt(request: LLMRequest): string {
    let prompt = `QUERY: ${request.query}\n\n`;

    // Add context if provided
    if (request.context) {
      prompt += `CONTEXT: ${request.context}\n\n`;
    }

    // Add attendance data if provided
    if (request.attendanceData && request.attendanceData.length > 0) {
      prompt += `ATTENDANCE DATA: ${JSON.stringify(request.attendanceData, null, 2)}\n\n`;
    }

    // Add alert data if provided
    if (request.alertData && request.alertData.length > 0) {
      prompt += `ALERT DATA: ${JSON.stringify(request.alertData, null, 2)}\n\n`;
    }

    prompt += `
IMPORTANT: You must format your entire response as a valid JSON object with these fields:
{
  "naturalLanguageAnswer": "A detailed, conversational response that thoroughly explains all information in the structuredData field",
  "structuredData": {}, // Comprehensive data with specific details about the query
  "suggestedActions": [], // Specific, actionable next steps with clear guidance
  "confidence": 0.0 // Number between 0-1 indicating your confidence in the response
}

RESPONSE GUIDELINES:
1. Make your naturalLanguageAnswer comprehensive and detailed
2. Always explain ALL data points included in structuredData thoroughly
3. Use natural, conversational language as if speaking directly to an educator
4. Include specific examples and names when available
5. Format your response for easy reading with appropriate organization

If you are unsure how to respond or encounter an error, use this fallback format:
{
  "naturalLanguageAnswer": "I'm not able to process this query at the moment. [Explanation]",
  "structuredData": null,
  "suggestedActions": ["Try rephrasing your question", "Be more specific"],
  "confidence": 0.0
}

DO NOT include any text outside the JSON object. Your entire response must be parseable as JSON.
`;

    return prompt;
  }

  /**
   * Parse and validate LLM response
   */
  private parseResponse(responseContent: string): LLMResponse {
    try {
      // Try to extract and validate the response
      const extractedResponse = extractLLMResponseFromText(responseContent);
      
      // Check if the response is valid
      if (!validateLLMResponse(extractedResponse)) {
        if (this.config.debug) {
          console.warn('[LLM] Invalid response structure, sanitizing:', responseContent);
        }
        
        // Sanitize the response if it's invalid
        return sanitizeLLMResponse(extractedResponse);
      }
      
      return extractedResponse;
    } catch (error) {
      console.error('[LLM] Error parsing response:', error);
      
      if (this.config.debug) {
        console.error('Raw response content:', responseContent);
      }
      
      // Return graceful error response
      return this.createErrorResponse('Failed to parse LLM response');
    }
  }

  /**
   * Calculate a confidence score based on response quality
   * This provides a heuristic estimate when the model doesn't return a confidence value
   */
  private calculateConfidenceScore(response: any): number {
    // Default moderate confidence
    let confidence = 0.7;
    
    // Check for quality indicators
    if (!response.naturalLanguageAnswer || response.naturalLanguageAnswer.length < 20) {
      confidence = 0.4; // Lower confidence for very short answers
    }
    
    // Check for detailed structured data
    if (response.structuredData) {
      // More detailed structured data means higher confidence
      const hasStudents = response.structuredData.students || 
                          (Array.isArray(response.structuredData) && 
                          response.structuredData.length > 0 && 
                          response.structuredData[0].firstName);
                          
      const hasAlerts = response.structuredData.alerts || 
                        (Array.isArray(response.structuredData) && 
                        response.structuredData.length > 0 && 
                        response.structuredData[0].alertType);
      
      if (hasStudents || hasAlerts) {
        confidence = Math.min(confidence + 0.2, 0.9); // Boost confidence for detailed data
      }
    }
    
    // Lower confidence if no structured data at all
    if (!response.structuredData) {
      confidence = Math.max(confidence - 0.2, 0.5);
    }
    
    // Lower confidence if no suggested actions
    if (!response.actions || !Array.isArray(response.actions) || response.actions.length === 0) {
      confidence = Math.max(confidence - 0.1, 0.5);
    }
    
    return confidence;
  }
  
  /**
   * Create error response
   */
  private createErrorResponse(errorMessage: string): LLMResponse {
    return {
      naturalLanguageAnswer: `I'm sorry, but I encountered an error: ${errorMessage}. Please try again or rephrase your question.`,
      structuredData: null,
      suggestedActions: [
        'Try rephrasing your question',
        'Check if your question is related to attendance data',
        'Verify the data provided is correct'
      ],
      confidence: 0
    };
  }
  
  /**
   * Generate a mock response for testing without API
   * This is used when ENABLE_MOCK_LLM=true or when OpenAI API key is missing
   */
  private generateMockResponse(request: LLMRequest): LLMResponse {
    // Log that we're using a mock response
    console.log('[LLM] Generating mock response for request:', request);

    let response = '';
    let suggestedActions: string[] = [];
    let structuredData: any = {};
    let confidence = 0.95;

    // Use alertData if present
    if (request.alertData && request.alertData.length > 0) {
      // Build a detailed, consistent answer from the actual alert data
      response = `There are ${request.alertData.length} active attendance alerts in the system.\n`;
      response += request.alertData.map((a: any) => {
        const name = `${a.studentFirstName || a.studentName || ''} ${a.studentLastName || ''}`.trim();
        const id = a.studentId ? `(${a.studentId})` : '';
        const type = a.type || 'Alert';
        const status = a.status || '';
        const absenceDates = a.details?.absenceDates && a.details.absenceDates.length > 0
          ? `Absent on: ${a.details.absenceDates.map((d: string) => new Date(d).toISOString().split('T')[0]).join(', ')}`
          : '';
        const tardyDates = a.details?.tardyDates && a.details.tardyDates.length > 0
          ? `Late on: ${a.details.tardyDates.map((d: string) => new Date(d).toISOString().split('T')[0]).join(', ')}`
          : '';
        const threshold = a.details?.threshold ? `Threshold: ${a.details.threshold}` : '';
        const pattern = a.details?.pattern ? `Pattern: ${a.details.pattern}` : '';
        return `- ${name} ${id}: ${type} (${status})${absenceDates ? ", " + absenceDates : ''}${tardyDates ? ", " + tardyDates : ''}${threshold ? ", " + threshold : ''}${pattern ? ", " + pattern : ''}`;
      }).join('\n');
      suggestedActions = ['Review all alerts', 'Modify alert thresholds', 'Disable notifications'];
      structuredData = { alerts: request.alertData, total: request.alertData.length };
    } else if (request.attendanceData && request.attendanceData.length > 0) {
      response = `There are ${request.attendanceData.length} attendance records.\n` +
        request.attendanceData.slice(0, 5).map((rec: any) => `${rec.studentFirstName || ''} ${rec.studentLastName || ''}: ${rec.status} on ${rec.dateISO || rec.date}`).join('\n');
      suggestedActions = ['View detailed attendance reports', 'Check student absences', 'Set up attendance alerts'];
      structuredData = { records: request.attendanceData, total: request.attendanceData.length };
    } else if ((request as any).students && (request as any).students.length > 0) {
      const students = (request as any).students;
      response = `There are ${students.length} students in the system.\n` +
        students.slice(0, 10).map((s: any) => `${s.firstName} ${s.lastName} (ID: ${s.id})`).join('\n');
      suggestedActions = ['View student details', 'Generate performance report', 'Compare to previous term'];
      structuredData = { students, total: students.length };
    } else {
      // Fallback to keyword-based mock
      const lowerQuery = request.query.toLowerCase();
      if (lowerQuery.includes('attendance') || lowerQuery.includes('present') || lowerQuery.includes('absent')) {
        response = 'Based on the attendance records, the overall attendance rate is 85%. There were 5 absences last week.';
        suggestedActions = ['View detailed attendance reports', 'Check student absences', 'Set up attendance alerts'];
        structuredData = {
          attendanceRate: "85%",
          absences: 5,
          period: "last week"
        };
      } else if (lowerQuery.includes('student') || lowerQuery.includes('performance')) {
        response = 'Student performance data shows an average score of 78% across all subjects. Mathematics has the highest average at 82%.';
        suggestedActions = ['View student details', 'Generate performance report', 'Compare to previous term'];
        structuredData = {
          averageScore: "78%",
          highestSubject: "Mathematics",
          highestScore: "82%"
        };
      } else if (lowerQuery.includes('report') || lowerQuery.includes('summary')) {
        response = 'I\'ve prepared a summary report for you. The data indicates normal attendance patterns with no significant anomalies this month.';
        suggestedActions = ['Download full report', 'Share with staff', 'Schedule regular reports'];
        structuredData = {
          reportType: "summary",
          period: "current month",
          status: "normal"
        };
      } else if (lowerQuery.includes('alert') || lowerQuery.includes('notification')) {
        response = 'There are 3 active alerts in the system. One student has triggered the attendance threshold alert.';
        suggestedActions = ['Review all alerts', 'Modify alert thresholds', 'Disable notifications'];
        structuredData = {
          alertCount: 3,
          criticalAlerts: 1,
          type: "attendance threshold"
        };
      } else {
        response = 'I\'m here to help with attendance and student performance data. How can I assist you today?';
        suggestedActions = ['Check attendance records', 'Generate reports', 'Set up alerts'];
        confidence = 0.7;
      }
    }

    // Add a disclaimer about mock mode
    response += '\n\n[Note: This is a mock response for testing. OpenAI API is not being used.]';

    return {
      naturalLanguageAnswer: response,
      structuredData,
      suggestedActions,
      confidence
    };
  }

  /**
   * Reset conversation history
   */
  public resetConversation(): void {
    this.initializeSystemPrompt();
  }

  /**
   * Get conversation history length
   */
  public getConversationLength(): number {
    return this.messageHistory.length;
  }
}

// Export singleton instance
/**
 * Gets the LLM service instance with error handling
 * @returns LLM service instance or throws an error if initialization fails
 */
export const getLLMService = (): LLMService => {
  try {
    return LLMService.getInstance();
  } catch (error) {
    console.error('Failed to get LLM service instance:', error);
    throw new LLMError(
      'LLM service initialization failed. Check API key and environment.',
      LLMErrorCategory.SERVICE_INTEGRATION,
      500,
      false
    );
  }
};
