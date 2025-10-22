// Simple test file to verify utility functions
// Run with: npm test -- reportUtils.test.ts

import {
  formatStudentName,
  getStatusBadgeColor,
  formatAttendancePercentage,
  isFilterActive,
  calculateTableHeight
} from './reportUtils';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';
import { ReportFilters } from '../../src/domains/ReportFilters';

describe('Report Utilities', () => {
  describe('formatStudentName', () => {
    test('formats names with proper capitalization', () => {
      expect(formatStudentName('john', 'doe')).toBe('John Doe');
      expect(formatStudentName('JANE', 'SMITH')).toBe('Jane Smith');
      expect(formatStudentName('mary-jane', 'watson-parker')).toBe('Mary-Jane Watson-Parker');
    });

    test('handles empty or missing names', () => {
      expect(formatStudentName('', '')).toBe('Unknown Student');
      expect(formatStudentName('John', '')).toBe('John');
      expect(formatStudentName('', 'Doe')).toBe('Doe');
    });

    test('handles multiple spaces and special characters', () => {
      expect(formatStudentName('  john  ', '  doe  ')).toBe('John Doe');
      expect(formatStudentName('mary jane', 'van der berg')).toBe('Mary Jane Van Der Berg');
    });
  });

  describe('getStatusBadgeColor', () => {
    test('returns correct colors for each status', () => {
      expect(getStatusBadgeColor(AttendanceStatus.PRESENT)).toBe('#28a745');
      expect(getStatusBadgeColor(AttendanceStatus.LATE)).toBe('#ffc107');
      expect(getStatusBadgeColor(AttendanceStatus.ABSENT)).toBe('#dc3545');
      expect(getStatusBadgeColor(AttendanceStatus.EXCUSED)).toBe('#6c757d');
    });
  });

  describe('formatAttendancePercentage', () => {
    test('calculates and formats percentages correctly', () => {
      expect(formatAttendancePercentage(85, 100)).toBe('85%');
      expect(formatAttendancePercentage(87.5, 100)).toBe('87.5%');
      expect(formatAttendancePercentage(0, 100)).toBe('0%');
      expect(formatAttendancePercentage(100, 100)).toBe('100%');
    });

    test('handles edge cases', () => {
      expect(formatAttendancePercentage(0, 0)).toBe('0%');
      expect(formatAttendancePercentage(-5, 100)).toBe('0%');
      expect(formatAttendancePercentage(110, 100)).toBe('100%');
      expect(formatAttendancePercentage(10, -5)).toBe('0%');
    });

    test('rounds properly', () => {
      expect(formatAttendancePercentage(33, 100)).toBe('33%');
      expect(formatAttendancePercentage(33.33, 100)).toBe('33.3%');
      expect(formatAttendancePercentage(66.67, 100)).toBe('66.7%');
    });
  });

  describe('isFilterActive', () => {
    test('detects active filters', () => {
      const activeFilter1: ReportFilters = { lastName: 'Smith' };
      const activeFilter2: ReportFilters = { status: AttendanceStatus.PRESENT };
      const activeFilter3: ReportFilters = { dateISO: '2025-10-20' };
      
      expect(isFilterActive(activeFilter1)).toBe(true);
      expect(isFilterActive(activeFilter2)).toBe(true);
      expect(isFilterActive(activeFilter3)).toBe(true);
    });

    test('detects no active filters', () => {
      const emptyFilter: ReportFilters = {};
      const nullishFilter: ReportFilters = { lastName: '', dateISO: '' };
      
      expect(isFilterActive(emptyFilter)).toBe(false);
      expect(isFilterActive(nullishFilter)).toBe(false);
    });

    test('handles invalid inputs', () => {
      expect(isFilterActive(null as any)).toBe(false);
      expect(isFilterActive(undefined as any)).toBe(false);
    });
  });

  describe('calculateTableHeight', () => {
    test('calculates height within constraints', () => {
      expect(calculateTableHeight(0)).toBe('200px'); // MIN_HEIGHT
      expect(calculateTableHeight(5)).toBe('295px'); // (5 * 45) + 50 + 20 = 295
      expect(calculateTableHeight(20)).toBe('600px'); // MAX_HEIGHT
    });

    test('handles negative inputs', () => {
      expect(calculateTableHeight(-5)).toBe('200px');
    });

    test('applies min and max constraints', () => {
      expect(calculateTableHeight(1)).toBe('200px'); // Should use MIN_HEIGHT
      expect(calculateTableHeight(100)).toBe('600px'); // Should use MAX_HEIGHT
    });
  });
});