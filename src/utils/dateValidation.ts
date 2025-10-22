/**
 * Date validation logic for User Story 3 schedule system
 */

import { ValidationResult } from '../types/schedule';
import { 
  SCHEDULE_CONSTRAINTS, 
  SCHEDULE_BUSINESS_RULES, 
  SCHEDULE_VALIDATION_MESSAGES,
  SCHEDULE_ERROR_CODES,
  CALENDAR_CONSTANTS
} from '../constants/scheduleConstants';

export function validateScheduleDate(date: Date): ValidationResult {
  try {
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: SCHEDULE_VALIDATION_MESSAGES.INVALID_DATE_FORMAT,
        errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
      };
    }

    if (!SCHEDULE_BUSINESS_RULES.ALLOW_PAST_DATES && isPastDate(date)) {
      return {
        isValid: false,
        error: SCHEDULE_VALIDATION_MESSAGES.PAST_DATE_NOT_ALLOWED,
        errorCode: SCHEDULE_ERROR_CODES.BUSINESS_RULE_VIOLATION
      };
    }

    const futureValidation = validateFutureDate(date);
    if (!futureValidation.isValid) {
      return futureValidation;
    }

    const warnings: string[] = [];
    if (isWeekend(date) && !SCHEDULE_BUSINESS_RULES.ALLOW_WEEKENDS) {
      return {
        isValid: false,
        error: SCHEDULE_VALIDATION_MESSAGES.WEEKEND_WARNING,
        errorCode: SCHEDULE_ERROR_CODES.BUSINESS_RULE_VIOLATION
      };
    } else if (isWeekend(date)) {
      warnings.push(SCHEDULE_VALIDATION_MESSAGES.WEEKEND_WARNING);
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.INVALID_DATE_FORMAT,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }
}

export function validateScheduleDateString(dateString: string): ValidationResult {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.INVALID_DATE_FORMAT,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }

  const date = new Date(dateString);
  return validateScheduleDate(date);
}

export function validateFutureDate(date: Date): ValidationResult {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < SCHEDULE_CONSTRAINTS.MIN_FUTURE_DAYS) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.PAST_DATE_NOT_ALLOWED,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }

  if (diffDays > SCHEDULE_CONSTRAINTS.MAX_FUTURE_DAYS) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.FUTURE_DATE_TOO_FAR,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }

  return { isValid: true };
}

export function isValidFutureDate(date: Date): boolean {
  const validation = validateFutureDate(date);
  return validation.isValid;
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
}

export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return CALENDAR_CONSTANTS.WEEKEND_DAYS.includes(dayOfWeek as 0 | 6);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function formatScheduleDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function parseScheduleDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getNextBusinessDay(date: Date): Date {
  let nextDay = addDays(date, 1);
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
}

export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  if (startDate > endDate) {
    return {
      isValid: false,
      error: 'Start date must be before or equal to end date',
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }

  const daysDiff = daysBetween(startDate, endDate);
  if (daysDiff > SCHEDULE_CONSTRAINTS.MAX_FUTURE_DAYS) {
    return {
      isValid: false,
      error: `Date range cannot exceed ${SCHEDULE_CONSTRAINTS.MAX_FUTURE_DAYS} days`,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }

  return { isValid: true };
}
