/**
 * Filter type definitions and Zod validation schemas for User Story 2
 */

import { z } from 'zod';

export enum FilterType {
  STUDENT_NAME = 'studentName',
  DATE_RANGE = 'dateRange',
  ATTENDANCE_STATUS = 'attendanceStatus',
  CLASS_SELECTION = 'classSelection',
  LATE_LIST = 'lateList',
  EARLY_DISMISSAL_LIST = 'earlyDismissalList'
}

// Removes dangerous characters and validates non-empty result
export const SanitizedInputSchema = z.string()
  .trim()
  .transform((str) => str.replace(/[<>\"'%;()&+]/g, ''))
  .refine((str) => str.length > 0, 'Input cannot be empty after sanitization');

// Student name filter schema with partial matching
export const StudentNameFilterSchema = z.object({
  searchQuery: z.string().trim().max(50, 'Student name search is too long')
    .transform((str) => str.replace(/[<>\"'%;()&+]/g, ''))
    .refine((str) => str.length > 0, 'Input cannot be empty after sanitization'),
  matchType: z.enum(['partial', 'exact']).default('partial'),
  caseSensitive: z.boolean().default(false)
});

export const MultiSelectFilterSchema = z.object({
  selectedItems: z.array(z.string()),
  maxSelections: z.number().optional()
});

export const ClassFilterSchema = MultiSelectFilterSchema.extend({
  selectedItems: z.array(z.string().min(1, 'Class ID cannot be empty')),
  gradeLevel: z.string().optional()
});

export const StatusFilterSchema = MultiSelectFilterSchema.extend({
  selectedItems: z.array(z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']))
});

// Late list filter schema for User Story 2 acceptance criteria
export const LateListFilterSchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  lastName: z.string().trim().max(50, 'Last name is too long').optional()
}).refine(
  (data) => data.dateISO || data.lastName,
  { message: 'Either date or last name must be provided for late list filtering' }
);

// Early dismissal list filter schema for User Story 2 acceptance criteria
export const EarlyDismissalFilterSchema = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  lastName: z.string().trim().max(50, 'Last name is too long').optional()
}).refine(
  (data) => data.dateISO || data.lastName,
  { message: 'Either date or last name must be provided for early dismissal filtering' }
);

// Core filter state for data validation (UI state management handled by teammates)
export const FilterStateSchema = z.object({
  studentName: StudentNameFilterSchema.optional(),
  classSelection: ClassFilterSchema.optional(),
  attendanceStatus: StatusFilterSchema.optional(),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string()
  }).optional(),
  presetRange: z.enum(['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'ytd', 'custom']).optional()
});

// Tracks validation state and user interactions for UI feedback
export const FilterValidationStateSchema = z.object({
  isValid: z.boolean(),
  hasErrors: z.boolean(),
  hasWarnings: z.boolean(),
  errors: z.record(z.string(), z.array(z.string())),
  warnings: z.record(z.string(), z.array(z.string()))
});

// TypeScript interfaces from Zod schemas
export type StudentNameFilter = z.infer<typeof StudentNameFilterSchema>;
export type MultiSelectFilter = z.infer<typeof MultiSelectFilterSchema>;
export type ClassFilter = z.infer<typeof ClassFilterSchema>;
export type StatusFilter = z.infer<typeof StatusFilterSchema>;
export type LateListFilter = z.infer<typeof LateListFilterSchema>;
export type EarlyDismissalFilter = z.infer<typeof EarlyDismissalFilterSchema>;
export type FilterState = z.infer<typeof FilterStateSchema>;
export type FilterValidationState = z.infer<typeof FilterValidationStateSchema>;
