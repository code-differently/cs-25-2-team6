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

  // Methods for report generation, filtering, aggregation, sorting, and pagination

  
  generateFilteredReport(filters: {
    studentIds?: string[];
    classIds?: string[];
    dateFrom?: string;
    dateTo?: string;
    statuses?: AttendanceStatus[];
    relativePeriod?: string;
  }) {
    let records = this.attendanceRepo.allAttendance();
    const students = this.studentRepo.allStudents();

  // Filters
    if (filters.studentIds && filters.studentIds.length > 0) {
      records = records.filter(record => filters.studentIds!.includes(record.studentId));
    }

    if (filters.dateFrom) {
      records = records.filter(record => record.dateISO >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      records = records.filter(record => record.dateISO <= filters.dateTo!);
    }

    if (filters.statuses && filters.statuses.length > 0) {
      records = records.filter(record => filters.statuses!.includes(record.status));
    }

  // Handle relative periods
    if (filters.relativePeriod) {
      const dateRange = this.calculateRelativeDateRange(filters.relativePeriod);
      records = records.filter(record => 
        record.dateISO >= dateRange.start && record.dateISO <= dateRange.end
      );
    }

    return {
      records,
      totalRecords: records.length,
      optimizations: ['basic-filtering']
    };
  }

  //aggregation logic
  calculateAggregations(
    records: AttendanceRecord[], 
    aggregationTypes: string[], 
    groupBy: string[]
  ) {
    const students = this.studentRepo.allStudents();
    const aggregations: any = {};

    if (aggregationTypes.includes('count')) {
      aggregations.counts = {
        total: records.length,
        present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
        absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
        late: records.filter(r => r.status === AttendanceStatus.LATE).length,
        excused: records.filter(r => r.status === AttendanceStatus.EXCUSED).length
      };
    }

    if (aggregationTypes.includes('percentage')) {
      const total = records.length;
      if (total > 0) {
        aggregations.percentages = {
          present: Math.round((aggregations.counts.present / total) * 100),
          absent: Math.round((aggregations.counts.absent / total) * 100),
          late: Math.round((aggregations.counts.late / total) * 100),
          excused: Math.round((aggregations.counts.excused / total) * 100)
        };
      }
    }

    // Group by student 
    if (groupBy.includes('student')) {
      aggregations.byStudent = this.groupRecordsByStudent(records, students);
    }

    return aggregations;
  }

  
  sortRecords(records: AttendanceRecord[], sortBy: string, sortOrder: string) {
    const students = this.studentRepo.allStudents();
    
    return records.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const studentA = students.find(s => s.id === a.studentId);
          const studentB = students.find(s => s.id === b.studentId);
          const nameA = studentA ? `${studentA.firstName} ${studentA.lastName}` : '';
          const nameB = studentB ? `${studentB.firstName} ${studentB.lastName}` : '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'date':
          comparison = a.dateISO.localeCompare(b.dateISO);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.dateISO.localeCompare(b.dateISO);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Paginate records
  paginateRecords(records: AttendanceRecord[], page: number, limit: number) {
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + limit);
    
    return {
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        total: records.length,
        hasNext: offset + limit < records.length,
        hasPrev: page > 1
      }
    };
  }

  // Validate student IDs exist
  async validateStudentIds(studentIds: string[]): Promise<string[]> {
    const students = this.studentRepo.allStudents();
    const validIds = students.map(s => s.id);
    return studentIds.filter(id => validIds.includes(id));
  }

  
  // Validate class IDs exist 
   
  async validateClassIds(classIds: string[]): Promise<string[]> {
    
    return [];
  }

  // convert records to CSV format
  async convertToCSV(records: any[]): Promise<string> {
    if (records.length === 0) {
      return 'No data available';
    }

    const headers = Object.keys(records[0]);
    const csvRows = records.map(record => 
      headers.map(header => `"${record[header]}"`).join(',')
    );
    
    return [headers.join(','), ...csvRows].join('\n');
  }

  // Helper methods

  private calculateRelativeDateRange(period: string): { start: string; end: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    
    switch (period) {
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'semester':
        startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  }

  private groupRecordsByStudent(records: AttendanceRecord[], students: any[]) {
    const grouped: any = {};
    
    records.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      if (!student) return;
      
      const studentName = `${student.firstName} ${student.lastName}`;
      
      if (!grouped[studentName]) {
        grouped[studentName] = {
          studentId: record.studentId,
          studentName,
          totalDays: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      
      grouped[studentName].totalDays++;
      
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          grouped[studentName].present++;
          break;
        case AttendanceStatus.ABSENT:
          grouped[studentName].absent++;
          break;
        case AttendanceStatus.LATE:
          grouped[studentName].late++;
          break;
        case AttendanceStatus.EXCUSED:
          grouped[studentName].excused++;
          break;
      }
    });
    
    return Object.values(grouped);
  }
}
