/**
 * Utility functions for attendance form operations
 */

import { AttendanceStatus } from '../domains/AttendanceStatus';
import { 
  AttendanceFormData, 
  StudentAttendanceFormData, 
  BulkOperationRequest 
} from '../types/attendance';
import { FORM_DEFAULTS } from '../constants/attendance-form';

export function createEmptyStudentAttendance(
  studentId: string, 
  firstName: string, 
  lastName: string
): StudentAttendanceFormData {
  return {
    studentId,
    firstName,
    lastName,
    status: FORM_DEFAULTS.ATTENDANCE_FORM.STATUS,
    late: FORM_DEFAULTS.ATTENDANCE_FORM.LATE,
    earlyDismissal: FORM_DEFAULTS.ATTENDANCE_FORM.EARLY_DISMISSAL,
    isDirty: FORM_DEFAULTS.ATTENDANCE_FORM.IS_DIRTY,
    hasErrors: FORM_DEFAULTS.ATTENDANCE_FORM.HAS_ERRORS,
    errors: [...FORM_DEFAULTS.ATTENDANCE_FORM.ERRORS]
  };
}

export function createEmptyAttendanceForm(
  dateISO: string,
  classId: string,
  className: string,
  students: Array<{ id: string; firstName: string; lastName: string }>
): AttendanceFormData {
  return {
    dateISO,
    classId,
    className,
    students: students.map(student => 
      createEmptyStudentAttendance(student.id, student.firstName, student.lastName)
    ),
    hasUnsavedChanges: false,
    formErrors: [],
    formWarnings: []
  };
}

export function applyBulkOperation(
  formData: AttendanceFormData,
  operation: BulkOperationRequest
): AttendanceFormData {
  const updatedStudents = formData.students.map(student => {
    const shouldUpdate = operation.studentIds.length === 0 || 
                        operation.studentIds.includes(student.studentId);
    
    if (!shouldUpdate) {
      return student;
    }
    
    const updatedStudent = { ...student, isDirty: true };
    
    switch (operation.operation) {
      case 'markAllPresent':
        updatedStudent.status = AttendanceStatus.PRESENT;
        updatedStudent.late = operation.late || false;
        updatedStudent.earlyDismissal = operation.earlyDismissal || false;
        break;
        
      case 'markAllAbsent':
        updatedStudent.status = AttendanceStatus.ABSENT;
        updatedStudent.late = false;
        updatedStudent.earlyDismissal = false;
        break;
        
      case 'clearAll':
        updatedStudent.status = FORM_DEFAULTS.ATTENDANCE_FORM.STATUS;
        updatedStudent.late = FORM_DEFAULTS.ATTENDANCE_FORM.LATE;
        updatedStudent.earlyDismissal = FORM_DEFAULTS.ATTENDANCE_FORM.EARLY_DISMISSAL;
        updatedStudent.isDirty = false;
        break;
    }
    
    return updatedStudent;
  });
  
  return {
    ...formData,
    students: updatedStudents,
    hasUnsavedChanges: true
  };
}

export function updateStudentAttendance(
  formData: AttendanceFormData,
  studentId: string,
  updates: Partial<Pick<StudentAttendanceFormData, 'status' | 'late' | 'earlyDismissal'>>
): AttendanceFormData {
  const updatedStudents = formData.students.map(student => {
    if (student.studentId !== studentId) {
      return student;
    }
    
    const updatedStudent = { 
      ...student, 
      ...updates, 
      isDirty: true 
    };
    
    // Clear flags if not present
    if (updatedStudent.status !== AttendanceStatus.PRESENT) {
      updatedStudent.late = false;
      updatedStudent.earlyDismissal = false;
    }
    
    return updatedStudent;
  });
  
  return {
    ...formData,
    students: updatedStudents,
    hasUnsavedChanges: true
  };
}

export function hasUnsavedChanges(formData: AttendanceFormData): boolean {
  return formData.hasUnsavedChanges || 
         formData.students.some(student => student.isDirty);
}

export function markFormAsSaved(formData: AttendanceFormData): AttendanceFormData {
  return {
    ...formData,
    hasUnsavedChanges: false,
    students: formData.students.map(student => ({
      ...student,
      isDirty: false
    }))
  };
}

export function getAttendanceStats(formData: AttendanceFormData) {
  const total = formData.students.length;
  const present = formData.students.filter(s => s.status === AttendanceStatus.PRESENT).length;
  const late = formData.students.filter(s => s.late).length;
  const earlyDismissal = formData.students.filter(s => s.earlyDismissal).length;
  const absent = formData.students.filter(s => s.status === AttendanceStatus.ABSENT).length;
  const excused = formData.students.filter(s => s.status === AttendanceStatus.EXCUSED).length;
  
  const presentPercentage = total > 0 ? (present / total) * 100 : 0;
  const absentPercentage = total > 0 ? ((absent) / total) * 100 : 0;
  
  return {
    total,
    present,
    late,
    earlyDismissal,
    absent,
    excused,
    presentPercentage: Math.round(presentPercentage * 10) / 10,
    absentPercentage: Math.round(absentPercentage * 10) / 10
  };
}

export function convertFormToBatchRequest(formData: AttendanceFormData): {
  dateISO: string;
  classId: string;
  attendanceRecords: Array<{
    studentId: string;
    status: AttendanceStatus;
    late: boolean;
    earlyDismissal: boolean;
  }>;
} {
  return {
    dateISO: formData.dateISO,
    classId: formData.classId,
    attendanceRecords: formData.students.map(student => ({
      studentId: student.studentId,
      status: student.status,
      late: student.late,
      earlyDismissal: student.earlyDismissal
    }))
  };
}

export function generateAttendanceSummary(formData: AttendanceFormData): string {
  const stats = getAttendanceStats(formData);
  const changedStudents = formData.students.filter(s => s.isDirty);
  
  if (changedStudents.length === 0) {
    return 'No changes to save';
  }
  
  const summaryParts = [
    `${changedStudents.length} student${changedStudents.length === 1 ? '' : 's'} updated`,
    `${stats.present} present`,
    `${stats.absent} absent`
  ];
  
  if (stats.late > 0) {
    summaryParts.push(`${stats.late} late`);
  }
  
  if (stats.earlyDismissal > 0) {
    summaryParts.push(`${stats.earlyDismissal} early dismissal`);
  }
  
  if (stats.excused > 0) {
    summaryParts.push(`${stats.excused} excused`);
  }
  
  return summaryParts.join(', ');
}
