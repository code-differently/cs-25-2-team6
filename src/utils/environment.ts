/**
 * Utility to validate environment variables
 */

/**
 * Validates that required environment variables are set
 * @returns Object with validation status, any missing variables, and guidance message
 */
export function validateEnvironment(): { 
  isValid: boolean; 
  missingVars: string[]; 
  message: string;
  useFallback?: boolean;
} {
  const requiredVars = [
    'OPENAI_API_KEY',
  ];
  
  // Check for empty string values as well as undefined/null
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '' || value.includes('your_') || value === 'sk-...';
  });
  
  const isValid = missingVars.length === 0;
  
  // Build a helpful message based on validation results
  let message = isValid 
    ? 'Environment validation successful' 
    : `Missing or invalid environment variables: ${missingVars.join(', ')}`;
    
  // Provide more helpful guidance in development mode
  if (!isValid && process.env.NODE_ENV === 'development') {
    message += `
    
    Please check your .env.local file and ensure you have:
    1. Created the file if it doesn't exist
    2. Set OPENAI_API_KEY to your actual OpenAI API key
    3. Restarted your server after making changes
    
    You can verify your API key by running:
    node verify-openai-api.js
    `;
  }
  
  // Determine if we should use fallback mode
  const useFallback = !isValid && process.env.ENABLE_MOCK_LLM === 'true';
  
  return { isValid, missingVars, message, useFallback };
}

/**
 * Gets the appropriate OpenAI model to use
 * Falls back to a default if not specified
 * 
 * Available models:
 * - gpt-4-turbo: Most capable model, but more expensive
 * - gpt-4: Older version of GPT-4, still very capable
 * - gpt-3.5-turbo: Less capable but faster and cheaper
 */
export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
}

/**
 * Gets the RAG system prompt
 * Falls back to a default if not specified
 */
import { ATTENDANCE_SYSTEM_PROMPT, getSystemPromptForContext } from './system-prompts';

export function getRAGSystemPrompt(context: string = 'general'): string {
  // If a custom prompt is provided in environment, use that
  if (process.env.RAG_SYSTEM_PROMPT) {
    return process.env.RAG_SYSTEM_PROMPT;
  }
  
  // Otherwise use our system prompts based on context
  return getSystemPromptForContext(context);
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log environment validation status (for server-side startup)
 */
export function logEnvironmentValidation(): void {
  const { isValid, message } = validateEnvironment();
  
  if (isValid) {
    console.log('✅ Environment validation passed');
    console.log(`🤖 Using OpenAI Model: ${getOpenAIModel()}`);
  } else {
    console.error(`❌ ${message}`);
  }
}
