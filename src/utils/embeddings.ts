/**
 * Simple embedding utilities for the RAG system.
 * This lightweight implementation avoids using external vector databases.
 */

// Simple text normalization
export function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Calculate simple similarity between two strings using keyword overlap
export function calculateSimilarity(text1: string, text2: string): number {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  
  // Count overlapping words
  const overlap = words1.filter(word => words2.includes(word)).length;
  
  // Simple Jaccard similarity
  const union = new Set([...words1, ...words2]).size;
  
  return union === 0 ? 0 : overlap / union;
}

// Extract keywords from text
export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  // Filter out common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of'
  ]);
  
  return words.filter(word => !stopWords.has(word) && word.length > 1);
}

// Check if text contains any of the keywords
export function containsAnyKeyword(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(normalizeText(keyword)));
}

// Check if text contains all of the keywords
export function containsAllKeywords(text: string, keywords: string[]): boolean {
  const normalized = normalizeText(text);
  return keywords.every(keyword => normalized.includes(normalizeText(keyword)));
}
