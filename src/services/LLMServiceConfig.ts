/**
 * Configuration types and defaults for the LLM service
 */

export interface OpenAIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxRetries: number;
  retryDelay: number; // base delay in ms
  timeout?: number;   // request timeout in ms
}

export interface LLMServiceConfig {
  openai: OpenAIConfig;
  debug: boolean;
  maxHistoryMessages: number;
}

// Default configuration values
export const DEFAULT_CONFIG: LLMServiceConfig = {
  openai: {
    model: "gpt-3.5-turbo", // Default model
    temperature: 0.7,       // Default creativity level (0.0 to 1.0)
    maxTokens: 2000,        // Default maximum tokens in response
    topP: 1.0,              // Default sampling parameter
    frequencyPenalty: 0.0,  // Default penalty for token frequency
    presencePenalty: 0.0,   // Default penalty for token presence
    timeout: 30000,         // Default timeout (30 seconds)
    maxRetries: 3,          // Default number of retries
    retryDelay: 1000        // Default base delay between retries in ms
  },
  debug: process.env.LLM_DEBUG === 'true',
  maxHistoryMessages: 10
};

/**
 * Load configuration from environment variables
 * @returns The configuration with environment values or defaults
 */
export function loadConfigFromEnvironment(): LLMServiceConfig {
  return {
    openai: {
      model: process.env.OPENAI_MODEL || DEFAULT_CONFIG.openai.model,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '') || DEFAULT_CONFIG.openai.temperature,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '') || DEFAULT_CONFIG.openai.maxTokens,
      topP: parseFloat(process.env.OPENAI_TOP_P || '') || DEFAULT_CONFIG.openai.topP,
      frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '') || DEFAULT_CONFIG.openai.frequencyPenalty,
      presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '') || DEFAULT_CONFIG.openai.presencePenalty,
      maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '') || DEFAULT_CONFIG.openai.maxRetries,
      retryDelay: parseInt(process.env.OPENAI_RETRY_DELAY || '') || DEFAULT_CONFIG.openai.retryDelay
    },
    debug: process.env.LLM_DEBUG === 'true',
    maxHistoryMessages: parseInt(process.env.LLM_MAX_HISTORY || '') || DEFAULT_CONFIG.maxHistoryMessages
  };
}
