import { Student } from './Student';

export class DuplicateStudentError extends Error {
  constructor(id: string) {
    super(`Student with id "${id}" already exists`);
    this.name = 'DuplicateStudentError';
  }
}

export class StudentRoster {
  private byId = new Map<string, Student>();

  addStudent(student: Student): void {
    if (this.byId.has(student.id)) throw new DuplicateStudentError(student.id);
    this.byId.set(student.id, student);
  }

  getStudent(id: string): Student | undefined {
    return this.byId.get(id);
  }

  updateStudent(student: Student): void {
    if (!this.byId.has(student.id)) return;
    this.byId.set(student.id, student);
  }

  removeStudent(id: string): void {
    this.byId.delete(id);
  }

  findByLastName(lastName: string): Student[] {
    const q = lastName.trim().toLowerCase();
    return Array.from(this.byId.values()).filter(s => s.lastName.toLowerCase() === q);
  }

  listAll(): Student[] {
    return Array.from(this.byId.values());
  }

  size(): number {
    return this.byId.size;
  }
}
