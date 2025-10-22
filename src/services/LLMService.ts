

import OpenAI from 'openai';
import { validateEnvironment, getOpenAIModel, getRAGSystemPrompt } from '../utils/environment';

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
  context?: string;
  attendanceData?: any[];
  alertData?: any[];
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
  private client: OpenAI;
  private messageHistory: MessageHistoryEntry[] = [];
  private initialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Validate environment before initializing
    const { isValid, message } = validateEnvironment();
    if (!isValid) {
      throw new Error(`LLMService initialization failed: ${message}`);
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize system prompt
    this.initializeSystemPrompt();
    this.initialized = true;
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
   */
  private initializeSystemPrompt(): void {
    const systemPrompt = getRAGSystemPrompt();
    
    const systemMessage: MessageHistoryEntry = {
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now()
    };

    // Clear any existing history and set system prompt
    this.messageHistory = [systemMessage];
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

      console.log('[LLM] Processing query:', request.query);

      // Build context-enhanced prompt
      const userMessage = this.buildContextualPrompt(request);
      
      // Add to message history
      this.addMessage('user', userMessage);

      // Call OpenAI API
      const messages = this.messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const completion = await this.client.chat.completions.create({
        model: getOpenAIModel(),
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      // Extract response content
      const responseContent = completion.choices[0].message.content;
      
      if (!responseContent) {
        throw new Error('Empty response from OpenAI API');
      }

      // Add assistant response to history
      this.addMessage('assistant', responseContent);

      // Parse and validate response
      const response = this.parseResponse(responseContent);
      
      console.log('[LLM] Response processed successfully');
      return response;

    } catch (error) {
      console.error('[LLM] Error processing query:', error);
      
      // Return graceful error response
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
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
  private trimMessageHistoryIfNeeded(maxMessages: number = 10): void {
    if (this.messageHistory.length > maxMessages) {
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
Please provide a helpful response in JSON format with these fields:
- naturalLanguageAnswer: A human-readable response to the query
- structuredData: Relevant data extracted or processed from the query
- suggestedActions: Array of suggested actions the user can take
- confidence: Number between 0-1 indicating your confidence in the response
`;

    return prompt;
  }

  /**
   * Parse and validate LLM response
   */
  private parseResponse(responseContent: string): LLMResponse {
    try {
      // Parse JSON response
      const parsedResponse = JSON.parse(responseContent);
      
      // Validate required fields with fallbacks
      return {
        naturalLanguageAnswer: parsedResponse.naturalLanguageAnswer || 'No answer provided',
        structuredData: parsedResponse.structuredData || null,
        suggestedActions: Array.isArray(parsedResponse.suggestedActions) 
          ? parsedResponse.suggestedActions 
          : [],
        confidence: typeof parsedResponse.confidence === 'number' 
          ? Math.max(0, Math.min(1, parsedResponse.confidence)) // Ensure between 0-1
          : 0.5 // Default confidence
      };
    } catch (error) {
      console.error('[LLM] Error parsing response:', error);
      console.error('Raw response content:', responseContent);
      
      // Return graceful error response
      return this.createErrorResponse('Failed to parse LLM response');
    }
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

// Export singleton instance accessor
export const getLLMService = (): LLMService => LLMService.getInstance();
