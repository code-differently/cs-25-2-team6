import { AttendanceStatus } from './AttendanceStatus';
import { ReportFilters, ReportMetadata } from './ReportFilters';

/**
 * Individual attendance record in a report
 */
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentFirstName: string;
  studentLastName: string;
  grade?: string;
  date: string; // ISO date string
  status: AttendanceStatus;
  late: boolean;
  earlyDismissal: boolean;
  excused: boolean;
  createdAt: string;
}

/**
 * Aggregated statistics for a student
 */
export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  grade?: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  excusedDays: number;
  attendanceRate: number; // Percentage (0-100)
  lateRate: number; // Percentage (0-100)
  consecutiveAbsences: number;
  longestPresentStreak: number;
  lastAttendanceDate?: string;
  averageWeeklyAttendance: number;
  trend: 'improving' | 'declining' | 'stable';
}

/**
 * Aggregated statistics for a date period
 */
export interface DateAttendanceStats {
  date: string;
  totalStudents: number;
  presentStudents: number;
  lateStudents: number;
  absentStudents: number;
  excusedStudents: number;
  attendanceRate: number;
  lateRate: number;
}

/**
 * Summary statistics for the entire report
 */
export interface ReportSummary {
  totalStudents: number;
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
    totalDays: number;
  };
  overallStats: {
    averageAttendanceRate: number;
    averageLateRate: number;
    totalPresentDays: number;
    totalLateDays: number;
    totalAbsentDays: number;
    totalExcusedDays: number;
  };
  trends: {
    attendanceDirection: 'improving' | 'declining' | 'stable';
    riskStudents: number; // Students below attendance threshold
    perfectAttendance: number; // Students with 100% attendance
  };
}

/**
 * Main report data structure containing all aggregated results
 */
export interface ReportData {
  // Core data
  records: AttendanceRecord[];
  
  // Aggregated statistics
  studentStats: StudentAttendanceStats[];
  dateStats: DateAttendanceStats[];
  summary: ReportSummary;
  
  // Report metadata
  metadata: ReportMetadata;
  
  // Additional insights
  insights?: ReportInsights;
}

/**
 * AI-generated insights and recommendations
 */
export interface ReportInsights {
  keyFindings: string[];
  recommendations: string[];
  alertStudents: Array<{
    studentId: string;
    studentName: string;
    alertType: 'attendance' | 'tardiness' | 'pattern';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  patterns: Array<{
    type: 'weekly' | 'monthly' | 'seasonal';
    description: string;
    affectedStudents: string[];
  }>;
}

/**
 * Export format options
 */
export interface ExportData {
  format: 'csv' | 'json' | 'pdf';
  filename: string;
  data: ReportData;
  options?: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    includeInsights?: boolean;
    summaryOnly?: boolean;
  };
}

/**
 * Comparative report data for analyzing trends over time
 */
export interface ComparativeReportData {
  current: ReportData;
  previous?: ReportData;
  comparison: {
    attendanceRateChange: number;
    lateRateChange: number;
    improvingStudents: string[];
    decliningStudents: string[];
    significantChanges: Array<{
      studentId: string;
      metric: string;
      change: number;
      significance: 'minor' | 'moderate' | 'major';
    }>;
  };
}
