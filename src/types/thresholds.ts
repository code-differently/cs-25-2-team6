/**
 * Threshold type definitions for User Story 4
 * Simple form data structures for alert threshold configuration
 */
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
