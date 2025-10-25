import * as fs from "fs";
import * as path from "path";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string; // Optional grade property
}

export class FileStudentRepo {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, "students.json");
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  saveStudent(student: Student): void {
    const students = this.allStudents();
    students.push(student);
    fs.writeFileSync(this.filePath, JSON.stringify(students, null, 2));
  }

  findStudentIdByName(firstName: string, lastName: string): string | undefined {
    const students = this.allStudents();
    const match = students.find(
      student => student.firstName === firstName && student.lastName === lastName
    );
    return match ? match.id : undefined;
  }

  allStudents(): Student[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      if (data.trim() === '') {
        // File is empty, initialize with empty array
        fs.writeFileSync(this.filePath, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data) as Student[];
    } catch (error) {
      // If file is corrupted or invalid JSON, reset to empty array
      fs.writeFileSync(this.filePath, JSON.stringify([]));
      return [];
    }
  }

  // New method for filtering by last name
  findStudentsByLastName(lastName: string): Student[] {
    const students = this.allStudents();
    return students.filter(student => student.lastName === lastName);
  }

  findStudentById(studentId: string): Student | undefined {
    return this.allStudents().find(s => s.id === studentId);
  }

  getAllStudents(): Student[] {
    return this.allStudents();
  }

  addStudent(student: Student): void {
    this.saveStudent(student);
  }

  clearAll(): void {
    fs.writeFileSync(this.filePath, JSON.stringify([]));
  }

  /**
   * Delete student profile, optionally cascade
   */
  deleteStudent(id: string, options?: { cascade?: boolean }): boolean {
    let students = this.allStudents();
    const initialLength = students.length;
    students = students.filter(s => s.id !== id);
    fs.writeFileSync(this.filePath, JSON.stringify(students, null, 2));
    if (options?.cascade) {
      // Cascade delete: remove related attendance and class records
      this.cascadeDeleteAttendance(id);
      this.cascadeDeleteClassMembership(id);
    }
    return students.length < initialLength;
  }

  /**
   * Remove all attendance records for a student (stub)
   */
  private cascadeDeleteAttendance(studentId: string): void {
    // TODO: Implement actual attendance repo logic
    // Example: const attendanceRepo = new FileAttendanceRepo();
    // attendanceRepo.deleteRecordsByStudentId(studentId);
  }

  /**
   * Remove student from all classes (stub)
   */
  private cascadeDeleteClassMembership(studentId: string): void {
    // TODO: Implement actual class repo logic
    // Example: const classRepo = new FileClassRepo();
    // classRepo.removeStudentFromAllClasses(studentId);
  }

  /**
   * Create a new student if ID is unique (conflict resolution)
   */
  createStudent(student: Student): Student | undefined {
    if (!this.isStudentIdUnique(student.id)) {
      // Conflict resolution: do not create, throw error
      throw new Error('Student ID must be unique');
    }
    const students = this.allStudents();
    students.push(student);
    fs.writeFileSync(this.filePath, JSON.stringify(students, null, 2));
    return student;
  }

  /**
   * Update student profile (full or partial)
   */
  updateStudent(id: string, updates: Partial<Student>, partial: boolean = false): Student | undefined {
    const students = this.allStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    if (partial) {
      students[idx] = { ...students[idx], ...updates };
    } else {
      students[idx] = { ...updates, id } as Student;
    }
    fs.writeFileSync(this.filePath, JSON.stringify(students, null, 2));
    return students[idx];
  }

  /**
   * Check if student ID is unique (optionally exclude an ID)
   */
  isStudentIdUnique(studentId: string, excludeId?: string): boolean {
    const students = this.allStudents();
    return !students.some(s => s.id === studentId && s.id !== excludeId);
  }
}
