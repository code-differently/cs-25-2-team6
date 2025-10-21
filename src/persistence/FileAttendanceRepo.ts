import * as fs from "fs";
import * as path from "path";
import { AttendanceRecord } from "../domains/AttendanceRecords";
import { AttendanceStatus } from "../domains/AttendanceStatus";

export class FileAttendanceRepo {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, "attendance.json");
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  saveAttendance(record: AttendanceRecord): void {
    const records = this.allAttendance();
    
    const recordData = {
      studentId: record.studentId,
      dateISO: record.dateISO,
      status: record.status,
      late: record.late,
      earlyDismissal: record.earlyDismissal,
      onTime: record.onTime,
      excused: record.excused,
    };
    
    records.push(recordData);
    fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
  }

  allAttendance(): AttendanceRecord[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      if (data.trim() === '') {
        // File is empty, initialize with empty array
        fs.writeFileSync(this.filePath, JSON.stringify([]));
        return [];
      }
      const recordsData = JSON.parse(data);
      return recordsData.map((data: any) => new AttendanceRecord({
        studentId: data.studentId,
        dateISO: data.dateISO,
        status: data.status as AttendanceStatus,
        late: data.late,
        earlyDismissal: data.earlyDismissal,
      }));
    } catch (error) {
      // If file is corrupted or invalid JSON, reset to empty array
      fs.writeFileSync(this.filePath, JSON.stringify([]));
      return [];
    }
  }

  findAttendanceBy(studentId: string, dateISO: string): AttendanceRecord | undefined {
    const records = this.allAttendance();
    return records.find(r => r.studentId === studentId && r.dateISO === dateISO);
  }

  /**
   * Find attendance record by student and date for duplicate checking
   * @param studentId Student ID to search for
   * @param dateISO Date in ISO format (YYYY-MM-DD)
   * @returns AttendanceRecord if found, null if not found
   * @throws Error if there are any issues during the search
   */
  findByStudentAndDate(studentId: string, dateISO: string): AttendanceRecord | null {
    try {
      const records = this.allAttendance();
      const found = records.find(r => r.studentId === studentId && r.dateISO === dateISO);
      return found || null;
    } catch (error) {
      throw new Error(`Failed to search for attendance record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New filtering methods for CLI functionality
  findAttendanceByDate(dateISO: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.dateISO === dateISO);
  }

  findAttendanceByStatus(status: AttendanceStatus): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.status === status);
  }

  getLateListByDate(dateISO: string): AttendanceRecord[] {
    const records = this.findAttendanceByDate(dateISO);
    return records.filter(record => record.late === true);
  }

  getEarlyDismissalListByDate(dateISO: string): AttendanceRecord[] {
    const records = this.findAttendanceByDate(dateISO);
    return records.filter(record => record.earlyDismissal === true);
  }

  getLateListByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.studentId === studentId && record.late === true);
  }

  getEarlyDismissalListByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.studentId === studentId && record.earlyDismissal === true);
  }

  findByStudentAndDateRange(studentId: string, startISO: string, endISO: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records
      .filter(record => record.studentId === studentId && record.dateISO >= startISO && record.dateISO <= endISO)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  findAllByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records
      .filter(record => record.studentId === studentId)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  saveMany(records: AttendanceRecord[]): void {
    const existingRecords = this.allAttendance();
    
    const newRecordsData = records.map(record => ({
      studentId: record.studentId,
      dateISO: record.dateISO,
      status: record.status,
      late: record.late,
      earlyDismissal: record.earlyDismissal,
      onTime: record.onTime,
      excused: record.excused,
    }));
    
    existingRecords.push(...newRecordsData);
    
    fs.writeFileSync(this.filePath, JSON.stringify(existingRecords, null, 2));
  }

  /**
   * Efficiently save multiple attendance records with transaction support
   * @param records Array of attendance records to save
   * @param options Configuration options for the batch operation
   * @returns BatchSaveResult with operation details
   */
  saveBatch(records: AttendanceRecord[], options: {
    overwriteExisting?: boolean;
    validateBeforeSave?: boolean;
    createBackup?: boolean;
  } = {}): BatchSaveResult {
    const {
      overwriteExisting = false,
      validateBeforeSave = true,
      createBackup = true
    } = options;

    let backupPath: string | null = null;
    let originalRecords: any[] = [];

    try {
      // Read current records
      originalRecords = this.allAttendance();
      
      // Create backup if requested
      if (createBackup) {
        backupPath = `${this.filePath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, JSON.stringify(originalRecords, null, 2));
      }

      // Validation phase
      if (validateBeforeSave) {
        const validationResult = this.validateBatchRecords(records);
        if (!validationResult.isValid) {
          throw new Error(`Batch validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      const conflicts: string[] = [];
      const newRecords: any[] = [...originalRecords];
      const processed: AttendanceRecord[] = [];
      const skipped: AttendanceRecord[] = [];

      // Process each record
      for (const record of records) {
        const existingIndex = newRecords.findIndex(
          r => r.studentId === record.studentId && r.dateISO === record.dateISO
        );

        if (existingIndex >= 0) {
          if (overwriteExisting) {
            // Replace existing record
            newRecords[existingIndex] = {
              studentId: record.studentId,
              dateISO: record.dateISO,
              status: record.status,
              late: record.late,
              earlyDismissal: record.earlyDismissal,
              onTime: record.onTime,
              excused: record.excused,
            };
            processed.push(record);
          } else {
            // Skip duplicate
            conflicts.push(`${record.studentId}-${record.dateISO}`);
            skipped.push(record);
          }
        } else {
          // Add new record
          newRecords.push({
            studentId: record.studentId,
            dateISO: record.dateISO,
            status: record.status,
            late: record.late,
            earlyDismissal: record.earlyDismissal,
            onTime: record.onTime,
            excused: record.excused,
          });
          processed.push(record);
        }
      }

      // Atomic write
      fs.writeFileSync(this.filePath, JSON.stringify(newRecords, null, 2));

      // Clean up backup if operation was successful
      if (backupPath && createBackup) {
        try {
          fs.unlinkSync(backupPath);
        } catch (error) {
          console.warn(`Failed to clean up backup file: ${backupPath}`);
        }
      }

      return {
        success: true,
        totalRequested: records.length,
        processed: processed.length,
        skipped: skipped.length,
        conflicts: conflicts,
        processedRecords: processed,
        skippedRecords: skipped,
        backupPath: null // Backup was cleaned up
      };

    } catch (error) {
      // Rollback operation
      if (backupPath && fs.existsSync(backupPath)) {
        try {
          fs.copyFileSync(backupPath, this.filePath);
          fs.unlinkSync(backupPath);
          console.log('Batch operation failed, rolled back to previous state');
        } catch (rollbackError) {
          console.error('Failed to rollback after batch operation failure:', rollbackError);
        }
      }

      return {
        success: false,
        totalRequested: records.length,
        processed: 0,
        skipped: records.length,
        conflicts: [],
        processedRecords: [],
        skippedRecords: records,
        error: error instanceof Error ? error.message : 'Unknown error',
        backupPath
      };
    }
  }

  /**
   * Validate batch records before processing
   * @param records Array of records to validate
   * @returns Validation result
   */
  private validateBatchRecords(records: AttendanceRecord[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!records || records.length === 0) {
      errors.push('No records provided for batch operation');
      return { isValid: false, errors, warnings };
    }

    // Check for duplicates within the batch
    const seenKeys = new Set<string>();
    
    records.forEach((record, index) => {
      const key = `${record.studentId}-${record.dateISO}`;
      
      // Validate required fields
      if (!record.studentId || record.studentId.trim() === '') {
        errors.push(`Record ${index + 1}: Student ID is required`);
      }
      
      if (!record.dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(record.dateISO)) {
        errors.push(`Record ${index + 1}: Valid date in YYYY-MM-DD format is required`);
      }
      
      if (!record.status) {
        errors.push(`Record ${index + 1}: Attendance status is required`);
      }

      // Check for duplicates within batch
      if (seenKeys.has(key)) {
        errors.push(`Duplicate record in batch: ${key}`);
      } else {
        seenKeys.add(key);
      }

      // Logical validation warnings
      if (record.status === AttendanceStatus.PRESENT && record.late) {
        warnings.push(`Record ${index + 1}: Student marked as PRESENT but also marked as late`);
      }
      
      if (record.status === AttendanceStatus.ABSENT && (record.late || record.earlyDismissal)) {
        warnings.push(`Record ${index + 1}: Student marked as ABSENT but has late/early dismissal flags`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Delete an attendance record (for rollback operations)
   * @param studentId Student ID
   * @param dateISO Date in ISO format
   * @returns True if record was deleted, false if not found
   */
  deleteAttendanceRecord(studentId: string, dateISO: string): boolean {
    try {
      const records = this.allAttendance();
      const filteredRecords = records.filter(
        record => !(record.studentId === studentId && record.dateISO === dateISO)
      );
      
      if (filteredRecords.length === records.length) {
        return false; // No record was found to delete
      }
      
      const recordsData = filteredRecords.map(record => ({
        studentId: record.studentId,
        dateISO: record.dateISO,
        status: record.status,
        late: record.late,
        earlyDismissal: record.earlyDismissal,
        onTime: record.onTime,
        excused: record.excused,
      }));
      
      fs.writeFileSync(this.filePath, JSON.stringify(recordsData, null, 2));
      return true;
    } catch (error) {
      throw new Error(`Failed to delete attendance record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing attendance record
   * @param studentId Student ID
   * @param dateISO Date in ISO format
   * @param updates Partial record updates
   * @returns True if updated, false if not found
   */
  updateAttendanceRecord(
    studentId: string, 
    dateISO: string, 
    updates: Partial<AttendanceRecord>
  ): boolean {
    try {
      const records = this.allAttendance();
      const recordIndex = records.findIndex(
        record => record.studentId === studentId && record.dateISO === dateISO
      );
      
      if (recordIndex === -1) {
        return false; // Record not found
      }
      
      // Update the record
      const existingRecord = records[recordIndex];
      const updatedRecord = new AttendanceRecord({
        studentId: existingRecord.studentId,
        dateISO: existingRecord.dateISO,
        status: updates.status || existingRecord.status,
        late: updates.late !== undefined ? updates.late : existingRecord.late,
        earlyDismissal: updates.earlyDismissal !== undefined ? updates.earlyDismissal : existingRecord.earlyDismissal,
      });
      
      // Replace in array
      records[recordIndex] = updatedRecord;
      
      // Save back to file
      const recordsData = records.map(record => ({
        studentId: record.studentId,
        dateISO: record.dateISO,
        status: record.status,
        late: record.late,
        earlyDismissal: record.earlyDismissal,
        onTime: record.onTime,
        excused: record.excused,
      }));
      
      fs.writeFileSync(this.filePath, JSON.stringify(recordsData, null, 2));
      return true;
    } catch (error) {
      throw new Error(`Failed to update attendance record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Result interface for batch save operations
 */
export interface BatchSaveResult {
  success: boolean;
  totalRequested: number;
  processed: number;
  skipped: number;
  conflicts: string[];
  processedRecords: AttendanceRecord[];
  skippedRecords: AttendanceRecord[];
  error?: string;
  backupPath?: string | null;
}
