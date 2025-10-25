/**
 * Tests for threshold validation utilities
 * Ensures threshold configuration validation works correctly for User Story 4
 */

import {
  validateThresholdForm,
  validateThresholdValue,
  sanitizeThresholdInput,
  validateThresholdLogic
} from '../../src/utils/thresholdValidation';
import { SimpleThresholdFormData } from '../../src/types/thresholds';
import { DEFAULT_THRESHOLDS, VALIDATION_LIMITS } from '../../src/constants/alertConstants';

describe('Threshold Validation', () => {
  describe('validateThresholdForm', () => {
    it('should validate complete threshold form successfully', () => {
      const validForm: SimpleThresholdFormData = {
        absences30Day: 5,
        absencesCumulative: 15,
        lateness30Day: 8,
        latenessCumulative: 20
      };

      const result = validateThresholdForm(validForm);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.data).toEqual(validForm);
    });

    it('should fail validation for missing required fields', () => {
      const incompleteForm = {
        absences30Day: 5
        // Missing other required fields
      };

      const result = validateThresholdForm(incompleteForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required: Cumulative Absences');
      expect(result.errors).toContain('This field is required: 30-Day Lateness');
      expect(result.errors).toContain('This field is required: Cumulative Lateness');
      expect(result.fieldErrors.absencesCumulative).toContain('This field is required');
    });

    it('should generate warnings for values significantly different from defaults', () => {
      const form = {
        absences30Day: 15, // Significantly different from default (5)
        absencesCumulative: 50, // Significantly different from default (15)
        lateness30Day: 20, // Significantly different from default (8)
        latenessCumulative: 50 // Significantly different from default (20)
      };

      const result = validateThresholdForm(form);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('30-day absence threshold differs significantly from recommended default');
    });

    it('should validate cross-field logic (cumulative > 30-day)', () => {
      const invalidForm = {
        absences30Day: 10,
        absencesCumulative: 5, // Lower than 30-day
        lateness30Day: 15,
        latenessCumulative: 10 // Lower than 30-day
      };

      const result = validateThresholdForm(invalidForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cumulative absence threshold should be higher than 30-day threshold');
      expect(result.errors).toContain('Cumulative lateness threshold should be higher than 30-day threshold');
      expect(result.fieldErrors.absencesCumulative).toContain('Should be higher than 30-day threshold');
    });

    it('should validate threshold value ranges', () => {
      const invalidForm = {
        absences30Day: 0, // Too low
        absencesCumulative: 150, // Too high
        lateness30Day: 35, // Too high for 30-day
        latenessCumulative: -5 // Negative
      };

      const result = validateThresholdForm(invalidForm);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Threshold must be at least 1');
      expect(result.errors).toContain('Cumulative threshold cannot exceed 100');
      expect(result.errors).toContain('Monthly threshold cannot exceed 30');
    });
  });

  describe('validateThresholdValue', () => {
    it('should validate proper threshold values', () => {
      const result = validateThresholdValue(5, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBe(5);
    });

    it('should fail validation for missing values', () => {
      const result = validateThresholdValue(null as any, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should fail validation for non-finite values', () => {
      const result = validateThresholdValue(Infinity, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be a valid number');
    });

    it('should fail validation for non-integer values', () => {
      const result = validateThresholdValue(5.5, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Threshold must be a whole number');
    });

    it('should fail validation for values below minimum', () => {
      const result = validateThresholdValue(0, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Threshold must be at least 1');
    });

    it('should fail validation for values above maximum (30-day)', () => {
      const result = validateThresholdValue(35, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Monthly threshold cannot exceed 30');
    });

    it('should fail validation for values above maximum (cumulative)', () => {
      const result = validateThresholdValue(150, VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cumulative threshold cannot exceed 100');
    });
  });

  describe('sanitizeThresholdInput', () => {
    it('should return clean data for valid input', () => {
      const input = {
        absences30Day: 5,
        absencesCumulative: 15,
        lateness30Day: 8,
        latenessCumulative: 20
      };

      const result = sanitizeThresholdInput(input);

      expect(result).toEqual(input);
    });

    it('should convert string numbers to integers', () => {
      const input = {
        absences30Day: '5' as any,
        absencesCumulative: '15' as any,
        lateness30Day: '8' as any,
        latenessCumulative: '20' as any
      };

      const result = sanitizeThresholdInput(input);

      expect(result.absences30Day).toBe(5);
      expect(result.absencesCumulative).toBe(15);
      expect(result.lateness30Day).toBe(8);
      expect(result.latenessCumulative).toBe(20);
    });

    it('should use defaults for invalid input', () => {
      const input = {
        absences30Day: 'invalid' as any,
        absencesCumulative: null as any,
        lateness30Day: undefined as any,
        latenessCumulative: -5
      };

      const result = sanitizeThresholdInput(input);

      expect(result.absences30Day).toBe(DEFAULT_THRESHOLDS.absences30Day);
      expect(result.absencesCumulative).toBe(DEFAULT_THRESHOLDS.absencesCumulative);
      expect(result.lateness30Day).toBe(DEFAULT_THRESHOLDS.lateness30Day);
      expect(result.latenessCumulative).toBe(DEFAULT_THRESHOLDS.latenessCumulative);
    });

    it('should clamp values to valid ranges', () => {
      const input = {
        absences30Day: 0, // Below minimum
        absencesCumulative: 200, // Above maximum
        lateness30Day: 5,
        latenessCumulative: 15
      };

      const result = sanitizeThresholdInput(input);

      expect(result.absences30Day).toBe(DEFAULT_THRESHOLDS.absences30Day);
      expect(result.absencesCumulative).toBe(VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE);
    });
  });

  describe('validateThresholdLogic', () => {
    it('should validate logical threshold relationships', () => {
      const validThresholds = {
        absences30Day: 5,
        absencesCumulative: 15,
        lateness30Day: 8,
        latenessCumulative: 20
      };

      const result = validateThresholdLogic(validThresholds);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validThresholds);
    });

    it('should fail validation when cumulative <= 30-day', () => {
      const invalidThresholds = {
        absences30Day: 10,
        absencesCumulative: 10, // Same as 30-day
        lateness30Day: 15,
        latenessCumulative: 10 // Less than 30-day
      };

      const result = validateThresholdLogic(invalidThresholds);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cumulative absence threshold must be higher than 30-day threshold');
      expect(result.errors).toContain('Cumulative lateness threshold must be higher than 30-day threshold');
    });

    it('should warn about unreasonably low thresholds', () => {
      const lowThresholds = {
        absences30Day: 1, // Too low
        absencesCumulative: 5,
        lateness30Day: 2, // Too low
        latenessCumulative: 10
      };

      const result = validateThresholdLogic(lowThresholds);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('30-day absence threshold seems too low (would generate excessive alerts)');
      expect(result.errors).toContain('30-day lateness threshold seems too low (would generate excessive alerts)');
    });

    it('should warn about unreasonably high thresholds', () => {
      const highThresholds = {
        absences30Day: 26, // Too high
        absencesCumulative: 50,
        lateness30Day: 27, // Too high
        latenessCumulative: 60
      };

      const result = validateThresholdLogic(highThresholds);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('30-day absence threshold seems too high (alerts may never trigger)');
      expect(result.errors).toContain('30-day lateness threshold seems too high (alerts may never trigger)');
    });
  });
});
