import { FileStudentRepo, Student } from '../persistence/FileStudentRepo';
import { StudentValidator, ValidationResult } from '../validation/StudentValidator';
import { StudentProfile } from '../domains/StudentProfile';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
// If you have a class repo, import it here
// import { FileClassRepo } from '../persistence/FileClassRepo';

export class StudentManagementService {
  private repo: FileStudentRepo;
  private validator: StudentValidator;
  private attendanceRepo: FileAttendanceRepo;
  // private classRepo: FileClassRepo; // Uncomment if implemented

  constructor(repo?: FileStudentRepo, attendanceRepo?: FileAttendanceRepo) {
    this.repo = repo || new FileStudentRepo();
    this.validator = new StudentValidator(this.repo);
    this.attendanceRepo = attendanceRepo || new FileAttendanceRepo();
    // this.classRepo = classRepo || new FileClassRepo(); // Uncomment if implemented
  }

  validateStudentUniqueness(studentId: string, excludeId?: string): ValidationResult {
    return this.validator.validateIdUniqueness(studentId, excludeId);
  }

  /**
   * Handle student dependencies (attendance/class)
   */
  async handleStudentDependencies(studentId: string): Promise<{ attendanceCount: number; classCount: number }> {
    const attendanceRecords = this.attendanceRepo.getRecordsByStudentId(studentId);
    // const classMemberships = this.classRepo.getClassesForStudent(studentId); // Uncomment if implemented
    return {
      attendanceCount: attendanceRecords.length,
      classCount: 0 // Replace with classMemberships.length if implemented
    };
  }

  /**
   * Enhanced delete: prevent deletion if dependencies exist
   */
  async deleteStudentProfile(id: string, options?: { cascade?: boolean, preventIfDependencies?: boolean }): Promise<boolean> {
    if (options?.preventIfDependencies) {
      const deps = await this.handleStudentDependencies(id);
      if (deps.attendanceCount > 0 || deps.classCount > 0) {
        throw new Error('Cannot delete student: dependencies exist');
      }
    }
    // Cascade: remove attendance/class records
    if (options?.cascade) {
      this.attendanceRepo.deleteRecordsByStudentId(id);
      // if (this.classRepo) this.classRepo.removeStudentFromAllClasses(id); // Uncomment if implemented
    }
    return this.repo.deleteStudent(id, options);
  }

  /**
   * Enhanced create/update: cascade changes to attendance/class systems if needed
   */
  async createStudentProfile(studentData: StudentProfile): Promise<{ student?: Student; validation: ValidationResult }> {
    const validation = this.validator.validateStudent(studentData);
    if (!validation.valid) return { validation };
    // Optionally update attendance/class systems here
    // Example: this.attendanceRepo.syncStudent(studentData);
    const student = this.repo.createStudent(studentData);
    return { student, validation };
  }

  async updateStudentProfile(id: string, updates: Partial<StudentProfile>): Promise<{ student?: Student; validation: ValidationResult }> {
    const existing = this.repo.findStudentById(id);
    if (!existing) return { validation: { valid: false, errors: ['Student not found'] } };
    const merged = { ...existing, ...updates };
    const validation = this.validator.validateStudent(merged, id);
    if (!validation.valid) return { validation };
    // Optionally update attendance/class systems here
    // Example: this.attendanceRepo.syncStudent(merged);
    const student = this.repo.updateStudent(id, updates, true);
    return { student, validation };
  }

  /**
   * Public method to fetch a student by ID
   */
  getStudentById(id: string): Student | undefined {
    return this.repo.findStudentById(id);
  }

  async bulkStudentOperations(operations: Array<{ type: string; id?: string; data?: StudentProfile }>): Promise<Array<{ success: boolean; result?: any; error?: string }>> {
    const results = [];
    for (const op of operations) {
      try {
        let result;
        if (op.type === 'create' && op.data) {
          const validation = this.validator.validateStudent(op.data);
          if (!validation.valid) throw new Error(validation.errors.join(', '));
          result = await this.repo.createStudent(op.data);
        } else if (op.type === 'update' && op.id && op.data) {
          const existing = this.repo.findStudentById(op.id);
          if (!existing) throw new Error('Student not found');
          const merged = { ...existing, ...op.data };
          const validation = this.validator.validateStudent(merged, op.id);
          if (!validation.valid) throw new Error(validation.errors.join(', '));
          result = await this.repo.updateStudent(op.id, op.data, true);
        } else if (op.type === 'delete' && op.id) {
          result = await this.deleteStudentProfile(op.id, { cascade: true });
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
