/**
 * Tests for alert validation utilities
 * Ensures data validation works correctly for User Story 4
 */

import {
  validateAlertData,
  validateAlertForm,
  validateTimeframe,
  validateStudentId,
  validateAlertCount
} from '../../src/utils/alertValidation';
import { AlertType, AlertPeriod } from '../../src/domains/AlertThreshold';
import { AlertStatus } from '../../src/domains/AttendanceAlert';
import { SimpleAlertData, SimpleAlertFormData } from '../../src/types/alerts';

describe('Alert Validation', () => {
  describe('validateAlertData', () => {
    it('should validate complete alert data successfully', () => {
      const validAlert: SimpleAlertData = {
        id: 'alert_123',
        studentId: 'student_456',
        studentName: 'John Doe',
        type: AlertType.ABSENCE,
        currentCount: 6,
        thresholdCount: 5,
        period: AlertPeriod.THIRTY_DAYS,
        status: AlertStatus.ACTIVE,
        createdAt: new Date(),
        canDismiss: true
      };

      const result = validateAlertData(validAlert);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validAlert);
    });

    it('should fail validation for missing required fields', () => {
      const incompleteAlert = {
        id: 'alert_123',
        // Missing studentId, studentName, type, etc.
      };

      const result = validateAlertData(incompleteAlert);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required: Student ID');
      expect(result.errors).toContain('This field is required: Student Name');
      expect(result.errors).toContain('This field is required: Alert Type');
      expect(result.data).toBeUndefined();
    });

    it('should fail validation for invalid alert type', () => {
      const invalidAlert = {
        studentId: 'student_123',
        studentName: 'Jane Doe',
        type: 'INVALID_TYPE' as any,
        currentCount: 5,
        thresholdCount: 3,
        period: AlertPeriod.THIRTY_DAYS
      };

      const result = validateAlertData(invalidAlert);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid alert type');
    });

    it('should fail validation for negative counts', () => {
      const invalidAlert = {
        studentId: 'student_123',
        studentName: 'Jane Doe',
        type: AlertType.ABSENCE,
        currentCount: -1,
        thresholdCount: -5,
        period: AlertPeriod.THIRTY_DAYS
      };

      const result = validateAlertData(invalidAlert);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current count cannot be negative');
      expect(result.errors).toContain('Threshold count cannot be negative');
    });

    it('should fail validation for unreasonably high counts', () => {
      const invalidAlert = {
        studentId: 'student_123',
        studentName: 'Jane Doe',
        type: AlertType.ABSENCE,
        currentCount: 1001,
        thresholdCount: 5,
        period: AlertPeriod.THIRTY_DAYS
      };

      const result = validateAlertData(invalidAlert);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Current count seems unreasonably high (>1000)');
    });
  });

  describe('validateAlertForm', () => {
    it('should validate complete form data successfully', () => {
      const validForm: SimpleAlertFormData = {
        type: AlertType.LATENESS,
        thirtyDayThreshold: 8,
        cumulativeThreshold: 20
      };

      const result = validateAlertForm(validForm);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validForm);
    });

    it('should fail validation for missing thresholds', () => {
      const incompleteForm = {
        type: AlertType.ABSENCE
        // Missing thresholds
      };

      const result = validateAlertForm(incompleteForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required: 30-Day Threshold');
      expect(result.errors).toContain('This field is required: Cumulative Threshold');
    });

    it('should fail validation for thresholds too low', () => {
      const invalidForm = {
        type: AlertType.ABSENCE,
        thirtyDayThreshold: 0,
        cumulativeThreshold: 0
      };

      const result = validateAlertForm(invalidForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Threshold must be at least 1');
    });

    it('should fail validation for thresholds too high', () => {
      const invalidForm = {
        type: AlertType.ABSENCE,
        thirtyDayThreshold: 35,
        cumulativeThreshold: 150
      };

      const result = validateAlertForm(invalidForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Monthly threshold cannot exceed 30');
      expect(result.errors).toContain('Cumulative threshold cannot exceed 100');
    });

    it('should fail validation for non-integer thresholds', () => {
      const invalidForm = {
        type: AlertType.ABSENCE,
        thirtyDayThreshold: 5.5,
        cumulativeThreshold: 15.7
      };

      const result = validateAlertForm(invalidForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('30-day threshold must be a whole number');
      expect(result.errors).toContain('Cumulative threshold must be a whole number');
    });
  });

  describe('validateTimeframe', () => {
    it('should validate reasonable timeframes', () => {
      expect(validateTimeframe(1)).toBe(true);
      expect(validateTimeframe(30)).toBe(true);
      expect(validateTimeframe(365)).toBe(true);
    });

    it('should reject invalid timeframes', () => {
      expect(validateTimeframe(0)).toBe(false);
      expect(validateTimeframe(-5)).toBe(false);
      expect(validateTimeframe(366)).toBe(false);
      expect(validateTimeframe(1.5)).toBe(false);
    });
  });

  describe('validateStudentId', () => {
    it('should validate proper student IDs', () => {
      const result = validateStudentId('student_123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBe('student_123');
    });

    it('should trim whitespace from student IDs', () => {
      const result = validateStudentId('  student_123  ');

      expect(result.isValid).toBe(true);
      expect(result.data).toBe('student_123');
    });

    it('should fail validation for empty student IDs', () => {
      const result = validateStudentId('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required: Student ID');
    });

    it('should fail validation for too long student IDs', () => {
      const longId = 'a'.repeat(51);
      const result = validateStudentId(longId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Student ID is too long (max 50 characters)');
    });
  });

  describe('validateAlertCount', () => {
    it('should validate proper counts', () => {
      const result = validateAlertCount(5, 'Test Count');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBe(5);
    });

    it('should fail validation for missing counts', () => {
      const result = validateAlertCount(null as any, 'Test Count');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Test Count is required');
    });

    it('should fail validation for negative counts', () => {
      const result = validateAlertCount(-1, 'Test Count');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Test Count cannot be negative');
    });

    it('should fail validation for non-integer counts', () => {
      const result = validateAlertCount(5.5, 'Test Count');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Test Count must be a whole number');
    });

    it('should fail validation for unreasonably high counts', () => {
      const result = validateAlertCount(1001, 'Test Count');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Test Count seems unreasonably high (>1000)');
    });
  });
});
