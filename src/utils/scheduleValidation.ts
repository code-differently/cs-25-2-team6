/**
 * Schedule validation utilities for User Story 3
 */

import { ScheduleFormData, ValidationResult, ScheduleConflictResult } from '../types/schedule';
import { CreateDayOffRequest } from '../types/dayOff';
import { DayOffReason } from '../domains/DayOffReason';
import { validateScheduleDate, validateScheduleDateString } from './dateValidation';
import { validateDayOffReason, sanitizeReasonText } from './reasonValidation';
import { 
  SCHEDULE_CONSTRAINTS,
  SCHEDULE_VALIDATION_MESSAGES,
  SCHEDULE_ERROR_CODES,
  SCHEDULE_BUSINESS_RULES
} from '../constants/scheduleConstants';

export function validateScheduleForm(formData: ScheduleFormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const dateValidation = validateScheduleDateString(formData.date);
  if (!dateValidation.isValid) {
    errors.push(dateValidation.error || 'Invalid date');
  }
  if (dateValidation.warnings) {
    warnings.push(...dateValidation.warnings);
  }
  
  const reasonValidation = validateDayOffReason(formData.reason, formData.customReason);
  if (!reasonValidation.isValid) {
    errors.push(reasonValidation.error || 'Invalid reason');
  }
  if (reasonValidation.warnings) {
    warnings.push(...reasonValidation.warnings);
  }
  
  if (formData.description && formData.description.length > SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH) {
    errors.push(`Description cannot exceed ${SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH} characters`);
  }
  
  if (formData.date) {
    const businessRuleValidation = validateBusinessRules(formData);
    if (!businessRuleValidation.isValid) {
      errors.push(businessRuleValidation.error || 'Business rule violation');
    }
    if (businessRuleValidation.warnings) {
      warnings.push(...businessRuleValidation.warnings);
    }
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; '),
      errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateBusinessRules(formData: ScheduleFormData): ValidationResult {
  const warnings: string[] = [];
  
  try {
    const date = new Date(formData.date);
    
    if (!SCHEDULE_BUSINESS_RULES.ALLOW_WEEKENDS) {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (isWeekend) {
        return {
          isValid: false,
          error: 'Weekend scheduling is not allowed',
          errorCode: SCHEDULE_ERROR_CODES.BUSINESS_RULE_VIOLATION
        };
      }
    }
    
    if (!SCHEDULE_BUSINESS_RULES.ALLOW_PAST_DATES) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (date < today) {
        return {
          isValid: false,
          error: SCHEDULE_VALIDATION_MESSAGES.PAST_DATE_NOT_ALLOWED,
          errorCode: SCHEDULE_ERROR_CODES.BUSINESS_RULE_VIOLATION
        };
      }
    }
    
    // Check reason requirement
    if (SCHEDULE_BUSINESS_RULES.REQUIRE_REASON && !formData.reason) {
      return {
        isValid: false,
        error: SCHEDULE_VALIDATION_MESSAGES.REASON_REQUIRED,
        errorCode: SCHEDULE_ERROR_CODES.BUSINESS_RULE_VIOLATION
      };
    }
    
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid date format',
      errorCode: SCHEDULE_ERROR_CODES.INVALID_SCHEDULE_DATE
    };
  }
}

export function sanitizeScheduleInput(input: ScheduleFormData): ScheduleFormData {
  return {
    date: input.date.trim(),
    reason: input.reason,
    customReason: input.customReason ? sanitizeReasonText(input.customReason) : undefined,
    description: input.description ? sanitizeDescription(input.description) : undefined,
    notifyStudents: Boolean(input.notifyStudents),
    applyBulkExcuses: Boolean(input.applyBulkExcuses)
  };
}

function sanitizeDescription(description: string): string {
  return description
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 255);
}

export function validateCreateDayOffRequest(request: CreateDayOffRequest): ValidationResult {
  const formData: ScheduleFormData = {
    date: request.date,
    reason: request.reason,
    customReason: request.customReason,
    description: request.description,
    notifyStudents: request.sendNotifications,
    applyBulkExcuses: request.autoExcuseStudents
  };
  
  return validateScheduleForm(formData);
}

export function validateScheduleConflicts(
  date: string, 
  existingSchedules: string[] = []
): ScheduleConflictResult {
  const hasDuplicate = existingSchedules.includes(date);
  
  if (hasDuplicate) {
    return {
      hasConflict: true,
      conflictDetails: {
        existingSchedule: {
          id: 'existing',
          dateISO: date,
          reason: DayOffReason.OTHER,
          scope: 'ALL_STUDENTS' as const,
          customReason: 'Existing schedule',
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          notifyStudents: true,
          bulkExcusesApplied: false
        },
        conflictType: 'DUPLICATE_DATE',
        suggestion: 'Choose a different date or update the existing schedule'
      }
    };
  }
  
  return { hasConflict: false };
}

/**
 * Validates bulk excuse operation parameters
 * @param date - Date for bulk excuse
 * @param studentCount - Number of students to be excused
 * @returns ValidationResult
 */
export function validateBulkExcuseOperation(date: string, studentCount: number): ValidationResult {
  // Validate date
  const dateValidation = validateScheduleDateString(date);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  // Check student count limits
  if (studentCount <= 0) {
    return {
      isValid: false,
      error: 'No students to excuse',
      errorCode: SCHEDULE_ERROR_CODES.BULK_EXCUSE_ERROR
    };
  }
  
  if (studentCount > SCHEDULE_CONSTRAINTS.MAX_BULK_STUDENT_COUNT) {
    return {
      isValid: false,
      error: SCHEDULE_VALIDATION_MESSAGES.BULK_OPERATION_LIMIT_EXCEEDED,
      errorCode: SCHEDULE_ERROR_CODES.BULK_EXCUSE_ERROR
    };
  }
  
  return { isValid: true };
}

/**
 * Validates schedule update operation
 * @param scheduleId - ID of schedule to update
 * @param updateData - Data to update
 * @returns ValidationResult
 */
export function validateScheduleUpdate(
  scheduleId: string, 
  updateData: Partial<ScheduleFormData>
): ValidationResult {
  if (!scheduleId || scheduleId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Schedule ID is required',
      errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
    };
  }
  
  // Validate only provided fields
  const errors: string[] = [];
  
  if (updateData.date) {
    const dateValidation = validateScheduleDateString(updateData.date);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error || 'Invalid date');
    }
  }
  
  if (updateData.reason !== undefined) {
    const reasonValidation = validateDayOffReason(updateData.reason, updateData.customReason);
    if (!reasonValidation.isValid) {
      errors.push(reasonValidation.error || 'Invalid reason');
    }
  }
  
  if (updateData.description && updateData.description.length > SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH) {
    errors.push(`Description cannot exceed ${SCHEDULE_CONSTRAINTS.REASON_MAX_LENGTH} characters`);
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; '),
      errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
    };
  }
  
  return { isValid: true };
}

export function validateScheduleDeletion(scheduleId: string, force: boolean = false): ValidationResult {
  if (!scheduleId || scheduleId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Schedule ID is required',
      errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
    };
  }
  
  const warnings: string[] = [];
  
  if (!force) {
    warnings.push('Deleting this schedule may affect existing attendance records');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateNotificationSettings(settings: {
  sendNotifications: boolean;
  advanceNoticeDays?: number;
  reminderDays?: number[];
}): ValidationResult {
  if (settings.advanceNoticeDays !== undefined) {
    if (settings.advanceNoticeDays < 0 || settings.advanceNoticeDays > 30) {
      return {
        isValid: false,
        error: 'Advance notice days must be between 0 and 30',
        errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
      };
    }
  }
  
  if (settings.reminderDays) {
    for (const day of settings.reminderDays) {
      if (day < 0 || day > 30) {
        return {
          isValid: false,
          error: 'Reminder days must be between 0 and 30',
          errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
        };
      }
    }
  }
  
  return { isValid: true };
}

export function validateScheduleOperation(
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_EXCUSE',
  data: any
): ValidationResult {
  switch (operation) {
    case 'CREATE':
      return validateCreateDayOffRequest(data);
    case 'UPDATE':
      return validateScheduleUpdate(data.id, data.updateData);
    case 'DELETE':
      return validateScheduleDeletion(data.id, data.force);
    case 'BULK_EXCUSE':
      return validateBulkExcuseOperation(data.date, data.studentCount);
    default:
      return {
        isValid: false,
        error: 'Unknown operation type',
        errorCode: SCHEDULE_ERROR_CODES.FORM_VALIDATION_ERROR
      };
  }
}
