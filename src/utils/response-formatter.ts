/**
 * Response formatter utilities for standardizing LLM responses
 * and ensuring they match our expected API formats
 */

import { 
  ResponseValidationError, 
  ResponseValidationErrorType, 
  validateResponse, 
  DEFAULT_RAG_SCHEMA,
  interpretConfidence,
  createErrorResponse,
  safeJsonParse
} from '../utils/context-management';
import { RAGResponse, SuggestedAction } from '../services/RAGService';

/**
 * Default timeout duration for LLM requests in milliseconds
 */
export const LLM_REQUEST_TIMEOUT = 30000;

/**
 * Options for response formatting
 */
export interface FormatResponseOptions {
  timeout?: number;
  schema?: any;
  defaultConfidence?: number;
}

/**
 * Formats and validates a raw LLM response into our standardized format
 * @param rawResponse Raw response from LLM service
 * @param options Formatting options
 * @returns Standardized and validated response
 */
export async function formatLLMResponse(
  rawResponsePromise: Promise<any>,
  options: FormatResponseOptions = {}
): Promise<RAGResponse> {
  const { 
    timeout = LLM_REQUEST_TIMEOUT,
    schema = DEFAULT_RAG_SCHEMA,
    defaultConfidence = 0.7
  } = options;
  
  try {
    // Add timeout handling
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`LLM request timed out after ${timeout}ms`));
      }, timeout);
    });
    
    // Race the LLM response against the timeout
    const rawResponse = await Promise.race([rawResponsePromise, timeoutPromise]);
    
    // Handle different response formats
    let processedResponse: any;
    
    // Handle string responses (parse as JSON if possible)
    if (typeof rawResponse === 'string') {
      // Try to extract JSON from the response (some models might return text with JSON embedded)
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                      rawResponse.match(/\{[\s\S]*\}/);
      
      const jsonContent = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : rawResponse;
      
      const { data, error } = safeJsonParse(jsonContent);
      if (error) {
        // If it's not valid JSON, treat the string as the natural language answer
        console.log("[Response Formatter] Received non-JSON response, treating as plain text");
        processedResponse = {
          naturalLanguageAnswer: rawResponse,
          confidence: defaultConfidence
        };
      } else {
        console.log("[Response Formatter] Successfully parsed JSON from response");
        processedResponse = data;
      }
    } else {
      processedResponse = rawResponse;
    }
    
    // Validate the response against our schema
    const validation = validateResponse(processedResponse, schema);
    
    if (!validation.valid) {
      console.warn('LLM response validation failed:', validation.errors);
      
      // Try to salvage what we can from the response
      const salvaged: RAGResponse = {
        naturalLanguageAnswer: 
          typeof processedResponse === 'string' ? processedResponse :
          processedResponse?.naturalLanguageAnswer || 
          processedResponse?.answer ||
          processedResponse?.text ||
          processedResponse?.content ||
          'I could not generate a proper response for your query.',
        confidence: processedResponse?.confidence || defaultConfidence,
      };
      
      // Add any structured data if available
      if (processedResponse?.structuredData) {
        salvaged.structuredData = processedResponse.structuredData;
      }
      
      // Add any actions if available and in correct format
      if (Array.isArray(processedResponse?.actions)) {
        const validActions = processedResponse.actions.filter((action: any) => 
          action && typeof action === 'object' && action.type && action.label
        );
        if (validActions.length > 0) {
          salvaged.actions = validActions as SuggestedAction[];
        }
      }
      
      return salvaged;
    }
    
    // Return the valid response
    return processedResponse as RAGResponse;
  } catch (error) {
    console.error('Error formatting LLM response:', error);
    
    // Create standardized error response
    return createErrorResponse(
      error instanceof Error 
        ? error 
        : { 
            type: ResponseValidationErrorType.API_ERROR, 
            message: 'Unknown error formatting LLM response' 
          }
    ) as RAGResponse;
  }
}

/**
 * Extracts structured data from a response or falls back gracefully
 * @param response The response to extract from
 * @param fallback Fallback value if extraction fails
 * @returns Extracted structured data or fallback
 */
export function extractStructuredData<T>(response: RAGResponse, fallback: T): T {
  try {
    if (!response.structuredData) return fallback;
    return response.structuredData as T;
  } catch (error) {
    console.warn('Failed to extract structured data:', error);
    return fallback;
  }
}
