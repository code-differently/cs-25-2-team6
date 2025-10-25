import { 
  validateClassId, 
  validateClassName, 
  validateClassForm, 
  generateNextClassId,
  sanitizeClassInput 
} from '../../src/utils/classValidation';
import { ClassFormData } from '../../src/types/classForm';

describe('Class Validation', () => {
  describe('validateClassId', () => {
    it('should validate correct class ID format', () => {
      const result = validateClassId('CLS001', []);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe(true);
      expect(result.isUnique).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject empty class ID', () => {
      const result = validateClassId('', []);
      expect(result.isValid).toBe(false);
      expect(result.format).toBe(false);
      expect(result.isUnique).toBe(true);
      expect(result.message).toBe('Class ID is required');
    });

    it('should reject invalid class ID format', () => {
      const result = validateClassId('INVALID', []);
      expect(result.isValid).toBe(false);
      expect(result.format).toBe(false);
      expect(result.isUnique).toBe(true);
      expect(result.message).toBe('Class ID must follow format CLS001');
    });

    it('should detect duplicate class ID', () => {
      const existingIds = ['CLS001', 'CLS002'];
      const result = validateClassId('CLS001', existingIds);
      expect(result.isValid).toBe(false);
      expect(result.format).toBe(true);
      expect(result.isUnique).toBe(false);
      expect(result.message).toBe('Class ID already exists');
    });

    it('should handle whitespace in class ID', () => {
      const result = validateClassId('  CLS001  ', []);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe(true);
      expect(result.isUnique).toBe(true);
    });
  });

  describe('validateClassName', () => {
    it('should validate correct class name', () => {
      const result = validateClassName('Math 101');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('Math 101');
      expect(result.message).toBeUndefined();
    });

    it('should reject empty class name', () => {
      const result = validateClassName('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Class name is required');
      expect(result.value).toBe('');
    });

    it('should reject class name that is too short', () => {
      const result = validateClassName('A');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Class name must be at least 2 characters');
      expect(result.value).toBe('A');
    });

    it('should reject class name that is too long', () => {
      const longName = 'A'.repeat(101);
      const result = validateClassName(longName);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Class name cannot exceed 100 characters');
      expect(result.value).toBe(longName);
    });

    it('should trim whitespace from class name', () => {
      const result = validateClassName('  Math 101  ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('Math 101');
    });

    it('should handle custom validation options', () => {
      const result = validateClassName('Math 101', { minLength: 5, maxLength: 20 });
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('Math 101');
    });

    it('should reject names with invalid characters when not allowed', () => {
      const result = validateClassName('Math@101!', { allowSpecialChars: false });
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Class name contains invalid characters');
    });
  });

  describe('validateClassForm', () => {
    it('should validate complete valid form', () => {
      const formData: ClassFormData = {
        name: 'Math 101',
        grade: '9',
        description: 'Basic mathematics course',
        teacherId: 'T001'
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(true);
      expect(result.fieldErrors).toHaveLength(0);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should validate form with minimal required fields', () => {
      const formData: ClassFormData = {
        name: 'English 101'
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(true);
      expect(result.fieldErrors).toHaveLength(0);
    });

    it('should reject form with invalid name', () => {
      const formData: ClassFormData = {
        name: ''
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Class name is required');
      expect(result.fieldErrors).toHaveLength(1);
      expect(result.fieldErrors[0].field).toBe('name');
    });

    it('should reject form with invalid grade', () => {
      const formData: ClassFormData = {
        name: 'Math 101',
        grade: 'InvalidGrade'
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.grade).toBe('Invalid grade level');
      expect(result.fieldErrors.some(e => e.field === 'grade')).toBe(true);
    });

    it('should reject form with description too long', () => {
      const formData: ClassFormData = {
        name: 'Math 101',
        description: 'A'.repeat(501)
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description cannot exceed 500 characters');
      expect(result.fieldErrors.some(e => e.field === 'description')).toBe(true);
    });

    it('should handle multiple validation errors', () => {
      const formData: ClassFormData = {
        name: '',
        grade: 'InvalidGrade',
        description: 'A'.repeat(501)
      };

      const result = validateClassForm(formData, []);
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors).toHaveLength(3);
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.grade).toBeTruthy();
      expect(result.errors.description).toBeTruthy();
    });
  });

  describe('generateNextClassId', () => {
    it('should generate CLS001 for empty list', () => {
      const result = generateNextClassId([]);
      expect(result).toBe('CLS001');
    });

    it('should generate next sequential ID', () => {
      const existingIds = ['CLS001', 'CLS002'];
      const result = generateNextClassId(existingIds);
      expect(result).toBe('CLS003');
    });

    it('should handle non-sequential existing IDs', () => {
      const existingIds = ['CLS001', 'CLS005', 'CLS003'];
      const result = generateNextClassId(existingIds);
      expect(result).toBe('CLS006');
    });

    it('should ignore invalid ID formats', () => {
      const existingIds = ['CLS001', 'INVALID', 'CLS002'];
      const result = generateNextClassId(existingIds);
      expect(result).toBe('CLS003');
    });

    it('should handle maximum ID limit', () => {
      const existingIds = ['CLS999'];
      const result = generateNextClassId(existingIds);
      expect(result).toBe('CLS999'); // Should not exceed max
    });
  });

  describe('sanitizeClassInput', () => {
    it('should trim whitespace from all fields', () => {
      const input: ClassFormData = {
        name: '  Math 101  ',
        grade: '  9  ',
        description: '  Basic math course  ',
        teacherId: '  T001  '
      };

      const result = sanitizeClassInput(input);
      expect(result.name).toBe('Math 101');
      expect(result.grade).toBe('9');
      expect(result.description).toBe('Basic math course');
      expect(result.teacherId).toBe('T001');
    });

    it('should handle undefined optional fields', () => {
      const input: ClassFormData = {
        name: '  Math 101  '
      };

      const result = sanitizeClassInput(input);
      expect(result.name).toBe('Math 101');
      expect(result.grade).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.teacherId).toBeUndefined();
    });

    it('should convert empty strings to undefined for optional fields', () => {
      const input: ClassFormData = {
        name: 'Math 101',
        grade: '',
        description: '',
        teacherId: ''
      };

      const result = sanitizeClassInput(input);
      expect(result.name).toBe('Math 101');
      expect(result.grade).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.teacherId).toBeUndefined();
    });
  });
});
