/**
 * Error handling utilities for LLM service interactions
 */

import { ResponseValidationErrorType } from './context-management';

/**
 * LLM Error Categories
 */
export enum LLMErrorCategory {
  // API and service errors
  CONNECTION = 'connection',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CONTENT_FILTER = 'content_filter',
  VALIDATION = 'validation',
  PARSING = 'parsing',
  
  // Integration errors
  DATA_RETRIEVAL = 'data_retrieval',
  CONTEXT_PREPARATION = 'context_preparation',
  QUERY_PROCESSING = 'query_processing',
  SERVICE_INTEGRATION = 'service_integration',
  
  // Fallback
  UNKNOWN = 'unknown',
}

/**
 * LLM Error with categorization
 */
export class LLMError extends Error {
  category: LLMErrorCategory;
  statusCode?: number;
  retryable: boolean;
  
  constructor(
    message: string,
    category: LLMErrorCategory = LLMErrorCategory.UNKNOWN,
    statusCode?: number,
    retryable = false
  ) {
    super(message);
    this.name = 'LLMError';
    this.category = category;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Maps OpenAI API errors to our standardized format
 * @param error The error from OpenAI API
 * @returns Standardized LLM error
 */
export function handleOpenAIError(error: any): LLMError {
  // Extract useful information from the error
  const statusCode = error.status || error.statusCode;
  const message = error.message || 'Unknown OpenAI API error';
  
  // Handle specific error types based on status code and message patterns
  if (!statusCode) {
    if (message.includes('timeout')) {
      return new LLMError(
        'Request to OpenAI API timed out',
        LLMErrorCategory.TIMEOUT,
        408,
        true
      );
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return new LLMError(
        'Network error when connecting to OpenAI API',
        LLMErrorCategory.CONNECTION,
        0,
        true
      );
    }
  }
  
  switch (statusCode) {
    case 401:
      return new LLMError(
        'Authentication error with OpenAI API',
        LLMErrorCategory.AUTHORIZATION,
        401,
        false
      );
      
    case 429:
      return new LLMError(
        'Rate limit exceeded with OpenAI API',
        LLMErrorCategory.RATE_LIMIT,
        429,
        true
      );
      
    case 400:
      if (message.includes('content filter') || message.includes('moderation')) {
        return new LLMError(
          'Content was flagged by OpenAI content filters',
          LLMErrorCategory.CONTENT_FILTER,
          400,
          false
        );
      }
      return new LLMError(
        'Invalid request to OpenAI API',
        LLMErrorCategory.VALIDATION,
        400,
        false
      );
      
    case 500:
    case 502:
    case 503:
    case 504:
      return new LLMError(
        'OpenAI API service error',
        LLMErrorCategory.CONNECTION,
        statusCode,
        true
      );
      
    default:
      return new LLMError(
        `OpenAI API error: ${message}`,
        LLMErrorCategory.UNKNOWN,
        statusCode,
        statusCode ? statusCode >= 500 : false
      );
  }
}

/**
 * Maps validation errors to LLM errors
 * @param error The validation error
 * @returns Standardized LLM error
 */
export function handleValidationError(error: any): LLMError {
  if (error.type === ResponseValidationErrorType.PARSING_ERROR) {
    return new LLMError(
      'Failed to parse LLM response',
      LLMErrorCategory.PARSING,
      undefined,
      false
    );
  }
  
  if (error.type === ResponseValidationErrorType.MISSING_FIELD) {
    return new LLMError(
      `Missing required field in LLM response: ${error.field || 'unknown'}`,
      LLMErrorCategory.VALIDATION,
      undefined,
      false
    );
  }
  
  if (error.type === ResponseValidationErrorType.INVALID_FORMAT) {
    return new LLMError(
      'Invalid format in LLM response',
      LLMErrorCategory.VALIDATION,
      undefined,
      false
    );
  }
  
  if (error.type === ResponseValidationErrorType.TIMEOUT) {
    return new LLMError(
      'LLM request timed out',
      LLMErrorCategory.TIMEOUT,
      408,
      true
    );
  }
  
  return new LLMError(
    `Validation error: ${error.message || 'Unknown validation error'}`,
    LLMErrorCategory.VALIDATION,
    undefined,
    false
  );
}

/**
 * Generate a user-friendly fallback response based on error category
 * @param error The LLM error
 * @returns User-friendly response message
 */
export function getFallbackResponse(error: LLMError): string {
  switch (error.category) {
    // API-related errors
    case LLMErrorCategory.TIMEOUT:
      return "I'm sorry, but the request took too long to process. Please try again or simplify your query.";
      
    case LLMErrorCategory.RATE_LIMIT:
      return "I'm currently experiencing high demand. Please try again in a moment.";
      
    case LLMErrorCategory.CONNECTION:
      return "I'm having trouble connecting to my knowledge base right now. Please try again shortly.";
      
    case LLMErrorCategory.CONTENT_FILTER:
      return "I'm unable to provide a response to that query based on content guidelines.";
    
    // Integration-related errors  
    case LLMErrorCategory.DATA_RETRIEVAL:
      return "I couldn't retrieve the necessary attendance data to answer your question. Please verify the student records are available.";
      
    case LLMErrorCategory.CONTEXT_PREPARATION:
      return "I had trouble processing the attendance records. Please check that the date ranges and formats in your query are valid.";
      
    case LLMErrorCategory.QUERY_PROCESSING:
      return "I couldn't properly interpret your question. Could you please rephrase it with specific dates, student names, or attendance types?";
      
    case LLMErrorCategory.SERVICE_INTEGRATION:
      return "There was an issue connecting the attendance database with the analysis service. Please try again later.";
    
    // Other errors
    case LLMErrorCategory.AUTHORIZATION:
    case LLMErrorCategory.VALIDATION:
    case LLMErrorCategory.PARSING:
    case LLMErrorCategory.UNKNOWN:
    default:
      return "I apologize, but I'm unable to process that request right now. Our team has been notified of the issue.";
  }
}
