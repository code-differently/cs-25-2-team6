import * as fs from 'fs';
import * as path from 'path';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { ReportFilters, ReportMetadata, ReportAggregations, ReportRequest } from '../domains/ReportFilters';
import { FileStudentRepo, Student } from './FileStudentRepo';
import { FileAttendanceRepo } from './FileAttendanceRepo';

//report data structure
export interface ReportData {
  id: string;
  filters: ReportFilters;
  records: AttendanceRecord[];
  metadata: ReportMetadata;
  aggregations?: any;
  createdAt: string;
  expiresAt: string;
}

//aggregate 
export interface AggregatedReportResult {
  records: AttendanceRecord[];
  totalRecords: number;
  filteredRecords: number;
  aggregations: any;
  metadata: ReportMetadata;
}

// FileReportRepo: Repository for report data aggregation, caching, and persistence
 
export class FileReportRepo {
  private reportsFilePath: string;
  private cacheFilePath: string;
  private studentRepo: FileStudentRepo;
  private attendanceRepo: FileAttendanceRepo;

  constructor(reportsFilePath?: string, cacheFilePath?: string) {
    this.reportsFilePath = reportsFilePath ?? path.join(__dirname, 'reports.json');
    this.cacheFilePath = cacheFilePath ?? path.join(__dirname, 'reports_cache.json');
    this.studentRepo = new FileStudentRepo();
    this.attendanceRepo = new FileAttendanceRepo();
    
    this.initializeFiles();
  }

  private initializeFiles(): void {
    if (!fs.existsSync(this.reportsFilePath)) {
      fs.writeFileSync(this.reportsFilePath, JSON.stringify([]));
    }
    if (!fs.existsSync(this.cacheFilePath)) {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify([]));
    }
  }


  async generateReport(request: ReportRequest): Promise<AggregatedReportResult> {
    const startTime = Date.now();
    
   
    let cacheHit = false;
    if (request.useCache !== false) {
      const cachedResult = this.getCachedReport(request.filters);
      if (cachedResult) {
        cacheHit = true;
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            queryTime: Date.now() - startTime,
            cacheHit: true
          }
        };
      }
    }

// Get all data
    const allRecords = this.attendanceRepo.allAttendance();
    const allStudents = this.studentRepo.allStudents();

    
    const filteredRecords = this.applyFilters(allRecords, allStudents, request.filters);

// aggregation logic
    const aggregations = this.calculateAggregations(
      filteredRecords, 
      allStudents,
      request.aggregations || {}
    );

    
    let sortedRecords = filteredRecords;
    if (request.sorting) {
      sortedRecords = this.sortRecords(filteredRecords, allStudents, request.sorting);
    }


    let finalRecords = sortedRecords;
    let paginationInfo = null;
    if (request.pagination) {
      const paginatedResult = this.paginateRecords(sortedRecords, request.pagination);
      finalRecords = paginatedResult.records;
      paginationInfo = paginatedResult.pagination;
    }

    const queryTime = Date.now() - startTime;

    // Create metadata
    const metadata: ReportMetadata = {
      totalRecords: allRecords.length,
      filteredRecords: filteredRecords.length,
      generatedAt: new Date().toISOString(),
      appliedFilters: request.filters,
      queryTime,
      cacheHit
    };

    const result: AggregatedReportResult = {
      records: finalRecords,
      totalRecords: allRecords.length,
      filteredRecords: filteredRecords.length,
      aggregations: {
        ...aggregations,
        ...(paginationInfo && { pagination: paginationInfo })
      },
      metadata
    };

    // Cache the result if caching is enabled
    if (request.useCache !== false) {
      this.cacheReport(request.filters, result, queryTime);
    }

    return result;
  }

//Filters
  private applyFilters(
    records: AttendanceRecord[], 
    students: Student[], 
    filters: ReportFilters
  ): AttendanceRecord[] {
    let filteredRecords = [...records];

    if (filters.studentIds && filters.studentIds.length > 0) {
      filteredRecords = filteredRecords.filter(record => 
        filters.studentIds!.includes(record.studentId)
      );
    }

    
    if (filters.studentName) {
      const matchingStudents = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(filters.studentName!.toLowerCase());
      });
      const studentIds = matchingStudents.map(s => s.id);
      filteredRecords = filteredRecords.filter(record => 
        studentIds.includes(record.studentId)
      );
    }

   
    if (filters.lastName) {
      const matchingStudents = students.filter(student =>
        student.lastName.toLowerCase().includes(filters.lastName!.toLowerCase())
      );
      const studentIds = matchingStudents.map(s => s.id);
      filteredRecords = filteredRecords.filter(record => 
        studentIds.includes(record.studentId)
      );
    }

   
    if (filters.dateISO) {
      filteredRecords = filteredRecords.filter(record => 
        record.dateISO === filters.dateISO
      );
    }

    
    if (filters.dateFrom) {
      filteredRecords = filteredRecords.filter(record => 
        record.dateISO >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filteredRecords = filteredRecords.filter(record => 
        record.dateISO <= filters.dateTo!
      );
    }

   
    if (filters.relativePeriod) {
      const dateRange = this.calculateRelativeDateRange(filters.relativePeriod);
      filteredRecords = filteredRecords.filter(record => 
        record.dateISO >= dateRange.start && record.dateISO <= dateRange.end
      );
    }


    if (filters.status) {
      filteredRecords = filteredRecords.filter(record => 
        record.status === filters.status
      );
    }

  
    if (filters.statuses && filters.statuses.length > 0) {
      filteredRecords = filteredRecords.filter(record => 
        filters.statuses!.includes(record.status)
      );
    }


    if (filters.onlyLate) {
      filteredRecords = filteredRecords.filter(record => record.late === true);
    }

    if (filters.onlyEarlyDismissal) {
      filteredRecords = filteredRecords.filter(record => record.earlyDismissal === true);
    }

    if (filters.includeExcused === false) {
      filteredRecords = filteredRecords.filter(record => !record.excused);
    }

    return filteredRecords;
  }

// aggregation logic
  private calculateAggregations(
    records: AttendanceRecord[], 
    students: Student[],
    aggregationOptions: ReportAggregations
  ): any {
    const aggregations: any = {};

    if (aggregationOptions.includeCount !== false) {
      aggregations.counts = {
        total: records.length,
        present: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
        absent: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
        late: records.filter(r => r.status === AttendanceStatus.LATE).length,
        excused: records.filter(r => r.status === AttendanceStatus.EXCUSED).length,
        earlyDismissal: records.filter(r => r.earlyDismissal === true).length
      };
    }

    if (aggregationOptions.includePercentage) {
      const total = records.length;
      if (total > 0) {
        aggregations.percentages = {
          present: Math.round((aggregations.counts.present / total) * 100),
          absent: Math.round((aggregations.counts.absent / total) * 100),
          late: Math.round((aggregations.counts.late / total) * 100),
          excused: Math.round((aggregations.counts.excused / total) * 100),
          earlyDismissal: Math.round((aggregations.counts.earlyDismissal / total) * 100)
        };
      }
    }

    if (aggregationOptions.includeStreaks) {
      aggregations.streaks = this.calculateAttendanceStreaks(records, students);
    }

    if (aggregationOptions.includeTrends) {
      aggregations.trends = this.calculateAttendanceTrends(records);
    }

    if (aggregationOptions.includeComparative) {
      aggregations.comparative = this.calculateComparativeMetrics(records, students);
    }

    return aggregations;
  }


  private sortRecords(
    records: AttendanceRecord[], 
    students: Student[],
    sortOptions: { sortBy: string; sortOrder: string }
  ): AttendanceRecord[] {
    return records.sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.sortBy) {
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

      return sortOptions.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

//pagination logic
  private paginateRecords(
    records: AttendanceRecord[], 
    paginationOptions: { page: number; limit: number }
  ): { records: AttendanceRecord[]; pagination: any } {
    const { page, limit } = paginationOptions;
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + limit);

    return {
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        total: records.length,
        totalPages: Math.ceil(records.length / limit),
        hasNext: offset + limit < records.length,
        hasPrev: page > 1
      }
    };
  }

// Calculate date range for relative periods
  private calculateRelativeDateRange(period: string): { start: string; end: string } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { start: today, end: today };
      case '7days':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo.toISOString().split('T')[0], end: today };
      case '30days':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: monthAgo.toISOString().split('T')[0], end: today };
      case '90days':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return { start: quarterAgo.toISOString().split('T')[0], end: today };
      default:
        return { start: today, end: today };
    }
  }

//attendance streaks logic
  private calculateAttendanceStreaks(records: AttendanceRecord[], students: Student[]): any {
    const streaks: any = {};
    

    const recordsByStudent = records.reduce((acc, record) => {
      if (!acc[record.studentId]) {
        acc[record.studentId] = [];
      }
      acc[record.studentId].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

//streak calculation logic
    Object.entries(recordsByStudent).forEach(([studentId, studentRecords]) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const sortedRecords = studentRecords.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      
      let currentStreak = 0;
      let maxStreak = 0;
      let streakType = 'present';

      sortedRecords.forEach(record => {
        if (record.status === AttendanceStatus.PRESENT) {
          if (streakType === 'present') {
            currentStreak++;
          } else {
            currentStreak = 1;
            streakType = 'present';
          }
        } else {
          if (streakType === 'absent') {
            currentStreak++;
          } else {
            currentStreak = 1;
            streakType = 'absent';
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      });

      streaks[studentId] = {
        studentName: `${student.firstName} ${student.lastName}`,
        currentStreak,
        maxStreak,
        streakType
      };
    });

    return streaks;
  }

//attendance trends over time logic
  private calculateAttendanceTrends(records: AttendanceRecord[]): any {
    const trends: any = {};
    
    
    const recordsByDate = records.reduce((acc, record) => {
      if (!acc[record.dateISO]) {
        acc[record.dateISO] = [];
      }
      acc[record.dateISO].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

// Calculate daily attendance rates
    const dailyRates = Object.entries(recordsByDate).map(([date, dayRecords]) => {
      const total = dayRecords.length;
      const present = dayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      return {
        date,
        total,
        present,
        rate: total > 0 ? Math.round((present / total) * 100) : 0
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    trends.daily = dailyRates;
    trends.averageRate = dailyRates.length > 0 
      ? Math.round(dailyRates.reduce((sum, day) => sum + day.rate, 0) / dailyRates.length)
      : 0;

    return trends;
  }

// Calculate comparative metrics across students
  private calculateComparativeMetrics(records: AttendanceRecord[], students: Student[]): any {
    const metrics: any = {};
    
// Calculate metrics by student
    const studentMetrics = students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const total = studentRecords.length;
      const present = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      
      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        totalDays: total,
        presentDays: present,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    metrics.byStudent = studentMetrics;
    metrics.topPerformers = studentMetrics.slice(0, 5);
    metrics.needsAttention = studentMetrics.filter(s => s.attendanceRate < 80).slice(0, 5);

    return metrics;
  }

// Cache report result
  private cacheReport(filters: ReportFilters, result: AggregatedReportResult, queryTime: number): void {
    try {
      const cache = this.getCachedReports();
      const cacheId = this.generateCacheId(filters);
      
      const cacheEntry: ReportData = {
        id: cacheId,
        filters,
        records: result.records,
        metadata: result.metadata,
        aggregations: result.aggregations,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
      };

// Remove expired entries and add new one
      const validCache = cache.filter(entry => new Date(entry.expiresAt) > new Date());
      validCache.push(cacheEntry);

// Keep only last 50 entries in cache
      const limitedCache = validCache.slice(-50);

      fs.writeFileSync(this.cacheFilePath, JSON.stringify(limitedCache, null, 2));
    } catch (error) {
      console.warn('Failed to cache report:', error);
    }
  }


  private getCachedReport(filters: ReportFilters): AggregatedReportResult | null {
    try {
      const cache = this.getCachedReports();
      const cacheId = this.generateCacheId(filters);
      
      const cachedEntry = cache.find(entry => 
        entry.id === cacheId && new Date(entry.expiresAt) > new Date()
      );

      if (cachedEntry) {
        return {
          records: cachedEntry.records,
          totalRecords: cachedEntry.metadata.totalRecords,
          filteredRecords: cachedEntry.metadata.filteredRecords,
          aggregations: cachedEntry.aggregations || {},
          metadata: cachedEntry.metadata
        };
      }
    } catch (error) {
      console.warn('Failed to retrieve cached report:', error);
    }
    
    return null;
  }

// Read cached reports from file
  private getCachedReports(): ReportData[] {
    try {
      const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
      return JSON.parse(data) as ReportData[];
    } catch (error) {
      return [];
    }
  }

// Generate a unique cache ID based on filters
  private generateCacheId(filters: ReportFilters): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    return Buffer.from(filterString).toString('base64').replace(/[/+=]/g, '');
  }

//clear expired cache entries
  clearExpiredCache(): void {
    try {
      const cache = this.getCachedReports();
      const validCache = cache.filter(entry => new Date(entry.expiresAt) > new Date());
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(validCache, null, 2));
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

//save a report
  saveReportConfig(name: string, request: ReportRequest): void {
    try {
      const reports = this.getAllReports();
      const config = {
        id: `config_${Date.now()}`,
        name,
        request,
        createdAt: new Date().toISOString()
      };
      
      reports.push(config);
      fs.writeFileSync(this.reportsFilePath, JSON.stringify(reports, null, 2));
    } catch (error) {
      console.error('Failed to save report config:', error);
    }
  }

// Get all saved report configurations
  getAllReports(): any[] {
    try {
      const data = fs.readFileSync(this.reportsFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

// Delete a saved report configuration by ID
  deleteReportConfig(configId: string): boolean {
    try {
      const reports = this.getAllReports();
      const filteredReports = reports.filter(report => report.id !== configId);
      
      if (filteredReports.length !== reports.length) {
        fs.writeFileSync(this.reportsFilePath, JSON.stringify(filteredReports, null, 2));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete report config:', error);
      return false;
    }
  }
}
