/**
 * Response adapter utilities for converting between different response formats
 * in the application (RAGResponse, LLMResponse, etc.)
 */

import { LLMResponse } from '../services/LLMService';
import { RAGResponse, SuggestedAction } from '../services/RAGService';
import { validateResponse, ResponseSchema } from './context-management';

/**
 * Standard schema for RAGResponse validation
 */
export const RAG_RESPONSE_SCHEMA: ResponseSchema = {
  requiredFields: ['naturalLanguageAnswer', 'confidence'],
  optionalFields: ['structuredData', 'actions'],
  nestedSchemas: {
    actions: {
      requiredFields: ['type', 'label']
    }
  }
};

/**
 * Convert an LLMResponse to a RAGResponse format
 * @param llmResponse The LLM response to convert
 * @returns Converted RAG response
 */
export function adaptLLMToRAGResponse(llmResponse: LLMResponse): RAGResponse {
  // Map suggested actions to SuggestedAction format
  const actions: SuggestedAction[] = llmResponse.suggestedActions
    .filter(actionStr => actionStr && actionStr.trim().length > 0)
    .map((actionStr, index) => {
      // Try to determine action type based on content
      const lowerAction = actionStr.toLowerCase();
      let type: SuggestedAction['type'] = 'VIEW_ALERTS'; // Default type
      
      if (lowerAction.includes('student') || lowerAction.includes('profile')) {
        type = 'VIEW_STUDENT';
      } else if (lowerAction.includes('notification') || lowerAction.includes('message')) {
        type = 'SEND_NOTIFICATION';
      } else if (lowerAction.includes('meeting') || lowerAction.includes('schedule')) {
        type = 'SCHEDULE_MEETING';
      }
      
      return {
        type,
        label: actionStr,
        params: { id: `action-${index + 1}` }
      };
    });
  
  return {
    naturalLanguageAnswer: llmResponse.naturalLanguageAnswer,
    structuredData: llmResponse.structuredData,
    actions,
    confidence: llmResponse.confidence
  };
}

/**
 * Convert a RAGResponse to an LLMResponse format
 * @param ragResponse The RAG response to convert
 * @returns Converted LLM response
 */
export function adaptRAGToLLMResponse(ragResponse: RAGResponse): LLMResponse {
  return {
    naturalLanguageAnswer: ragResponse.naturalLanguageAnswer,
    structuredData: ragResponse.structuredData || null,
    suggestedActions: ragResponse.actions ? 
      ragResponse.actions.map(action => action.label) : 
      [],
    confidence: ragResponse.confidence
  };
}

/**
 * Validate a RAG response and fix common issues
 * @param response The response to validate and fix
 * @returns Fixed response or original if valid
 */
export function validateAndFixRAGResponse(response: any): RAGResponse {
  // Validate against our schema
  const validation = validateResponse(response, RAG_RESPONSE_SCHEMA);
  
  // If valid, return as is
  if (validation.valid) return response as RAGResponse;
  
  // Otherwise, try to fix common issues
  const fixedResponse: RAGResponse = {
    naturalLanguageAnswer: response?.naturalLanguageAnswer || 
      response?.answer || 
      response?.text || 
      response?.content ||
      "I'm sorry, but I couldn't generate a proper response.",
    confidence: typeof response?.confidence === 'number' ? response.confidence : 0.5,
    actions: []
  };
  
  // Add structuredData if available
  if (response?.structuredData) {
    fixedResponse.structuredData = response.structuredData;
  }
  
  // Add actions if available and valid
  if (Array.isArray(response?.actions)) {
    fixedResponse.actions = response.actions
      .filter((action: any) => action && typeof action === 'object' && action.type && action.label)
      .map((action: any) => ({
        type: action.type,
        label: action.label,
        params: action.params || {}
      }));
  } else if (Array.isArray(response?.suggestedActions)) {
    // Try to adapt from suggestedActions format
    fixedResponse.actions = response.suggestedActions
      .filter((action: any) => action && (typeof action === 'string' || (typeof action === 'object' && action.label)))
      .map((action: any, index: number) => {
        if (typeof action === 'string') {
          return {
            type: 'VIEW_ALERTS' as const,
            label: action,
            params: { id: `auto-${index + 1}` }
          };
        } else {
          return {
            type: action.type || 'VIEW_ALERTS' as const,
            label: action.label,
            params: action.params || { id: `auto-${index + 1}` }
          };
        }
      });
  }
  
  return fixedResponse;
}
