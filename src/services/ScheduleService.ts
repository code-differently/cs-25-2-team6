import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { ScheduleRepo, DayOffReason } from '../persistence/ScheduleRepo';

export class ScheduleService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
  private scheduleRepo = new ScheduleRepo();

  planDayOff(params: { dateISO: string; reason: DayOffReason; scope?: 'ALL_STUDENTS' }) {
    const { dateISO, reason, scope = 'ALL_STUDENTS' } = params;
    this.scheduleRepo.savePlannedDayOff({ dateISO, reason, scope });
  }

  isWeekend(dateISO: string): boolean {
    const d = new Date(dateISO + 'T00:00:00Z');
    const day = d.getUTCDay();
    return day === 0 || day === 6; // Sunday=0, Saturday=6
  }

  isPlannedDayOff(dateISO: string): boolean {
    return this.scheduleRepo.isPlannedDayOff(dateISO);
  }

  isOffDay(dateISO: string): boolean {
    return this.isWeekend(dateISO) || this.isPlannedDayOff(dateISO);
  }

  applyPlannedDayOffToAllStudents(dateISO: string) {
    const students = this.studentRepo.allStudents();
    for (const student of students) {
      // Skip if attendance record already exists
      const existing = this.attendanceRepo.findAttendanceBy(student.id, dateISO);
      if (existing) continue;
      const record = new AttendanceRecord({
        studentId: student.id,
        dateISO,
        status: AttendanceStatus.EXCUSED,
        late: false,
        earlyDismissal: false
      });
      this.attendanceRepo.saveAttendance(record);
    }
  }
}

// You will need to implement ScheduleRepo and DayOffReason in persistence/ScheduleRepo.ts
