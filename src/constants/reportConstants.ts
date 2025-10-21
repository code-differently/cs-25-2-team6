/**
 * Report constants and default configurations for User Story 2
 */

import { AttendanceStatus } from '../domains/AttendanceStatus';
import { ReportFilters, Pagination, LegacyReportFilters } from '../types/reports';

// Date range presets for quick filtering
export const DATE_RANGE_PRESETS = {
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek', 
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_YEAR: 'thisYear',
  YEAR_TO_DATE: 'ytd',
  CUSTOM: 'custom'
} as const;

// Date validation constraints
export const DATE_CONSTRAINTS = {
  MAX_DATE_RANGE_DAYS: 365,
  MIN_DATE_RANGE_DAYS: 1,
  MAX_FUTURE_DAYS: 0,
  DATE_FORMAT: 'YYYY-MM-DD'
} as const;

// Pagination limits and defaults
export const PAGINATION_LIMITS = {
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MIN_PAGE: 1,
  MAX_TOTAL_RECORDS: 10000
} as const;

// Filter input validation limits
export const INPUT_LIMITS = {
  STUDENT_NAME_MAX_LENGTH: 50,
  MAX_SELECTED_CLASSES: 20,
  MAX_SELECTED_STATUSES: 4,
  MIN_SEARCH_LENGTH: 1
} as const;

// Default report filter configuration
export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0] // Today
  },
  attendanceStatus: [],
  studentSelection: {
    studentIds: [],
    classIds: []
  }
};

// Default legacy report filter configuration for existing ReportService compatibility
export const DEFAULT_LEGACY_REPORT_FILTERS: LegacyReportFilters = {
  lastName: undefined,
  status: undefined,
  dateISO: undefined
};

// Default pagination configuration
export const DEFAULT_PAGINATION: Pagination = {
  page: PAGINATION_LIMITS.MIN_PAGE,
  limit: PAGINATION_LIMITS.DEFAULT_PAGE_SIZE,
  sortBy: 'date',
  sortOrder: 'desc'
};

// Attendance status options for filtering
export const ATTENDANCE_STATUS_OPTIONS = [
  { value: AttendanceStatus.PRESENT, label: 'Present', color: '#22c55e' },
  { value: AttendanceStatus.LATE, label: 'Late', color: '#f59e0b' },
  { value: AttendanceStatus.ABSENT, label: 'Absent', color: '#ef4444' },
  { value: AttendanceStatus.EXCUSED, label: 'Excused', color: '#6366f1' }
] as const;

// Sort field options for reports
export const SORT_FIELDS = {
  DATE: 'date',
  STUDENT_NAME: 'studentName',
  CLASS_NAME: 'className',
  ATTENDANCE_STATUS: 'attendanceStatus',
  CREATED_AT: 'createdAt'
} as const;

// Export validation messages for consistent error handling
export const VALIDATION_MESSAGES = {
  DATE_RANGE_TOO_LARGE: `Date range cannot exceed ${DATE_CONSTRAINTS.MAX_DATE_RANGE_DAYS} days`,
  FUTURE_DATE_NOT_ALLOWED: 'Future dates are not allowed for reports',
  INVALID_DATE_FORMAT: `Date must be in ${DATE_CONSTRAINTS.DATE_FORMAT} format`,
  PAGE_SIZE_EXCEEDED: `Page size cannot exceed ${PAGINATION_LIMITS.MAX_PAGE_SIZE}`,
  STUDENT_NAME_TOO_LONG: `Student name cannot exceed ${INPUT_LIMITS.STUDENT_NAME_MAX_LENGTH} characters`,
  TOO_MANY_SELECTIONS: 'Too many items selected for this filter',
  LATE_LIST_MISSING_CRITERIA: 'Either date or last name must be provided for late list filtering',
  EARLY_DISMISSAL_MISSING_CRITERIA: 'Either date or last name must be provided for early dismissal filtering'
} as const;

// Error codes for programmatic error handling
export const ERROR_CODES = {
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  PAGINATION_ERROR: 'PAGINATION_ERROR',
  FILTER_VALIDATION_ERROR: 'FILTER_VALIDATION_ERROR',
  INPUT_SANITIZATION_ERROR: 'INPUT_SANITIZATION_ERROR',
  LATE_LIST_VALIDATION_ERROR: 'LATE_LIST_VALIDATION_ERROR',
  EARLY_DISMISSAL_VALIDATION_ERROR: 'EARLY_DISMISSAL_VALIDATION_ERROR'
} as const;
