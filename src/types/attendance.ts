/**
 * Attendance form types for batch attendance management
 * Uses existing AttendanceStatus enum and boolean flags system
 */

import { AttendanceStatus } from '../domains/AttendanceStatus';

export interface StudentAttendanceFormData {
  studentId: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus;
  late: boolean; // Only valid when status is PRESENT
  earlyDismissal: boolean; // Only valid when status is PRESENT
  isDirty: boolean;
  hasErrors: boolean;
  errors: string[];
}

export interface AttendanceFormData {
  dateISO: string; // YYYY-MM-DD
  classId: string;
  className: string;
  students: StudentAttendanceFormData[];
  hasUnsavedChanges: boolean;
  formErrors: string[];
  formWarnings: string[];
}

export interface BatchAttendanceRequest {
  dateISO: string;
  classId: string;
  attendanceRecords: Array<{
    studentId: string;
    status: AttendanceStatus;
    late: boolean;
    earlyDismissal: boolean;
  }>;
  notes?: string;
}

export interface AttendanceFormValidationResult {
  isValid: boolean;
  formErrors: string[];
  formWarnings: string[];
  studentErrors: Record<string, string[]>;
  hasBlockingErrors: boolean;
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateStudents: Array<{
    studentId: string;
    firstName: string;
    lastName: string;
    existingStatus: AttendanceStatus;
    existingLate: boolean;
    existingEarlyDismissal: boolean;
  }>;
  warningMessage: string;
}

export interface BulkOperationRequest {
  operation: 'markAllPresent' | 'markAllAbsent' | 'clearAll';
  studentIds: string[]; // Empty array = apply to all students
  late?: boolean; // For markAllPresent operation
  earlyDismissal?: boolean; // For markAllPresent operation
}
