/**
 * Reason validation and formatting utilities for User Story 3
 */

import { DayOffReason } from '../domains/DayOffReason';
import { ValidationResult } from '../types/schedule';
import { 
  DEFAULT_REASON_OPTIONS,
  SCHEDULE_CONSTRAINTS,
  SCHEDULE_VALIDATION_MESSAGES,
  SCHEDULE_ERROR_CODES,
  ReasonOption
} from '../constants/scheduleConstants';

export function validateDayOffReason(reason: DayOffReason, customReason?: string): ValidationResult {
  if (!Object.values(DayOffReason).includes(reason)) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.INVALID_REASON_TYPE,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON
    };
  }

  if (reason === DayOffReason.OTHER) {
    if (!customReason || customReason.trim().length === 0) {
      return {
        isValid: false,
        error: 'Custom reason is required when selecting "Other"',
        errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON
      };
    }

    const customReasonValidation = validateCustomReason(customReason);
    if (!customReasonValidation.isValid) {
      return customReasonValidation;
    }
  }

  return { isValid: true };
}

/**
 * Validates custom reason text
 */
export function validateCustomReason(customReason: string): ValidationResult {
  if (!customReason || customReason.trim().length === 0) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.REASON_REQUIRED,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON
    };
  }

  const trimmedReason = customReason.trim();

  if (trimmedReason.length < SCHEDULE_CONSTRAINTS.REASON_MIN_LENGTH) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.REASON_TOO_SHORT,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON
    };
  }

  if (trimmedReason.length > SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.REASON_TOO_LONG,
      errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON
    };
  }

  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /\b(test|testing|temp|temporary)\b/i,
    /^\s*[.]{2,}\s*$/,
    /^\s*[a-zA-Z]\s*$/,
    /^[^a-zA-Z0-9\s]*$/
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(trimmedReason)) {
      return {
        isValid: false,
        error: 'Please provide a more descriptive reason',
        errorCode: SCHEDULE_ERROR_CODES.INVALID_REASON,
        warnings: ['Reason appears to be a placeholder or test value']
      };
    }
  }

  return { isValid: true };
}

export function sanitizeReasonText(reason: string): string {
  if (!reason) return '';
  
  return reason
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?()]/g, '')
    .substring(0, SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH);
}

export function formatReasonForDisplay(reason: DayOffReason, customReason?: string): string {
  const reasonOption = getReasonOption(reason);
  
  if (reason === DayOffReason.OTHER && customReason) {
    return sanitizeReasonText(customReason);
  }
  
  return reasonOption.label;
}

export function getFullReasonText(reason: DayOffReason, customReason?: string): string {
  const reasonOption = getReasonOption(reason);
  
  if (reason === DayOffReason.OTHER && customReason) {
    return `Other: ${sanitizeReasonText(customReason)}`;
  }
  
  return `${reasonOption.label}${reasonOption.description ? ` - ${reasonOption.description}` : ''}`;
}

export function getReasonOption(reason: DayOffReason): ReasonOption {
  const option = DEFAULT_REASON_OPTIONS.find(opt => opt.value === reason);
  return option || DEFAULT_REASON_OPTIONS.find(opt => opt.value === DayOffReason.OTHER)!;
}

export function getDefaultReasons(): readonly ReasonOption[] {
  return DEFAULT_REASON_OPTIONS;
}

export function getReasonDisplayColor(reason: DayOffReason): string {
  const option = getReasonOption(reason);
  return option.color;
}

export function getReasonDisplayIcon(reason: DayOffReason): string {
  const option = getReasonOption(reason);
  return option.icon;
}

export function requiresCustomReason(reason: DayOffReason): boolean {
  return reason === DayOffReason.OTHER;
}

export function validateReasonSelection(formData: { reason: DayOffReason; customReason?: string }): ValidationResult {
  return validateDayOffReason(formData.reason, formData.customReason);
}

/**
 * Gets suggested reasons based on date patterns
 */
export function getSuggestedReasons(date: Date): DayOffReason[] {
  const month = date.getMonth();
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay();
  
  const suggestions: DayOffReason[] = [];
  
  // Holiday suggestions for common dates
  if ((month === 0 && dayOfMonth === 1) ||
      (month === 6 && dayOfMonth === 4) ||
      (month === 11 && dayOfMonth === 25)) {
    suggestions.push(DayOffReason.HOLIDAY);
  }
  
  // Professional development on Fridays
  if (dayOfWeek === 5) {
    suggestions.push(DayOffReason.PROF_DEV);
  }
  
  // Report card days at end of quarters
  const isEndOfMonth = dayOfMonth > 25;
  const isQuarterEnd = [2, 5, 8, 11].includes(month);
  if (isEndOfMonth && isQuarterEnd) {
    suggestions.push(DayOffReason.REPORT_CARD);
  }
  
  suggestions.push(DayOffReason.OTHER);
  
  return [...new Set(suggestions)];
}

/**
 * Creates a reason summary for reporting
 */
export function createReasonSummary(reasons: Array<{ reason: DayOffReason; count: number; customReasons?: string[] }>): {
  total: number;
  breakdown: Array<{
    reason: DayOffReason;
    label: string;
    count: number;
    percentage: number;
    customReasons?: string[];
  }>;
  mostCommon: DayOffReason;
} {
  const total = reasons.reduce((sum, r) => sum + r.count, 0);
  
  const breakdown = reasons.map(r => ({
    reason: r.reason,
    label: getReasonOption(r.reason).label,
    count: r.count,
    percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    customReasons: r.customReasons
  }));
  
  const mostCommon = reasons.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  ).reason;
  
  return {
    total,
    breakdown,
    mostCommon
  };
}

export function validateReasonBusinessRules(reason: DayOffReason, date: Date): ValidationResult {
  const warnings: string[] = [];
  
  const month = date.getMonth();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  if (reason === DayOffReason.PROF_DEV && isWeekend) {
    warnings.push('Professional development days are typically scheduled on weekdays');
  }
  
  if (reason === DayOffReason.REPORT_CARD && ![2, 5, 8, 11].includes(month)) {
    warnings.push('Report card days are typically at the end of grading periods');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
