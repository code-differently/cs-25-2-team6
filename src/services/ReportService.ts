import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';

export class ReportService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();

  filterAttendanceBy(options: { lastName?: string; status?: AttendanceStatus; dateISO?: string }): AttendanceRecord[] {
    let studentIds: string[] | undefined = undefined;
    if (options.lastName) {
      studentIds = this.resolveStudentIdsByLastName(options.lastName);
      if (studentIds.length === 0) return [];
    }
    let records = this.attendanceRepo.allAttendance();
    if (studentIds) {
      records = records.filter(r => studentIds!.includes(r.studentId));
    }
    if (options.status) {
      records = records.filter(r => r.status === options.status);
    }
    if (options.dateISO) {
      records = records.filter(r => r.dateISO === options.dateISO);
    }
    // Sort by dateISO, then studentId for deterministic results
    records.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.studentId.localeCompare(b.studentId));
    return records;
  }

  getLateListBy(options: { lastName?: string; dateISO?: string }): AttendanceRecord[] {
    // Always filter by status = LATE
    return this.filterAttendanceBy({
      lastName: options.lastName,
      status: AttendanceStatus.LATE,
      dateISO: options.dateISO
    });
  }

  getEarlyDismissalListBy(options: { lastName?: string; dateISO?: string }): AttendanceRecord[] {
    let studentIds: string[] | undefined = undefined;
    if (options.lastName) {
      studentIds = this.resolveStudentIdsByLastName(options.lastName);
      if (studentIds.length === 0) return [];
    }
    let records = this.attendanceRepo.allAttendance();
    records = records.filter(r => r.earlyDismissal === true);
    if (studentIds) {
      records = records.filter(r => studentIds!.includes(r.studentId));
    }
    if (options.dateISO) {
      records = records.filter(r => r.dateISO === options.dateISO);
    }
    // Sort by dateISO, then studentId
    records.sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.studentId.localeCompare(b.studentId));
    return records;
  }

  private resolveStudentIdsByLastName(lastName: string): string[] {
    // Case-insensitive exact match
    const students = this.studentRepo.allStudents();
    return students
      .filter(s => s.lastName.toLowerCase() === lastName.toLowerCase())
      .map(s => s.id);
  }
}
