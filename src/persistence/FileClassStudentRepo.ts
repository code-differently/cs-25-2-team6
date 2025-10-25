import { ClassStudent } from '../domains/ClassStudent';

export class FileClassStudentRepo {
  private classStudents: ClassStudent[] = [];

  addStudentsToClass(classId: string, studentIds: string[]): void {
    for (const studentId of studentIds) {
      if (!this.classStudents.some(cs => cs.classId === classId && cs.studentId === studentId)) {
        this.classStudents.push({ classId, studentId });
      }
    }
  }

  removeStudentsFromClass(classId: string, studentIds: string[]): void {
    this.classStudents = this.classStudents.filter(cs =>
      cs.classId !== classId || !studentIds.includes(cs.studentId)
    );
  }

  removeAllStudentsFromClass(classId: string): void {
    this.classStudents = this.classStudents.filter(cs => cs.classId !== classId);
  }

  getStudentsInClass(classId: string): string[] {
    return this.classStudents
      .filter(cs => cs.classId === classId)
      .map(cs => cs.studentId);
  }
}
