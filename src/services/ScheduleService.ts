import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
<<<<<<< HEAD
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { AttendanceRecord } from '../domains/AttendanceRecords';
=======
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { ScheduleRepo, DayOffReason } from '../persistence/ScheduleRepo';
>>>>>>> 0b2ab1725e14ff3067c04b0e6cf55c1733f155dd

export class ScheduleService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
<<<<<<< HEAD

  /**
   * Applies a planned day off to all students for a specific date.
   * This method is idempotent - running it multiple times won't create duplicate entries.
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   */
  applyPlannedDayOffToAllStudents(dateISO: string): void {
    const students = this.studentRepo.allStudents();
    const existingRecords = this.attendanceRepo.allAttendance();
    
    for (const student of students) {
      // Check if this student already has an attendance record for this date
      const existingRecord = existingRecords.find(
        record => record.studentId === student.id && record.dateISO === dateISO
      );
      
      // Only create EXCUSED record if no record exists for this student on this date
      if (!existingRecord) {
        const excusedRecord = new AttendanceRecord({
          studentId: student.id,
          dateISO,
          status: AttendanceStatus.EXCUSED
        });
        this.attendanceRepo.saveAttendance(excusedRecord);
      }
    }
  }

  /**
   * Determines if a given date is considered an "off day" (no school).
   * Returns true for:
   * - Planned weekdays that are scheduled off
   * - Weekend days (Saturday/Sunday) when no specific planning overrides them
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   * @returns true if it's an off day, false otherwise
   */
  isOffDay(dateISO: string): boolean {
    const date = new Date(dateISO);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const students = this.studentRepo.allStudents();
    const attendanceRecords = this.attendanceRepo.allAttendance();
    
    // If no students exist, no days are considered "off days"
    if (students.length === 0) {
      return false;
    }
    
    // Check if there are any planned activities for this date
    // (If there are attendance records planned for a weekend, it's not an off day)
    const hasPlannedActivities = attendanceRecords.some(
      record => record.dateISO === dateISO && record.status !== AttendanceStatus.EXCUSED
    );
    
    // Check if this date has been marked as a planned day off for all students
    const excusedRecords = attendanceRecords.filter(
      record => record.dateISO === dateISO && record.status === AttendanceStatus.EXCUSED
    );
    const isPlannedDayOff = excusedRecords.length === students.length;
    
    // It's an off day if:
    // 1. It's a weekend day without planned activities, OR
    // 2. It's a planned day off for all students
    return (isWeekend && !hasPlannedActivities) || isPlannedDayOff;
  }
}
=======
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
>>>>>>> 0b2ab1725e14ff3067c04b0e6cf55c1733f155dd
