import { Student } from '../domains/Student';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { ScheduleService } from './ScheduleService';

export class StudentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

export interface MarkAttendanceParams {
  firstName: string;
  lastName: string;
  dateISO: string;
  onTime?: boolean;
  late?: boolean;
  earlyDismissal?: boolean;
  excused?: boolean;
}

// Batch operation interfaces
export interface BatchAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  late?: boolean;
  earlyDismissal?: boolean;
}

export interface BatchAttendanceResult {
  studentId: string;
  studentName?: string;
  success: boolean;
  error?: string;
  operation: 'created' | 'updated' | 'failed';
}

export interface BatchOperationSummary {
  totalRequested: number;
  successful: number;
  failed: number;
  created: number;
  updated: number;
  results: BatchAttendanceResult[];
}

export class AttendanceService {
  private studentRepo = new FileStudentRepo();
  private attendanceRepo = new FileAttendanceRepo();
  private scheduleService = new ScheduleService();

  inferStatusFromFlags(flags: { onTime?: boolean; late?: boolean; excused?: boolean }): AttendanceStatus {
    if (flags.excused) return AttendanceStatus.EXCUSED;
    if (flags.late) return AttendanceStatus.LATE;
    if (flags.onTime) return AttendanceStatus.PRESENT;
    return AttendanceStatus.ABSENT;
  }

  markAttendanceByName(params: MarkAttendanceParams) {
    const { firstName, lastName, dateISO, onTime, late, earlyDismissal, excused } = params;
    const studentId = this.studentRepo.findStudentIdByName(firstName, lastName);
    if (!studentId) throw new StudentNotFoundError(`Student ${firstName} ${lastName} not found`);

    // Check if this is an off day (weekend or planned day off)
    if (this.scheduleService.isOffDay(dateISO)) {
      const record = new AttendanceRecord({
        studentId,
        dateISO,
        status: AttendanceStatus.EXCUSED,
        late: false,
        earlyDismissal: false
      });
      this.attendanceRepo.saveAttendance(record);
      return record;
    }

    const status = this.inferStatusFromFlags({ onTime, late, excused });
    const record = new AttendanceRecord({
      studentId,
      dateISO,
      status,
      late,
      earlyDismissal
    });
    this.attendanceRepo.saveAttendance(record);
    return record;
  }

  /**
   * Process batch attendance for multiple students on a single date
   * @param date ISO date string (YYYY-MM-DD)
   * @param attendanceEntries Array of student attendance data
   * @param forceUpdate Whether to update existing records without confirmation
   * @returns Batch operation summary with individual results
   */
  public async batchMarkAttendance(
    date: string,
    attendanceEntries: BatchAttendanceEntry[],
    forceUpdate: boolean = false
  ): Promise<BatchOperationSummary> {
    const results: BatchAttendanceResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    for (const entry of attendanceEntries) {
      try {
        // Check if student exists
        const student = this.studentRepo.allStudents().find(s => s.id === entry.studentId);
        if (!student) {
          results.push({
            studentId: entry.studentId,
            success: false,
            error: 'Student not found',
            operation: 'failed'
          });
          failedCount++;
          continue;
        }

        // Check for existing attendance record
        const existingRecord = this.attendanceRepo.findAttendanceBy(entry.studentId, date);
        
        if (existingRecord && !forceUpdate) {
          results.push({
            studentId: entry.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            success: false,
            error: 'Attendance record already exists. Use forceUpdate to override.',
            operation: 'failed'
          });
          failedCount++;
          continue;
        }

        // Mark attendance using existing method
        const markParams: MarkAttendanceParams = {
          firstName: student.firstName,
          lastName: student.lastName,
          dateISO: date,
          onTime: entry.status === AttendanceStatus.PRESENT && !entry.late,
          late: entry.late || entry.status === AttendanceStatus.LATE,
          earlyDismissal: entry.earlyDismissal || false,
          excused: entry.status === AttendanceStatus.EXCUSED
        };

        this.markAttendanceByName(markParams);

        const operation = existingRecord ? 'updated' : 'created';
        results.push({
          studentId: entry.studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          success: true,
          operation
        });

        successCount++;
        if (operation === 'created') createdCount++;
        if (operation === 'updated') updatedCount++;

      } catch (error) {
        results.push({
          studentId: entry.studentId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'failed'
        });
        failedCount++;
      }
    }

    return {
      totalRequested: attendanceEntries.length,
      successful: successCount,
      failed: failedCount,
      created: createdCount,
      updated: updatedCount,
      results
    };
  }

  /**
   * Check for existing attendance records for multiple students on a specific date
   * @param date ISO date string (YYYY-MM-DD)
   * @param studentIds Array of student IDs to check
   * @returns Object containing duplicate information and invalid student IDs
   */
  public async batchCheckDuplicates(
    date: string,
    studentIds: string[]
  ): Promise<{
    hasDuplicates: boolean;
    duplicates: Array<{
      studentId: string;
      studentName: string;
      existingRecord: {
        status: string;
        late: boolean;
        earlyDismissal: boolean;
        excused: boolean;
      };
    }>;
    invalidStudents: Array<{
      studentId: string;
      reason: string;
    }>;
  }> {
    const duplicates = [];
    const invalidStudents = [];
    const allStudents = this.studentRepo.allStudents();

    for (const studentId of studentIds) {
      
      const student = allStudents.find(s => s.id === studentId);
      
      if (!student) {
        invalidStudents.push({
          studentId,
          reason: 'Student not found in system'
        });
        continue;
      }

      
      try {
        const existingRecord = this.attendanceRepo.findAttendanceBy(studentId, date);
        
        if (existingRecord) {
          duplicates.push({
            studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            existingRecord: {
              status: existingRecord.status.toString(),
              late: existingRecord.late,
              earlyDismissal: existingRecord.earlyDismissal,
              excused: existingRecord.excused
            }
          });
        }
      } catch (error) {
        // No existing record found 
        console.log(`No existing attendance found for student ${studentId} on ${date}`);
      }
    }

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      invalidStudents
    };
  }

  /**
   * Validate batch attendance data before processing
   * @param date ISO date string
   * @param attendanceEntries Array of attendance entries to validate
   * @returns Validation result with details
   */
  public validateBatchAttendanceData(
    date: string,
    attendanceEntries: BatchAttendanceEntry[]
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push('Invalid date format. Expected YYYY-MM-DD');
    }

    
    if (!attendanceEntries || attendanceEntries.length === 0) {
      errors.push('At least one attendance entry is required');
    }

    // Check for duplicate student IDs in the batch
    const studentIds = attendanceEntries.map(entry => entry.studentId);
    const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate student IDs in batch: ${duplicateIds.join(', ')}`);
    }

    
    attendanceEntries.forEach((entry, index) => {
      if (!entry.studentId || entry.studentId.trim() === '') {
        errors.push(`Entry ${index + 1}: Student ID is required`);
      }

      if (!entry.status) {
        errors.push(`Entry ${index + 1}: Attendance status is required`);
      }

     
      if (entry.status === AttendanceStatus.PRESENT && entry.late) {
        warnings.push(`Entry ${index + 1}: Student marked as PRESENT but also marked as late`);
      }

      if (entry.status === AttendanceStatus.ABSENT && (entry.late || entry.earlyDismissal)) {
        warnings.push(`Entry ${index + 1}: Student marked as ABSENT but has late/early dismissal flags`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get attendance summary for multiple students over a date range
   * @param studentIds Array of student IDs
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Batch attendance summary
   */
  public async getBatchAttendanceSummary(
    studentIds: string[],
    startDate: string,
    endDate: string
  ): Promise<{
    students: Array<{
      studentId: string;
      studentName: string;
      totalDays: number;
      presentCount: number;
      lateCount: number;
      absentCount: number;
      excusedCount: number;
      attendanceRate: number;
    }>;
    overallSummary: {
      totalStudents: number;
      averageAttendanceRate: number;
      totalPossibleDays: number;
    };
  }> {
    const students = [];
    const allStudents = this.studentRepo.allStudents();
    let totalAttendanceRate = 0;

    for (const studentId of studentIds) {
      const student = allStudents.find(s => s.id === studentId);
      if (!student) continue;

      const attendanceRecords = this.getAttendanceForStudent(studentId, startDate, endDate);
      
      const summary = {
        studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        totalDays: attendanceRecords.length,
        presentCount: attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length,
        lateCount: attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length,
        absentCount: attendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
        excusedCount: attendanceRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length,
        attendanceRate: 0
      };

      //attendance rate logic (present + late + excused) / total
      const attendingDays = summary.presentCount + summary.lateCount + summary.excusedCount;
      summary.attendanceRate = summary.totalDays > 0 ? (attendingDays / summary.totalDays) * 100 : 0;
      
      totalAttendanceRate += summary.attendanceRate;
      students.push(summary);
    }

    const averageAttendanceRate = students.length > 0 ? totalAttendanceRate / students.length : 0;

    return {
      students,
      overallSummary: {
        totalStudents: students.length,
        averageAttendanceRate,
        totalPossibleDays: students.length > 0 ? students[0].totalDays : 0
      }
    };
  }

  /**
   * Get attendance records for a student within a date range
   * @param studentId Student ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Array of attendance records
   */
  public getAttendanceForStudent(studentId: string, startDate: string, endDate: string): AttendanceRecord[] {
    const allRecords = this.attendanceRepo.allAttendance();
    return allRecords.filter(record => 
      record.studentId === studentId &&
      record.dateISO >= startDate &&
      record.dateISO <= endDate
    );
  }
}
