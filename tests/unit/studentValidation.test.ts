import { 
  validateStudentId, 
  validateStudentName, 
  isValidGrade, 
  generateNextStudentId 
} from '../../src/utils/studentValidation';
import { STUDENT_ID_VALIDATION, VALIDATION_MESSAGES } from '../../src/constants/studentConstants';

describe('Student Validation', () => {
  describe('validateStudentId', () => {
    it('should validate correct student ID format', () => {
      const result = validateStudentId('STU001', []);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe(true);
      expect(result.isUnique).toBe(true);
    });

    it('should reject invalid ID format', () => {
      const result = validateStudentId('INVALID', []);
      expect(result.isValid).toBe(false);
      expect(result.format).toBe(false);
      expect(result.message).toBe(VALIDATION_MESSAGES.STUDENT_ID_INVALID_FORMAT);
    });

    it('should detect duplicate IDs', () => {
      const result = validateStudentId('STU001', ['STU001', 'STU002']);
      expect(result.isValid).toBe(false);
      expect(result.isUnique).toBe(false);
      expect(result.message).toBe(VALIDATION_MESSAGES.STUDENT_ID_NOT_UNIQUE);
    });

    it('should require non-empty ID', () => {
      const result = validateStudentId('', []);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(VALIDATION_MESSAGES.STUDENT_ID_REQUIRED);
    });
  });

  describe('validateStudentName', () => {
    it('should validate correct names', () => {
      const result = validateStudentName('John', 'Doe');
      expect(result.firstName).toBe(true);
      expect(result.lastName).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty first name', () => {
      const result = validateStudentName('', 'Doe');
      expect(result.firstName).toBe(false);
      expect(result.errors).toContain(VALIDATION_MESSAGES.FIRST_NAME_REQUIRED);
    });

    it('should reject empty last name', () => {
      const result = validateStudentName('John', '');
      expect(result.lastName).toBe(false);
      expect(result.errors).toContain(VALIDATION_MESSAGES.LAST_NAME_REQUIRED);
    });

    it('should handle names with special characters', () => {
      const result = validateStudentName("John-Paul", "O'Connor");
      expect(result.firstName).toBe(true);
      expect(result.lastName).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('isValidGrade', () => {
    it('should validate allowed grades', () => {
      expect(isValidGrade('K')).toBe(true);
      expect(isValidGrade('12')).toBe(true);
      expect(isValidGrade('Freshman')).toBe(true);
    });

    it('should reject invalid grades', () => {
      expect(isValidGrade('Invalid')).toBe(false);
      expect(isValidGrade('13')).toBe(false);
    });

    it('should handle optional grades', () => {
      expect(isValidGrade(undefined)).toBe(true);
      expect(isValidGrade('')).toBe(true);
    });
  });

  describe('generateNextStudentId', () => {
    it('should generate first student ID', () => {
      const result = generateNextStudentId([]);
      expect(result).toBe('STU001');
    });

    it('should generate next sequential ID', () => {
      const result = generateNextStudentId(['STU001', 'STU002']);
      expect(result).toBe('STU003');
    });

    it('should handle non-sequential IDs', () => {
      const result = generateNextStudentId(['STU001', 'STU005']);
      expect(result).toBe('STU006');
    });

    it('should handle invalid ID formats in existing list', () => {
      const result = generateNextStudentId(['STU001', 'INVALID', 'STU003']);
      expect(result).toBe('STU004');
    });

    it('should respect maximum ID limit', () => {
      const result = generateNextStudentId(['STU999']);
      expect(result).toBe('STU999');
    });
  });

  describe('validateStudentName edge cases', () => {
    it('should handle names at maximum length', () => {
      const longName = 'A'.repeat(50);
      const result = validateStudentName(longName, longName);
      expect(result.firstName).toBe(true);
      expect(result.lastName).toBe(true);
    });

    it('should reject names exceeding maximum length', () => {
      const tooLongName = 'A'.repeat(51);
      const result = validateStudentName(tooLongName, 'Valid');
      expect(result.firstName).toBe(false);
      expect(result.errors.some(err => err.includes('exceed'))).toBe(true);
    });

    it('should handle whitespace-only names', () => {
      const result = validateStudentName('   ', 'Valid');
      expect(result.firstName).toBe(false);
      expect(result.errors).toContain('First name is required');
    });
  });
});
