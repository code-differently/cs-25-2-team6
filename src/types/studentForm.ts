export interface StudentFormData {
  firstName: string;
  lastName: string;
  grade?: string;
}

export interface StudentEditFormData extends StudentFormData {
  id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export enum FormState {
  IDLE = 'IDLE',
  VALIDATING = 'VALIDATING',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface FormValidationContext {
  mode: 'create' | 'edit';
  existingStudentIds: string[];
  currentStudentId?: string;
}

export interface StudentIdValidationResult {
  isValid: boolean;
  isUnique: boolean;
  format: boolean;
  message?: string;
}

export interface NameValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowSpecialChars?: boolean;
}

export interface GradeValidationOptions {
  allowedGrades?: string[];
  isRequired?: boolean;
}
