/**
 * Utilities for managing context windows for RAG and LLM interactions
 * and standardizing LLM response formats
 */

/**
 * Maximum number of items to include in context windows
 */
export const MAX_CONTEXT_ITEMS = 20;

/**
 * Default timeout for LLM requests in milliseconds (30 seconds)
 */
export const DEFAULT_LLM_TIMEOUT = 30000;

/**
 * Truncates data arrays to be suitable for context windows
 * @param data Array of data items to truncate
 * @param maxItems Maximum number of items to include
 * @returns Truncated array
 */
export function truncateDataForContext<T>(data: T[], maxItems: number = MAX_CONTEXT_ITEMS): T[] {
  if (!data || data.length === 0) return [];
  
  // If the data is already within limits, return as is
  if (data.length <= maxItems) return data;
  
  // Otherwise truncate to the specified limit
  return data.slice(0, maxItems);
}

/**
 * Estimates the token count of a string
 * This is a very rough estimate (about 4 characters per token)
 * @param text Text to estimate tokens for
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Truncates text to fit within a token limit
 * @param text Text to truncate
 * @param maxTokens Maximum tokens to allow
 * @returns Truncated text
 */
export function truncateToTokenLimit(text: string, maxTokens: number = 1000): string {
  if (!text) return '';
  
  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= maxTokens) return text;
  
  // Truncate to approximate character count
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars) + '...';
}

/**
 * Response validation error types
 */
export enum ResponseValidationErrorType {
  MISSING_FIELD = 'missing_field',
  INVALID_FORMAT = 'invalid_format',
  PARSING_ERROR = 'parsing_error',
  TIMEOUT = 'timeout',
  API_ERROR = 'api_error',
}

/**
 * Response validation error
 */
export interface ResponseValidationError {
  type: ResponseValidationErrorType;
  message: string;
  field?: string;
  raw?: any;
}

/**
 * Schema definition for response validation
 */
export interface ResponseSchema {
  requiredFields: string[];
  optionalFields?: string[];
  nestedSchemas?: Record<string, ResponseSchema>;
}

/**
 * Default schema for RAG responses
 */
export const DEFAULT_RAG_SCHEMA: ResponseSchema = {
  requiredFields: ['naturalLanguageAnswer', 'confidence'],
  optionalFields: ['structuredData', 'actions'],
  nestedSchemas: {
    actions: {
      requiredFields: ['type', 'label']
    }
  }
};

/**
 * Confidence level interpretation
 */
export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Parses JSON from a string with error handling
 * @param jsonString String containing JSON
 * @returns Parsed object or null if parsing failed
 */
export function safeJsonParse(jsonString: string): { data: any; error?: ResponseValidationError } {
  try {
    const data = JSON.parse(jsonString);
    return { data };
  } catch (e) {
    return {
      data: null,
      error: {
        type: ResponseValidationErrorType.PARSING_ERROR,
        message: `Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`,
        raw: jsonString,
      }
    };
  }
}

/**
 * Validates a response object against a schema
 * @param response Response object to validate
 * @param schema Schema to validate against
 * @returns Validation result with errors if any
 */
export function validateResponse(
  response: any, 
  schema: ResponseSchema = DEFAULT_RAG_SCHEMA
): { valid: boolean; errors: ResponseValidationError[] } {
  const errors: ResponseValidationError[] = [];
  
  if (!response) {
    errors.push({
      type: ResponseValidationErrorType.INVALID_FORMAT,
      message: 'Response is null or undefined',
    });
    return { valid: false, errors };
  }
  
  // Check required fields
  for (const field of schema.requiredFields) {
    if (response[field] === undefined) {
      errors.push({
        type: ResponseValidationErrorType.MISSING_FIELD,
        message: `Required field '${field}' is missing`,
        field,
      });
    }
  }
  
  // Check nested schemas
  if (schema.nestedSchemas) {
    for (const [field, nestedSchema] of Object.entries(schema.nestedSchemas)) {
      // Skip if the field doesn't exist (it might be optional)
      if (!response[field]) continue;
      
      // If it's an array, validate each item
      if (Array.isArray(response[field])) {
        response[field].forEach((item: any, index: number) => {
          const result = validateResponse(item, nestedSchema);
          if (!result.valid) {
            errors.push({
              type: ResponseValidationErrorType.INVALID_FORMAT,
              message: `Item ${index} in array '${field}' failed validation`,
              field: `${field}[${index}]`,
              raw: result.errors,
            });
          }
        });
      } 
      // Otherwise validate as a single object
      else {
        const result = validateResponse(response[field], nestedSchema);
        if (!result.valid) {
          errors.push({
            type: ResponseValidationErrorType.INVALID_FORMAT,
            message: `Nested object '${field}' failed validation`,
            field,
            raw: result.errors,
          });
        }
      }
    }
  }
  
  return { 
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Interprets a confidence score into a qualitative level
 * @param score Numerical confidence score (0-1)
 * @returns Confidence level interpretation
 */
export function interpretConfidence(score: number): ConfidenceLevel {
  if (score >= 0.8) return ConfidenceLevel.HIGH;
  if (score >= 0.5) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}

/**
 * Creates a standardized error response when the LLM fails
 * @param error The error that occurred
 * @param query The original query (optional)
 * @returns A formatted error response
 */
export function createErrorResponse(
  error: Error | ResponseValidationError | string,
  query?: string
): any {
  const errorMessage = typeof error === 'string' 
    ? error 
    : 'message' in error 
      ? error.message 
      : String(error);
  
  const errorType = typeof error === 'object' && 'type' in error
    ? error.type
    : ResponseValidationErrorType.API_ERROR;
  
  // Create a safe user-facing message without sensitive details
  const userMessage = "I'm sorry, but I couldn't process that request properly.";
  
  // Log the detailed error for debugging (would go to server logs)
  console.error(`LLM Error: ${errorMessage}`, {
    query,
    errorType,
    timestamp: new Date().toISOString(),
  });
  
  // Return a standardized error response
  return {
    naturalLanguageAnswer: userMessage,
    confidence: 0,
    error: {
      type: errorType,
      // Don't expose internal error messages to client
      userMessage,
    }
  };
}
