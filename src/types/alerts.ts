/**
 * Alert-related TypeScript interfaces for User Story 4
 * Simple alert system for attendance threshold monitoring
 */

import { AlertType, AlertPeriod } from '../domains/AlertThreshold';
import { AlertStatus } from '../domains/AttendanceAlert';

/**
 * Validation result pattern used across all validation functions
 */
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

/**
 * Simple alert display data for UI components
 */
export interface SimpleAlertData {
  id: string;
  studentId: string;
  studentName: string;
  type: AlertType; // ABSENCE or LATENESS
  currentCount: number;
  thresholdCount: number;
  period: AlertPeriod; // THIRTY_DAYS or CUMULATIVE
  status: AlertStatus;
  createdAt: Date;
  canDismiss: boolean;
}

/**
 * Simple alert form data for setting thresholds
 */
export interface SimpleAlertFormData {
  type: AlertType; // ABSENCE or LATENESS
  thirtyDayThreshold: number;
  cumulativeThreshold: number;
}

/**
 * Basic alert filtering options
 */
export interface SimpleAlertFilters {
  studentId?: string;
  status?: AlertStatus[];
  type?: AlertType[];
  period?: AlertPeriod;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Simple alert sorting criteria
 */
export interface SimpleAlertSortCriteria {
  field: 'createdAt' | 'count' | 'studentName' | 'type';
  direction: 'asc' | 'desc';
}

/**
 * Result of threshold validation
 */
export interface ThresholdValidationResult extends ValidationResult<SimpleAlertFormData> {
  warnings: string[];
}

/**
 * Simple alert calculation result
 */
export interface SimpleAlertCalculationResult {
  studentId: string;
  absences30Day: number;
  absencesCumulative: number;
  lateness30Day: number;
  latenessCumulative: number;
  thresholds: {
    absences30Day: number;
    absencesCumulative: number;
    lateness30Day: number;
    latenessCumulative: number;
  };
  triggeredAlerts: Array<{
    type: AlertType;
    period: AlertPeriod;
    currentCount: number;
    thresholdCount: number;
  }>;
}

/**
 * Basic alert summary statistics
 */
export interface SimpleAlertSummaryStats {
  totalActiveAlerts: number;
  absenceAlerts: number;
  latenessAlerts: number;
  studentsWithAlerts: number;
  alertsToday: number;
}
