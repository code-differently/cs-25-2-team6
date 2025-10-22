/**
 * Schedule-related TypeScript interfaces for User Story 3
 */

import { z } from 'zod';
import { DayOffReason } from '../domains/DayOffReason';
import { ScheduledDayOff } from '../domains/ScheduledDayOff';

export interface Schedule extends ScheduledDayOff {
  id: string;
  customReason?: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  notifyStudents: boolean;
  bulkExcusesApplied: boolean;
  affectedStudentCount?: number;
}

export interface ScheduleFormData {
  date: string;
  reason: DayOffReason;
  customReason?: string;
  description?: string;
  notifyStudents: boolean;
  applyBulkExcuses: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
  warnings?: string[];
}

export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflictDetails?: {
    existingSchedule: Schedule;
    conflictType: 'DUPLICATE_DATE' | 'OVERLAPPING_PERIOD';
    suggestion?: string;
  };
}

export interface BulkExcuseResult {
  success: boolean;
  studentsExcused: number;
  failedCount: number;
  failedStudentIds: string[];
  errors: Array<{
    studentId: string;
    error: string;
  }>;
  timestamp: Date;
}

export interface ScheduleCalendarData {
  period: {
    year: number;
    month: number;
  };
  schedules: Schedule[];
  scheduledDays: Map<string, Schedule[]>;
  statistics: {
    totalScheduledDays: number;
    totalAffectedStudents: number;
    reasonBreakdown: Record<DayOffReason, number>;
  };
}

export interface ScheduleDashboardSummary {
  upcomingSchedules: Schedule[];
  recentSchedules: Schedule[];
  stats: {
    totalSchedulesThisYear: number;
    totalStudentsAffected: number;
    mostCommonReason: DayOffReason;
    nextScheduledDate?: string;
  };
}

export interface ScheduleNotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  advanceNoticeDays: number;
  sendReminders: boolean;
  reminderDays: number[];
}

export interface ScheduleFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  reasons?: DayOffReason[];
  createdBy?: string[];
  notificationSent?: boolean;
  bulkExcusesApplied?: boolean;
}

export interface ScheduleQuery {
  search?: string;
  filters?: ScheduleFilters;
  pagination: {
    page: number;
    limit: number;
    sortBy: 'date' | 'reason' | 'createdAt' | 'affectedStudentCount';
    sortOrder: 'asc' | 'desc';
  };
}

export interface ScheduleResponse {
  data: Schedule[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metadata?: {
    summary: ScheduleDashboardSummary;
    filters: ScheduleFilters;
  };
}

// Zod schemas for runtime validation
export const ScheduleFormDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  reason: z.nativeEnum(DayOffReason),
  customReason: z.string().min(3).max(100).optional(),
  description: z.string().max(255).optional(),
  notifyStudents: z.boolean().default(true),
  applyBulkExcuses: z.boolean().default(true)
}).refine(
  (data) => {
    if (data.reason === DayOffReason.OTHER) {
      return data.customReason && data.customReason.trim().length >= 3;
    }
    return true;
  },
  {
    message: 'Custom reason is required when selecting "Other"',
    path: ['customReason']
  }
);

export const ScheduleFiltersSchema = z.object({
  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).optional(),
  reasons: z.array(z.nativeEnum(DayOffReason)).optional(),
  createdBy: z.array(z.string()).optional(),
  notificationSent: z.boolean().optional(),
  bulkExcusesApplied: z.boolean().optional()
});

export const ScheduleQuerySchema = z.object({
  search: z.string().optional(),
  filters: ScheduleFiltersSchema.optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.enum(['date', 'reason', 'createdAt', 'affectedStudentCount']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  })
});

export type ScheduleFormInput = z.infer<typeof ScheduleFormDataSchema>;
export type ScheduleFiltersInput = z.infer<typeof ScheduleFiltersSchema>;
export type ScheduleQueryInput = z.infer<typeof ScheduleQuerySchema>;
