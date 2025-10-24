/**
 * Core student management types for User Story 5
 * Separate from existing Student domain to avoid merge conflicts
 */

/**
 * Student profile for management operations
 * Matches API expectations from existing student route
 */
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade?: string;
  buildingIds: string[];
}

/**
 * Basic student data structure
 * Minimal interface for core operations
 */
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
}

/**
 * Student search and filtering options
 * Matches existing query patterns from API
 */
export interface StudentFilters {
  search?: string;
  grade?: string;
  limit?: number;
  offset?: number;
}

/**
 * Student list response structure
 * Matches existing API response format
 */
export interface StudentListResponse {
  success: boolean;
  data: StudentProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Student operation result
 * Standard response format for CRUD operations
 */
export interface StudentResponse {
  success: boolean;
  message?: string;
  data?: StudentProfile;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Sort criteria for student lists
 */
export interface StudentSortCriteria {
  field: 'firstName' | 'lastName' | 'fullName' | 'grade' | 'id';
  direction: 'asc' | 'desc';
}

/**
 * Bulk operation types for students
 */
export enum BulkAction {
  DELETE = 'DELETE',
  UPDATE_GRADE = 'UPDATE_GRADE',
  ASSIGN_BUILDING = 'ASSIGN_BUILDING'
}

/**
 * Bulk operation request
 */
export interface BulkStudentOperation {
  studentIds: string[];
  action: BulkAction;
  data?: Record<string, any>;
}
