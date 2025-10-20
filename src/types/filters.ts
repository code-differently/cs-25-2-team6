/**
 * Filter type definitions and Zod validation schemas for User Story 2
 */

import { z } from 'zod';

// Filter types enum
export enum FilterType {
  STUDENT_NAME = 'studentName',
  DATE_RANGE = 'dateRange',
  ATTENDANCE_STATUS = 'attendanceStatus',
  CLASS_SELECTION = 'classSelection'
}

// Input sanitization schema
export const SanitizedInputSchema = z.string()
  .trim()
  .transform((str) => str.replace(/[<>\"'%;()&+]/g, '')) // Remove potentially dangerous characters
  .refine((str) => str.length > 0, 'Input cannot be empty after sanitization');

// Student name filter schema with partial matching
export const StudentNameFilterSchema = z.object({
  searchQuery: z.string().trim().max(50, 'Student name search too long')
    .transform((str) => str.replace(/[<>\"'%;()&+]/g, ''))
    .refine((str) => str.length > 0, 'Input cannot be empty after sanitization'),
  matchType: z.enum(['partial', 'exact']).default('partial'),
  caseSensitive: z.boolean().default(false)
});

// Multi-select filter base schema
export const MultiSelectFilterSchema = z.object({
  selectedItems: z.array(z.string()),
  selectAll: z.boolean().default(false),
  maxSelections: z.number().optional()
});

// Class filter schema
export const ClassFilterSchema = MultiSelectFilterSchema.extend({
  selectedItems: z.array(z.string().min(1, 'Class ID cannot be empty')),
  gradeLevel: z.string().optional()
});

// Status filter schema
export const StatusFilterSchema = MultiSelectFilterSchema.extend({
  selectedItems: z.array(z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']))
});

// Advanced filter options
export const AdvancedFilterOptionsSchema = z.object({
  enableDebounce: z.boolean().default(true),
  debounceDelay: z.number().min(100).max(2000).default(300), // milliseconds
  enableClientSideFiltering: z.boolean().default(true),
  clientSideThreshold: z.number().default(1000), // Switch to server-side if more records
  enablePagination: z.boolean().default(true)
});

// Combined filter state schema
export const FilterStateSchema = z.object({
  studentName: StudentNameFilterSchema.optional(),
  classSelection: ClassFilterSchema.optional(),
  attendanceStatus: StatusFilterSchema.optional(),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string()
  }).optional(),
  presetRange: z.enum(['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'ytd', 'custom']).optional(),
  advancedOptions: AdvancedFilterOptionsSchema.default({
    enableDebounce: true,
    debounceDelay: 300,
    enableClientSideFiltering: true,
    clientSideThreshold: 1000,
    enablePagination: true
  })
});

// Filter validation state
export const FilterValidationStateSchema = z.object({
  isValid: z.boolean(),
  hasErrors: z.boolean(),
  hasWarnings: z.boolean(),
  errors: z.record(z.string(), z.array(z.string())), // Field name -> error messages
  warnings: z.record(z.string(), z.array(z.string())), // Field name -> warning messages
  touchedFields: z.array(z.string()) // Track which fields user has interacted with
});

// TypeScript interfaces from Zod schemas
export type StudentNameFilter = z.infer<typeof StudentNameFilterSchema>;
export type MultiSelectFilter = z.infer<typeof MultiSelectFilterSchema>;
export type ClassFilter = z.infer<typeof ClassFilterSchema>;
export type StatusFilter = z.infer<typeof StatusFilterSchema>;
export type AdvancedFilterOptions = z.infer<typeof AdvancedFilterOptionsSchema>;
export type FilterState = z.infer<typeof FilterStateSchema>;
export type FilterValidationState = z.infer<typeof FilterValidationStateSchema>;

// Filter operation types
export interface FilterOperation {
  type: FilterType;
  operation: 'add' | 'remove' | 'update' | 'clear';
  value: any;
  timestamp: number;
}

// Filter history for undo/redo functionality
export interface FilterHistory {
  operations: FilterOperation[];
  currentIndex: number;
  maxHistory: number;
}

// Hybrid filtering strategy interface
export interface FilteringStrategy {
  useClientSide: boolean;
  reason: 'dataset_size' | 'network_speed' | 'user_preference' | 'system_performance';
  threshold: number;
  fallbackToServer: boolean;
}
