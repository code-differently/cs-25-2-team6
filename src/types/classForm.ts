export interface ClassFormData {
  name: string;
  grade?: string;
  description?: string;
  teacherId?: string;
}

export interface ClassValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    grade?: string;
    description?: string;
    teacherId?: string;
    general?: string;
  };
  fieldErrors: Array<{
    field: keyof ClassFormData;
    message: string;
  }>;
}

export interface ClassIdValidationResult {
  isValid: boolean;
  isUnique: boolean;
  format: boolean;
  message?: string;
}

export interface ClassNameValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowSpecialChars?: boolean;
  requireAlphabetic?: boolean;
}

export interface ClassFormValidationOptions {
  validateName?: ClassNameValidationOptions;
  allowEmptyGrade?: boolean;
  requireDescription?: boolean;
  validateTeacherId?: boolean;
}

export interface ClassFieldValidationResult {
  isValid: boolean;
  message?: string;
  value: string;
}

export interface ClassFormState {
  data: ClassFormData;
  errors: ClassValidationResult['errors'];
  touched: {
    name: boolean;
    grade: boolean;
    description: boolean;
    teacherId: boolean;
  };
  isSubmitting: boolean;
  isDirty: boolean;
}
