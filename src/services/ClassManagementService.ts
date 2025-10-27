import { ClassProfile } from '../domains/ClassProfile';
import { ClassStudent } from '../domains/ClassStudent';
import { FileClassRepo } from '../persistence/FileClassRepo';
import { FileClassStudentRepo } from '../persistence/FileClassStudentRepo';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { ClassValidator, ValidationResult } from '../validation/ClassValidator';

export class ClassManagementService {
  private classRepo: FileClassRepo;
  private classStudentRepo: FileClassStudentRepo;
  private studentRepo: FileStudentRepo;
  private attendanceRepo: FileAttendanceRepo;
  private validator: ClassValidator;

  constructor(
    classRepo?: FileClassRepo,
    classStudentRepo?: FileClassStudentRepo,
    studentRepo?: FileStudentRepo,
    attendanceRepo?: FileAttendanceRepo
  ) {
    this.classRepo = classRepo || new FileClassRepo();
    this.classStudentRepo = classStudentRepo || new FileClassStudentRepo();
    this.studentRepo = studentRepo || new FileStudentRepo();
    this.attendanceRepo = attendanceRepo || new FileAttendanceRepo();
    this.validator = new ClassValidator(this.studentRepo);
  }

  async createClassWithStudents(classData: ClassProfile, studentIds: string[]): Promise<{ class?: ClassProfile; validation: ValidationResult }> {
    const validation = this.validator.validateRequiredFields(classData);
    if (!validation.valid) return { validation };
    const relValidation = this.validator.validateClassStudentRelationships(classData.id, studentIds);
    if (!relValidation.valid) return { validation: relValidation };
    const createdClass = this.classRepo.createClass(classData);
    await this.classStudentRepo.addStudentsToClass(classData.id, studentIds);
    return { class: createdClass, validation: { valid: true, errors: [] } };
  }

  async addStudentsToClass(classId: string, studentIds: string[]): Promise<ValidationResult> {
    const relValidation = this.validator.validateClassStudentRelationships(classId, studentIds);
    if (!relValidation.valid) return relValidation;
    await this.classStudentRepo.addStudentsToClass(classId, studentIds);
    return { valid: true, errors: [] };
  }

  async removeStudentsFromClass(classId: string, studentIds: string[]): Promise<ValidationResult> {
    await this.classStudentRepo.removeStudentsFromClass(classId, studentIds);
    return { valid: true, errors: [] };
  }

  async deleteClassSafely(classId: string, preserveStudents: boolean): Promise<boolean> {
    if (!preserveStudents) {
      await this.classStudentRepo.removeAllStudentsFromClass(classId);
    }
    return this.classRepo.deleteClass(classId);
  }

  async validateClassStudentRelationships(classId: string, studentIds: string[]): Promise<ValidationResult> {
    return this.validator.validateClassStudentRelationships(classId, studentIds);
  }

  async getClassAttendanceSummary(classId: string, dateRange: { start: string; end: string }): Promise<any> {
    const studentIds = this.classStudentRepo.getStudentsInClass(classId);
    const attendanceRecords = studentIds.flatMap((studentId: string) =>
      this.attendanceRepo.findByStudentAndDateRange(studentId, dateRange.start, dateRange.end)
    );
    // Summarize attendance as needed
    return { classId, attendanceRecords };
  }

  async getClassById(classId: string): Promise<ClassProfile | undefined> {
    return this.classRepo.findClassById(classId);
  }

  async getAllClasses(): Promise<ClassProfile[]> {
    // Fetch all classes and normalize to ensure 'id', 'name', 'subject', 'teacher', 'grade', and 'status' fields exist
    const classes = this.classRepo.getAllClasses();
    return classes.map(cls => ({
      ...cls,
      id: cls.id,
      name: cls.name || cls.id, // fallback to id if name missing
      subject: cls.subject || '',
      teacher: cls.teacher || '',
      grade: cls.grade || '',
      status: cls.status || '',
    }));
  }

  async updateClass(classId: string, updates: Partial<ClassProfile>): Promise<ClassProfile | undefined> {
    return this.classRepo.updateClass(classId, updates);
  }
}
