import { Student } from '../domains/Student';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';

export class StudentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

export interface MarkAttendanceParams {
  firstName: string;
  lastName: string;
  dateISO: string;
  onTime?: boolean;
  late?: boolean;
  earlyDismissal?: boolean;
  excused?: boolean;
}

export class AttendanceService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();

  inferStatusFromFlags(flags: { onTime?: boolean; late?: boolean; excused?: boolean }): AttendanceStatus {
    if (flags.excused) return AttendanceStatus.EXCUSED;
    if (flags.late) return AttendanceStatus.LATE;
    if (flags.onTime) return AttendanceStatus.PRESENT;
    return AttendanceStatus.ABSENT;
  }

  markAttendanceByName(params: MarkAttendanceParams) {
    const { firstName, lastName, dateISO, onTime, late, earlyDismissal, excused } = params;
    const studentId = this.studentRepo.findStudentIdByName(firstName, lastName);
    if (!studentId) throw new StudentNotFoundError(`Student ${firstName} ${lastName} not found`);
    const status = this.inferStatusFromFlags({ onTime, late, excused });
    const record = new AttendanceRecord({
      studentId,
      dateISO,
      status,
      late,
      earlyDismissal
    });
    this.attendanceRepo.saveAttendance(record);
    return record;
  }
}
//check for additional functions for SCheduledDayOff 
//HOLIDAY, PROFESSIONAL_DEVELOPMENT,REPORT_CARD_CONFERENCES, OTHER