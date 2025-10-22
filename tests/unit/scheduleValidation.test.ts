/**
 * Comprehensive tests for User Story 3 schedule validation utilities
 */

import { DayOffReason } from '../../src/domains/DayOffReason';
import { 
  validateScheduleDate, 
  validateScheduleDateString,
  validateFutureDate,
  isValidFutureDate,
  isPastDate,
  isWeekend,
  isToday,
  formatScheduleDate,
  formatDisplayDate,
  parseScheduleDate,
  getMonthRange,
  getDateRange,
  daysBetween,
  addDays,
  getNextBusinessDay,
  validateDateRange
} from '../../src/utils/dateValidation';

import {
  validateDayOffReason,
  validateCustomReason,
  sanitizeReasonText,
  formatReasonForDisplay,
  getFullReasonText,
  getReasonOption,
  getDefaultReasons,
  getReasonDisplayColor,
  getReasonDisplayIcon,
  requiresCustomReason,
  getSuggestedReasons,
  createReasonSummary,
  validateReasonBusinessRules
} from '../../src/utils/reasonValidation';

import {
  validateScheduleForm,
  validateBusinessRules,
  sanitizeScheduleInput,
  validateCreateDayOffRequest,
  validateScheduleConflicts,
  validateBulkExcuseOperation,
  validateScheduleUpdate,
  validateScheduleDeletion,
  validateNotificationSettings,
  validateScheduleOperation
} from '../../src/utils/scheduleValidation';

import { ScheduleFormData } from '../../src/types/schedule';
import { CreateDayOffRequest } from '../../src/types/dayOff';

describe('Date Validation Utilities', () => {
  describe('validateScheduleDate', () => {
    test('should validate future dates correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const result = validateScheduleDate(futureDate);
      expect(result.isValid).toBe(true);
    });

    test('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const result = validateScheduleDate(pastDate);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('BUSINESS_RULE_VIOLATION');
    });

    test('should reject invalid dates', () => {
      const invalidDate = new Date('invalid');
      
      const result = validateScheduleDate(invalidDate);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_SCHEDULE_DATE');
    });

    test('should warn about weekend dates', () => {
      // Find next weekend
      const date = new Date();
      while (date.getDay() !== 6 && date.getDay() !== 0) {
        date.setDate(date.getDate() + 1);
      }
      
      const result = validateScheduleDate(date);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('This date falls on a weekend');
    });

    test('should reject dates too far in future', () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 400);
      
      const result = validateScheduleDate(farFutureDate);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateScheduleDateString', () => {
    test('should validate correct date format', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      const result = validateScheduleDateString(dateString);
      expect(result.isValid).toBe(true);
    });

    test('should reject incorrect date format', () => {
      const result = validateScheduleDateString('12/31/2024');
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVALID_SCHEDULE_DATE');
    });

    test('should reject empty string', () => {
      const result = validateScheduleDateString('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('utility functions', () => {
    test('isValidFutureDate should work correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(isValidFutureDate(futureDate)).toBe(true);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isValidFutureDate(pastDate)).toBe(false);
    });

    test('isPastDate should identify past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isPastDate(pastDate)).toBe(true);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isPastDate(futureDate)).toBe(false);
    });

    test('isWeekend should identify weekends', () => {
      const saturday = new Date('2024-10-26'); // Known Saturday
      const sunday = new Date('2024-10-27'); // Known Sunday
      const monday = new Date('2024-10-28'); // Known Monday

      expect(isWeekend(saturday)).toBe(true);
      expect(isWeekend(sunday)).toBe(true);
      expect(isWeekend(monday)).toBe(false);
    });

    test('isToday should identify current date', () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isToday(today)).toBe(true);
      expect(isToday(tomorrow)).toBe(false);
    });

    test('formatScheduleDate should return YYYY-MM-DD format', () => {
      const date = new Date('2024-10-26T15:30:00Z');
      const formatted = formatScheduleDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('parseScheduleDate should parse valid dates', () => {
      const dateString = '2024-10-26';
      const parsed = parseScheduleDate(dateString);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed!.getFullYear()).toBe(2024);
    });

    test('parseScheduleDate should return null for invalid dates', () => {
      expect(parseScheduleDate('invalid')).toBeNull();
      expect(parseScheduleDate('')).toBeNull();
    });

    test('daysBetween should calculate correct difference', () => {
      const date1 = new Date('2024-10-26');
      const date2 = new Date('2024-10-30');
      expect(daysBetween(date1, date2)).toBe(4);
    });

    test('addDays should add days correctly', () => {
      const date = new Date('2024-10-26');
      const newDate = addDays(date, 5);
      expect(newDate.getDate()).toBe(31);
    });

    test('getNextBusinessDay should skip weekends', () => {
      const friday = new Date('2024-10-25'); // Known Friday
      const nextBusinessDay = getNextBusinessDay(friday);
      expect(nextBusinessDay.getDay()).toBe(1); // Should be Monday
    });
  });
});

describe('Reason Validation Utilities', () => {
  describe('validateDayOffReason', () => {
    test('should validate valid reasons', () => {
      const result = validateDayOffReason(DayOffReason.HOLIDAY);
      expect(result.isValid).toBe(true);
    });

    test('should require custom reason for OTHER', () => {
      const result = validateDayOffReason(DayOffReason.OTHER);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Custom reason is required');
    });

    test('should validate OTHER with custom reason', () => {
      const result = validateDayOffReason(DayOffReason.OTHER, 'Snow day closure');
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid reason enum', () => {
      const result = validateDayOffReason('INVALID' as any);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCustomReason', () => {
    test('should validate proper custom reasons', () => {
      const result = validateCustomReason('Weather emergency closure');
      expect(result.isValid).toBe(true);
    });

    test('should reject too short reasons', () => {
      const result = validateCustomReason('Hi');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    test('should reject too long reasons', () => {
      const longReason = 'A'.repeat(101);
      const result = validateCustomReason(longReason);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });

    test('should reject empty or whitespace-only reasons', () => {
      expect(validateCustomReason('').isValid).toBe(false);
      expect(validateCustomReason('   ').isValid).toBe(false);
    });

    test('should warn about placeholder values', () => {
      const result = validateCustomReason('test');
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Reason appears to be a placeholder or test value');
    });
  });

  describe('formatting functions', () => {
    test('sanitizeReasonText should clean input', () => {
      const dirty = '  Multiple   spaces  and  special@#$%  chars  ';
      const clean = sanitizeReasonText(dirty);
      expect(clean).toBe('Multiple spaces and special chars');
    });

    test('formatReasonForDisplay should format correctly', () => {
      expect(formatReasonForDisplay(DayOffReason.HOLIDAY)).toBe('Holiday');
      expect(formatReasonForDisplay(DayOffReason.OTHER, 'Custom reason')).toBe('Custom reason');
    });

    test('getFullReasonText should include descriptions', () => {
      const full = getFullReasonText(DayOffReason.HOLIDAY);
      expect(full).toContain('Holiday');
      expect(full).toContain('Federal, state, or local holiday');
    });

    test('getReasonOption should return correct option', () => {
      const option = getReasonOption(DayOffReason.PROF_DEV);
      expect(option.value).toBe(DayOffReason.PROF_DEV);
      expect(option.label).toBe('Professional Development');
    });

    test('getDefaultReasons should return all options', () => {
      const reasons = getDefaultReasons();
      expect(reasons).toHaveLength(4);
      expect(reasons.map(r => r.value)).toContain(DayOffReason.HOLIDAY);
    });

    test('requiresCustomReason should identify OTHER correctly', () => {
      expect(requiresCustomReason(DayOffReason.OTHER)).toBe(true);
      expect(requiresCustomReason(DayOffReason.HOLIDAY)).toBe(false);
    });
  });

  describe('getSuggestedReasons', () => {
    test('should suggest holidays for holiday dates', () => {
      const newYears = new Date('2024-01-01');
      const suggestions = getSuggestedReasons(newYears);
      expect(suggestions).toContain(DayOffReason.HOLIDAY);
    });

    test('should suggest prof dev for Fridays', () => {
      const friday = new Date('2024-10-25');
      const suggestions = getSuggestedReasons(friday);
      expect(suggestions).toContain(DayOffReason.PROF_DEV);
    });

    test('should always include OTHER', () => {
      const randomDate = new Date('2024-03-15');
      const suggestions = getSuggestedReasons(randomDate);
      expect(suggestions).toContain(DayOffReason.OTHER);
    });
  });
});

describe('Schedule Validation Utilities', () => {
  const validFormData: ScheduleFormData = {
    date: '2025-12-25', // Future date
    reason: DayOffReason.HOLIDAY,
    description: 'Christmas Day',
    notifyStudents: true,
    applyBulkExcuses: true
  };

  describe('validateScheduleForm', () => {
    test('should validate complete valid form', () => {
      const result = validateScheduleForm(validFormData);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid date format', () => {
      const invalidForm = { ...validFormData, date: '12/25/2025' };
      const result = validateScheduleForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Date must be in YYYY-MM-DD format');
    });

    test('should reject OTHER without custom reason', () => {
      const invalidForm = { ...validFormData, reason: DayOffReason.OTHER };
      const result = validateScheduleForm(invalidForm);
      expect(result.isValid).toBe(false);
    });

    test('should validate OTHER with custom reason', () => {
      const validForm = { 
        ...validFormData, 
        reason: DayOffReason.OTHER,
        customReason: 'Emergency closure'
      };
      const result = validateScheduleForm(validForm);
      expect(result.isValid).toBe(true);
    });

    test('should reject too long description', () => {
      const invalidForm = { 
        ...validFormData, 
        description: 'A'.repeat(101)
      };
      const result = validateScheduleForm(invalidForm);
      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeScheduleInput', () => {
    test('should sanitize all fields correctly', () => {
      const dirtyInput = {
        date: '  2024-12-25  ',
        reason: DayOffReason.OTHER,
        customReason: '  Multiple   spaces  ',
        description: '  Extra   whitespace  ',
        notifyStudents: true,
        applyBulkExcuses: true
      };

      const sanitized = sanitizeScheduleInput(dirtyInput);
      expect(sanitized.date).toBe('2024-12-25');
      expect(sanitized.customReason).toBe('Multiple spaces');
      expect(sanitized.description).toBe('Extra whitespace');
    });
  });

  describe('validateCreateDayOffRequest', () => {
    const validRequest: CreateDayOffRequest = {
      date: '2025-12-25', // Future date
      reason: DayOffReason.HOLIDAY,
      description: 'Christmas Day',
      sendNotifications: true,
      autoExcuseStudents: true
    };

    test('should validate valid request', () => {
      const result = validateCreateDayOffRequest(validRequest);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid request', () => {
      const invalidRequest = { ...validRequest, date: 'invalid' };
      const result = validateCreateDayOffRequest(invalidRequest);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateScheduleConflicts', () => {
    test('should detect duplicate dates', () => {
      const existingSchedules = ['2025-12-25', '2025-12-31'];
      const result = validateScheduleConflicts('2025-12-25', existingSchedules);
      expect(result.hasConflict).toBe(true);
      expect(result.conflictDetails?.conflictType).toBe('DUPLICATE_DATE');
    });

    test('should pass with no conflicts', () => {
      const existingSchedules = ['2025-12-31'];
      const result = validateScheduleConflicts('2025-12-25', existingSchedules);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('validateBulkExcuseOperation', () => {
    test('should validate valid bulk operation', () => {
      const result = validateBulkExcuseOperation('2025-12-25', 100);
      expect(result.isValid).toBe(true);
    });

    test('should reject zero students', () => {
      const result = validateBulkExcuseOperation('2025-12-25', 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('No students to excuse');
    });

    test('should reject too many students', () => {
      const result = validateBulkExcuseOperation('2025-12-25', 15000);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('BULK_EXCUSE_ERROR');
    });

    test('should reject invalid date', () => {
      const result = validateBulkExcuseOperation('invalid-date', 100);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateScheduleUpdate', () => {
    test('should validate valid update', () => {
      const result = validateScheduleUpdate('schedule-123', { 
        reason: DayOffReason.PROF_DEV 
      });
      expect(result.isValid).toBe(true);
    });

    test('should reject empty schedule ID', () => {
      const result = validateScheduleUpdate('', { reason: DayOffReason.HOLIDAY });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Schedule ID is required');
    });

    test('should reject invalid update data', () => {
      const result = validateScheduleUpdate('schedule-123', { 
        date: 'invalid-date' 
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateScheduleDeletion', () => {
    test('should validate valid deletion', () => {
      const result = validateScheduleDeletion('schedule-123');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    test('should reject empty schedule ID', () => {
      const result = validateScheduleDeletion('');
      expect(result.isValid).toBe(false);
    });

    test('should handle forced deletion', () => {
      const result = validateScheduleDeletion('schedule-123', true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNotificationSettings', () => {
    test('should validate valid settings', () => {
      const result = validateNotificationSettings({
        sendNotifications: true,
        advanceNoticeDays: 5,
        reminderDays: [1, 3, 7]
      });
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid advance notice days', () => {
      const result = validateNotificationSettings({
        sendNotifications: true,
        advanceNoticeDays: 35
      });
      expect(result.isValid).toBe(false);
    });

    test('should reject invalid reminder days', () => {
      const result = validateNotificationSettings({
        sendNotifications: true,
        reminderDays: [1, 35, 7]
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateScheduleOperation', () => {
    test('should validate CREATE operation', () => {
      const data: CreateDayOffRequest = {
        date: '2025-12-25',
        reason: DayOffReason.HOLIDAY,
        sendNotifications: true,
        autoExcuseStudents: true
      };
      
      const result = validateScheduleOperation('CREATE', data);
      expect(result.isValid).toBe(true);
    });

    test('should validate UPDATE operation', () => {
      const data = {
        id: 'schedule-123',
        updateData: { reason: DayOffReason.PROF_DEV }
      };
      
      const result = validateScheduleOperation('UPDATE', data);
      expect(result.isValid).toBe(true);
    });

    test('should validate DELETE operation', () => {
      const data = { id: 'schedule-123', force: false };
      const result = validateScheduleOperation('DELETE', data);
      expect(result.isValid).toBe(true);
    });

    test('should validate BULK_EXCUSE operation', () => {
      const data = { date: '2025-12-25', studentCount: 100 };
      const result = validateScheduleOperation('BULK_EXCUSE', data);
      expect(result.isValid).toBe(true);
    });

    test('should reject unknown operation', () => {
      const result = validateScheduleOperation('UNKNOWN' as any, {});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown operation type');
    });
  });
});
