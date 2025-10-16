import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { FileScheduleRepo } from '../persistence/FileScheduleRepo';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { AttendanceRecord } from '../domains/AttendanceRecords';

export class ScheduleService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
  private scheduleRepo = new FileScheduleRepo();

  /**
   * Checks if a given date is a weekend (Saturday or Sunday).
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   * @returns true if the date is a weekend, false otherwise
   */
  isWeekend(dateISO: string): boolean {
    const d = new Date(dateISO + 'T00:00:00Z');
    const day = d.getUTCDay();
    return day === 0 || day === 6; // Sunday=0, Saturday=6
  }

  /**
   * Plans a day off for a specific date with a reason.
   * @param params Object containing dateISO, reason, and optional scope
   */
  planDayOff(params: { dateISO: string; reason: string; scope?: string }): void {
    // Save the planned day off to the schedule repository
    const plannedDayOff = {
      dateISO: params.dateISO,
      reason: params.reason as any, // Cast to match DayOffReason type
      scope: 'ALL_STUDENTS' as const
    };
    this.scheduleRepo.saveDayOff(plannedDayOff);
    
    // Note: Do not automatically apply to students here.
    // Use applyPlannedDayOffToAllStudents() separately if needed.
  }

  /**
   * Lists planned days off within a date range.
   * @param params Object containing start and end dates
   * @returns Array of planned days off
   */
  listPlannedDays(params: { start: string; end: string }): Array<{ dateISO: string; reason: string }> {
    return this.scheduleRepo.listDaysOffInRange(params.start, params.end);
  }

  /**
   * Checks if a specific date has been planned as a day off.
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   * @returns true if it's a planned day off, false otherwise
   */
  isPlannedDayOff(dateISO: string): boolean {
    return this.scheduleRepo.hasDayOff(dateISO);
  }

  /**
   * Applies a planned day off to all students for a specific date.
   * This method is idempotent - running it multiple times won't create duplicate entries.
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   * @returns The number of EXCUSED records created
   */
  applyPlannedDayOffToAllStudents(dateISO: string): number {
    const students = this.studentRepo.allStudents();
    let count = 0;
    
    for (const student of students) {
      // Check if this student already has an attendance record for this date
      const existingRecord = this.attendanceRepo.findAttendanceBy(student.id, dateISO);
      
      // Only create EXCUSED record if no record exists for this student on this date
      if (!existingRecord) {
        const excusedRecord = new AttendanceRecord({
          studentId: student.id,
          dateISO,
          status: AttendanceStatus.EXCUSED
        });
        this.attendanceRepo.saveAttendance(excusedRecord);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Checks if a date is a day off (either weekend or planned day off).
   * @param dateISO The date in ISO format (YYYY-MM-DD)
   * @returns true if it's a day off, false otherwise
   */
  isOffDay(dateISO: string): boolean {
    return this.isWeekend(dateISO) || this.isPlannedDayOff(dateISO);
  }
}