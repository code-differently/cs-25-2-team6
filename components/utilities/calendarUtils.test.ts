// Test file for calendar utility functions
// Run with: npm test -- calendarUtils.test.ts

import {
  formatDisplayDate,
  getReasonDisplayColor,
  isWeekend,
  isScheduledDay,
  calculateAffectedStudentsText
} from './calendarUtils';
import { DayOffReason } from '../../src/domains/DayOffReason';
import { DayOff } from '../../src/persistence/FileScheduleRepo';

describe('Calendar Utilities', () => {
  describe('formatDisplayDate', () => {
    const testDate = new Date('2025-10-21'); // Tuesday, October 21, 2025

    test('formats date in short format', () => {
      expect(formatDisplayDate(testDate, 'short')).toBe('10/21/25');
    });

    test('formats date in medium format (default)', () => {
      expect(formatDisplayDate(testDate, 'medium')).toBe('Oct 21, 2025');
      expect(formatDisplayDate(testDate)).toBe('Oct 21, 2025'); // Default format
    });

    test('formats date in long format', () => {
      expect(formatDisplayDate(testDate, 'long')).toBe('October 21, 2025');
    });

    test('formats date in full format', () => {
      expect(formatDisplayDate(testDate, 'full')).toBe('Tuesday, October 21, 2025');
    });

    test('handles invalid dates', () => {
      expect(formatDisplayDate(new Date('invalid'))).toBe('Invalid Date');
      expect(formatDisplayDate(null as any)).toBe('Invalid Date');
      expect(formatDisplayDate(undefined as any)).toBe('Invalid Date');
    });
  });

  describe('getReasonDisplayColor', () => {
    test('returns correct colors for DayOffReason enum values', () => {
      expect(getReasonDisplayColor(DayOffReason.HOLIDAY)).toBe('#dc3545');
      expect(getReasonDisplayColor(DayOffReason.PROF_DEV)).toBe('#007bff');
      expect(getReasonDisplayColor(DayOffReason.REPORT_CARD)).toBe('#6f42c1');
      expect(getReasonDisplayColor(DayOffReason.OTHER)).toBe('#6c757d');
    });

    test('returns correct colors for string values', () => {
      expect(getReasonDisplayColor('HOLIDAY')).toBe('#dc3545');
      expect(getReasonDisplayColor('holiday')).toBe('#dc3545'); // Case insensitive
      expect(getReasonDisplayColor('PROF_DEV')).toBe('#007bff');
      expect(getReasonDisplayColor('PROFESSIONAL_DEVELOPMENT')).toBe('#007bff');
      expect(getReasonDisplayColor('REPORT_CARD')).toBe('#6f42c1');
      expect(getReasonDisplayColor('OTHER')).toBe('#6c757d');
    });

    test('returns default color for unknown reasons', () => {
      expect(getReasonDisplayColor('UNKNOWN_REASON')).toBe('#6c757d');
      expect(getReasonDisplayColor('')).toBe('#6c757d');
      expect(getReasonDisplayColor(null as any)).toBe('#6c757d');
    });
  });

  describe('isWeekend', () => {
    test('identifies weekends correctly', () => {
      // Saturday, October 18, 2025
      expect(isWeekend(new Date('2025-10-18'))).toBe(true);
      // Sunday, October 19, 2025
      expect(isWeekend(new Date('2025-10-19'))).toBe(true);
    });

    test('identifies weekdays correctly', () => {
      // Monday, October 20, 2025
      expect(isWeekend(new Date('2025-10-20'))).toBe(false);
      // Tuesday, October 21, 2025
      expect(isWeekend(new Date('2025-10-21'))).toBe(false);
      // Friday, October 24, 2025
      expect(isWeekend(new Date('2025-10-24'))).toBe(false);
    });

    test('handles invalid dates', () => {
      expect(isWeekend(new Date('invalid'))).toBe(false);
      expect(isWeekend(null as any)).toBe(false);
      expect(isWeekend(undefined as any)).toBe(false);
    });
  });

  describe('isScheduledDay', () => {
    const scheduledDays: DayOff[] = [
      {
        dateISO: '2025-10-21',
        reason: DayOffReason.HOLIDAY,
        scope: 'ALL_STUDENTS'
      },
      {
        dateISO: '2025-11-15',
        reason: DayOffReason.PROF_DEV,
        scope: 'ALL_STUDENTS'
      }
    ];

    test('identifies scheduled days correctly', () => {
      expect(isScheduledDay(new Date('2025-10-21'), scheduledDays)).toBe(true);
      expect(isScheduledDay(new Date('2025-11-15'), scheduledDays)).toBe(true);
    });

    test('identifies non-scheduled days correctly', () => {
      expect(isScheduledDay(new Date('2025-10-22'), scheduledDays)).toBe(false);
      expect(isScheduledDay(new Date('2025-12-01'), scheduledDays)).toBe(false);
    });

    test('handles empty scheduled days array', () => {
      expect(isScheduledDay(new Date('2025-10-21'), [])).toBe(false);
    });

    test('handles invalid inputs', () => {
      expect(isScheduledDay(new Date('invalid'), scheduledDays)).toBe(false);
      expect(isScheduledDay(new Date('2025-10-21'), null as any)).toBe(false);
      expect(isScheduledDay(null as any, scheduledDays)).toBe(false);
    });

    test('handles malformed scheduled days', () => {
      const malformedDays = [
        { dateISO: null, reason: DayOffReason.HOLIDAY, scope: 'ALL_STUDENTS' },
        { reason: DayOffReason.PROF_DEV, scope: 'ALL_STUDENTS' } // Missing dateISO
      ] as any;
      
      expect(isScheduledDay(new Date('2025-10-21'), malformedDays)).toBe(false);
    });
  });

  describe('calculateAffectedStudentsText', () => {
    test('formats student counts correctly', () => {
      expect(calculateAffectedStudentsText(0)).toBe('No students affected');
      expect(calculateAffectedStudentsText(1)).toBe('1 student affected');
      expect(calculateAffectedStudentsText(5)).toBe('5 students affected');
      expect(calculateAffectedStudentsText(25)).toBe('25 students affected');
      expect(calculateAffectedStudentsText(150)).toBe('150 students affected');
    });

    test('formats large numbers with commas', () => {
      expect(calculateAffectedStudentsText(1000)).toBe('1,000 students affected (1000 total)');
      expect(calculateAffectedStudentsText(12500)).toBe('12,500 students affected (12500 total)');
    });

    test('handles invalid inputs', () => {
      expect(calculateAffectedStudentsText(-5)).toBe('Invalid count');
      expect(calculateAffectedStudentsText(NaN)).toBe('Invalid count');
      expect(calculateAffectedStudentsText(null as any)).toBe('Invalid count');
      expect(calculateAffectedStudentsText(undefined as any)).toBe('Invalid count');
    });
  });


});