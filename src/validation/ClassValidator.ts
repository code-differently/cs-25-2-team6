import { ClassProfile } from '../domains/ClassProfile';
import { ClassStudent } from '../domains/ClassStudent';
import { FileStudentRepo } from '../persistence/FileStudentRepo';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ClassValidator {
  private studentRepo: FileStudentRepo;

  constructor(studentRepo?: FileStudentRepo) {
    this.studentRepo = studentRepo || new FileStudentRepo();
  }

  validateRequiredFields(data: any): ValidationResult {
    const errors = [];
    if (!data.id) errors.push('ID is required');
    if (!data.name) errors.push('Name is required');
    return { valid: errors.length === 0, errors };
  }

  validateClassStudentRelationships(classId: string, studentIds: string[]): ValidationResult {
    const errors = [];
    const seen = new Set<string>();
    for (const studentId of studentIds) {
      if (seen.has(studentId)) errors.push(`Duplicate student ID: ${studentId}`);
      seen.add(studentId);
      const student = this.studentRepo.findStudentById(studentId);
      if (!student) errors.push(`Student not found: ${studentId}`);
    }
    return { valid: errors.length === 0, errors };
  }
}
