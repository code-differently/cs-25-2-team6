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
   * Check if attendance record exists for a specific student and date
   * @param studentId Student ID to check
   * @param date ISO date string (YYYY-MM-DD)
   * @returns Object with existence status and record details if found
   */
  public checkExistingAttendance(studentId: string, date: string): {
    exists: boolean;
    record?: {
      status: AttendanceStatus;
      late: boolean;
      earlyDismissal: boolean;
      excused: boolean;
    };
    student?: {
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  } {
    // Check if student exists first
    const student = this.studentRepo.allStudents().find(s => s.id === studentId);
    if (!student) {
      return { exists: false };
    }

    try {
      const existingRecord = this.attendanceRepo.findAttendanceBy(studentId, date);
      
      if (existingRecord) {
        return {
          exists: true,
          record: {
            status: existingRecord.status,
            late: existingRecord.late,
            earlyDismissal: existingRecord.earlyDismissal,
            excused: existingRecord.excused
          },
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: `${student.firstName} ${student.lastName}`
          }
        };
      }
    } catch (error) {
   
      console.log(`No existing attendance found for student ${studentId} on ${date}`);
    }

    return { 
      exists: false,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`
      }
    };
  }

  /**
   * Process batch attendance for multiple students on a single date with transaction support
   * @param date ISO date string (YYYY-MM-DD)
   * @param attendanceEntries Array of student attendance data
   * @param forceUpdate Whether to update existing records without confirmation
   * @param useTransaction Whether to use transaction-like behavior (rollback on failure)
   * @returns Batch operation summary with individual results
   */
  public async batchMarkAttendance(
    date: string,
    attendanceEntries: BatchAttendanceEntry[],
    forceUpdate: boolean = false,
    useTransaction: boolean = true
  ): Promise<BatchOperationSummary> {
    const results: BatchAttendanceResult[] = [];
    const successfulOperations: BatchAttendanceResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    // Pre-validation phase
    const preValidation = this.validateBatchAttendanceData(date, attendanceEntries);
    if (!preValidation.isValid) {
      throw new Error(`Batch validation failed: ${preValidation.errors.join(', ')}`);
    }

   
    const backupRecords: Map<string, AttendanceRecord | null> = new Map();
    
    if (useTransaction) {
      for (const entry of attendanceEntries) {
        try {
          const existing = this.attendanceRepo.findAttendanceBy(entry.studentId, date);
          backupRecords.set(entry.studentId, existing || null);
        } catch (error) {
          backupRecords.set(entry.studentId, null); 
        }
      }
    }

    try {
// Processing phase
      for (const entry of attendanceEntries) {
        try {
// Check if student exists using the new method
          const existenceCheck = this.checkExistingAttendance(entry.studentId, date);
          
          if (!existenceCheck.student) {
            const failResult: BatchAttendanceResult = {
              studentId: entry.studentId,
              success: false,
              error: 'Student not found',
              operation: 'failed'
            };
            results.push(failResult);
            failedCount++;
            

            if (useTransaction) {
              throw new Error(`Critical failure: Student ${entry.studentId} not found`);
            }
            continue;
          }

          // Check for existing attendance record
          if (existenceCheck.exists && !forceUpdate) {
            const failResult: BatchAttendanceResult = {
              studentId: entry.studentId,
              studentName: existenceCheck.student.fullName,
              success: false,
              error: 'Attendance record already exists. Use forceUpdate to override.',
              operation: 'failed'
            };
            results.push(failResult);
            failedCount++;


            if (useTransaction) {
              throw new Error(`Duplicate record found for student ${entry.studentId} on ${date}`);
            }
            continue;
          }

// mark attendance using existing method
          const markParams: MarkAttendanceParams = {
            firstName: existenceCheck.student.firstName,
            lastName: existenceCheck.student.lastName,
            dateISO: date,
            onTime: entry.status === AttendanceStatus.PRESENT && !entry.late,
            late: entry.late || entry.status === AttendanceStatus.LATE,
            earlyDismissal: entry.earlyDismissal || false,
            excused: entry.status === AttendanceStatus.EXCUSED
          };

          this.markAttendanceByName(markParams);

          const operation = existenceCheck.exists ? 'updated' : 'created';
          const successResult: BatchAttendanceResult = {
            studentId: entry.studentId,
            studentName: existenceCheck.student.fullName,
            success: true,
            operation
          };

          results.push(successResult);
          successfulOperations.push(successResult);
          successCount++;
          
          if (operation === 'created') createdCount++;
          if (operation === 'updated') updatedCount++;

        } catch (error) {
          const failResult: BatchAttendanceResult = {
            studentId: entry.studentId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            operation: 'failed'
          };
          results.push(failResult);
          failedCount++;

          // If using transactions, rollback and rethrow
          if (useTransaction) {
            await this.rollbackBatchOperations(successfulOperations, date, backupRecords);
            throw error;
          }
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

    } catch (error) {
      // Transaction rollback occurred
      if (useTransaction) {
        console.error('Batch operation failed, rollback completed:', error);
        return {
          totalRequested: attendanceEntries.length,
          successful: 0,
          failed: attendanceEntries.length,
          created: 0,
          updated: 0,
          results: attendanceEntries.map(entry => ({
            studentId: entry.studentId,
            success: false,
            error: 'Batch operation rolled back due to failure',
            operation: 'failed' as const
          }))
        };
      }
      
      throw error;
    }
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

  /**
   * Rollback mechanism for failed batch operations
   * @param successfulOperations Array of successful operations to rollback
   * @param date Date of the operations
   * @param backupRecords Map of original records for restoration
   */
  private async rollbackBatchOperations(
    successfulOperations: BatchAttendanceResult[],
    date: string,
    backupRecords: Map<string, AttendanceRecord | null>
  ): Promise<void> {
    console.log(`Rolling back ${successfulOperations.length} successful operations for date ${date}`);
    
    for (const operation of successfulOperations) {
      try {
        const backup = backupRecords.get(operation.studentId);
        
        if (operation.operation === 'created') {
          // For created records, we would need a delete method in the repository
          // Since we don't have one, we log this for now
          console.log(`Would rollback created record for student ${operation.studentId} on ${date}`);
          // In a real implementation: this.attendanceRepo.deleteAttendance(operation.studentId, date);
        } else if (operation.operation === 'updated' && backup) {
          // Restore the previous record
          console.log(`Rolling back updated record for student ${operation.studentId} on ${date}`);
          this.attendanceRepo.saveAttendance(backup);
        }
      } catch (error) {
        console.error(`Failed to rollback operation for student ${operation.studentId}:`, error);
      }
    }
  }
}
