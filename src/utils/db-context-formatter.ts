/**
 * Database context preparation utilities
 * 
 * These utilities help prepare database records (particularly attendance data)
 * for optimal LLM consumption. They handle date formatting, context truncation,
 * and data organization to maximize LLM comprehension.
 */

import { truncateDataForContext, estimateTokenCount, truncateToTokenLimit } from './context-management';
import { LLMErrorCategory, LLMError } from './llm-error-handler';
import { AttendanceRecord as DomainAttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';

/**
 * Date format options for different presentation contexts
 */
export enum DateFormatStyle {
  SHORT = 'short',       // MM/DD/YYYY
  MEDIUM = 'medium',     // Mon DD, YYYY
  LONG = 'long',         // Month DD, YYYY
  ISO = 'iso'            // YYYY-MM-DD (ISO 8601)
}

/**
 * Standard timezone to use for date formatting
 * Default is Eastern Time (ET)
 */
export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Format a date string based on the specified format style
 * @param dateString Date string or Date object
 * @param style Format style to use
 * @param timezone Timezone to use (defaults to America/New_York)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date, 
  style: DateFormatStyle = DateFormatStyle.MEDIUM,
  timezone: string = DEFAULT_TIMEZONE
): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateString}`);
    }
    
    switch (style) {
      case DateFormatStyle.SHORT:
        return date.toLocaleDateString('en-US', { 
          timeZone: timezone,
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric' 
        });
        
      case DateFormatStyle.MEDIUM:
        return date.toLocaleDateString('en-US', {
          timeZone: timezone,
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
      case DateFormatStyle.LONG:
        return date.toLocaleDateString('en-US', {
          timeZone: timezone,
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        
      case DateFormatStyle.ISO:
        return date.toISOString().split('T')[0];
        
      default:
        return date.toLocaleDateString('en-US', { timeZone: timezone });
    }
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    // Return original string if it can't be formatted
    return String(dateString);
  }
}

/**
 * Attendance record interface for context preparation
 * Adapts from the domain AttendanceRecord format
 */
export interface AttendanceRecordContext {
  id?: string;
  studentId: string;
  date: string;
  status: string | AttendanceStatus;
  reason?: string;
  notes?: string;
  late?: boolean;
  earlyDismissal?: boolean;
  onTime?: boolean;
  excused?: boolean;
  formattedDate?: string;
  studentName?: string;
  studentGrade?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Adapter function to convert domain AttendanceRecord to AttendanceRecordContext
 */
export function adaptDomainToContext(record: DomainAttendanceRecord): AttendanceRecordContext {
  return {
    id: record.studentId + '-' + record.dateISO,
    studentId: record.studentId,
    date: record.dateISO,
    status: record.status,
    late: record.late,
    earlyDismissal: record.earlyDismissal,
    onTime: record.onTime,
    excused: record.excused
  };
}

/**
 * Adapter function to convert multiple domain records to context format
 */
export function adaptMultipleDomainToContext(records: DomainAttendanceRecord[]): AttendanceRecordContext[] {
  return records.map(adaptDomainToContext);
}

/**
 * Student record interface for context preparation
 */
export interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
  email?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Options for formatting attendance records
 */
export interface FormatAttendanceOptions {
  dateFormat?: DateFormatStyle;
  timezone?: string;
  includeNotes?: boolean;
  maxRecords?: number;
  studentInfo?: StudentRecord[];
  summarize?: boolean;
}

/**
 * Formats attendance records for LLM consumption with consistent date formatting
 * and contextual information
 * 
 * @param records The attendance records to format
 * @param options Formatting options
 * @returns Formatted attendance records optimized for LLM
 */
export function formatAttendanceForLLM(
  records: DomainAttendanceRecord[],
  options: FormatAttendanceOptions = {}
): AttendanceRecordContext[] {
  try {
    if (!records || records.length === 0) {
      return [];
    }
    
    const {
      dateFormat = DateFormatStyle.MEDIUM,
      timezone = DEFAULT_TIMEZONE,
      includeNotes = true,
      maxRecords = 50,
      studentInfo = [],
      summarize = true
    } = options;

    // Handle excessive records for token limits
    let processedRecords = records;
    if (records.length > maxRecords) {
      if (summarize) {
        processedRecords = summarizeAttendanceRecords(records);
      }
      
      // After summarizing, if still too many records, truncate
      if (processedRecords.length > maxRecords) {
        processedRecords = truncateDataForContext(processedRecords, maxRecords);
      }
    }

        // Format each record
    return processedRecords.map(record => {
      // Convert domain AttendanceRecord to AttendanceRecordContext
      const formatted: AttendanceRecordContext = {
        id: record.studentId + '-' + record.dateISO, // Create an id from studentId and dateISO
        studentId: record.studentId,
        date: record.dateISO, // Map dateISO to date in our context format
        status: record.status,
        late: record.late,
        earlyDismissal: record.earlyDismissal,
        onTime: record.onTime,
        excused: record.excused
      };
      
      // Format date if present
      formatted.formattedDate = formatDate(formatted.date, dateFormat, timezone);
      
      // Add student details if available
      if (studentInfo.length > 0) {
        const student = studentInfo.find(s => s.id === record.studentId);
        if (student) {
          formatted.studentName = `${student.firstName} ${student.lastName}`;
          formatted.studentGrade = student.grade;
        }
      }
      
      return formatted;
    });
    
  } catch (error) {
    console.error('Error formatting attendance records:', error);
    throw new LLMError(
      'Failed to prepare attendance data for processing',
      LLMErrorCategory.CONTEXT_PREPARATION,
      undefined,
      false
    );
  }
}

/**
 * Summarizes a large set of attendance records to reduce token count
 * while preserving important patterns and information
 * 
 * @param records The attendance records to summarize
 * @returns Summarized records
 */
function summarizeAttendanceRecords(records: DomainAttendanceRecord[]): DomainAttendanceRecord[] {
  // Group records by student and month
  const groupedRecords: Record<string, Record<string, DomainAttendanceRecord[]>> = {};
  
  // Group by student and month
  records.forEach(record => {
    const studentId = record.studentId;
    const date = new Date(record.dateISO);
    const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
    
    groupedRecords[studentId] = groupedRecords[studentId] || {};
    groupedRecords[studentId][monthYear] = groupedRecords[studentId][monthYear] || [];
    groupedRecords[studentId][monthYear].push(record);
  });
  
  // Create summary records
  const summaries: DomainAttendanceRecord[] = [];
  
  Object.entries(groupedRecords).forEach(([studentId, months]) => {
    Object.entries(months).forEach(([monthYear, monthRecords]) => {
      // Count statuses
      const statusCounts: Record<string, number> = {};
      monthRecords.forEach(record => {
        statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
      });
      
      // Get month name and year
      const [month, year] = monthYear.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleString('default', { month: 'long' });
      
      // Create summary record
      const summary: any = {
        id: `summary-${studentId}-${monthYear}`,
        studentId,
        date: `${year}-${month}-01`, // First day of month
        status: 'summary',
        summary: true,
        period: `${monthName} ${year}`,
        recordCount: monthRecords.length,
        statusSummary: statusCounts
      };
      
      // Add summary record
      summaries.push(summary);
      
      // Add most recent 3 records for this student/month
      const recentRecords = [...monthRecords]
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, 3);
        
      summaries.push(...recentRecords);
    });
  });
  
  return summaries;
}

/**
 * Format student information for LLM context
 * @param students Array of student records
 * @param options Formatting options
 * @returns Formatted student records
 */
export function formatStudentsForLLM(
  students: StudentRecord[],
  maxStudents: number = 25
): StudentRecord[] {
  if (!students || students.length === 0) {
    return [];
  }
  
  // Truncate if needed
  if (students.length > maxStudents) {
    return truncateDataForContext(students, maxStudents);
  }
  
  // Format each student record
  return students.map(student => {
    const formatted = { ...student };
    
    // Add full name for convenience
    formatted.fullName = `${student.firstName} ${student.lastName}`;
    
    return formatted;
  });
}

/**
 * Prepares comprehensive context for an attendance query
 * @param attendanceRecords Attendance records
 * @param students Student records
 * @param query The user's query (for context optimization)
 * @returns Formatted context string optimized for LLM
 */
export function prepareAttendanceContext(
  attendanceRecords: DomainAttendanceRecord[],
  students: StudentRecord[] = [],
  query?: string
): string {
  try {
    // Format the records
    const formattedAttendance = formatAttendanceForLLM(attendanceRecords, {
      dateFormat: DateFormatStyle.MEDIUM,
      includeNotes: true,
      studentInfo: students,
      summarize: true
    });
    
    // Format student information
    const formattedStudents = formatStudentsForLLM(students);
    
    // Prepare context sections
    const sections = [];
    
    // Add attendance data section
    if (formattedAttendance.length > 0) {
      sections.push(
        `ATTENDANCE RECORDS (${formattedAttendance.length}):\n${JSON.stringify(formattedAttendance, null, 2)}`
      );
    }
    
    // Add student data section if relevant
    if (formattedStudents.length > 0) {
      sections.push(
        `STUDENT INFORMATION (${formattedStudents.length}):\n${JSON.stringify(formattedStudents, null, 2)}`
      );
    }
    
    // Join sections and return
    const contextString = sections.join('\n\n');
    
    // Ensure context isn't too large (limit to ~8000 tokens max)
    return truncateToTokenLimit(contextString, 8000);
    
  } catch (error) {
    console.error('Error preparing attendance context:', error);
    throw new LLMError(
      'Failed to prepare attendance context',
      LLMErrorCategory.CONTEXT_PREPARATION,
      undefined,
      false
    );
  }
}
