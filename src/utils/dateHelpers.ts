/**
 * Date manipulation utilities for User Story 2
 * Provides date formatting, validation, and helper functions for reports
 */

/**
 * Formats a date for report display according to assignment requirements
 */
export function formatReportDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  // Return YYYY-MM-DD format for reports
  return dateObj.toISOString().split('T')[0];
}

/**
 * Validates date range according to assignment requirements
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  // Check for valid date objects
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }
  
  // Start date must be before or equal to end date
  if (startDate > endDate) {
    return false;
  }
  
  // No future dates allowed
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (startDate > today || endDate > today) {
    return false;
  }
  
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  const rangeDuration = endDate.getTime() - startDate.getTime();
  if (rangeDuration > oneYearMs) {
    return false;
  }
  
  return true;
}

/**
 * Converts various date inputs to Date objects
 */
export function parseDate(input: string | Date | number): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  
  if (typeof input === 'number') {
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof input === 'string') {
    // Handle YYYY-MM-DD format specifically
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const date = new Date(input + 'T00:00:00.000Z');
      return isNaN(date.getTime()) ? null : date;
    }
    
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

/**
 * Gets the start and end dates for preset ranges
 */
export function getPresetDateRange(preset: string): { startDate: Date; endDate: Date } | null {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  
  switch (preset) {
    case 'thisWeek': {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      return { startDate: startOfWeek, endDate: today };
    }
    
    case 'lastWeek': {
      const startOfLastWeek = new Date(startOfToday);
      startOfLastWeek.setDate(startOfToday.getDate() - startOfToday.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return { startDate: startOfLastWeek, endDate: endOfLastWeek };
    }
    
    case 'thisMonth': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: startOfMonth, endDate: today };
    }
    
    case 'lastMonth': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return { startDate: startOfLastMonth, endDate: endOfLastMonth };
    }
    
    case 'thisYear': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: startOfYear, endDate: today };
    }
    
    case 'ytd': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: startOfYear, endDate: today };
    }
    
    default:
      return null;
  }
}

/**
 * Calculates the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Gets the first and last day of a month
 */
export function getMonthBounds(year: number, month: number): { startDate: Date; endDate: Date } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Formats date for ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Validates that a date string is in YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  if (typeof dateString !== 'string') {
    return false;
  }
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString + 'T00:00:00.000Z');
  return !isNaN(date.getTime()) && toISODateString(date) === dateString;
}

/**
 * Gets a date that's a specific number of days before the given date
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Gets a date that's a specific number of days after the given date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
