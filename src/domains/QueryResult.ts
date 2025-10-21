import { ReportData, StudentAttendanceStats, AttendanceRecord } from './ReportData';

/**
 * Generic pagination metadata
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Sorting configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  type?: 'string' | 'number' | 'date';
}

/**
 * Query performance metrics
 */
export interface QueryMetrics {
  executionTimeMs: number;
  recordsProcessed: number;
  recordsFiltered: number;
  cacheHit: boolean;
  queryComplexity: 'simple' | 'moderate' | 'complex';
  optimizationSuggestions?: string[];
}

/**
 * Natural language query result with confidence scoring
 */
export interface NLQueryResult {
  originalQuery: string;
  interpretedQuery: {
    intent: 'summary' | 'filter' | 'compare' | 'trend' | 'alert';
    entities: Array<{
      type: 'student' | 'date' | 'status' | 'grade' | 'metric';
      value: string;
      confidence: number;
    }>;
    filters: any; // Will be converted to ReportFilters
  };
  confidence: number; // 0-1 scale
  alternatives?: Array<{
    interpretation: string;
    confidence: number;
  }>;
  result: QueryResult<ReportData>;
}

/**
 * Search result for student/record searching
 */
export interface SearchResult<T> {
  item: T;
  score: number; // Relevance score 0-1
  matches: Array<{
    field: string;
    value: string;
    highlighted: string; // With highlights
  }>;
}

/**
 * Generic query result wrapper with pagination, sorting, and metadata
 */
export interface QueryResult<T> {
  // Core data
  data: T;
  
  // Pagination (when applicable)
  pagination?: PaginationInfo;
  
  // Sorting information
  sorting?: SortConfig;
  
  // Performance and metadata
  metrics: QueryMetrics;
  timestamp: string;
  version: string; // API version
  
  // Query context
  query: {
    filters: any; // Original filters used
    parameters: Record<string, any>;
    hash: string; // For caching
  };
  
  // Status and errors
  status: 'success' | 'partial' | 'error';
  warnings?: string[];
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

/**
 * Paginated list result
 */
export interface PaginatedResult<T> extends QueryResult<T[]> {
  pagination: PaginationInfo; // Required for paginated results
}

/**
 * Report-specific query result
 */
export interface ReportQueryResult extends QueryResult<ReportData> {
  // Additional report-specific metadata
  reportType: 'attendance' | 'tardiness' | 'summary' | 'comparative' | 'custom';
  generationTime: number; // Time to generate report in ms
  dataFreshness: string; // When underlying data was last updated
  
  // Export options
  exportOptions: {
    available: Array<'csv' | 'json' | 'pdf'>;
    urls?: Record<string, string>;
  };
  
  // Sharing and permissions
  sharing?: {
    shareable: boolean;
    expiresAt?: string;
    permissions: string[];
  };
}

/**
 * Student search result with attendance summary
 */
export interface StudentSearchResult extends SearchResult<StudentAttendanceStats> {
  // Additional student context
  recentActivity: AttendanceRecord[];
  alerts: Array<{
    type: 'attendance' | 'tardiness' | 'pattern';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
}

/**
 * Attendance record search result
 */
export interface AttendanceSearchResult extends SearchResult<AttendanceRecord> {
  // Additional record context
  studentContext: {
    name: string;
    grade?: string;
    recentPattern: 'improving' | 'declining' | 'stable';
  };
}

/**
 * Batch query result for multiple concurrent queries
 */
export interface BatchQueryResult {
  results: Array<{
    queryId: string;
    result: QueryResult<any>;
  }>;
  overallMetrics: QueryMetrics;
  batchId: string;
  timestamp: string;
}

/**
 * Streaming query result for large datasets
 */
export interface StreamingQueryResult<T> {
  streamId: string;
  totalExpected?: number;
  chunk: {
    data: T[];
    chunkNumber: number;
    isLastChunk: boolean;
  };
  metadata: Omit<QueryResult<T>, 'data'>;
}

/**
 * Cached query result
 */
export interface CachedQueryResult<T> extends QueryResult<T> {
  cache: {
    key: string;
    hit: boolean;
    createdAt: string;
    expiresAt: string;
    source: 'memory' | 'redis' | 'database';
  };
}

/**
 * Query suggestion for autocomplete/typeahead
 */
export interface QuerySuggestion {
  text: string;
  type: 'student' | 'filter' | 'metric' | 'date' | 'command';
  confidence: number;
  description?: string;
  parameters?: Record<string, any>;
}

/**
 * Query validation result
 */
export interface QueryValidation {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  suggestions: QuerySuggestion[];
  correctedQuery?: any;
}
