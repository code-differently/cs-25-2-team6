/**
 * Utilities for sanitizing and processing user queries
 */

/**
 * Options for query sanitization
 */
export interface SanitizeQueryOptions {
  maxLength?: number;
  removeHtml?: boolean;
  removeSql?: boolean;
  trimWhitespace?: boolean;
}

/**
 * Default options for query sanitization
 */
const DEFAULT_SANITIZE_OPTIONS: SanitizeQueryOptions = {
  maxLength: 1000,
  removeHtml: true,
  removeSql: true,
  trimWhitespace: true
};

/**
 * Sanitize a user query to prevent injection and ensure quality
 * @param query The raw user query
 * @param options Sanitization options
 * @returns Sanitized query
 */
export function sanitizeQuery(
  query: string, 
  options: SanitizeQueryOptions = DEFAULT_SANITIZE_OPTIONS
): string {
  if (!query) return '';
  
  let sanitized = query;
  
  // Trim whitespace
  if (options.trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Remove HTML tags
  if (options.removeHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Remove SQL injection attempts
  if (options.removeSql) {
    sanitized = sanitized
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b/gi, '')
      .replace(/--/g, '')
      .replace(/;/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }
  
  // Truncate if too long
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
}

/**
 * Process and enhance a user query for better LLM understanding
 * @param query The sanitized user query
 * @returns Enhanced query
 */
export function enhanceQuery(query: string): string {
  // Add any query enhancements here, such as:
  // - Adding context hints
  // - Reformatting for better LLM understanding
  // - Adding specific instructions
  return query;
}

/**
 * Analyze a query for potential harmful content
 * @param query The user query to analyze
 * @returns True if the query appears harmful
 */
export function isHarmfulQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Check for harmful content keywords
  const harmfulPatterns = [
    /\b(hack|exploit|attack|steal|fraud|illegal)\b/i,
    /\b(password|credential|token|key)\b.*\b(share|get|steal|find)\b/i,
    /\b(bypass|circumvent|evade)\b.*\b(security|authentication|verification)\b/i
  ];
  
  return harmfulPatterns.some(pattern => pattern.test(lowerQuery));
}
