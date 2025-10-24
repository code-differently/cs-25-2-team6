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
      if (!value.trim()) {
        return { field: 'firstName', message: 'First name is required' };
      }
      const firstNameValidation = validateStudentName(value, 'TempLast');
      const firstNameErrors = firstNameValidation.errors.filter(err => err.includes('First'));
      if (firstNameErrors.length > 0) {
        return { field: 'firstName', message: firstNameErrors[0] };
      }
      break;

    case 'lastName':
      if (!value.trim()) {
        return { field: 'lastName', message: 'Last name is required' };
      }
      const lastNameValidation = validateStudentName('TempFirst', value);
      const lastNameErrors = lastNameValidation.errors.filter(err => err.includes('Last'));
      if (lastNameErrors.length > 0) {
        return { field: 'lastName', message: lastNameErrors[0] };
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
