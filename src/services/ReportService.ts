import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { startOfDay, startOfWeek, startOfMonth, format, isAfter, isBefore } from 'date-fns';
import { ScheduleService } from './ScheduleService';

export class ReportService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
  private scheduleService = new ScheduleService();

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

  getHistoryByTimeframe(params: {
    studentId: string;
    timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startISO?: string;
    endISO?: string;
  }) {
    const { studentId, timeframe } = params;
    const allRecords = this.attendanceRepo.allAttendance().filter(r => r.studentId === studentId);
    const today = new Date();
    const defaultEnd = today;
    const defaultStart = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000); // last 30 days
    const start = params.startISO ? new Date(params.startISO + 'T00:00:00Z') : startOfDay(defaultStart);
    // Make end inclusive: add one day and use < endPlusOneDay
    const end = params.endISO ? new Date(params.endISO + 'T00:00:00Z') : startOfDay(defaultEnd);
    const endPlusOneDay = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    const filtered = allRecords.filter(r => {
      // Exclude weekends and planned days off
      if (this.scheduleService.isOffDay(r.dateISO)) return false;
      const d = new Date(r.dateISO + 'T00:00:00Z');
      return (d.getTime() >= start.getTime()) && (d.getTime() < endPlusOneDay.getTime());
    });
    // Grouping
    const buckets: Record<string, any> = {};
    for (const r of filtered) {
      let bucketKey: string;
      // Create date in local timezone to avoid timezone conversion issues with date-fns
      const [year, month, day] = r.dateISO.split('-').map(Number);
      const d = new Date(year, month - 1, day); // month is 0-indexed
      if (timeframe === 'DAILY') bucketKey = format(startOfDay(d), 'yyyy-MM-dd');
      else if (timeframe === 'WEEKLY') bucketKey = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'); // Monday start
      else bucketKey = format(startOfMonth(d), 'yyyy-MM-dd');
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = { date: bucketKey, present: 0, late: 0, absent: 0, excused: 0, earlyDismissal: 0 };
      }
      if (r.status === AttendanceStatus.PRESENT) buckets[bucketKey].present++;
      if (r.status === AttendanceStatus.LATE) buckets[bucketKey].late++;
      if (r.status === AttendanceStatus.ABSENT) buckets[bucketKey].absent++;
      if (r.status === AttendanceStatus.EXCUSED) buckets[bucketKey].excused++;
      if (r.earlyDismissal) buckets[bucketKey].earlyDismissal++;
    }
    // Return sorted by date ascending, and filter out buckets before the start boundary
    let minBucketKey: string;
    // Create start date in local timezone to match grouping logic
    const [startYear, startMonth, startDay] = (params.startISO || '').split('-').map(Number);
    const startLocal = params.startISO ? new Date(startYear, startMonth - 1, startDay) : new Date(start);
    if (timeframe === 'DAILY') minBucketKey = format(startOfDay(startLocal), 'yyyy-MM-dd');
    else if (timeframe === 'WEEKLY') minBucketKey = format(startOfWeek(startLocal, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    else minBucketKey = format(startOfMonth(startLocal), 'yyyy-MM-dd');
    return Object.values(buckets)
      .filter((b: any) => b.date >= minBucketKey)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
  }

  getYearToDateSummary(studentId: string, year?: number) {
    const now = new Date();
    const y = year || now.getFullYear();
    const start = new Date(Date.UTC(y, 0, 1));
    // Make end inclusive: add one day and use < endPlusOneDay
    const end = now;
    const endPlusOneDay = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    const allRecords = this.attendanceRepo.allAttendance().filter(r => r.studentId === studentId);
    const filtered = allRecords.filter(r => {
      // Exclude weekends and planned days off
      if (this.scheduleService.isOffDay(r.dateISO)) return false;
      const d = new Date(r.dateISO + 'T00:00:00Z');
      return (d.getTime() >= start.getTime()) && (d.getTime() < endPlusOneDay.getTime());
    });
    const summary = { present: 0, late: 0, absent: 0, excused: 0, earlyDismissal: 0 };
    for (const r of filtered) {
      if (r.status === AttendanceStatus.PRESENT) summary.present++;
      if (r.status === AttendanceStatus.LATE) summary.late++;
      if (r.status === AttendanceStatus.ABSENT) summary.absent++;
      if (r.status === AttendanceStatus.EXCUSED) summary.excused++;
      if (r.earlyDismissal) summary.earlyDismissal++;
    }
    return summary;
  }

  private resolveStudentIdsByLastName(lastName: string): string[] {
    // Case-insensitive exact match
    const students = this.studentRepo.allStudents();
    return students
      .filter(s => s.lastName.toLowerCase() === lastName.toLowerCase())
      .map(s => s.id);
  }
}
