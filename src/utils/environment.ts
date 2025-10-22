/**
 * Utility to validate environment variables
 */

/**
 * Validates that required environment variables are set
 * @returns Object with validation status and any missing variables
 */
export function validateEnvironment(): { 
  isValid: boolean; 
  missingVars: string[]; 
  message: string 
} {
  const requiredVars = [
    'OPENAI_API_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => {
    return !process.env[varName];
  });
  
  const isValid = missingVars.length === 0;
  
  let message = isValid 
    ? 'Environment validation successful' 
    : `Missing required environment variables: ${missingVars.join(', ')}`;
    
  if (!isValid && process.env.NODE_ENV === 'development') {
    message += '. Make sure to set them in your .env.local file.';
  }
  
  return { isValid, missingVars, message };
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
export function getRAGSystemPrompt(): string {
  return process.env.RAG_SYSTEM_PROMPT || 
    "You are an AI assistant for an Attendance Management System. " +
    "Help users understand attendance data, generate reports, and provide insights " +
    "about student attendance patterns.";
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
