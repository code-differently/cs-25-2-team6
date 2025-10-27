import { 
  validateStudentForm, 
  validateField, 
  getDefaultStudentData, 
  isFormComplete, 
  hasUnsavedChanges,
  hasValidationErrors,
  getFieldError,
  clearFieldError
} from '../../src/utils/formValidation';
import { StudentFormData, FormValidationContext, ValidationError } from '../../src/types/studentForm';

describe('Form Validation', () => {
  const mockContext: FormValidationContext = {
    mode: 'create',
    existingStudentIds: ['STU001', 'STU002']
  };

  describe('validateStudentForm', () => {
    it('should validate complete valid form', () => {
      const formData: StudentFormData = {
        firstName: 'John',
        lastName: 'Doe',
        grade: 'K'
      };
      
      const result = validateStudentForm(formData, mockContext);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject form with missing required fields', () => {
      const formData: StudentFormData = {
        firstName: '',
        lastName: 'Doe',
        grade: 'K'
      };
      
      const result = validateStudentForm(formData, mockContext);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject form with invalid grade', () => {
      const formData: StudentFormData = {
        firstName: 'John',
        lastName: 'Doe',
        grade: 'Invalid'
      };
      
      const result = validateStudentForm(formData, mockContext);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'grade')).toBe(true);
    });
  });

  describe('validateField', () => {
    it('should validate individual firstName field', () => {
      const result = validateField('firstName', 'John', mockContext);
      expect(result).toBeNull();
    });

    it('should reject empty firstName', () => {
      const result = validateField('firstName', '', mockContext);
      expect(result).not.toBeNull();
      expect(result?.field).toBe('firstName');
    });

    it('should validate grade field', () => {
      const result = validateField('grade', 'K', mockContext);
      expect(result).toBeNull();
    });
  });

  describe('getDefaultStudentData', () => {
    it('should return default form data', () => {
      const defaults = getDefaultStudentData();
      expect(defaults.firstName).toBe('');
      expect(defaults.lastName).toBe('');
      expect(defaults.grade).toBeUndefined();
    });
  });

  describe('isFormComplete', () => {
    it('should detect complete form', () => {
      const formData: StudentFormData = {
        firstName: 'John',
        lastName: 'Doe',
        grade: 'K'
      };
      
      expect(isFormComplete(formData)).toBe(true);
    });

    it('should detect incomplete form', () => {
      const formData: StudentFormData = {
        firstName: '',
        lastName: 'Doe',
        grade: 'K'
      };
      
      expect(isFormComplete(formData)).toBe(false);
    });
  });

  describe('hasUnsavedChanges', () => {
    const original: StudentFormData = {
      firstName: 'John',
      lastName: 'Doe',
      grade: 'K'
    };

    it('should detect no changes', () => {
      const current = { ...original };
      expect(hasUnsavedChanges(current, original)).toBe(false);
    });

    it('should detect firstName changes', () => {
      const current = { ...original, firstName: 'Jane' };
      expect(hasUnsavedChanges(current, original)).toBe(true);
    });

    it('should detect grade changes', () => {
      const current = { ...original, grade: '1' };
      expect(hasUnsavedChanges(current, original)).toBe(true);
    });
  });

  describe('hasValidationErrors', () => {
    it('should return true when errors exist', () => {
      const errors: ValidationError[] = [{ field: 'firstName', message: 'Required' }];
      expect(hasValidationErrors(errors)).toBe(true);
    });

    it('should return false when no errors exist', () => {
      expect(hasValidationErrors([])).toBe(false);
    });
  });

  describe('getFieldError', () => {
    const errors: ValidationError[] = [
      { field: 'firstName', message: 'First name required' },
      { field: 'lastName', message: 'Last name required' }
    ];

    it('should return error message for existing field', () => {
      expect(getFieldError(errors, 'firstName')).toBe('First name required');
    });

    it('should return undefined for non-existing field', () => {
      expect(getFieldError(errors, 'grade')).toBeUndefined();
    });
  });

  describe('clearFieldError', () => {
    const errors: ValidationError[] = [
      { field: 'firstName', message: 'First name required' },
      { field: 'lastName', message: 'Last name required' }
    ];

    it('should remove specific field error', () => {
      const result = clearFieldError(errors, 'firstName');
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('lastName');
    });

    it('should return same array if field not found', () => {
      const result = clearFieldError(errors, 'grade');
      expect(result).toHaveLength(2);
    });
  });
});
