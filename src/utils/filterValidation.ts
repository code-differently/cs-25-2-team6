/**
 * Filter Validation Utilities for User Story 2
 * Provides input sanitization and filter validation functions
 */

import { z, ZodError } from 'zod';
import { 
  FilterType,
  StudentNameFilterSchema,
  MultiSelectFilterSchema,
  LateListFilterSchema,
  EarlyDismissalFilterSchema,
  FilterValidationStateSchema,
  type StudentNameFilter,
  type MultiSelectFilter,
  type LateListFilter,
  type EarlyDismissalFilter,
  type FilterValidationState
} from '../types/filters';

export interface FilterValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
  warnings: string[];
}

/**
 * Sanitizes user input to prevent XSS and other security issues
 */
export function sanitizeFilterInput(input: any, filterType: FilterType): any {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .trim()
    .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Validates student name filter input according to assignment requirements
 */
export function validateStudentNameFilter(filter: unknown): FilterValidationResult<StudentNameFilter> {
  try {
    const validatedFilter = StudentNameFilterSchema.parse(filter);
    
    if (validatedFilter.searchQuery && validatedFilter.searchQuery.length < 2) {
      return {
        isValid: false,
        data: null,
        errors: ['Search query must be at least 2 characters long'],
        warnings: []
      };
    }
    
    return {
      isValid: true,
      data: validatedFilter,
      errors: [],
      warnings: []
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.issues.map(issue => issue.message),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid student name filter'],
      warnings: []
    };
  }
}

/**
 * Validates student ID array according to assignment requirements
 */
export function isValidStudentSelection(studentIds: string[]): boolean {
  if (!Array.isArray(studentIds)) {
    return false;
  }
  
  // Check that all IDs are non-empty strings
  return studentIds.every(id => 
    typeof id === 'string' && 
    id.trim().length > 0 &&
    id.length <= 50 // Reasonable limit
  );
}

/**
 * Validates multi-select filter options
 */
export function validateMultiSelectFilter(filter: unknown): FilterValidationResult<MultiSelectFilter> {
  try {
    const validatedFilter = MultiSelectFilterSchema.parse(filter);
    
    const warnings: string[] = [];
    
    if (validatedFilter.selectedItems.length > 20) {
      warnings.push('Large number of selections may impact performance');
    }
    
    if (validatedFilter.maxSelections && 
        validatedFilter.selectedItems.length > validatedFilter.maxSelections) {
      return {
        isValid: false,
        data: null,
        errors: [`Too many selections (maximum: ${validatedFilter.maxSelections})`],
        warnings
      };
    }
    
    return {
      isValid: true,
      data: validatedFilter,
      errors: [],
      warnings
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.issues.map(issue => issue.message),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid multi-select filter'],
      warnings: []
    };
  }
}

/**
 * Validates late list filter according to User Story 2 acceptance criteria
 */
export function validateLateListFilter(filter: unknown): FilterValidationResult<LateListFilter> {
  try {
    const validatedFilter = LateListFilterSchema.parse(filter);
    
    const warnings: string[] = [];
    
    // Warn if both date and lastName provided (might be overly restrictive)
    if (validatedFilter.dateISO && validatedFilter.lastName) {
      warnings.push('Filtering by both date and last name may return very limited results');
    }
    
    return {
      isValid: true,
      data: validatedFilter,
      errors: [],
      warnings
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.issues.map(issue => issue.message),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid late list filter'],
      warnings: []
    };
  }
}

/**
 * Validates early dismissal filter according to User Story 2 acceptance criteria
 */
export function validateEarlyDismissalFilter(filter: unknown): FilterValidationResult<EarlyDismissalFilter> {
  try {
    const validatedFilter = EarlyDismissalFilterSchema.parse(filter);
    
    const warnings: string[] = [];
    
    // Warn if both date and lastName provided (might be overly restrictive)
    if (validatedFilter.dateISO && validatedFilter.lastName) {
      warnings.push('Filtering by both date and last name may return very limited results');
    }
    
    return {
      isValid: true,
      data: validatedFilter,
      errors: [],
      warnings
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.issues.map(issue => issue.message),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid early dismissal filter'],
      warnings: []
    };
  }
}

/**
 * Validates filter validation state for UI feedback
 */
export function validateFilterValidationState(state: unknown): FilterValidationResult<FilterValidationState> {
  try {
    const validatedState = FilterValidationStateSchema.parse(state);
    
    return {
      isValid: true,
      data: validatedState,
      errors: [],
      warnings: []
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false,
        data: null,
        errors: error.issues.map(issue => issue.message),
        warnings: []
      };
    }
    
    return {
      isValid: false,
      data: null,
      errors: ['Invalid filter validation state'],
      warnings: []
    };
  }
}

/**
 * Gets available filter types as defined in the enum
 */
export function getAvailableFilterTypes(): FilterType[] {
  return Object.values(FilterType);
}

/**
 * Validates filter type selection
 */
export function validateFilterType(type: unknown): FilterValidationResult<FilterType> {
  if (typeof type !== 'string') {
    return {
      isValid: false,
      data: null,
      errors: ['Filter type must be a string'],
      warnings: []
    };
  }
  
  const validTypes = Object.values(FilterType);
  if (!validTypes.includes(type as FilterType)) {
    return {
      isValid: false,
      data: null,
      errors: [`Invalid filter type: ${type}. Valid options: ${validTypes.join(', ')}`],
      warnings: []
    };
  }
  
  return {
    isValid: true,
    data: type as FilterType,
    errors: [],
    warnings: []
  };
}
