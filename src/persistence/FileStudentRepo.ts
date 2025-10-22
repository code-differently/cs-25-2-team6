import * as fs from "fs";
import * as path from "path";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
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

  findStudentById(id: string): Student | undefined {
    const students = this.allStudents();
    return students.find(student => student.id === id);
  }

  addStudent(student: Student): void {
    this.saveStudent(student);
  }

  clearAll(): void {
    fs.writeFileSync(this.filePath, JSON.stringify([]));
  }
}
