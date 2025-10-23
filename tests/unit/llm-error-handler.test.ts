/**
 * Unit tests for LLM error handler
 * 
 * These tests validate the functionality of the error handler utilities,
 * including error categorization, error responses, and fallback behaviors.
 */

import { 
  LLMError, 
  LLMErrorCategory, 
  handleOpenAIError,
  getFallbackResponse
} from '../../src/utils/llm-error-handler';

describe('LLM Error Handler', () => {
  describe('LLMError', () => {
    test('should create an error with proper category', () => {
      const error = new LLMError(
        "Rate limit exceeded", 
        LLMErrorCategory.RATE_LIMIT
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.category).toBe(LLMErrorCategory.RATE_LIMIT);
      expect(error.retryable).toBe(false); // Default value
    });
    
    test('should set status code and retryable flag', () => {
      const error = new LLMError(
        "Service error", 
        LLMErrorCategory.CONNECTION,
        503,
        true
      );
      
      expect(error.message).toBe("Service error");
      expect(error.statusCode).toBe(503);
      expect(error.retryable).toBe(true);
    });
  });
  
  describe('handleOpenAIError', () => {
    test('should categorize rate limit errors by status code', () => {
      const openAIError = {
        message: "Rate limit exceeded",
        status: 429
      };
      const handled = handleOpenAIError(openAIError);
      
      expect(handled).toBeInstanceOf(LLMError);
      expect(handled.category).toBe(LLMErrorCategory.RATE_LIMIT);
      expect(handled.retryable).toBe(true);
    });
    
    test('should categorize timeout errors by message', () => {
      const openAIError = new Error("Request timeout after 30000ms");
      const handled = handleOpenAIError(openAIError);
      
      expect(handled.category).toBe(LLMErrorCategory.TIMEOUT);
      expect(handled.statusCode).toBe(408);
    });
    
    test('should categorize authentication errors', () => {
      const openAIError = {
        message: "Invalid API key",
        status: 401
      };
      const handled = handleOpenAIError(openAIError);
      
      expect(handled.category).toBe(LLMErrorCategory.AUTHORIZATION);
    });
    
    test('should categorize general errors', () => {
      const generalError = new Error("Some other error");
      const handled = handleOpenAIError(generalError);
      
      expect(handled.category).toBe(LLMErrorCategory.UNKNOWN);
    });
  });
  
  describe('getFallbackResponse', () => {
    test('should generate fallback for rate limit errors', () => {
      const error = new LLMError(
        "Rate limit exceeded", 
        LLMErrorCategory.RATE_LIMIT
      );
      
      const fallback = getFallbackResponse(error);
      
      expect(fallback).toContain("high demand");
      expect(fallback).toContain("try again");
    });
    
    test('should generate fallback for timeout errors', () => {
      const error = new LLMError(
        "Request timed out", 
        LLMErrorCategory.TIMEOUT
      );
      
      const fallback = getFallbackResponse(error);
      
      expect(fallback).toContain("too long");
      expect(fallback).toContain("simplify");
    });
    
    test('should generate generic fallback for unknown errors', () => {
      const error = new LLMError(
        "Unknown error", 
        LLMErrorCategory.UNKNOWN
      );
      
      const fallback = getFallbackResponse(error);
      
      expect(fallback).toContain("I'm sorry");
    });
  });
});
