import { FileStudentRepo, Student } from '../persistence/FileStudentRepo';
import { StudentValidator, ValidationResult } from '../validation/StudentValidator';
import { StudentProfile } from '../domains/StudentProfile';

export class StudentManagementService {
  private repo: FileStudentRepo;
  private validator: StudentValidator;

  constructor(repo?: FileStudentRepo) {
    this.repo = repo || new FileStudentRepo();
    this.validator = new StudentValidator(this.repo);
  }

  validateStudentUniqueness(studentId: string, excludeId?: string): ValidationResult {
    return this.validator.validateIdUniqueness(studentId, excludeId);
  }

  createStudentProfile(studentData: StudentProfile): { student?: Student; validation: ValidationResult } {
    const validation = this.validator.validateStudent(studentData);
    if (!validation.valid) return { validation };
    const student = this.repo.createStudent(studentData);
    return { student, validation };
  }

  updateStudentProfile(id: string, updates: Partial<StudentProfile>): { student?: Student; validation: ValidationResult } {
    const existing = this.repo.findStudentById(id);
    if (!existing) return { validation: { valid: false, errors: ['Student not found'] } };
    const merged = { ...existing, ...updates };
    const validation = this.validator.validateStudent(merged, id);
    if (!validation.valid) return { validation };
    const student = this.repo.updateStudent(id, updates, true);
    return { student, validation };
  }

  deleteStudentProfile(id: string, options?: { cascade?: boolean }): boolean {
    return this.repo.deleteStudent(id, options);
  }

  bulkStudentOperations(operations: Array<{ type: string; id?: string; data?: StudentProfile }>): Array<{ success: boolean; result?: any; error?: string }> {
    const results = [];
    for (const op of operations) {
      try {
        let result;
        if (op.type === 'create' && op.data) {
          const validation = this.validator.validateStudent(op.data);
          if (!validation.valid) throw new Error(validation.errors.join(', '));
          result = this.repo.createStudent(op.data);
        } else if (op.type === 'update' && op.id && op.data) {
          const existing = this.repo.findStudentById(op.id);
          if (!existing) throw new Error('Student not found');
          const merged = { ...existing, ...op.data };
          const validation = this.validator.validateStudent(merged, op.id);
          if (!validation.valid) throw new Error(validation.errors.join(', '));
          result = this.repo.updateStudent(op.id, op.data, true);
        } else if (op.type === 'delete' && op.id) {
          result = this.repo.deleteStudent(op.id, { cascade: true });
        } else {
          throw new Error('Invalid operation');
        }
        results.push({ success: true, result });
      } catch (error) {
        const errorMsg = (error instanceof Error && error.message) ? error.message : String(error);
        results.push({ success: false, error: errorMsg });
      }
    }
    return results;
  }
}
