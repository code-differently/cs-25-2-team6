import { 
  StudentFormData, 
  ValidationResult, 
  ValidationError, 
  FormValidationContext 
} from '../types/studentForm';
import { validateStudentId, validateStudentName, isValidGrade } from './studentValidation';
import { DEFAULT_STUDENT_DATA } from '../constants/studentConstants';

export function validateStudentForm(
  data: StudentFormData, 
  context: FormValidationContext
): ValidationResult {
  const errors: ValidationError[] = [];

  const nameValidation = validateStudentName(data.firstName, data.lastName);
  errors.push(...nameValidation.errors.map(message => ({ 
    field: message.includes('First') ? 'firstName' : 'lastName', 
    message 
  })));

  if (data.grade && !isValidGrade(data.grade)) {
    errors.push({ field: 'grade', message: 'Invalid grade selection' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateField(
  fieldName: keyof StudentFormData, 
  value: string, 
  context: FormValidationContext
): ValidationError | null {
  switch (fieldName) {
    case 'firstName':
      const firstNameValidation = validateStudentName(value, '');
      if (firstNameValidation.errors.length > 0) {
        return { field: 'firstName', message: firstNameValidation.errors[0] };
      }
      break;

    case 'lastName':
      const lastNameValidation = validateStudentName('', value);
      if (lastNameValidation.errors.length > 0) {
        return { field: 'lastName', message: lastNameValidation.errors[0] };
      }
      break;

    case 'grade':
      if (value && !isValidGrade(value)) {
        return { field: 'grade', message: 'Invalid grade selection' };
      }
      break;
  }

  return null;
}

export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
}

export function clearFieldError(errors: ValidationError[], fieldName: string): ValidationError[] {
  return errors.filter(err => err.field !== fieldName);
}

export function getDefaultStudentData(): StudentFormData {
  return {
    firstName: DEFAULT_STUDENT_DATA.firstName,
    lastName: DEFAULT_STUDENT_DATA.lastName,
    grade: DEFAULT_STUDENT_DATA.grade
  };
}

export function isFormComplete(data: StudentFormData): boolean {
  return !!(data.firstName.trim() && data.lastName.trim());
}

export function hasUnsavedChanges(current: StudentFormData, original: StudentFormData): boolean {
  return current.firstName !== original.firstName ||
         current.lastName !== original.lastName ||
         current.grade !== original.grade;
}
