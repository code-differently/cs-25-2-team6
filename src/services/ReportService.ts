import { Student, AttendanceRecord, AttendanceStatus } from '../types';

/**
 * ReportService - Handles attendance reporting and filtering functionality
 * This is a stub implementation for testing purposes
 */
export class ReportService {
  private students: Map<string, Student> = new Map();
  private attendanceRecords: AttendanceRecord[] = [];

  /**
   * Add a student to the service
   */
  addStudent(student: Student): void {
    this.students.set(student.id, student);
  }

  /**
   * Add an attendance record
   */
  addAttendanceRecord(record: AttendanceRecord): void {
    this.attendanceRecords.push(record);
  }

  /**
   * Clear all data - useful for testing
   */
  clear(): void {
    this.students.clear();
    this.attendanceRecords = [];
  }

  /**
   * Get all attendance records
   */
  getAllAttendanceRecords(): AttendanceRecord[] {
    return [...this.attendanceRecords];
  }

  /**
   * Filter attendance records by lastName (case-insensitive)
   * Returns empty array for unknown lastName (not an error)
   */
  getAttendanceByLastName(lastName: string): AttendanceRecord[] {
    if (!lastName || typeof lastName !== 'string') {
      return [];
    }

    const normalizedLastName = this.normalizeString(lastName.trim());
    if (!normalizedLastName) {
      return [];
    }

    const matchingStudentIds = Array.from(this.students.values())
      .filter(student => this.normalizeString(student.lastName) === normalizedLastName)
      .map(student => student.id);

    return this.attendanceRecords.filter(record => 
      matchingStudentIds.includes(record.studentId)
    );
  }

  /**
   * Normalize string for case-insensitive comparison including accented characters
   */
  private normalizeString(str: string): string {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Filter attendance records by date
   */
  getAttendanceByDate(dateISO: string): AttendanceRecord[] {
    if (!dateISO || typeof dateISO !== 'string') {
      return [];
    }

    const trimmedDate = dateISO.trim();
    if (!trimmedDate) {
      return [];
    }

    return this.attendanceRecords.filter(record => record.date === trimmedDate);
  }

  /**
   * Filter attendance records by lastName AND date (AND behavior)
   * Both conditions must be satisfied
   */
  getAttendanceByLastNameAndDate(lastName: string, dateISO: string): AttendanceRecord[] {
    if (!lastName || !dateISO || typeof lastName !== 'string' || typeof dateISO !== 'string') {
      return [];
    }

    const lastNameRecords = this.getAttendanceByLastName(lastName);
    const dateRecords = this.getAttendanceByDate(dateISO);

    return lastNameRecords.filter(lastNameRecord =>
      dateRecords.some(dateRecord =>
        dateRecord.studentId === lastNameRecord.studentId && 
        dateRecord.date === lastNameRecord.date
      )
    );
  }

  /**
   * Get student by ID
   */
  getStudentById(studentId: string): Student | undefined {
    return this.students.get(studentId);
  }
}