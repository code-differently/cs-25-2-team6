/**
 * Validator integration for RAG service responses
 * This module integrates the attendance output validator with the RAG service
 */

import { validateAttendanceOutput, ValidationResult } from './attendance-output-validator';

/**
 * Post-process a RAG service response to ensure it meets quality standards
 * @param response The RAG service response to validate
 * @param options Configuration options
 * @returns The validated and potentially fixed response
 */
export function validateAndFixRagResponse(response: any, options: { 
  autoFix?: boolean;
  throwOnError?: boolean;
  logValidation?: boolean;
} = {}) {
  const { autoFix = true, throwOnError = false, logValidation = true } = options;
  
  // Skip validation for empty or error responses
  if (!response || !response.naturalLanguageAnswer || !response.structuredData) {
    return response;
  }
  
  try {
    // Validate the output
    const validationResult = validateAttendanceOutput(response, { autoFix });
    
    // Log validation results if enabled
    if (logValidation) {
      console.log(`[RAG Validator] Output validation: ${validationResult.valid ? 'PASSED' : 'FAILED'}`);
      if (validationResult.issues.length > 0) {
        console.log(`[RAG Validator] Found ${validationResult.issues.length} issues:`);
        validationResult.issues.forEach(issue => {
          console.log(`[RAG Validator] - ${issue.level.toUpperCase()}: ${issue.message}`);
        });
      }
    }
    
    // Apply auto-fixes if available and enabled
    if (autoFix && validationResult.autoFixes?.applied) {
      if (logValidation) {
        console.log(`[RAG Validator] Applied ${validationResult.autoFixes.details.length} fixes`);
      }
      
      // Fix confidence if it's missing or zero
      let confidence = response.confidence;
      if (!confidence || confidence === 0) {
        // Set a reasonable confidence based on validation results
        confidence = validationResult.valid ? 0.8 : 0.6;
        console.log(`[RAG Validator] Fixed missing confidence: ${confidence}`);
      }
      
      // Return the fixed response
      return {
        ...response,
        confidence,
        structuredData: validationResult.autoFixes.fixedStructuredData || response.structuredData,
        _validation: {
          applied: true,
          valid: validationResult.valid,
          issues: validationResult.issues.length,
          fixes: validationResult.autoFixes.details.length
        }
      };
    }
    
    // Handle validation failures
    if (!validationResult.valid && throwOnError) {
      throw new Error(`RAG response validation failed with ${validationResult.issues.length} issues`);
    }
    
    // Fix confidence if it's missing or zero (even for non-auto-fixed responses)
    let confidence = response.confidence;
    if (!confidence || confidence === 0) {
      // Set a reasonable confidence based on validation results
      confidence = validationResult.valid ? 0.8 : 0.6;
      console.log(`[RAG Validator] Fixed missing confidence: ${confidence}`);
    }
    
    // Add validation metadata to the response
    return {
      ...response,
      confidence,
      _validation: {
        applied: true,
        valid: validationResult.valid,
        issues: validationResult.issues.length,
        fixes: 0
      }
    };
    
  } catch (error) {
    console.error('[RAG Validator] Error validating response:', error);
    if (throwOnError) {
      throw error;
    }
    
    // Return the original response on error
    return {
      ...response,
      _validation: {
        applied: false,
        error: error instanceof Error ? error.message : 'Unknown error during validation'
      }
    };
  }
}
