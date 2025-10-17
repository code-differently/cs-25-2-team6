/**
 * Attendance form validation utilities
 * Implements business rules for date validation and attendance logic
 */

import { AttendanceStatus } from '../domains/AttendanceStatus';
import { 
  AttendanceFormData, 
  StudentAttendanceFormData, 
  AttendanceFormValidationResult,
  DuplicateCheckResult 
} from '../types/attendance';

/**
 * Validates that a date is not in the future
 */
export function validateAttendanceDate(dateISO: string): { isValid: boolean; error?: string } {
  try {
    const inputDate = new Date(dateISO);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate > today) {
      return {
        isValid: false,
        error: 'Cannot take attendance for future dates'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid date format'
    };
  }
}

/**
 * Validates individual student attendance data
 */
export function validateStudentAttendance(student: StudentAttendanceFormData): string[] {
  const errors: string[] = [];
  
  if (!student.studentId?.trim()) {
    errors.push('Student ID is required');
  }
  
  if (!student.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!student.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  // Business rules: flags only valid when present
  if (student.late && student.status !== AttendanceStatus.PRESENT) {
    errors.push('Late flag can only be set when student is Present');
  }
  
  if (student.earlyDismissal && student.status !== AttendanceStatus.PRESENT) {
    errors.push('Early dismissal flag can only be set when student is Present');
  }
  
  return errors;
}

/**
 * Validates the entire attendance form
 */
export function validateAttendanceForm(formData: AttendanceFormData): AttendanceFormValidationResult {
  const result: AttendanceFormValidationResult = {
    isValid: true,
    formErrors: [],
    formWarnings: [],
    studentErrors: {},
    hasBlockingErrors: false
  };
  
  // Validate date
  const dateValidation = validateAttendanceDate(formData.dateISO);
  if (!dateValidation.isValid) {
    result.formErrors.push(dateValidation.error!);
    result.hasBlockingErrors = true;
  }
  
  // Validate class information
  if (!formData.classId?.trim()) {
    result.formErrors.push('Class ID is required');
    result.hasBlockingErrors = true;
  }
  
  if (!formData.className?.trim()) {
    result.formErrors.push('Class name is required');
    result.hasBlockingErrors = true;
  }
  
  // Validate students
  if (!formData.students || formData.students.length === 0) {
    result.formErrors.push('At least one student is required');
    result.hasBlockingErrors = true;
  } else {
    formData.students.forEach(student => {
      const studentErrors = validateStudentAttendance(student);
      if (studentErrors.length > 0) {
        result.studentErrors[student.studentId] = studentErrors;
        result.hasBlockingErrors = true;
      }
    });
  }
  
  // Check for warnings
  const presentCount = formData.students.filter(s => s.status === AttendanceStatus.PRESENT).length;
  const totalCount = formData.students.length;
  const absentPercentage = ((totalCount - presentCount) / totalCount) * 100;
  
  if (absentPercentage > 50) {
    result.formWarnings.push(`High absence rate: ${absentPercentage.toFixed(1)}% of students are absent`);
  }
  
  result.isValid = result.formErrors.length === 0 && Object.keys(result.studentErrors).length === 0;
  
  return result;
}

/**
 * Checks for duplicate attendance records
 */
export function checkForDuplicates(
  formData: AttendanceFormData,
  existingRecords: Array<{
    studentId: string;
    dateISO: string;
    status: AttendanceStatus;
    late: boolean;
    earlyDismissal: boolean;
  }>
): DuplicateCheckResult {
  const duplicates = existingRecords.filter(record => 
    record.dateISO === formData.dateISO &&
    formData.students.some(student => student.studentId === record.studentId)
  );
  
  if (duplicates.length === 0) {
    return {
      hasDuplicates: false,
      duplicateStudents: [],
      warningMessage: ''
    };
  }
  
  const duplicateStudents = duplicates.map(record => {
    const student = formData.students.find(s => s.studentId === record.studentId)!;
    return {
      studentId: record.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      existingStatus: record.status,
      existingLate: record.late,
      existingEarlyDismissal: record.earlyDismissal
    };
  });
  
  const count = duplicateStudents.length;
  const warningMessage = count === 1
    ? `1 student already has attendance recorded for ${formData.dateISO}. Submitting will overwrite the existing record.`
    : `${count} students already have attendance recorded for ${formData.dateISO}. Submitting will overwrite existing records.`;
  
  return {
    hasDuplicates: true,
    duplicateStudents,
    warningMessage
  };
}

/**
 * Validates class name format
 */
export function validateClassName(name: string): { isValid: boolean; error?: string } {
  if (!name?.trim()) {
    return {
      isValid: false,
      error: 'Class name is required'
    };
  }
  
  if (!/[a-zA-Z0-9]/.test(name)) {
    return {
      isValid: false,
      error: 'Class name must contain at least one letter or number'
    };
  }
  
  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: 'Class name cannot exceed 100 characters'
    };
  }
  
  return { isValid: true };
}
