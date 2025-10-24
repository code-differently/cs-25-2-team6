import { 
  STUDENT_ID_VALIDATION, 
  NAME_VALIDATION, 
  GRADE_VALIDATION, 
  VALIDATION_MESSAGES 
} from '../constants/studentConstants';
import { 
  StudentIdValidationResult, 
  NameValidationOptions, 
  GradeValidationOptions 
} from '../types/studentForm';

export function validateStudentId(id: string, existingIds: string[] = []): StudentIdValidationResult {
  const trimmedId = id.trim();
  
  if (!trimmedId) {
    return {
      isValid: false,
      isUnique: true,
      format: false,
      message: VALIDATION_MESSAGES.STUDENT_ID_REQUIRED
    };
  }

  const format = STUDENT_ID_VALIDATION.PATTERN.test(trimmedId);
  const isUnique = !existingIds.includes(trimmedId);

  return {
    isValid: format && isUnique,
    isUnique,
    format,
    message: !format 
      ? VALIDATION_MESSAGES.STUDENT_ID_INVALID_FORMAT
      : !isUnique 
        ? VALIDATION_MESSAGES.STUDENT_ID_NOT_UNIQUE
        : undefined
  };
}

export function validateStudentName(
  firstName: string, 
  lastName: string, 
  options: NameValidationOptions = {}
): { firstName: boolean; lastName: boolean; errors: string[] } {
  const {
    minLength = NAME_VALIDATION.MIN_LENGTH,
    maxLength = NAME_VALIDATION.MAX_LENGTH,
    allowSpecialChars = true
  } = options;

  const errors: string[] = [];
  const pattern = allowSpecialChars ? NAME_VALIDATION.PATTERN : /^[a-zA-Z\s]+$/;

  const firstNameTrimmed = firstName.trim();
  const lastNameTrimmed = lastName.trim();

  const firstNameValid = firstNameTrimmed.length >= minLength && 
                        firstNameTrimmed.length <= maxLength && 
                        pattern.test(firstNameTrimmed);

  const lastNameValid = lastNameTrimmed.length >= minLength && 
                       lastNameTrimmed.length <= maxLength && 
                       pattern.test(lastNameTrimmed);

  if (!firstNameTrimmed) {
    errors.push(VALIDATION_MESSAGES.FIRST_NAME_REQUIRED);
  } else if (firstNameTrimmed.length > maxLength) {
    errors.push(VALIDATION_MESSAGES.FIRST_NAME_TOO_LONG);
  } else if (!pattern.test(firstNameTrimmed)) {
    errors.push(VALIDATION_MESSAGES.FIRST_NAME_INVALID_CHARS);
  }

  if (!lastNameTrimmed) {
    errors.push(VALIDATION_MESSAGES.LAST_NAME_REQUIRED);
  } else if (lastNameTrimmed.length > maxLength) {
    errors.push(VALIDATION_MESSAGES.LAST_NAME_TOO_LONG);
  } else if (!pattern.test(lastNameTrimmed)) {
    errors.push(VALIDATION_MESSAGES.LAST_NAME_INVALID_CHARS);
  }

  return {
    firstName: firstNameValid,
    lastName: lastNameValid,
    errors
  };
}

export function isValidGrade(grade?: string, options: GradeValidationOptions = {}): boolean {
  const { allowedGrades = GRADE_VALIDATION.ALLOWED_VALUES, isRequired = false } = options;

  if (!grade || grade.trim() === '') {
    return !isRequired;
  }

  const trimmedGrade = grade.trim();
  
  if (trimmedGrade.length > GRADE_VALIDATION.MAX_LENGTH) {
    return false;
  }

  return (allowedGrades as readonly string[]).includes(trimmedGrade);
}

export function generateNextStudentId(existingIds: string[]): string {
  const numbers = existingIds
    .filter(id => STUDENT_ID_VALIDATION.PATTERN.test(id))
    .map(id => parseInt(id.replace(STUDENT_ID_VALIDATION.PREFIX, '')))
    .filter(num => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = Math.min(maxNumber + 1, STUDENT_ID_VALIDATION.MAX_NUMBER);
  
  return `${STUDENT_ID_VALIDATION.PREFIX}${String(nextNumber).padStart(3, '0')}`;
}
