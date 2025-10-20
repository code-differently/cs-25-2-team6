import { AttendanceStatus } from './AttendanceStatus';

/**
 * ReportFilters interface for filtering attendance reports.
 * All fields are optional and can be used in any combination.
 * Supports User Story 2: Filter by student name, date, or status
 */
export interface ReportFilters {
  // Student filtering
  studentIds?: string[];
  studentName?: string; // For name-based search
  lastName?: string; // Backward compatibility
  
  // Class filtering (for future class system)
  classIds?: string[];
  
  // Date filtering
  dateISO?: string; // Specific date
  dateFrom?: string; // Date range start
  dateTo?: string; // Date range end
  relativePeriod?: RelativePeriod; // Preset date ranges
  
  // Status filtering
  status?: AttendanceStatus; // Single status (backward compatibility)
  statuses?: AttendanceStatus[]; // Multiple statuses
  
  // Advanced filtering options
  includeExcused?: boolean; // Include excused absences
  onlyLate?: boolean; // Only late arrivals
  onlyEarlyDismissal?: boolean; // Only early dismissals
}

//time period options
export type RelativePeriod = 
  | '7days' 
  | '30days' 
  | '90days' 
  | 'semester' 
  | 'year'
  | 'today'
  | 'week'
  | 'month'
  | 'quarter';

/**
 * Report aggregation options
 */
export interface ReportAggregations {
  includeCount?: boolean;
  includePercentage?: boolean;
  includeStreaks?: boolean;
  includeTrends?: boolean;
  includeComparative?: boolean;
}

/**
 * Report grouping options
 */
export type ReportGroupBy = 
  | 'student' 
  | 'date' 
  | 'class' 
  | 'week' 
  | 'month'
  | 'status';

/**
 * Sort criteria for reports
 */
export interface ReportSortOptions {
  sortBy: 'name' | 'date' | 'attendanceRate' | 'class' | 'totalDays' | 'status';
  sortOrder: 'asc' | 'desc';
}

//pagnation options
export interface ReportPaginationOptions {
  page: number;
  limit: number;
}


export interface ReportRequest {
  filters: ReportFilters;
  aggregations?: ReportAggregations;
  groupBy?: ReportGroupBy[];
  sorting?: ReportSortOptions;
  pagination?: ReportPaginationOptions;
  format?: 'json' | 'csv' | 'pdf';
  useCache?: boolean;
}


export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

//metadata about generated report
export interface ReportMetadata {
  totalRecords: number;
  filteredRecords: number;
  generatedAt: string;
  appliedFilters: ReportFilters;
  queryTime: number;
  cacheHit: boolean;
}
