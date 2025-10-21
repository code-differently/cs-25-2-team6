import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { FileReportRepo } from '../persistence/FileReportRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { ReportFilters, ReportRequest } from '../domains/ReportFilters';
import { ReportData, StudentAttendanceStats } from '../domains/ReportData';
import { ReportQueryResult, QueryResult, NLQueryResult } from '../domains/QueryResult';
import { startOfDay, startOfWeek, startOfMonth, format, isAfter, isBefore } from 'date-fns';
import { ScheduleService } from './ScheduleService';

/**
 * ReportService: High-level business logic layer for attendance reporting
 * Coordinates between FileReportRepo, validation, caching, and business rules
 */
export class ReportService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
  private reportRepo = new FileReportRepo();
  private scheduleService = new ScheduleService();

  // ===== NEW COMPREHENSIVE REPORTING API =====

  /**
   * Generate a comprehensive attendance report with full filtering, aggregation, and insights
   */
  async generateComprehensiveReport(request: ReportRequest): Promise<ReportQueryResult> {
    // Validate the request
    await this.validateReportRequest(request);

    // Apply business rules
    const enhancedRequest = await this.applyBusinessRules(request);

    // Generate the report using our FileReportRepo
    const result = await this.reportRepo.generateReport(enhancedRequest);

    // Add service-level enhancements
    return this.enhanceReportResult(result);
  }

  /**
   * Create a quick summary report for dashboard display
   */
  async generateDashboardSummary(filters?: Partial<ReportFilters>): Promise<{
    totalStudents: number;
    todayAttendanceRate: number;
    weeklyAttendanceRate: number;
    riskStudents: StudentAttendanceStats[];
    perfectAttendance: StudentAttendanceStats[];
    trends: {
      direction: 'improving' | 'declining' | 'stable';
      weeklyChange: number;
    };
  }> {
    const request: ReportRequest = {
      filters: {
        relativePeriod: 'week',
        ...filters
      },
      aggregations: {
        includeCount: true,
        includePercentage: true,
        includeComparative: true,
        includeTrends: true
      },
      useCache: true
    };

    const result = await this.reportRepo.generateReport(request);
    const data = result.data;

    // Calculate today's attendance rate
    const todayFilters: ReportFilters = { relativePeriod: 'today' };
    const todayRequest: ReportRequest = { filters: todayFilters, aggregations: { includePercentage: true } };
    const todayResult = await this.reportRepo.generateReport(todayRequest);

    return {
      totalStudents: data.summary.totalStudents,
      todayAttendanceRate: todayResult.data.summary.overallStats.averageAttendanceRate,
      weeklyAttendanceRate: data.summary.overallStats.averageAttendanceRate,
      riskStudents: data.studentStats.filter(s => s.attendanceRate < 80).slice(0, 5),
      perfectAttendance: data.studentStats.filter(s => s.attendanceRate === 100).slice(0, 5),
      trends: {
        direction: data.summary.trends.attendanceDirection,
        weeklyChange: this.calculateWeeklyChange(data.dateStats)
      }
    };
  }

  /**
   * Generate reports for natural language queries (foundation for RAG integration)
   */
  async generateNaturalLanguageReport(query: string): Promise<NLQueryResult> {
    // Parse natural language query into filters
    const interpretation = await this.parseNaturalLanguageQuery(query);
    
    // Convert to report request
    const request: ReportRequest = {
      filters: interpretation.filters,
      aggregations: {
        includeCount: true,
        includePercentage: true,
        includeComparative: interpretation.intent === 'compare',
        includeTrends: interpretation.intent === 'trend'
      },
      useCache: true
    };

    // Generate the report
    const result = await this.reportRepo.generateReport(request);

    return {
      originalQuery: query,
      interpretedQuery: interpretation,
      confidence: interpretation.confidence,
      result
    };
  }

  /**
   * Get attendance alerts and recommendations
   */
  async generateAttendanceAlerts(): Promise<{
    criticalAlerts: Array<{
      studentId: string;
      studentName: string;
      alertType: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }>;
    patterns: Array<{
      type: string;
      description: string;
      affectedStudents: number;
      recommendation: string;
    }>;
  }> {
    const request: ReportRequest = {
      filters: { relativePeriod: '30days' },
      aggregations: {
        includeCount: true,
        includePercentage: true,
        includeStreaks: true,
        includeTrends: true,
        includeComparative: true
      }
    };

    const result = await this.reportRepo.generateReport(request);
    const insights = result.data.insights;

    if (!insights) {
      return { criticalAlerts: [], patterns: [] };
    }

    const criticalAlerts = insights.alertStudents
      .filter(alert => alert.severity === 'high' || alert.severity === 'medium')
      .map(alert => ({
        ...alert,
        recommendation: this.generateRecommendation(alert)
      }));

    const patterns = insights.patterns.map(pattern => ({
      type: pattern.type,
      description: pattern.description,
      affectedStudents: pattern.affectedStudents.length,
      recommendation: this.generatePatternRecommendation(pattern)
    }));

    return { criticalAlerts, patterns };
  }

  /**
   * Export report in various formats
   */
  async exportReport(
    request: ReportRequest, 
    format: 'csv' | 'json' | 'pdf',
    options?: { includeRawData?: boolean; summaryOnly?: boolean }
  ): Promise<{ data: string | Buffer; filename: string; mimeType: string }> {
    const result = await this.reportRepo.generateReport(request);
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(result.data, options);
      case 'json':
        return this.exportToJSON(result.data, options);
      case 'pdf':
        return this.exportToPDF(result.data, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // ===== EXISTING LEGACY METHODS (MAINTAINED FOR COMPATIBILITY) =====

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

  // ===== NEW HELPER METHODS FOR COMPREHENSIVE REPORTING =====

  /**
   * Validate report request parameters
   */
  private async validateReportRequest(request: ReportRequest): Promise<void> {
    // Validate student IDs if provided
    if (request.filters.studentIds && request.filters.studentIds.length > 0) {
      const validIds = await this.validateStudentIds(request.filters.studentIds);
      if (validIds.length !== request.filters.studentIds.length) {
        const invalidIds = request.filters.studentIds.filter(id => !validIds.includes(id));
        console.warn(`Invalid student IDs: ${invalidIds.join(', ')}`);
      }
    }

    // Validate date ranges
    if (request.filters.dateFrom && request.filters.dateTo) {
      if (request.filters.dateFrom > request.filters.dateTo) {
        throw new Error('dateFrom must be before or equal to dateTo');
      }
    }

    // Validate pagination
    if (request.pagination) {
      if (request.pagination.page < 1) {
        throw new Error('Page number must be >= 1');
      }
      if (request.pagination.limit < 1 || request.pagination.limit > 1000) {
        throw new Error('Limit must be between 1 and 1000');
      }
    }
  }

  /**
   * Apply business rules to enhance the request
   */
  private async applyBusinessRules(request: ReportRequest): Promise<ReportRequest> {
    const enhanced = { ...request };

    // Apply default aggregations for comprehensive reports
    if (!enhanced.aggregations) {
      enhanced.aggregations = {
        includeCount: true,
        includePercentage: true,
        includeStreaks: false,
        includeTrends: false,
        includeComparative: false
      };
    }

    // Apply default cache policy
    if (enhanced.useCache === undefined) {
      enhanced.useCache = true; // Enable caching by default
    }

    // Apply business rule: exclude weekends and holidays by default
    // This would integrate with ScheduleService for school-specific rules

    return enhanced;
  }

  /**
   * Enhance report result with service-level additions
   */
  private enhanceReportResult(result: ReportQueryResult): ReportQueryResult {
    // Add service-level metadata
    const enhanced = { ...result };
    
    // Add performance recommendations
    if (result.metrics.executionTimeMs > 1000) {
      enhanced.warnings = enhanced.warnings || [];
      enhanced.warnings.push('Report generation took longer than expected. Consider using filters to reduce data size.');
    }

    // Add data quality indicators
    if (result.data.summary.totalRecords === 0) {
      enhanced.warnings = enhanced.warnings || [];
      enhanced.warnings.push('No attendance records found for the specified criteria.');
    }

    return enhanced;
  }

  /**
   * Calculate weekly attendance change percentage
   */
  private calculateWeeklyChange(dateStats: any[]): number {
    if (dateStats.length < 2) return 0;
    
    const sorted = dateStats.sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted.slice(-7); // Last 7 days
    const previous = sorted.slice(-14, -7); // Previous 7 days
    
    if (previous.length === 0 || recent.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, day) => sum + day.attendanceRate, 0) / recent.length;
    const previousAvg = previous.reduce((sum, day) => sum + day.attendanceRate, 0) / previous.length;
    
    return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  }

  /**
   * Parse natural language query (foundation for RAG integration)
   */
  private async parseNaturalLanguageQuery(query: string): Promise<{
    intent: 'summary' | 'filter' | 'compare' | 'trend' | 'alert';
    entities: Array<{ type: 'student' | 'date' | 'status' | 'grade' | 'metric'; value: string; confidence: number }>;
    filters: ReportFilters;
    confidence: number;
  }> {
    // Simplified NLP parsing - would be enhanced with proper NLP library
    const lowerQuery = query.toLowerCase();
    let intent: 'summary' | 'filter' | 'compare' | 'trend' | 'alert' = 'summary';
    let confidence = 0.8;
    const entities: Array<{ type: 'student' | 'date' | 'status' | 'grade' | 'metric'; value: string; confidence: number }> = [];
    const filters: ReportFilters = {};

    // Detect intent
    if (lowerQuery.includes('compare') || lowerQuery.includes('versus') || lowerQuery.includes('vs')) {
      intent = 'compare';
    } else if (lowerQuery.includes('trend') || lowerQuery.includes('over time') || lowerQuery.includes('pattern')) {
      intent = 'trend';
    } else if (lowerQuery.includes('alert') || lowerQuery.includes('problem') || lowerQuery.includes('risk')) {
      intent = 'alert';
    } else if (lowerQuery.includes('who') || lowerQuery.includes('which') || lowerQuery.includes('find')) {
      intent = 'filter';
    }

    // Extract date entities
    if (lowerQuery.includes('today')) {
      filters.relativePeriod = 'today';
      entities.push({ type: 'date', value: 'today', confidence: 0.9 });
    } else if (lowerQuery.includes('this week') || lowerQuery.includes('week')) {
      filters.relativePeriod = 'week';
      entities.push({ type: 'date', value: 'week', confidence: 0.9 });
    } else if (lowerQuery.includes('this month') || lowerQuery.includes('month')) {
      filters.relativePeriod = 'month';
      entities.push({ type: 'date', value: 'month', confidence: 0.9 });
    }

    // Extract status entities
    if (lowerQuery.includes('absent') || lowerQuery.includes('missing')) {
      filters.statuses = [AttendanceStatus.ABSENT];
      entities.push({ type: 'status', value: 'absent', confidence: 0.9 });
    } else if (lowerQuery.includes('late') || lowerQuery.includes('tardy')) {
      filters.statuses = [AttendanceStatus.LATE];
      entities.push({ type: 'status', value: 'late', confidence: 0.9 });
    }

    // Extract student name entities (basic regex)
    const nameMatch = lowerQuery.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/);
    if (nameMatch) {
      filters.studentName = nameMatch[1];
      entities.push({ type: 'student', value: nameMatch[1], confidence: 0.7 });
    }

    return { intent, entities, filters, confidence };
  }

  /**
   * Generate recommendation for individual student alert
   */
  private generateRecommendation(alert: any): string {
    switch (alert.alertType) {
      case 'attendance':
        if (alert.severity === 'high') {
          return 'Schedule immediate parent conference and create attendance intervention plan';
        } else {
          return 'Send attendance notification to parents and monitor closely';
        }
      case 'tardiness':
        return 'Review morning routine with student and family, consider transportation assistance';
      case 'pattern':
        return 'Analyze attendance patterns and identify potential underlying causes';
      default:
        return 'Monitor student attendance and provide appropriate support';
    }
  }

  /**
   * Generate recommendation for attendance pattern
   */
  private generatePatternRecommendation(pattern: any): string {
    switch (pattern.type) {
      case 'weekly':
        return 'Investigate weekly schedule factors that may be affecting attendance';
      case 'monthly':
        return 'Review monthly events and their impact on student attendance';
      case 'seasonal':
        return 'Prepare targeted interventions for identified seasonal attendance challenges';
      default:
        return 'Develop targeted strategies to address this attendance pattern';
    }
  }

  /**
   * Export report to CSV format
   */
  private async exportToCSV(
    data: ReportData, 
    options?: { includeRawData?: boolean; summaryOnly?: boolean }
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    let csvContent = '';
    
    if (options?.summaryOnly) {
      // Export summary only
      csvContent = 'Metric,Value\n';
      csvContent += `Total Students,${data.summary.totalStudents}\n`;
      csvContent += `Total Records,${data.summary.totalRecords}\n`;
      csvContent += `Average Attendance Rate,${data.summary.overallStats.averageAttendanceRate}%\n`;
      csvContent += `Average Late Rate,${data.summary.overallStats.averageLateRate}%\n`;
    } else {
      // Export student statistics
      csvContent = 'Student ID,Student Name,Grade,Total Days,Present Days,Late Days,Absent Days,Attendance Rate,Late Rate\n';
      
      data.studentStats.forEach(student => {
        csvContent += `${student.studentId},"${student.studentName}",${student.grade || ''}`;
        csvContent += `,${student.totalDays},${student.presentDays},${student.lateDays}`;
        csvContent += `,${student.absentDays},${student.attendanceRate}%,${student.lateRate}%\n`;
      });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `attendance-report-${timestamp}.csv`;

    return {
      data: csvContent,
      filename,
      mimeType: 'text/csv'
    };
  }

  /**
   * Export report to JSON format
   */
  private async exportToJSON(
    data: ReportData, 
    options?: { includeRawData?: boolean; summaryOnly?: boolean }
  ): Promise<{ data: string; filename: string; mimeType: string }> {
    let exportData: any;

    if (options?.summaryOnly) {
      exportData = {
        summary: data.summary,
        metadata: data.metadata
      };
    } else {
      exportData = {
        ...data,
        records: options?.includeRawData ? data.records : undefined
      };
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `attendance-report-${timestamp}.json`;

    return {
      data: JSON.stringify(exportData, null, 2),
      filename,
      mimeType: 'application/json'
    };
  }

  /**
   * Export report to PDF format (placeholder - would use PDF library)
   */
  private async exportToPDF(
    data: ReportData, 
    options?: { includeRawData?: boolean; summaryOnly?: boolean }
  ): Promise<{ data: Buffer; filename: string; mimeType: string }> {
    // Placeholder implementation - would use a PDF library like jsPDF or puppeteer
    const pdfContent = `
      ATTENDANCE REPORT
      Generated: ${data.metadata.generatedAt}
      
      SUMMARY:
      Total Students: ${data.summary.totalStudents}
      Total Records: ${data.summary.totalRecords}
      Average Attendance Rate: ${data.summary.overallStats.averageAttendanceRate}%
      
      ${data.studentStats.map(student => 
        `${student.studentName}: ${student.attendanceRate}% attendance`
      ).join('\n')}
    `;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `attendance-report-${timestamp}.pdf`;

    return {
      data: Buffer.from(pdfContent, 'utf-8'), // Would be actual PDF buffer
      filename,
      mimeType: 'application/pdf'
    };
  }
}
