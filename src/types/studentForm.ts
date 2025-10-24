/**
 * Student form data types for User Story 5
 * Form-specific interfaces and validation types
 */

/**
 * Form data for creating or editing a student
 * Matches API schema expectations
 */
export interface StudentFormData {
  firstName: string;
  lastName: string;
  grade?: string;
}

/**
 * Student form data with ID for editing
 */
export interface StudentEditFormData extends StudentFormData {
  id: string;
}

/**
 * Validation result for form fields
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Individual field validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form submission states
 */
export enum FormState {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

/**
 * Form validation context
 */
export interface FormValidationContext {
  mode: 'create' | 'edit';
  existingStudentIds: string[];
  currentStudentId?: string;
}

/**
 * Student ID validation result
 */
export interface StudentIdValidationResult {
  isValid: boolean;
  isUnique: boolean;
  format: boolean;
  message?: string;
}

/**
 * Name validation options
 */
export interface NameValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowSpecialChars?: boolean;
}

/**
 * Grade validation options
 */
export interface GradeValidationOptions {
  allowedGrades?: string[];
  isRequired?: boolean;
}
