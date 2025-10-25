/**
 * Schema validation for LLM responses
 * Ensures responses match expected structure
 */

import { LLMResponse } from './LLMService';

/**
 * Validates an LLM response against the expected schema
 * @param response The response object to validate
 * @returns True if valid, false if not
 */
export function validateLLMResponse(response: any): boolean {
  // Check if response has all required fields
  if (!response || typeof response !== 'object') return false;
  
  // Check naturalLanguageAnswer field
  if (typeof response.naturalLanguageAnswer !== 'string' || 
      response.naturalLanguageAnswer.trim() === '') {
    return false;
  }
  
  // Check suggestedActions field
  if (!Array.isArray(response.suggestedActions)) {
    return false;
  }
  
  // Check confidence field
  if (typeof response.confidence !== 'number' || 
      response.confidence < 0 || 
      response.confidence > 1) {
    return false;
  }
  
  // structuredData can be null or an object
  if (response.structuredData !== null && 
      (typeof response.structuredData !== 'object' || Array.isArray(response.structuredData))) {
    return false;
  }
  
  return true;
}

/**
 * Creates a valid LLM response object from a potentially invalid one
 * @param response The response object to sanitize
 * @returns A valid LLM response object
 */
export function sanitizeLLMResponse(response: any): LLMResponse {
  return {
    naturalLanguageAnswer: typeof response?.naturalLanguageAnswer === 'string' 
      ? response.naturalLanguageAnswer 
      : 'No valid response was generated.',
      
    structuredData: (response?.structuredData !== null && typeof response?.structuredData === 'object')
      ? response.structuredData
      : null,
      
    suggestedActions: Array.isArray(response?.suggestedActions)
      ? response.suggestedActions.filter((action: any) => typeof action === 'string')
      : [],
      
    confidence: typeof response?.confidence === 'number' && response.confidence >= 0 && response.confidence <= 1
      ? response.confidence
      : 0.5
  };
}

/**
 * Extract a structured response from potentially malformed JSON text
 * Uses error recovery techniques to salvage data when possible
 * @param jsonText The text containing JSON (potentially malformed)
 * @returns A sanitized LLM response object
 */
export function extractLLMResponseFromText(jsonText: string): LLMResponse {
  try {
    // Attempt to parse the JSON directly
    const parsedJson = JSON.parse(jsonText);
    return sanitizeLLMResponse(parsedJson);
  } catch (error) {
    // If direct parsing fails, try to extract the JSON portion
    try {
      // Look for JSON-like structure using regex
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = JSON.parse(jsonMatch[0]);
        return sanitizeLLMResponse(extractedJson);
      }
    } catch (innerError) {
      // Both parsing attempts failed
      console.error('Failed to extract valid JSON from LLM response');
    }
    
    // Return fallback response
    return {
      naturalLanguageAnswer: "I couldn't generate a proper response. Please try again or rephrase your question.",
      structuredData: null,
      suggestedActions: [
        "Try asking a different question",
        "Check if your question is related to attendance data",
        "Be more specific in your query"
      ],
      confidence: 0.1
    };
  }
}
