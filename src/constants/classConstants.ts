export const CLASS_ID_VALIDATION = {
  PATTERN: /^CLS\d{3}$/,
  PREFIX: 'CLS',
  MIN_NUMBER: 1,
  MAX_NUMBER: 999,
  EXAMPLE: 'CLS001'
} as const;

export const CLASS_NAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z0-9\s\-'\.]+$/,
  TRIM_WHITESPACE: true
} as const;

export const CLASS_DESCRIPTION_VALIDATION = {
  MAX_LENGTH: 500,
  TRIM_WHITESPACE: true,
  IS_OPTIONAL: true
} as const;

export const CLASS_FORM_LIMITS = {
  MAX_STUDENTS_PER_CLASS: 100,
  MAX_CLASSES_PER_BULK_OPERATION: 25,
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;

export const DEFAULT_CLASS_DATA = {
  name: '',
  grade: undefined,
  description: '',
  teacherId: undefined
} as const;

export const CLASS_VALIDATION_MESSAGES = {
  NAME_REQUIRED: 'Class name is required',
  NAME_TOO_SHORT: `Class name must be at least ${CLASS_NAME_VALIDATION.MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Class name cannot exceed ${CLASS_NAME_VALIDATION.MAX_LENGTH} characters`,
  NAME_INVALID_CHARS: 'Class name contains invalid characters',
  
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${CLASS_DESCRIPTION_VALIDATION.MAX_LENGTH} characters`,
  
  CLASS_ID_REQUIRED: 'Class ID is required',
  CLASS_ID_INVALID_FORMAT: `Class ID must follow format ${CLASS_ID_VALIDATION.EXAMPLE}`,
  CLASS_ID_NOT_UNIQUE: 'Class ID already exists',
  
  GRADE_INVALID: 'Invalid grade level',
  
  TEACHER_ID_INVALID: 'Invalid teacher ID format',
  
  TOO_MANY_STUDENTS: `Cannot assign more than ${CLASS_FORM_LIMITS.MAX_STUDENTS_PER_CLASS} students to a class`,
  
  RELATIONSHIP_DUPLICATE: 'Student is already enrolled in this class',
  RELATIONSHIP_NOT_FOUND: 'Student is not enrolled in this class',
  RELATIONSHIP_INVALID_STUDENT: 'Invalid student ID',
  RELATIONSHIP_INVALID_CLASS: 'Invalid class ID'
} as const;
