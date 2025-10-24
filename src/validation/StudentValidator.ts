import { StudentProfile } from '../domains/StudentProfile';
import { FileStudentRepo } from '../persistence/FileStudentRepo';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class StudentValidator {
  private repo: FileStudentRepo;

  constructor(repo?: FileStudentRepo) {
    this.repo = repo || new FileStudentRepo();
  }

  validateRequiredFields(data: any): ValidationResult {
    const errors = [];
    if (!data.id) errors.push('ID is required');
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    return { valid: errors.length === 0, errors };
  }

  validateIdUniqueness(id: string, excludeId?: string): ValidationResult {
    const isUnique = this.repo.isStudentIdUnique(id, excludeId);
    return {
      valid: isUnique,
      errors: isUnique ? [] : ['ID is not unique']
    };
  }

  validateFieldFormats(data: any): ValidationResult {
    const errors = [];
    if (data.id && !/^\w+$/.test(data.id)) errors.push('ID must be alphanumeric');
    if (data.grade && typeof data.grade !== 'string') errors.push('Grade must be a string');
    return { valid: errors.length === 0, errors };
  }

  validateStudent(data: any, excludeId?: string): ValidationResult {
    const required = this.validateRequiredFields(data);
    const unique = this.validateIdUniqueness(data.id, excludeId);
    const formats = this.validateFieldFormats(data);
    const errors = [...required.errors, ...unique.errors, ...formats.errors];
    return { valid: errors.length === 0, errors };
  }
}
