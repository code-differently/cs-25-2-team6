/**
 * Report-related TypeScript interfaces and Zod schemas for User Story 2
 */

import { z } from 'zod';
import { AttendanceStatus } from '../domains/AttendanceStatus';

// Zod schema for attendance status enum
export const AttendanceStatusSchema = z.enum([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.ABSENT,
  AttendanceStatus.EXCUSED
]);

// Zod schema for date range validation
export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before or equal to end date' }
).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365; // 1 year max
  },
  { message: 'Date range cannot exceed 1 year' }
).refine(
  (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate <= today && endDate <= today;
  },
  { message: 'Future dates are not allowed' }
);

// Zod schema for student selection
export const StudentSelectionSchema = z.object({
  studentIds: z.array(z.string().min(1, 'Student ID cannot be empty')).optional(),
  searchQuery: z.string().max(100, 'Search query too long').optional(),
  classIds: z.array(z.string().min(1, 'Class ID cannot be empty')).optional()
});

// Zod schema for pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1).max(100, 'Limit cannot exceed 100').default(20),
  sortBy: z.enum(['date', 'studentName', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Main report filters schema
export const ReportFiltersSchema = z.object({
  dateRange: DateRangeSchema.optional(),
  attendanceStatus: z.array(AttendanceStatusSchema).optional(),
  studentSelection: StudentSelectionSchema.optional(),
  pagination: PaginationSchema.optional()
});

// Preset date ranges
export const PresetRangeSchema = z.enum([
  'thisWeek',
  'lastWeek', 
  'thisMonth',
  'lastMonth',
  'thisYear',
  'ytd', // Year to date
  'custom'
]);

// Report data interface
export const ReportDataSchema = z.object({
  studentId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateISO: z.string(),
  status: AttendanceStatusSchema,
  late: z.boolean(),
  earlyDismissal: z.boolean(),
  classId: z.string().optional(),
  className: z.string().optional()
});

// Report summary statistics
export const ReportSummarySchema = z.object({
  totalRecords: z.number(),
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  excusedCount: z.number(),
  earlyDismissalCount: z.number(),
  dateRange: DateRangeSchema,
  generatedAt: z.string() // ISO timestamp
});

// Validation result schema
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
});

// TypeScript interfaces inferred from Zod schemas
export type AttendanceStatusType = z.infer<typeof AttendanceStatusSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type StudentSelection = z.infer<typeof StudentSelectionSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ReportFilters = z.infer<typeof ReportFiltersSchema>;
export type PresetRange = z.infer<typeof PresetRangeSchema>;
export type ReportData = z.infer<typeof ReportDataSchema>;
export type ReportSummary = z.infer<typeof ReportSummarySchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Report request interface for API calls
export interface ReportRequest {
  filters: ReportFilters;
  includeStats: boolean;
  format: 'json' | 'csv'; // For future export features
}

// Report response interface
export interface ReportResponse {
  data: ReportData[];
  summary: ReportSummary;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
