import { 
  CLASS_ID_VALIDATION, 
  CLASS_NAME_VALIDATION, 
  CLASS_DESCRIPTION_VALIDATION,
  CLASS_VALIDATION_MESSAGES 
} from '../constants/classConstants';
import { 
  ClassIdValidationResult, 
  ClassNameValidationOptions, 
  ClassValidationResult,
  ClassFormData,
  ClassFieldValidationResult
} from '../types/classForm';
import { isValidGrade } from './studentValidation';

export function validateClassId(id: string, existingIds: string[] = []): ClassIdValidationResult {
  const trimmedId = id.trim();
  
  if (!trimmedId) {
    return {
      isValid: false,
      isUnique: true,
      format: false,
      message: CLASS_VALIDATION_MESSAGES.CLASS_ID_REQUIRED
    };
  }

  const format = CLASS_ID_VALIDATION.PATTERN.test(trimmedId);
  const isUnique = !existingIds.includes(trimmedId);

  return {
    isValid: format && isUnique,
    isUnique,
    format,
    message: !format 
      ? CLASS_VALIDATION_MESSAGES.CLASS_ID_INVALID_FORMAT
      : !isUnique 
        ? CLASS_VALIDATION_MESSAGES.CLASS_ID_NOT_UNIQUE
        : undefined
  };
}

export function validateClassName(
  name: string, 
  options: ClassNameValidationOptions = {}
): ClassFieldValidationResult {
  const {
    minLength = CLASS_NAME_VALIDATION.MIN_LENGTH,
    maxLength = CLASS_NAME_VALIDATION.MAX_LENGTH,
    allowSpecialChars = true
  } = options;

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      message: CLASS_VALIDATION_MESSAGES.NAME_REQUIRED,
      value: trimmedName
    };
  }

  if (trimmedName.length < minLength) {
    return {
      isValid: false,
      message: CLASS_VALIDATION_MESSAGES.NAME_TOO_SHORT,
      value: trimmedName
    };
  }

  if (trimmedName.length > maxLength) {
    return {
      isValid: false,
      message: CLASS_VALIDATION_MESSAGES.NAME_TOO_LONG,
      value: trimmedName
    };
  }

  if (!allowSpecialChars && !CLASS_NAME_VALIDATION.PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      message: CLASS_VALIDATION_MESSAGES.NAME_INVALID_CHARS,
      value: trimmedName
    };
  }

  return {
    isValid: true,
    value: trimmedName
  };
}

export function validateClassForm(data: ClassFormData, existingIds: string[] = []): ClassValidationResult {
  const errors: ClassValidationResult['errors'] = {};
  const fieldErrors: ClassValidationResult['fieldErrors'] = [];

  // Validate name
  const nameResult = validateClassName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.message;
    fieldErrors.push({ field: 'name', message: nameResult.message || 'Invalid name' });
  }

  // Validate grade (optional)
  if (data.grade && !isValidGrade(data.grade)) {
    errors.grade = CLASS_VALIDATION_MESSAGES.GRADE_INVALID;
    fieldErrors.push({ field: 'grade', message: CLASS_VALIDATION_MESSAGES.GRADE_INVALID });
  }

  // Validate description (optional)
  if (data.description && data.description.trim().length > CLASS_DESCRIPTION_VALIDATION.MAX_LENGTH) {
    errors.description = CLASS_VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG;
    fieldErrors.push({ field: 'description', message: CLASS_VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG });
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    fieldErrors
  };
}

export function generateNextClassId(existingIds: string[]): string {
  const numbers = existingIds
    .filter(id => CLASS_ID_VALIDATION.PATTERN.test(id))
    .map(id => parseInt(id.substring(3), 10))
    .filter(num => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = Math.min(maxNumber + 1, CLASS_ID_VALIDATION.MAX_NUMBER);
  
  return `${CLASS_ID_VALIDATION.PREFIX}${nextNumber.toString().padStart(3, '0')}`;
}

export function sanitizeClassInput(input: ClassFormData): ClassFormData {
  return {
    name: input.name.trim(),
    grade: input.grade?.trim() || undefined,
    description: input.description?.trim() || undefined,
    teacherId: input.teacherId?.trim() || undefined
  };
}
