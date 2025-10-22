/**
 * Schedule constants and default configurations for User Story 3
 */

import { DayOffReason } from '../domains/DayOffReason';

export const SCHEDULE_CONSTRAINTS = {
  MAX_FUTURE_DAYS: 365,
  MIN_FUTURE_DAYS: 0,
  REASON_MAX_LENGTH: 100,
  REASON_MIN_LENGTH: 3,
  MAX_BULK_STUDENT_COUNT: 10000,
  DATE_FORMAT: 'YYYY-MM-DD'
} as const;

export const SCHEDULE_BUSINESS_RULES = {
  ALLOW_WEEKENDS: true,
  ALLOW_PAST_DATES: false,
  ALLOW_DUPLICATE_DATES: false,
  REQUIRE_REASON: true,
  AUTO_EXCUSE_STUDENTS: true
} as const;

export const DEFAULT_REASON_OPTIONS = [
  { 
    value: DayOffReason.HOLIDAY, 
    label: 'Holiday', 
    description: 'Federal, state, or local holiday',
    color: '#dc2626',
    icon: '🎉'
  },
  { 
    value: DayOffReason.PROF_DEV, 
    label: 'Professional Development', 
    description: 'Teacher training or professional development day',
    color: '#2563eb',
    icon: '📚'
  },
  { 
    value: DayOffReason.REPORT_CARD, 
    label: 'Report Card Day', 
    description: 'Report card preparation or conference day',
    color: '#7c3aed',
    icon: '📊'
  },
  { 
    value: DayOffReason.OTHER, 
    label: 'Other', 
    description: 'Other institutional reason',
    color: '#059669',
    icon: '📝'
  }
] as const;

export const SCHEDULE_INPUT_LIMITS = {
  CUSTOM_REASON_MAX_LENGTH: SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH,
  CUSTOM_REASON_MIN_LENGTH: SCHEDULE_CONSTRAINTS.REASON_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH: 255,
  MAX_CONCURRENT_SCHEDULES: 50
} as const;

export const CALENDAR_CONSTANTS = {
  WEEKEND_DAYS: [0, 6] as const,
  HIGHLIGHTED_DAY_CLASS: 'scheduled-day-off',
  DEFAULT_CALENDAR_VIEW: 'month' as const,
  MONTHS_TO_DISPLAY: 12
} as const;

export const SCHEDULE_VALIDATION_MESSAGES = {
  INVALID_DATE_FORMAT: `Date must be in ${SCHEDULE_CONSTRAINTS.DATE_FORMAT} format`,
  PAST_DATE_NOT_ALLOWED: 'Cannot schedule days off in the past',
  FUTURE_DATE_TOO_FAR: `Cannot schedule more than ${SCHEDULE_CONSTRAINTS.MAX_FUTURE_DAYS} days in advance`,
  REASON_REQUIRED: 'A reason for the day off is required',
  REASON_TOO_SHORT: `Reason must be at least ${SCHEDULE_CONSTRAINTS.REASON_MIN_LENGTH} characters`,
  REASON_TOO_LONG: `Reason cannot exceed ${SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH} characters`,
  DUPLICATE_DATE: 'A day off is already scheduled for this date',
  INVALID_REASON_TYPE: 'Invalid reason type selected',
  BULK_OPERATION_LIMIT_EXCEEDED: `Cannot process more than ${SCHEDULE_CONSTRAINTS.MAX_BULK_STUDENT_COUNT} students at once`,
  WEEKEND_WARNING: 'This date falls on a weekend',
  FORM_VALIDATION_ERROR: 'Please correct the highlighted errors before submitting'
} as const;

export const SCHEDULE_ERROR_CODES = {
  INVALID_SCHEDULE_DATE: 'INVALID_SCHEDULE_DATE',
  INVALID_REASON: 'INVALID_REASON',
  DUPLICATE_SCHEDULE: 'DUPLICATE_SCHEDULE',
  BULK_EXCUSE_ERROR: 'BULK_EXCUSE_ERROR',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
  FORM_VALIDATION_ERROR: 'FORM_VALIDATION_ERROR',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION'
} as const;

export const SCHEDULE_SUCCESS_MESSAGES = {
  DAY_OFF_SCHEDULED: 'Day off successfully scheduled',
  BULK_EXCUSES_APPLIED: 'All students have been excused for this date',
  SCHEDULE_UPDATED: 'Schedule updated successfully',
  SCHEDULE_DELETED: 'Scheduled day off removed',
  STUDENTS_NOTIFIED: 'Students and parents have been notified'
} as const;

export const DEFAULT_SCHEDULE_FORM = {
  date: '',
  reason: DayOffReason.OTHER,
  customReason: '',
  description: '',
  notifyStudents: true,
  applyBulkExcuses: SCHEDULE_BUSINESS_RULES.AUTO_EXCUSE_STUDENTS
} as const;

export const SCHEDULE_SORT_OPTIONS = {
  DATE_ASC: 'date_asc',
  DATE_DESC: 'date_desc',
  REASON_ASC: 'reason_asc',
  REASON_DESC: 'reason_desc',
  CREATED_ASC: 'created_asc',
  CREATED_DESC: 'created_desc'
} as const;

export type ReasonOption = typeof DEFAULT_REASON_OPTIONS[number];
export type ScheduleSortOption = typeof SCHEDULE_SORT_OPTIONS[keyof typeof SCHEDULE_SORT_OPTIONS];
export type ScheduleErrorCode = typeof SCHEDULE_ERROR_CODES[keyof typeof SCHEDULE_ERROR_CODES];
