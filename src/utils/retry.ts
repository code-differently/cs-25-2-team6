/**
 * Utility for handling API retries with exponential backoff
 */

/**
 * Options for retryAsync
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, delay: number, error: any) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryCondition: (error: any) => {
    // Retry on rate limits, timeout errors, or server errors
    if (error?.status === 429) return true; // Rate limit
    if (error?.status >= 500 && error?.status < 600) return true; // Server errors
    if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET') return true;
    return false;
  },
  onRetry: (attempt: number, delay: number, error: any) => {
    console.warn(`Retry attempt ${attempt} after ${delay}ms delay due to error:`, error);
  }
};

/**
 * Calculate exponential backoff delay with jitter
 * @param attempt Current retry attempt (0-based)
 * @param baseDelay Base delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const expDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter: random value between 0 and 1
  const jitter = Math.random();
  
  // Apply jitter and cap at maxDelay
  return Math.min(expDelay * (1 + jitter * 0.1), maxDelay);
}

/**
 * Retry an async function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Promise resolving to the function result
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let attempt = 0;
  
  // Loop until success or max retries reached
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      // If max retries reached or error is not retryable, throw
      if (attempt >= config.maxRetries || !config.retryCondition?.(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = calculateBackoff(attempt, config.baseDelay, config.maxDelay || Infinity);
      
      // Call onRetry hook if provided
      if (config.onRetry) {
        config.onRetry(attempt, delay, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
