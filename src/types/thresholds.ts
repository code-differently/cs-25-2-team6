/**
 * Simple threshold-related TypeScript interfaces for User Story 4
 * Basic threshold configuration for attendance monitoring
 */

import { AlertType, AlertPeriod } from '../domains/AlertThreshold';
import { ValidationResult } from './alerts';

/**
 * Simple threshold form data for UI
 */
export interface SimpleThresholdFormData {
  absences30Day: number;
  absencesCumulative: number;
  lateness30Day: number;
  latenessCumulative: number;
}

/**
 * Simple threshold display data
 */
export interface SimpleThresholdDisplayData {
  id: string;
  absences30Day: number;
  absencesCumulative: number;
  lateness30Day: number;
  latenessCumulative: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simple threshold validation result
 */
export interface SimpleThresholdValidationResult extends ValidationResult<SimpleThresholdFormData> {
  warnings: string[];
  fieldErrors: {
    absences30Day?: string[];
    absencesCumulative?: string[];
    lateness30Day?: string[];
    latenessCumulative?: string[];
  };
}
