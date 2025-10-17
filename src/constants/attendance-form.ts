/**
 * Constants for attendance forms and validation messages
 */

import { AttendanceStatus } from '../domains/AttendanceStatus';

export const ATTENDANCE_LABELS = {
  STATUS: {
    [AttendanceStatus.PRESENT]: 'Present',
    [AttendanceStatus.LATE]: 'Late',
    [AttendanceStatus.ABSENT]: 'Absent',
    [AttendanceStatus.EXCUSED]: 'Excused'
  },
  
  FLAGS: {
    LATE: 'Late',
    EARLY_DISMISSAL: 'Early Dismissal'
  },
  
  FORM: {
    DATE: 'Date',
    CLASS: 'Class',
    STUDENT_NAME: 'Student Name',
    STUDENT_ID: 'Student ID',
    STATUS: 'Status',
    ACTIONS: 'Actions'
  },
  
  BUTTONS: {
    SAVE: 'Save Attendance',
    CANCEL: 'Cancel',
    CLEAR_ALL: 'Clear All',
    MARK_ALL_PRESENT: 'Mark All Present',
    MARK_ALL_ABSENT: 'Mark All Absent',
    ADD_STUDENT: 'Add Student',
    REMOVE_STUDENT: 'Remove Student',
    SUBMIT: 'Submit',
    OVERRIDE: 'Override & Save'
  }
} as const;

export const VALIDATION_MESSAGES = {
  DATE: {
    REQUIRED: 'Date is required',
    FUTURE_DATE: 'Cannot take attendance for future dates',
    INVALID_FORMAT: 'Invalid date format'
  },
  
  CLASS: {
    ID_REQUIRED: 'Class ID is required',
    NAME_REQUIRED: 'Class name is required',
    NAME_INVALID: 'Class name must contain at least one letter or number',
    NAME_TOO_LONG: 'Class name cannot exceed 100 characters'
  },
  
  STUDENT: {
    ID_REQUIRED: 'Student ID is required',
    FIRST_NAME_REQUIRED: 'First name is required',
    LAST_NAME_REQUIRED: 'Last name is required',
    LATE_REQUIRES_PRESENT: 'Late flag can only be set when student is Present',
    EARLY_DISMISSAL_REQUIRES_PRESENT: 'Early dismissal flag can only be set when student is Present'
  },
  
  FORM: {
    NO_STUDENTS: 'At least one student is required',
    HIGH_ABSENCE_RATE: 'High absence rate detected',
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
  },
  
  DUPLICATES: {
    SINGLE: 'already has attendance recorded for this date. Submitting will overwrite the existing record.',
    MULTIPLE: 'students already have attendance recorded for this date. Submitting will overwrite existing records.',
    CONFIRM_OVERRIDE: 'Are you sure you want to overwrite existing attendance records?'
  },
  
  SUCCESS: {
    ATTENDANCE_SAVED: 'Attendance successfully saved',
    CLASS_CREATED: 'Class successfully created',
    CLASS_UPDATED: 'Class successfully updated',
    STUDENT_ADDED: 'Student successfully added to class',
    STUDENT_REMOVED: 'Student successfully removed from class'
  },
  
  ERROR: {
    SAVE_FAILED: 'Failed to save attendance',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    CLASS_NOT_FOUND: 'Class not found',
    STUDENT_NOT_FOUND: 'Student not found'
  }
} as const;

export const FORM_DEFAULTS = {
  ATTENDANCE_FORM: {
    STATUS: AttendanceStatus.PRESENT,
    LATE: false,
    EARLY_DISMISSAL: false,
    IS_DIRTY: false,
    HAS_ERRORS: false,
    ERRORS: []
  },
  
  BULK_OPERATIONS: {
    MARK_ALL_PRESENT: {
      status: AttendanceStatus.PRESENT,
      late: false,
      earlyDismissal: false
    },
    MARK_ALL_ABSENT: {
      status: AttendanceStatus.ABSENT,
      late: false,
      earlyDismissal: false
    }
  }
} as const;

export const UI_CONSTANTS = {
  GRID: {
    MIN_COLUMN_WIDTH: 150,
    STUDENT_NAME_COLUMN_WIDTH: 200,
    STATUS_COLUMN_WIDTH: 120,
    FLAG_COLUMN_WIDTH: 100
  },
  
  LIMITS: {
    MAX_CLASS_NAME_LENGTH: 100,
    MAX_STUDENTS_PER_CLASS: 50,
    MAX_BULK_OPERATIONS: 100
  },
  
  TIMING: {
    SAVE_DEBOUNCE_MS: 500,
    VALIDATION_DEBOUNCE_MS: 300,
    AUTO_SAVE_INTERVAL_MS: 30000
  }
} as const;
