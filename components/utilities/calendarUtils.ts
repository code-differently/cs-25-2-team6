import { DayOffReason } from '../../src/domains/DayOffReason';
import { DayOff } from '../../src/persistence/FileScheduleRepo';

/**
 * Formats a date for display purposes with various format options
 * @param date - Date object to format
 * @param format - Format type ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export const formatDisplayDate = (date: Date, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  try {
    switch (format) {
      case 'short':
        // Format: 10/21/25
        return date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      
      case 'medium':
        // Format: Oct 21, 2025
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'long':
        // Format: October 21, 2025
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'full':
        // Format: Monday, October 21, 2025
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Maps day-off reasons to appropriate display colors
 * @param reason - Day off reason string or DayOffReason enum
 * @returns CSS color string for the reason
 */
export const getReasonDisplayColor = (reason: string | DayOffReason): string => {
  // Normalize the reason to handle both string and enum values
  const normalizedReason = typeof reason === 'string' ? reason.toUpperCase() : reason;

  switch (normalizedReason) {
    case DayOffReason.HOLIDAY:
    case 'HOLIDAY':
      return '#dc3545'; // Red for holidays
    
    case DayOffReason.PROF_DEV:
    case 'PROF_DEV':
    case 'PROFESSIONAL_DEVELOPMENT':
      return '#007bff'; // Blue for professional development
    
    case DayOffReason.REPORT_CARD:
    case 'REPORT_CARD':
    case 'REPORT_CARD_CONFERENCES':
      return '#6f42c1'; // Purple for report card days
    
    case DayOffReason.OTHER:
    case 'OTHER':
      return '#6c757d'; // Gray for other reasons
    
    default:
      // Fallback color for unknown reasons
      return '#6c757d';
  }
};

/**
 * Determines if a given date falls on a weekend (Saturday or Sunday)
 * @param date - Date object to check
 * @returns Boolean indicating if the date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Checks if a specific date is a scheduled day off
 * @param date - Date object to check
 * @param scheduledDays - Array of scheduled day off objects
 * @returns Boolean indicating if the date is a scheduled day off
 */
export const isScheduledDay = (date: Date, scheduledDays: DayOff[]): boolean => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  if (!Array.isArray(scheduledDays)) {
    return false;
  }

  // Convert date to ISO string (YYYY-MM-DD format)
  const dateISO = date.toISOString().split('T')[0];

  // Check if any scheduled day matches this date
  return scheduledDays.some(scheduledDay => {
    if (!scheduledDay || typeof scheduledDay.dateISO !== 'string') {
      return false;
    }
    return scheduledDay.dateISO === dateISO;
  });
};

/**
 * Formats student count text for affected students display
 * @param count - Number of affected students
 * @returns Formatted text string describing the count
 */
export const calculateAffectedStudentsText = (count: number): string => {
  if (typeof count !== 'number' || count < 0 || isNaN(count)) {
    return 'Invalid count';
  }

  if (count === 0) {
    return 'No students affected';
  }

  if (count === 1) {
    return '1 student affected';
  }

  // Format large numbers with commas
  const formattedCount = count.toLocaleString();
  
  if (count < 10) {
    return `${formattedCount} students affected`;
  }

  if (count < 100) {
    return `${formattedCount} students affected`;
  }

  if (count < 1000) {
    return `${formattedCount} students affected`;
  }

  // For very large numbers, provide additional context
  return `${formattedCount} students affected (${count} total)`;
};