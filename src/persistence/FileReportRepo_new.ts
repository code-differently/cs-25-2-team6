import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { ReportFilters, ReportMetadata, ReportAggregations, ReportRequest } from '../domains/ReportFilters';
import { 
  ReportData, 
  StudentAttendanceStats, 
  DateAttendanceStats, 
  ReportSummary,
  AttendanceRecord as ReportAttendanceRecord,
  ReportInsights
} from '../domains/ReportData';
import { QueryResult, ReportQueryResult, QueryMetrics, PaginationInfo } from '../domains/QueryResult';
import { FileStudentRepo, Student } from './FileStudentRepo';
import { FileAttendanceRepo } from './FileAttendanceRepo';

// Serverless-compatible in-memory cache
let reportCache: Map<string, { data: ReportData; expiresAt: number }> = new Map();
let savedReports: Array<{ id: string; name: string; request: ReportRequest; createdAt: string }> = [];

/**
 * Uses in-memory storage instead of file system for Vercel compatibility
 */
export class FileReportRepo {
  private studentRepo: FileStudentRepo;
  private attendanceRepo: FileAttendanceRepo;

  constructor() {
    this.studentRepo = new FileStudentRepo();
    this.attendanceRepo = new FileAttendanceRepo();
  }

  /**
   * Generate a comprehensive report with filtering, aggregation, and caching
   */
  async generateReport(request: ReportRequest): Promise<ReportQueryResult> {
    const startTime = Date.now();
    const version = '1.0.0';
    
    // Check cache first
    let cacheHit = false;
    if (request.useCache !== false) {
      const cachedResult = this.getCachedReport(request.filters);
      if (cachedResult) {
        cacheHit = true;
        return {
          ...cachedResult,
          metrics: {
            ...cachedResult.metrics,
            executionTimeMs: Date.now() - startTime,
            cacheHit: true
          }
        };
      }
    }

   
    const allRecords = this.attendanceRepo.allAttendance();
    const allStudents = this.studentRepo.allStudents();

  
    const filteredRecords = this.applyFilters(allRecords, allStudents, request.filters);

    // Build report data structure
    const reportData = await this.buildReportData(filteredRecords, allStudents, request);

    // Apply sorting and pagination
    const finalData = this.applySortingAndPagination(reportData, request);

    const executionTime = Date.now() - startTime;

    // Create query metrics
    const metrics: QueryMetrics = {
      executionTimeMs: executionTime,
      recordsProcessed: allRecords.length,
      recordsFiltered: filteredRecords.length,
      cacheHit,
      queryComplexity: this.calculateComplexity(request),
      optimizationSuggestions: this.getOptimizationSuggestions(request, executionTime)
    };

    // Create query result
    const result: ReportQueryResult = {
      data: finalData,
      metrics,
      timestamp: new Date().toISOString(),
      version,
      query: {
        filters: request.filters,
        parameters: { ...request },
        hash: this.generateCacheId(request.filters)
      },
      status: 'success',
      reportType: this.determineReportType(request),
      generationTime: executionTime,
      dataFreshness: new Date().toISOString(),
      exportOptions: {
        available: ['csv', 'json', 'pdf']
      }
    };

    // Cache the result
    if (request.useCache !== false) {
      this.cacheReport(request.filters, result);
    }

    return result;
  }

  /**
   * Apply all filters to attendance records
   */
  private applyFilters(
    records: AttendanceRecord[], 
    students: Student[], 
    filters: ReportFilters
  ): AttendanceRecord[] {
    let filteredRecords = [...records];

    // Student ID filters
    if (filters.studentIds && filters.studentIds.length > 0) {
      filteredRecords = filteredRecords.filter(record => 
        filters.studentIds!.includes(record.studentId)
      );
    }

    // Student name filter
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

    // Last name filter
    if (filters.lastName) {
      const matchingStudents = students.filter(student =>
        student.lastName.toLowerCase().includes(filters.lastName!.toLowerCase())
      );
      const studentIds = matchingStudents.map(s => s.id);
      filteredRecords = filteredRecords.filter(record => 
        studentIds.includes(record.studentId)
      );
    }


    // Date filters
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

    // Relative period filter
    if (filters.relativePeriod) {
      const dateRange = this.calculateRelativeDateRange(filters.relativePeriod);
      filteredRecords = filteredRecords.filter(record => 
        record.dateISO >= dateRange.start && record.dateISO <= dateRange.end
      );
    }

    // Status filters
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

    // TODO: Add attendance rate filtering when needed
    // Currently disabled - attendanceRateMin/Max not in ReportFilters interface

    // Special condition filters
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

  /**
   * Build comprehensive report data structure
   */
  private async buildReportData(
    filteredRecords: AttendanceRecord[],
    allStudents: Student[],
    request: ReportRequest
  ): Promise<ReportData> {
// Convert to report attendance records
    const reportRecords: ReportAttendanceRecord[] = filteredRecords.map(record => {
      const student = allStudents.find(s => s.id === record.studentId);
      return {
        id: `${record.studentId}-${record.dateISO}`, // Generate ID from studentId + date
        studentId: record.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        studentFirstName: student?.firstName || '',
        studentLastName: student?.lastName || '',
        grade: undefined,
        date: record.dateISO,
        status: record.status,
        late: record.late,
        earlyDismissal: record.earlyDismissal,
        excused: record.excused,
        createdAt: record.dateISO // Use date as createdAt fallback
      };
    });
// Calculations
    
    const studentStats = this.calculateStudentStats(filteredRecords, allStudents);

    
    const dateStats = this.calculateDateStats(filteredRecords);

    
    const summary = this.calculateSummary(filteredRecords, allStudents);

    
    const insights = this.generateInsights(filteredRecords, allStudents, studentStats);

    // Create metadata
    const metadata: ReportMetadata = {
      totalRecords: this.attendanceRepo.allAttendance().length,
      filteredRecords: filteredRecords.length,
      generatedAt: new Date().toISOString(),
      appliedFilters: request.filters,
      queryTime: 0, // Will be set later
      cacheHit: false // Will be set later
    };

    return {
      records: reportRecords,
      studentStats,
      dateStats,
      summary,
      metadata,
      insights
    };
  }

  /**
   * Apply sorting and pagination to report data
   */
  private applySortingAndPagination(reportData: ReportData, request: ReportRequest): ReportData {
    let sortedData = { ...reportData };

    // Apply sorting if specified
    if (request.sorting) {
      sortedData.records = this.sortRecords(reportData.records, request.sorting);
    }

    // Apply pagination if specified
    if (request.pagination) {
      const paginatedResult = this.paginateRecords(sortedData.records, request.pagination);
      sortedData.records = paginatedResult.records;
     
    }

    return sortedData;
  }

  /**
   * Calculate student attendance statistics
   */
  private calculateStudentStats(
    records: AttendanceRecord[],
    students: Student[]
  ): StudentAttendanceStats[] {
    return students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const lateDays = studentRecords.filter(r => r.late === true).length;
      const absentDays = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const excusedDays = studentRecords.filter(r => r.excused === true).length;

      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      const lateRate = totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0;

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        grade: undefined, // Student model doesn't have grade property
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        excusedDays,
        attendanceRate,
        lateRate,
        consecutiveAbsences: this.calculateConsecutiveAbsences(studentRecords),
        longestPresentStreak: this.calculateLongestPresentStreak(studentRecords),
        lastAttendanceDate: this.getLastAttendanceDate(studentRecords),
        averageWeeklyAttendance: this.calculateAverageWeeklyAttendance(studentRecords),
        trend: this.calculateTrend(studentRecords)
      };
    }).filter(stats => stats.totalDays > 0); 
  }

  /**
   * Calculate date-based attendance statistics
   */
  private calculateDateStats(records: AttendanceRecord[]): DateAttendanceStats[] {
    const recordsByDate = records.reduce((acc, record) => {
      if (!acc[record.dateISO]) {
        acc[record.dateISO] = [];
      }
      acc[record.dateISO].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    return Object.entries(recordsByDate).map(([date, dayRecords]) => {
      const totalStudents = dayRecords.length;
      const presentStudents = dayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const lateStudents = dayRecords.filter(r => r.late === true).length;
      const absentStudents = dayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const excusedStudents = dayRecords.filter(r => r.excused === true).length;

      return {
        date,
        totalStudents,
        presentStudents,
        lateStudents,
        absentStudents,
        excusedStudents,
        attendanceRate: totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0,
        lateRate: totalStudents > 0 ? Math.round((lateStudents / totalStudents) * 100) : 0
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate report summary statistics
   */
  private calculateSummary(records: AttendanceRecord[], students: Student[]): ReportSummary {
    const uniqueStudents = new Set(records.map(r => r.studentId)).size;
    const uniqueDates = new Set(records.map(r => r.dateISO));
    const sortedDates = Array.from(uniqueDates).sort();

    const totalPresentDays = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const totalLateDays = records.filter(r => r.late === true).length;
    const totalAbsentDays = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const totalExcusedDays = records.filter(r => r.excused === true).length;

    const overallAttendanceRate = records.length > 0 ? Math.round((totalPresentDays / records.length) * 100) : 0;
    const overallLateRate = records.length > 0 ? Math.round((totalLateDays / records.length) * 100) : 0;

    // Calculate student performance metrics
    const studentStats = this.calculateStudentStats(records, students);
    const riskStudents = studentStats.filter(s => s.attendanceRate < 80).length;
    const perfectAttendance = studentStats.filter(s => s.attendanceRate === 100).length;

    return {
      totalStudents: uniqueStudents,
      totalRecords: records.length,
      dateRange: {
        start: sortedDates[0] || '',
        end: sortedDates[sortedDates.length - 1] || '',
        totalDays: uniqueDates.size
      },
      overallStats: {
        averageAttendanceRate: overallAttendanceRate,
        averageLateRate: overallLateRate,
        totalPresentDays,
        totalLateDays,
        totalAbsentDays,
        totalExcusedDays
      },
      trends: {
        attendanceDirection: this.calculateOverallTrend(records),
        riskStudents,
        perfectAttendance
      }
    };
  }

  /**
   * Generate AI-style insights and recommendations
   */
  private generateInsights(
    records: AttendanceRecord[],
    students: Student[],
    studentStats: StudentAttendanceStats[]
  ): ReportInsights {
    const keyFindings: string[] = [];
    const recommendations: string[] = [];
    const alertStudents: any[] = [];
    const patterns: any[] = [];

    // attendance patterns analysis
    const overallRate = records.length > 0 ? Math.round((records.filter(r => r.status === AttendanceStatus.PRESENT).length / records.length) * 100) : 0;
    
    if (overallRate < 85) {
      keyFindings.push(`Overall attendance rate of ${overallRate}% is below recommended 85% threshold`);
      recommendations.push('Consider implementing attendance intervention programs');
    }

    // Identify bad attendance students
    const riskStudents = studentStats.filter(s => s.attendanceRate < 80);
    if (riskStudents.length > 0) {
      keyFindings.push(`${riskStudents.length} students have attendance rates below 80%`);
      recommendations.push('Schedule meetings with at-risk students and their families');
      
      riskStudents.forEach(student => {
        alertStudents.push({
          studentId: student.studentId,
          studentName: student.studentName,
          alertType: 'attendance' as const,
          severity: student.attendanceRate < 60 ? 'high' as const : 'medium' as const,
          description: `Attendance rate: ${student.attendanceRate}%`
        });
      });
    }

    // Analyze late patterns
    const lateStudents = studentStats.filter(s => s.lateRate > 20);
    if (lateStudents.length > 0) {
      keyFindings.push(`${lateStudents.length} students have tardiness rates above 20%`);
      recommendations.push('Review morning routines and transportation options with frequently late students');
    }

    return {
      keyFindings,
      recommendations,
      alertStudents,
      patterns
    };
  }

  // Helper methods for calculations
  private calculateStudentAttendanceRates(records: AttendanceRecord[], students: Student[]): Record<string, number> {
    const rates: Record<string, number> = {};
    
    students.forEach(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      rates[student.id] = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    });

    return rates;
  }

  private calculateConsecutiveAbsences(records: AttendanceRecord[]): number {
    const sortedRecords = records.sort((a, b) => b.dateISO.localeCompare(a.dateISO)); // Most recent first
    let consecutive = 0;
    
    for (const record of sortedRecords) {
      if (record.status === AttendanceStatus.ABSENT) {
        consecutive++;
      } else {
        break;
      }
    }
    
    return consecutive;
  }

  private calculateLongestPresentStreak(records: AttendanceRecord[]): number {
    const sortedRecords = records.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const record of sortedRecords) {
      if (record.status === AttendanceStatus.PRESENT) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  private getLastAttendanceDate(records: AttendanceRecord[]): string | undefined {
    const sortedRecords = records.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return sortedRecords.length > 0 ? sortedRecords[0].dateISO : undefined;
  }

  private calculateAverageWeeklyAttendance(records: AttendanceRecord[]): number {
    // Simplified calculation
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    return totalDays > 0 ? Math.round((presentDays / totalDays) * 5) : 0; // Assuming 5-day school week
  }

  private calculateTrend(records: AttendanceRecord[]): 'improving' | 'declining' | 'stable' {
    if (records.length < 10) return 'stable'; // Not enough data
    
    const sortedRecords = records.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const midPoint = Math.floor(sortedRecords.length / 2);
    
    const firstHalf = sortedRecords.slice(0, midPoint);
    const secondHalf = sortedRecords.slice(midPoint);
    
    const firstHalfRate = firstHalf.filter(r => r.status === AttendanceStatus.PRESENT).length / firstHalf.length;
    const secondHalfRate = secondHalf.filter(r => r.status === AttendanceStatus.PRESENT).length / secondHalf.length;
    
    const difference = secondHalfRate - firstHalfRate;
    
    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }

  private calculateOverallTrend(records: AttendanceRecord[]): 'improving' | 'declining' | 'stable' {
// Similar logic to individual student trends but for overall dataset
    return 'stable'; 
  }

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

  private sortRecords(
    records: ReportAttendanceRecord[],
    sortOptions: { sortBy: string; sortOrder: string }
  ): ReportAttendanceRecord[] {
    return records.sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.sortBy) {
        case 'name':
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'grade':
          comparison = (a.grade || '').localeCompare(b.grade || '');
          break;
        default:
          comparison = a.date.localeCompare(b.date);
      }

      return sortOptions.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private paginateRecords(
    records: ReportAttendanceRecord[],
    paginationOptions: { page: number; limit: number }
  ): { records: ReportAttendanceRecord[]; pagination: PaginationInfo } {
    const { page, limit } = paginationOptions;
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + limit);

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(records.length / limit),
      totalItems: records.length,
      itemsPerPage: limit,
      hasNextPage: offset + limit < records.length,
      hasPreviousPage: page > 1,
      startIndex: offset,
      endIndex: Math.min(offset + limit - 1, records.length - 1)
    };

    return { records: paginatedRecords, pagination };
  }

  private calculateComplexity(request: ReportRequest): 'simple' | 'moderate' | 'complex' {
    let complexity = 0;
    
    if (request.filters.studentIds?.length) complexity++;
    if (request.filters.dateFrom || request.filters.dateTo) complexity++;
    if (request.filters.statuses?.length) complexity++;
    if (request.aggregations) complexity += 2;
    if (request.sorting) complexity++;
    if (request.pagination) complexity++;
    
    if (complexity <= 2) return 'simple';
    if (complexity <= 4) return 'moderate';
    return 'complex';
  }

  private getOptimizationSuggestions(request: ReportRequest, executionTime: number): string[] {
    const suggestions: string[] = [];
    
    if (executionTime > 1000) {
      suggestions.push('Consider using pagination for large result sets');
    }
    
    if (request.filters.studentName && !request.filters.studentIds) {
      suggestions.push('Use specific student IDs instead of name search for better performance');
    }
    
    return suggestions;
  }

  private determineReportType(request: ReportRequest): 'attendance' | 'tardiness' | 'summary' | 'comparative' | 'custom' {
    if (request.filters.onlyLate) return 'tardiness';
    if (request.aggregations?.includeComparative) return 'comparative';
    if (Object.keys(request.filters).length <= 1) return 'summary';
    return 'attendance';
  }

// Cache management methods
  private cacheReport(filters: ReportFilters, result: ReportQueryResult): void {
    try {
      const cacheId = this.generateCacheId(filters);
      const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
      
      reportCache.set(cacheId, {
        data: result.data,
        expiresAt
      });

// Clean expired entries
      this.cleanExpiredCache();
    } catch (error) {
      console.warn('Failed to cache report:', error);
    }
  }

  private getCachedReport(filters: ReportFilters): ReportQueryResult | null {
    try {
      const cacheId = this.generateCacheId(filters);
      const cached = reportCache.get(cacheId);
      
      if (cached && cached.expiresAt > Date.now()) {
        return {
          data: cached.data,
          metrics: {
            executionTimeMs: 0,
            recordsProcessed: 0,
            recordsFiltered: 0,
            cacheHit: true,
            queryComplexity: 'simple'
          },
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          query: {
            filters,
            parameters: {},
            hash: cacheId
          },
          status: 'success',
          reportType: 'attendance',
          generationTime: 0,
          dataFreshness: new Date().toISOString(),
          exportOptions: {
            available: ['csv', 'json', 'pdf']
          }
        };
      }
    } catch (error) {
      console.warn('Failed to retrieve cached report:', error);
    }
    
    return null;
  }

  private generateCacheId(filters: ReportFilters): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    return Buffer.from(filterString).toString('base64').replace(/[/+=]/g, '');
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of reportCache.entries()) {
      if (value.expiresAt <= now) {
        reportCache.delete(key);
      }
    }
  }

  // Report configuration management
  saveReportConfig(name: string, request: ReportRequest): string {
    const config = {
      id: `config_${Date.now()}`,
      name,
      request,
      createdAt: new Date().toISOString()
    };
    
    savedReports.push(config);
    return config.id;
  }

  getAllReportConfigs(): Array<{ id: string; name: string; request: ReportRequest; createdAt: string }> {
    return [...savedReports];
  }

  deleteReportConfig(configId: string): boolean {
    const initialLength = savedReports.length;
    savedReports = savedReports.filter(report => report.id !== configId);
    return savedReports.length !== initialLength;
  }

  clearCache(): void {
    reportCache.clear();
  }
}
