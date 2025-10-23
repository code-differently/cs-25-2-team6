/**
 * Simple alert constants and default values for User Story 4
 * Basic configuration for attendance threshold monitoring
 */

import { AlertType, AlertPeriod } from '../domains/AlertThreshold';

/**
 * Default threshold values - simple numerical limits
 */
export const DEFAULT_THRESHOLDS = {
  absences30Day: 5,        // 5 absences in 30 days triggers alert
  absencesCumulative: 15,  // 15 absences total for school year
  lateness30Day: 8,        // 8 late arrivals in 30 days
  latenessCumulative: 20   // 20 late arrivals total for school year
} as const;

/**
 * Validation limits for threshold settings
 */
export const VALIDATION_LIMITS = {
  MIN_THRESHOLD: 1,
  MAX_THRESHOLD_30_DAY: 30,
  MAX_THRESHOLD_CUMULATIVE: 100
} as const;

/**
 * Error messages for validation
 */
export const VALIDATION_MESSAGES = {
  THRESHOLD_TOO_LOW: 'Threshold must be at least 1',
  THRESHOLD_TOO_HIGH_30_DAY: 'Monthly threshold cannot exceed 30',
  THRESHOLD_TOO_HIGH_CUMULATIVE: 'Cumulative threshold cannot exceed 100',
  REQUIRED_FIELD: 'This field is required',
  INVALID_NUMBER: 'Must be a valid number'
} as const;

/**
 * Simple helper to get default thresholds
 */
export const getDefaultThresholds = () => ({
  absences30Day: DEFAULT_THRESHOLDS.absences30Day,
  absencesCumulative: DEFAULT_THRESHOLDS.absencesCumulative,
  lateness30Day: DEFAULT_THRESHOLDS.lateness30Day,
  latenessCumulative: DEFAULT_THRESHOLDS.latenessCumulative
});

/**
 * Time constants for calculations
 */
export const TIME_CONSTANTS = {
  THIRTY_DAYS: 30,
  DAYS_IN_SCHOOL_YEAR: 180
} as const;
