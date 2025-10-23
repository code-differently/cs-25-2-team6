import { DayOffReason } from './DayOffReason';

/**
 * Represents a scheduled day off in the attendance system
 */
export class DayOff {
  /**
   * Unique identifier for the scheduled day off
   */
  id: string;
  
  /**
   * ISO 8601 formatted date for the scheduled day off (YYYY-MM-DD)
   */
  dateISO: string;
  
  /**
   * Reason for the day off
   */
  reason: DayOffReason;
  
  /**
   * Optional description or notes about the day off
   */
  description?: string;
  
  /**
   * Timestamp when the day off was created
   */
  createdAt: Date;
  
  /**
   * Whether the day off has been processed (excused absences created)
   */
  processed: boolean;

  constructor(
    id: string,
    dateISO: string,
    reason: DayOffReason,
    description?: string,
    processed: boolean = false
  ) {
    this.id = id;
    this.dateISO = dateISO;
    this.reason = reason;
    this.description = description;
    this.createdAt = new Date();
    this.processed = processed;
  }

  /**
   * Generate a unique ID for a day off based on date and reason
   */
  static generateId(dateISO: string, reason: DayOffReason): string {
    return `${dateISO}_${reason}`;
  }

  /**
   * Validates the date format for a day off (YYYY-MM-DD)
   */
  static validateDate(dateISO: string): boolean {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateISO)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateISO);
    return date.toString() !== 'Invalid Date';
  }
}

/**
 * Result interface for batch operations
 */
export interface BatchResult {
  success: boolean;
  processedCount: number;
  errors?: Error[];
}

/**
 * Result interface for conflict checks
 */
export interface ConflictResult {
  hasConflicts: boolean;
  conflicts?: {
    studentId: string;
    status: string;
  }[];
}

/**
 * Date range interface for queries
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Attendance statistics interface
 */
export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  excusedBySchedule: number;
}
