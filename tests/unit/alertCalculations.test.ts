/**
 * Tests for alert calculation utilities
 * Ensures attendance counting and threshold checking works correctly for User Story 4
 */

import {
  calculateStudentAlerts,
  countAbsencesInPeriod,
  countAbsencesCumulative,
  countLatenessInPeriod,
  countLatenessCumulative,
  calculateDaysOverThreshold,
  calculateBatchAlerts,
  filterRecordsByDateRange,
  getAttendanceTrend,
  isApproachingThreshold,
  validateDateRange
} from '../../src/utils/alertCalculations';
import { AttendanceRecord } from '../../src/domains/AttendanceRecords';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';
import { AlertType, AlertPeriod } from '../../src/domains/AlertThreshold';
import { SimpleThresholdFormData } from '../../src/types/thresholds';

describe('Alert Calculations', () => {
  // Helper function to create test attendance records
  const createTestRecord = (studentId: string, dateISO: string, status: AttendanceStatus, late = false): AttendanceRecord => {
    return new AttendanceRecord({
      studentId,
      dateISO,
      status,
      late
    });
  };

  // Sample threshold data
  const testThresholds: SimpleThresholdFormData = {
    absences30Day: 5,
    absencesCumulative: 15,
    lateness30Day: 8,
    latenessCumulative: 20
  };

  describe('calculateStudentAlerts', () => {
    it('should calculate alerts correctly when thresholds are exceeded', () => {
      const records = [
        // 6 absences in recent days (exceeds 30-day threshold of 5)
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-16', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-15', AttendanceStatus.ABSENT),
        // Some present days
        createTestRecord('student1', '2025-10-14', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-13', AttendanceStatus.PRESENT)
      ];

      const result = calculateStudentAlerts('student1', records, testThresholds);

      expect(result.studentId).toBe('student1');
      expect(result.absences30Day).toBe(6);
      expect(result.absencesCumulative).toBe(6);
      expect(result.triggeredAlerts).toHaveLength(1);
      expect(result.triggeredAlerts[0].type).toBe(AlertType.ABSENCE);
      expect(result.triggeredAlerts[0].period).toBe(AlertPeriod.THIRTY_DAYS);
      expect(result.triggeredAlerts[0].currentCount).toBe(6);
      expect(result.triggeredAlerts[0].thresholdCount).toBe(5);
    });

    it('should not trigger alerts when under threshold', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.PRESENT)
      ];

      const result = calculateStudentAlerts('student1', records, testThresholds);

      expect(result.absences30Day).toBe(2);
      expect(result.triggeredAlerts).toHaveLength(0);
    });

    it('should handle lateness alerts correctly', () => {
      const records = [
        // 9 late arrivals (exceeds threshold of 8)
        createTestRecord('student1', '2025-10-20', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-16', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-15', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-14', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-13', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-12', AttendanceStatus.LATE)
      ];

      const result = calculateStudentAlerts('student1', records, testThresholds);

      expect(result.lateness30Day).toBe(9);
      expect(result.triggeredAlerts).toHaveLength(1);
      expect(result.triggeredAlerts[0].type).toBe(AlertType.LATENESS);
    });

    it('should filter records by student ID', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student2', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.ABSENT)
      ];

      const result = calculateStudentAlerts('student1', records, testThresholds);

      expect(result.absences30Day).toBe(2); // Only student1's records
      expect(result.absencesCumulative).toBe(2);
    });
  });

  describe('countAbsencesInPeriod', () => {
    it('should count absences within time period', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setDate(lastMonth.getDate() - 35);

      const records = [
        createTestRecord('student1', today.toISOString().split('T')[0], AttendanceStatus.ABSENT),
        createTestRecord('student1', yesterday.toISOString().split('T')[0], AttendanceStatus.ABSENT),
        createTestRecord('student1', lastWeek.toISOString().split('T')[0], AttendanceStatus.ABSENT),
        createTestRecord('student1', lastMonth.toISOString().split('T')[0], AttendanceStatus.ABSENT) // Outside 30-day window
      ];

      const count = countAbsencesInPeriod(records, 30);

      expect(count).toBe(3); // Should exclude the 35-day old record
    });

    it('should not count non-absence statuses', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.EXCUSED)
      ];

      const count = countAbsencesInPeriod(records, 30);

      expect(count).toBe(1); // Only the ABSENT record
    });
  });

  describe('countAbsencesCumulative', () => {
    it('should count all absences regardless of date', () => {
      const records = [
        createTestRecord('student1', '2025-01-01', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-06-01', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.PRESENT)
      ];

      const count = countAbsencesCumulative(records);

      expect(count).toBe(3);
    });
  });

  describe('countLatenessInPeriod', () => {
    it('should count LATE status within time period', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.PRESENT)
      ];

      const count = countLatenessInPeriod(records, 30);

      expect(count).toBe(2);
    });

    it('should count late flag on PRESENT records', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.PRESENT, true), // late=true
        createTestRecord('student1', '2025-10-19', AttendanceStatus.PRESENT, false),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.LATE)
      ];

      const count = countLatenessInPeriod(records, 30);

      expect(count).toBe(2); // Both the LATE status and late=true record
    });
  });

  describe('calculateDaysOverThreshold', () => {
    it('should calculate days student has been over threshold', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.PRESENT)
      ];

      const daysOver = calculateDaysOverThreshold(records, 2, 'absence');

      expect(daysOver).toBeGreaterThan(0);
    });
  });

  describe('calculateBatchAlerts', () => {
    it('should calculate alerts for multiple students', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.ABSENT),
        createTestRecord('student2', '2025-10-20', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.ABSENT)
      ];

      const results = calculateBatchAlerts(['student1', 'student2'], records, testThresholds);

      expect(results).toHaveLength(2);
      expect(results[0].studentId).toBe('student1');
      expect(results[1].studentId).toBe('student2');
    });
  });

  describe('filterRecordsByDateRange', () => {
    it('should filter records within date range', () => {
      const records = [
        createTestRecord('student1', '2025-10-15', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-20', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-25', AttendanceStatus.PRESENT)
      ];

      const startDate = new Date('2025-10-18');
      const endDate = new Date('2025-10-22');

      const filtered = filterRecordsByDateRange(records, startDate, endDate);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].dateISO).toBe('2025-10-20');
    });
  });

  describe('getAttendanceTrend', () => {
    it('should calculate attendance trend correctly', () => {
      const records = [
        createTestRecord('student1', '2025-10-20', AttendanceStatus.PRESENT),
        createTestRecord('student1', '2025-10-19', AttendanceStatus.LATE),
        createTestRecord('student1', '2025-10-18', AttendanceStatus.ABSENT),
        createTestRecord('student1', '2025-10-17', AttendanceStatus.PRESENT)
      ];

      const trend = getAttendanceTrend(records, 14);

      expect(trend.totalDays).toBe(4);
      expect(trend.presentDays).toBe(2);
      expect(trend.absentDays).toBe(1);
      expect(trend.lateDays).toBe(1);
      expect(trend.attendanceRate).toBe(75); // (2+1)/4 * 100
    });

    it('should handle empty records gracefully', () => {
      const trend = getAttendanceTrend([], 14);

      expect(trend.totalDays).toBe(0);
      expect(trend.attendanceRate).toBe(0);
    });
  });

  describe('isApproachingThreshold', () => {
    it('should detect when student is approaching threshold', () => {
      const calculation = {
        studentId: 'student1',
        absences30Day: 4, // Close to threshold of 5
        absencesCumulative: 13, // Close to threshold of 15
        lateness30Day: 7, // Close to threshold of 8
        latenessCumulative: 18, // Close to threshold of 20
        thresholds: testThresholds,
        triggeredAlerts: []
      };

      const approaching = isApproachingThreshold(calculation, 2);

      expect(approaching.absences30Day).toBe(true); // 4 >= (5-2)
      expect(approaching.absencesCumulative).toBe(true); // 13 >= (15-2)
      expect(approaching.lateness30Day).toBe(true); // 7 >= (8-2)
      expect(approaching.latenessCumulative).toBe(true); // 18 >= (20-2)
    });

    it('should not flag when not approaching threshold', () => {
      const calculation = {
        studentId: 'student1',
        absences30Day: 1,
        absencesCumulative: 5,
        lateness30Day: 2,
        latenessCumulative: 8,
        thresholds: testThresholds,
        triggeredAlerts: []
      };

      const approaching = isApproachingThreshold(calculation, 2);

      expect(approaching.absences30Day).toBe(false);
      expect(approaching.absencesCumulative).toBe(false);
      expect(approaching.lateness30Day).toBe(false);
      expect(approaching.latenessCumulative).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should validate proper date ranges', () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-10-20');

      expect(validateDateRange(startDate, endDate)).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const startDate = new Date('2025-10-20');
      const endDate = new Date('2025-10-01'); // End before start

      expect(validateDateRange(startDate, endDate)).toBe(false);
    });

    it('should reject future dates', () => {
      const startDate = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(validateDateRange(startDate, futureDate)).toBe(false);
    });
  });
});
