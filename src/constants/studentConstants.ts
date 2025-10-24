export const STUDENT_ID_VALIDATION = {
  PATTERN: /^STU\d{3}$/,
  PREFIX: 'STU',
  MIN_NUMBER: 1,
  MAX_NUMBER: 999,
  EXAMPLE: 'STU001'
} as const;

export const NAME_VALIDATION = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-Z\s\-'\.]+$/,
  TRIM_WHITESPACE: true
} as const;

export const GRADE_VALIDATION = {
  ALLOWED_VALUES: [
    'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    'Pre-K', 'Kindergarten', 'Freshman', 'Sophomore', 'Junior', 'Senior'
  ],
  MAX_LENGTH: 15,
  IS_OPTIONAL: true
} as const;

export const FORM_LIMITS = {
  MAX_STUDENTS_PER_BULK_OPERATION: 50,
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200
} as const;

export const DEFAULT_STUDENT_DATA = {
  firstName: '',
  lastName: '',
  grade: undefined,
  buildingIds: ['MAIN']
} as const;

export const VALIDATION_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_TOO_LONG: `First name cannot exceed ${NAME_VALIDATION.MAX_LENGTH} characters`,
  FIRST_NAME_INVALID_CHARS: 'First name contains invalid characters',
  
  LAST_NAME_REQUIRED: 'Last name is required',
  LAST_NAME_TOO_LONG: `Last name cannot exceed ${NAME_VALIDATION.MAX_LENGTH} characters`,
  LAST_NAME_INVALID_CHARS: 'Last name contains invalid characters',
  
  STUDENT_ID_REQUIRED: 'Student ID is required',
  STUDENT_ID_INVALID_FORMAT: `Student ID must follow format ${STUDENT_ID_VALIDATION.EXAMPLE}`,
  STUDENT_ID_NOT_UNIQUE: 'Student ID already exists',
  
  GRADE_INVALID: 'Invalid grade selection',
  GRADE_TOO_LONG: `Grade cannot exceed ${GRADE_VALIDATION.MAX_LENGTH} characters`,
  
  BULK_OPERATION_TOO_LARGE: `Cannot process more than ${FORM_LIMITS.MAX_STUDENTS_PER_BULK_OPERATION} students at once`
} as const;

export const API_ENDPOINTS = {
  STUDENTS: '/api/students',
  STUDENT_BY_ID: '/api/students/[id]',
  VALIDATE_STUDENT: '/api/students/validate',
  BULK_OPERATIONS: '/api/students/bulk'
} as const;
