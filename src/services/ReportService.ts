import { AttendanceRecord, AttendanceStatus, Student } from '../types/index';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';

export class ReportService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();

  filterAttendanceBy(options: { lastName?: string; status?: AttendanceStatus; dateISO?: string }): AttendanceRecord[] {
    let studentIds: string[] | undefined = undefined;
    if (options.lastName) {
      studentIds = this.resolveStudentIdsByLastName(options.lastName);
      if (studentIds.length === 0) return [];
    }

    const filter = {
      studentIds,
      dateISO: options.dateISO,
      status: options.status
    };

    return this.attendanceRepo.queryAttendance(filter);
  }

  getLateListBy(options: { lastName?: string; dateISO?: string }): AttendanceRecord[] {
    return this.filterAttendanceBy({
      ...options,
      status: AttendanceStatus.LATE
    });
  }

  getEarlyDismissalListBy(options: { lastName?: string; dateISO?: string }): AttendanceRecord[] {
    let studentIds: string[] | undefined = undefined;
    if (options.lastName) {
      studentIds = this.resolveStudentIdsByLastName(options.lastName);
      if (studentIds.length === 0) return [];
    }

    const filter = {
      studentIds,
      dateISO: options.dateISO
    };

    const allRecords = this.attendanceRepo.queryAttendance(filter);
    return allRecords.filter(record => record.earlyDismissal === true);
  }

  private resolveStudentIdsByLastName(lastName: string): string[] {
    if (!lastName || lastName.trim() === '') return [];
    
    const normalizedLastName = lastName.trim().toLowerCase();
    const allStudents = this.studentRepo.allStudents();
    
    return allStudents
      .filter(student => student.lastName.toLowerCase() === normalizedLastName)
      .map(student => student.id);
  }
}