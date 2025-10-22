/**
 * Report Validation Utilities for User Story 2
 * Provides comprehensive validation functions for report filtering and data integrity
 */

import { ZodError } from 'zod';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { 
  ReportFiltersSchema, 
  LegacyReportFiltersSchema,
  type ReportFilters, 
  type LegacyReportFilters,
  type DateRange,
  DateRangeSchema,
  PaginationSchema,
  type Pagination
} from '../types/reports';

export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validates complete report filters with detailed error handling
 */
export function validateReportFilters(filters: unknown): ValidationResult<ReportFilters> {
  try {
    const validatedFilters = ReportFiltersSchema.parse(filters);
    
    // Additional business logic validation
    const businessValidation = validateBusinessRules(validatedFilters);
    if (!businessValidation.isValid) {
      return businessValidation;
    }

    return {
      isValid: true,
      data: validatedFilters,
      errors: [],
      warnings: []
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: formatZodErrors(error),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Unexpected validation error occurred'],
      warnings: []
    };
  }
}

/**
 * Validates date range with enhanced business rules
 */
export function validateDateRange(dateRange: unknown): ValidationResult<DateRange> {
  try {
    const validatedRange = DateRangeSchema.parse(dateRange);
    
    // Convert string dates to Date objects for comparison
    const startDate = new Date(validatedRange.startDate);
    const endDate = new Date(validatedRange.endDate);
    
    // Check for logical date order
    if (startDate > endDate) {
      return {
        isValid: false,
        data: null,
        errors: ['Start date must be before end date'],
        warnings: []
      };
    }

    // Check for reasonable date range (not more than 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const rangeDuration = endDate.getTime() - startDate.getTime();
    
    if (rangeDuration > oneYearMs) {
      return {
        isValid: false,
        data: null,
        errors: ['Date range cannot exceed 1 year'],
        warnings: []
      };
    }

    // Warning for very recent dates (might have incomplete data)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const warnings: string[] = [];
    if (endDate > threeDaysAgo) {
      warnings.push('Recent dates may have incomplete attendance data');
    }

    return {
      isValid: true,
      data: validatedRange,
      errors: [],
      warnings
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: formatZodErrors(error),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid date range format'],
      warnings: []
    };
  }
}

/**
 * Validates pagination parameters
 */
export function validatePagination(pagination: unknown): ValidationResult<Pagination> {
  try {
    const validatedPagination = PaginationSchema.parse(pagination);
    
    // Business rule: ensure reasonable pagination
    if (validatedPagination.page < 1) {
      return {
        isValid: false,
        data: null,
        errors: ['Page number must be at least 1'],
        warnings: []
      };
    }

    if (validatedPagination.limit > 1000) {
      return {
        isValid: false,
        data: null,
        errors: ['Page size cannot exceed 1000 items'],
        warnings: []
      };
    }

    // Warning for very large page sizes
    const warnings: string[] = [];
    if (validatedPagination.limit > 100) {
      warnings.push('Large page sizes may impact performance');
    }

    return {
      isValid: true,
      data: validatedPagination,
      errors: [],
      warnings
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: formatZodErrors(error),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid pagination parameters'],
      warnings: []
    };
  }
}

/**
 * Validates individual attendance status values
 */
export function validateAttendanceStatus(status: unknown): ValidationResult<AttendanceStatus> {
  try {
    if (typeof status !== 'string') {
      return {
        isValid: false,
        data: null,
        errors: ['Attendance status must be a string'],
        warnings: []
      };
    }

    const validStatuses = Object.values(AttendanceStatus);
    if (!validStatuses.includes(status as AttendanceStatus)) {
      return {
        isValid: false,
        data: null,
        errors: [`Invalid attendance status: ${status}. Valid options: ${validStatuses.join(', ')}`],
        warnings: []
      };
    }

    return {
      isValid: true,
      data: status as AttendanceStatus,
      errors: [],
      warnings: []
    };
  } catch (error) {
    return {
      isValid: false,
      data: null,
      errors: ['Failed to validate attendance status'],
      warnings: []
    };
  }
}

/**
 * Applies business rule validation beyond schema validation
 */
function validateBusinessRules(filters: ReportFilters): ValidationResult<ReportFilters> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate student selection consistency
  if (filters.studentSelection && filters.studentSelection.studentIds && 
      filters.studentSelection.studentIds.length === 0) {
    warnings.push('No specific students selected');
  }

  if (filters.studentSelection && filters.studentSelection.searchQuery && 
      filters.studentSelection.searchQuery.trim().length < 2) {
    errors.push('Search query requires at least 2 characters');
  }

  // Validate attendance status selection
  if (filters.attendanceStatus && filters.attendanceStatus.length === 0) {
    warnings.push('No attendance statuses selected - results may be empty');
  }

  // Validate date range reasonableness
  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.startDate);
    const endDate = new Date(filters.dateRange.endDate);
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff < 1) {
      warnings.push('Date range is less than 1 day');
    } else if (daysDiff > 90) {
      warnings.push('Large date range may result in slow queries');
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      data: null,
      errors,
      warnings
    };
  }

  return {
    isValid: true,
    data: filters,
    errors: [],
    warnings
  };
}

/**
 * Formats Zod validation errors into user-friendly messages
 */
function formatZodErrors(error: ZodError): string[] {
  return error.issues.map(err => {
    const path = err.path.join('.');
    const message = err.message;
    return path ? `${path}: ${message}` : message;
  });
}

/**
 * Gets default report filters with proper validation
 */
export function getDefaultReportFilters(): ReportFilters {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return {
    dateRange: {
      startDate: thirtyDaysAgo.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      endDate: today.toISOString().split('T')[0]
    },
    studentSelection: {
      studentIds: [],
      searchQuery: undefined,
      classIds: []
    },
    attendanceStatus: Object.values(AttendanceStatus),
    pagination: {
      page: 1,
      limit: 50,
      sortBy: 'date' as const,
      sortOrder: 'desc' as const
    }
  };
}

/**
 * Validates legacy report filters for existing ReportService compatibility
 */
export function validateLegacyReportFilters(filters: unknown): ValidationResult<LegacyReportFilters> {
  try {
    const validatedFilters = LegacyReportFiltersSchema.parse(filters);
    
    return {
      isValid: true,
      data: validatedFilters,
      errors: [],
      warnings: []
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: formatZodErrors(error),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Unexpected validation error occurred'],
      warnings: []
    };
  }
}

/**
 * Converts new ReportFilters format to legacy format for ReportService compatibility
 */
export function convertToLegacyFilters(filters: ReportFilters): LegacyReportFilters {
  const legacy: LegacyReportFilters = {};
  
  // Convert student selection to lastName
  if (filters.studentSelection?.searchQuery) {
    legacy.lastName = filters.studentSelection.searchQuery;
  }
  
  // Convert attendance status array to single status (take first one)
  if (filters.attendanceStatus && filters.attendanceStatus.length > 0) {
    legacy.status = filters.attendanceStatus[0];
  }
  
  // Convert date range to single date (use start date)
  if (filters.dateRange) {
    legacy.dateISO = filters.dateRange.startDate;
  }
  
  return legacy;
}

/**
 * Validates and sanitizes report filter updates
 */
export function validateFilterUpdate(
  currentFilters: ReportFilters,
  updates: Partial<ReportFilters>
): ValidationResult<ReportFilters> {
  try {
    // Merge updates with current filters
    const updatedFilters = { ...currentFilters, ...updates };
    
    // Validate the merged result
    return validateReportFilters(updatedFilters);
  } catch (error) {
    return {
      isValid: false,
      data: null,
      errors: ['Failed to apply filter updates'],
      warnings: []
    };
  }
}
