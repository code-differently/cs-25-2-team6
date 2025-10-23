/**
 * Threshold validation utilities for User Story 4
 * Validation logic for attendance threshold configuration
 */

import { ValidationResult } from '../types/alerts';
import { SimpleThresholdFormData, SimpleThresholdValidationResult } from '../types/thresholds';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES, DEFAULT_THRESHOLDS } from '../constants/alertConstants';

/**
 * Validates threshold form data with comprehensive checking
 */
export function validateThresholdForm(formData: Partial<SimpleThresholdFormData>): SimpleThresholdValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: SimpleThresholdValidationResult['fieldErrors'] = {};

  // Validate absences30Day
  if (formData.absences30Day === undefined || formData.absences30Day === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': 30-Day Absences');
    fieldErrors.absences30Day = [VALIDATION_MESSAGES.REQUIRED_FIELD];
  } else {
    const absenceValidation = validateThresholdValue(formData.absences30Day, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);
    if (!absenceValidation.isValid) {
      errors.push(...absenceValidation.errors);
      fieldErrors.absences30Day = absenceValidation.errors;
    }
    // Warning if very different from defaults
    if (Math.abs(formData.absences30Day - DEFAULT_THRESHOLDS.absences30Day) > 5) {
      warnings.push('30-day absence threshold differs significantly from recommended default');
    }
  }

  // Validate absencesCumulative
  if (formData.absencesCumulative === undefined || formData.absencesCumulative === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Cumulative Absences');
    fieldErrors.absencesCumulative = [VALIDATION_MESSAGES.REQUIRED_FIELD];
  } else {
    const cumulativeValidation = validateThresholdValue(formData.absencesCumulative, VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE);
    if (!cumulativeValidation.isValid) {
      errors.push(...cumulativeValidation.errors);
      fieldErrors.absencesCumulative = cumulativeValidation.errors;
    }
    // Warning if very different from defaults
    if (Math.abs(formData.absencesCumulative - DEFAULT_THRESHOLDS.absencesCumulative) > 10) {
      warnings.push('Cumulative absence threshold differs significantly from recommended default');
    }
  }

  // Validate lateness30Day
  if (formData.lateness30Day === undefined || formData.lateness30Day === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': 30-Day Lateness');
    fieldErrors.lateness30Day = [VALIDATION_MESSAGES.REQUIRED_FIELD];
  } else {
    const latenessValidation = validateThresholdValue(formData.lateness30Day, VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY);
    if (!latenessValidation.isValid) {
      errors.push(...latenessValidation.errors);
      fieldErrors.lateness30Day = latenessValidation.errors;
    }
    // Warning if very different from defaults
    if (Math.abs(formData.lateness30Day - DEFAULT_THRESHOLDS.lateness30Day) > 5) {
      warnings.push('30-day lateness threshold differs significantly from recommended default');
    }
  }

  // Validate latenessCumulative
  if (formData.latenessCumulative === undefined || formData.latenessCumulative === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Cumulative Lateness');
    fieldErrors.latenessCumulative = [VALIDATION_MESSAGES.REQUIRED_FIELD];
  } else {
    const cumulativeLatenessValidation = validateThresholdValue(formData.latenessCumulative, VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE);
    if (!cumulativeLatenessValidation.isValid) {
      errors.push(...cumulativeLatenessValidation.errors);
      fieldErrors.latenessCumulative = cumulativeLatenessValidation.errors;
    }
    // Warning if very different from defaults
    if (Math.abs(formData.latenessCumulative - DEFAULT_THRESHOLDS.latenessCumulative) > 10) {
      warnings.push('Cumulative lateness threshold differs significantly from recommended default');
    }
  }

  // Cross-field validation: cumulative should be higher than 30-day
  if (formData.absences30Day && formData.absencesCumulative) {
    if (formData.absencesCumulative <= formData.absences30Day) {
      errors.push('Cumulative absence threshold should be higher than 30-day threshold');
      if (!fieldErrors.absencesCumulative) fieldErrors.absencesCumulative = [];
      fieldErrors.absencesCumulative.push('Should be higher than 30-day threshold');
    }
  }

  if (formData.lateness30Day && formData.latenessCumulative) {
    if (formData.latenessCumulative <= formData.lateness30Day) {
      errors.push('Cumulative lateness threshold should be higher than 30-day threshold');
      if (!fieldErrors.latenessCumulative) fieldErrors.latenessCumulative = [];
      fieldErrors.latenessCumulative.push('Should be higher than 30-day threshold');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors,
    data: errors.length === 0 ? formData as SimpleThresholdFormData : undefined
  };
}

/**
 * Validates a single threshold value
 */
export function validateThresholdValue(value: number, maxValue: number): ValidationResult<number> {
  const errors: string[] = [];

  if (value === undefined || value === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD);
  } else if (!Number.isFinite(value)) {
    errors.push(VALIDATION_MESSAGES.INVALID_NUMBER);
  } else if (!Number.isInteger(value)) {
    errors.push('Threshold must be a whole number');
  } else if (value < VALIDATION_LIMITS.MIN_THRESHOLD) {
    errors.push(VALIDATION_MESSAGES.THRESHOLD_TOO_LOW);
  } else if (value > maxValue) {
    errors.push(maxValue === VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY 
      ? VALIDATION_MESSAGES.THRESHOLD_TOO_HIGH_30_DAY 
      : VALIDATION_MESSAGES.THRESHOLD_TOO_HIGH_CUMULATIVE);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? value : undefined
  };
}

/**
 * Sanitizes threshold input data by cleaning and validating
 */
export function sanitizeThresholdInput(input: Partial<SimpleThresholdFormData>): SimpleThresholdFormData {
  const sanitized: SimpleThresholdFormData = {
    absences30Day: sanitizeNumber(input.absences30Day, DEFAULT_THRESHOLDS.absences30Day),
    absencesCumulative: sanitizeNumber(input.absencesCumulative, DEFAULT_THRESHOLDS.absencesCumulative),
    lateness30Day: sanitizeNumber(input.lateness30Day, DEFAULT_THRESHOLDS.lateness30Day),
    latenessCumulative: sanitizeNumber(input.latenessCumulative, DEFAULT_THRESHOLDS.latenessCumulative)
  };

  return sanitized;
}

/**
 * Helper function to sanitize individual number values
 */
function sanitizeNumber(value: unknown, defaultValue: number): number {
  // Convert string numbers to actual numbers
  if (typeof value === 'string') {
    const parsed = parseInt(value.trim(), 10);
    if (!isNaN(parsed)) {
      value = parsed;
    }
  }

  // Return clean number or default
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0) {
    return Math.min(Math.max(value, VALIDATION_LIMITS.MIN_THRESHOLD), VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE);
  }

  return defaultValue;
}

/**
 * Validates that threshold settings make logical sense
 */
export function validateThresholdLogic(thresholds: SimpleThresholdFormData): ValidationResult<SimpleThresholdFormData> {
  const errors: string[] = [];

  // Cumulative thresholds should be higher than 30-day thresholds
  if (thresholds.absencesCumulative <= thresholds.absences30Day) {
    errors.push('Cumulative absence threshold must be higher than 30-day threshold');
  }

  if (thresholds.latenessCumulative <= thresholds.lateness30Day) {
    errors.push('Cumulative lateness threshold must be higher than 30-day threshold');
  }

  // Thresholds shouldn't be unreasonably low (would cause too many alerts)
  if (thresholds.absences30Day < 2) {
    errors.push('30-day absence threshold seems too low (would generate excessive alerts)');
  }

  if (thresholds.lateness30Day < 3) {
    errors.push('30-day lateness threshold seems too low (would generate excessive alerts)');
  }

  // Thresholds shouldn't be unreasonably high (would never trigger)
  if (thresholds.absences30Day > 25) {
    errors.push('30-day absence threshold seems too high (alerts may never trigger)');
  }

  if (thresholds.lateness30Day > 25) {
    errors.push('30-day lateness threshold seems too high (alerts may never trigger)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? thresholds : undefined
  };
}
