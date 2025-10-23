/**
 * Validation utilities for alert data and forms
 * 
 * This module provides comprehensive validation for the alert system,
 * ensuring data integrity and consistent error handling across the application.
 * 
 * @fileoverview Alert validation utilities for User Story 4
 * @version 1.0.0
 */

import { AlertType, AlertPeriod } from '../domains/AlertThreshold';
import { AlertStatus } from '../domains/AttendanceAlert';
import { ValidationResult, SimpleAlertData, SimpleAlertFormData } from '../types/alerts';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../constants/alertConstants';

/**
 * Validates basic alert data structure
 */
/**
 * Validates complete alert data structure for integrity and business rules
 * 
 * @param data - The alert data to validate
 * @returns ValidationResult with validation status and any errors
 * 
 * @example
 * ```typescript
 * const result = validateAlertData({
 *   studentId: 'student123',
 *   alertType: AlertType.ABSENCE,
 *   period: AlertPeriod.THIRTY_DAYS
 * });
 * 
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateAlertData(data: SimpleAlertData): ValidationResult<SimpleAlertData> {
  const errors: string[] = [];

  // Check required fields
  if (!data.studentId?.trim()) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Student ID');
  }

  if (!data.studentName?.trim()) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Student Name');
  }

  if (!data.type) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Alert Type');
  }

  if (data.currentCount === undefined || data.currentCount === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Current Count');
  }

  if (data.thresholdCount === undefined || data.thresholdCount === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Threshold Count');
  }

  if (!data.period) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Period');
  }

  // Validate alert type
  if (data.type && !Object.values(AlertType).includes(data.type)) {
    errors.push('Invalid alert type');
  }

  // Validate period
  if (data.period && !Object.values(AlertPeriod).includes(data.period)) {
    errors.push('Invalid time period');
  }

  // Validate status
  if (data.status && !Object.values(AlertStatus).includes(data.status)) {
    errors.push('Invalid alert status');
  }

  // Validate counts are non-negative
  if (data.currentCount !== undefined && data.currentCount < 0) {
    errors.push('Current count cannot be negative');
  }

  if (data.thresholdCount !== undefined && data.thresholdCount < 0) {
    errors.push('Threshold count cannot be negative');
  }

  // Validate that current count doesn't exceed reasonable limits
  if (data.currentCount !== undefined && data.currentCount > 1000) {
    errors.push('Current count seems unreasonably high (>1000)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data as SimpleAlertData : undefined
  };
}

/**
 * Validates alert form data for creating/editing alerts
 */
export function validateAlertForm(formData: Partial<SimpleAlertFormData>): ValidationResult<SimpleAlertFormData> {
  const errors: string[] = [];

  // Check required fields
  if (!formData.type) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Alert Type');
  }

  if (formData.thirtyDayThreshold === undefined || formData.thirtyDayThreshold === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': 30-Day Threshold');
  }

  if (formData.cumulativeThreshold === undefined || formData.cumulativeThreshold === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Cumulative Threshold');
  }

  // Validate alert type
  if (formData.type && !Object.values(AlertType).includes(formData.type)) {
    errors.push('Invalid alert type');
  }

  // Validate threshold ranges
  if (formData.thirtyDayThreshold !== undefined) {
    if (formData.thirtyDayThreshold < VALIDATION_LIMITS.MIN_THRESHOLD) {
      errors.push(VALIDATION_MESSAGES.THRESHOLD_TOO_LOW);
    }
    if (formData.thirtyDayThreshold > VALIDATION_LIMITS.MAX_THRESHOLD_30_DAY) {
      errors.push(VALIDATION_MESSAGES.THRESHOLD_TOO_HIGH_30_DAY);
    }
    if (!Number.isInteger(formData.thirtyDayThreshold)) {
      errors.push('30-day threshold must be a whole number');
    }
  }

  if (formData.cumulativeThreshold !== undefined) {
    if (formData.cumulativeThreshold < VALIDATION_LIMITS.MIN_THRESHOLD) {
      errors.push(VALIDATION_MESSAGES.THRESHOLD_TOO_LOW);
    }
    if (formData.cumulativeThreshold > VALIDATION_LIMITS.MAX_THRESHOLD_CUMULATIVE) {
      errors.push(VALIDATION_MESSAGES.THRESHOLD_TOO_HIGH_CUMULATIVE);
    }
    if (!Number.isInteger(formData.cumulativeThreshold)) {
      errors.push('Cumulative threshold must be a whole number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? formData as SimpleAlertFormData : undefined
  };
}

/**
 * Validates timeframe in days
 */
export function validateTimeframe(days: number): boolean {
  return Number.isInteger(days) && days > 0 && days <= 365;
}

/**
 * Sanitizes and validates student ID
 */
export function validateStudentId(studentId: string): ValidationResult<string> {
  const errors: string[] = [];
  const trimmed = studentId?.trim();

  if (!trimmed) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Student ID');
  } else if (trimmed.length < 1) {
    errors.push('Student ID cannot be empty');
  } else if (trimmed.length > 50) {
    errors.push('Student ID is too long (max 50 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? trimmed : undefined
  };
}

/**
 * Validates alert count values
 */
export function validateAlertCount(count: number, label: string): ValidationResult<number> {
  const errors: string[] = [];

  if (count === undefined || count === null) {
    errors.push(`${label} is required`);
  } else if (!Number.isInteger(count)) {
    errors.push(`${label} must be a whole number`);
  } else if (count < 0) {
    errors.push(`${label} cannot be negative`);
  } else if (count > 1000) {
    errors.push(`${label} seems unreasonably high (>1000)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? count : undefined
  };
}
