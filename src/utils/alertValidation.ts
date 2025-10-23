/**
 * Alert validation utilities for User Story 4
 * Simple validation functions for alert data integrity
 */

import { AlertType, AlertPeriod } from '../domains/AlertThreshold';
import { AlertStatus } from '../domains/AttendanceAlert';
import { ValidationResult, SimpleAlertData, SimpleAlertFormData } from '../types/alerts';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../constants/alertConstants';

/**
 * Validates basic alert data structure
 */
export function validateAlertData(alertData: Partial<SimpleAlertData>): ValidationResult<SimpleAlertData> {
  const errors: string[] = [];

  // Check required fields
  if (!alertData.studentId?.trim()) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Student ID');
  }

  if (!alertData.studentName?.trim()) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Student Name');
  }

  if (!alertData.type) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Alert Type');
  }

  if (alertData.currentCount === undefined || alertData.currentCount === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Current Count');
  }

  if (alertData.thresholdCount === undefined || alertData.thresholdCount === null) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Threshold Count');
  }

  if (!alertData.period) {
    errors.push(VALIDATION_MESSAGES.REQUIRED_FIELD + ': Period');
  }

  // Validate alert type
  if (alertData.type && !Object.values(AlertType).includes(alertData.type)) {
    errors.push('Invalid alert type');
  }

  // Validate period
  if (alertData.period && !Object.values(AlertPeriod).includes(alertData.period)) {
    errors.push('Invalid time period');
  }

  // Validate status
  if (alertData.status && !Object.values(AlertStatus).includes(alertData.status)) {
    errors.push('Invalid alert status');
  }

  // Validate counts are non-negative
  if (alertData.currentCount !== undefined && alertData.currentCount < 0) {
    errors.push('Current count cannot be negative');
  }

  if (alertData.thresholdCount !== undefined && alertData.thresholdCount < 0) {
    errors.push('Threshold count cannot be negative');
  }

  // Validate that current count doesn't exceed reasonable limits
  if (alertData.currentCount !== undefined && alertData.currentCount > 1000) {
    errors.push('Current count seems unreasonably high (>1000)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? alertData as SimpleAlertData : undefined
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
