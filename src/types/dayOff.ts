/**
 * Day off type definitions for User Story 3
 */

import { z } from 'zod';
import { DayOffReason } from '../domains/DayOffReason';
import { ScheduledDayOff } from '../domains/ScheduledDayOff';

export interface DayOff extends ScheduledDayOff {
  id: string;
  customReason?: string;
  description?: string;
  metadata: {
    scheduledBy: string;
    scheduledAt: Date;
    lastModified: Date;
    notificationsSent: boolean;
    bulkExcusesApplied: boolean;
    affectedStudentCount: number;
  };
  status: DayOffStatus;
}

export enum DayOffStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface CreateDayOffRequest {
  date: string;
  reason: DayOffReason;
  customReason?: string;
  description?: string;
  sendNotifications: boolean;
  autoExcuseStudents: boolean;
}

export interface UpdateDayOffRequest {
  reason?: DayOffReason;
  customReason?: string;
  description?: string;
  sendNotifications?: boolean;
}

export interface DayOffSummary {
  dayOff: DayOff;
  impact: {
    totalStudents: number;
    studentsExcused: number;
    excuseSuccessRate: number;
  };
  relatedAttendance?: {
    recordsAffected: number;
    processingErrors: string[];
  };
}

export interface DayOffCalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  allDay: boolean;
  /** Event status for styling */
  status: DayOffStatus;
  /** Number of affected students for tooltip */
  affectedCount: number;
}

// Day off statistics
export interface DayOffStatistics {
  /** Total days off scheduled this year */
  totalDaysOff: number;
  /** Breakdown by reason */
  reasonBreakdown: Record<DayOffReason, number>;
  /** Breakdown by month */
  monthlyBreakdown: Record<string, number>;
  /** Total students affected across all days off */
  totalStudentsAffected: number;
  /** Average students affected per day off */
  averageStudentsPerDayOff: number;
  /** Most common reason */
  mostCommonReason: DayOffReason;
  /** Upcoming days off count */
  upcomingDaysOff: number;
}

// Day off notification details
export interface DayOffNotification {
  /** Notification ID */
  id: string;
  /** Associated day off ID */
  dayOffId: string;
  /** Notification type */
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM';
  /** Recipients */
  recipients: NotificationRecipient[];
  /** Notification content */
  content: {
    subject: string;
    message: string;
    templateId?: string;
  };
  /** Delivery status */
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  /** Timestamps */
  scheduledAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
}

// Notification recipient
export interface NotificationRecipient {
  /** Recipient type */
  type: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
  /** Recipient ID */
  id: string;
  /** Contact information */
  contact: string; // email, phone, etc.
  /** Delivery status for this recipient */
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  /** Error message if failed */
  error?: string;
}

// Day off batch operations
export interface DayOffBatchOperation {
  /** Operation ID */
  id: string;
  /** Operation type */
  type: 'CREATE_MULTIPLE' | 'UPDATE_MULTIPLE' | 'DELETE_MULTIPLE' | 'BULK_EXCUSE';
  /** Operation status */
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_FAILED';
  /** Items being processed */
  items: Array<{
    dayOffId?: string;
    request: CreateDayOffRequest | UpdateDayOffRequest;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    error?: string;
  }>;
  /** Operation metadata */
  metadata: {
    initiatedBy: string;
    initiatedAt: Date;
    completedAt?: Date;
    totalItems: number;
    successCount: number;
    failureCount: number;
  };
}

// Zod schemas for validation
export const CreateDayOffRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  reason: z.nativeEnum(DayOffReason),
  customReason: z.string().min(3).max(100).optional(),
  description: z.string().max(255).optional(),
  sendNotifications: z.boolean().default(true),
  autoExcuseStudents: z.boolean().default(true)
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

export const UpdateDayOffRequestSchema = z.object({
  reason: z.nativeEnum(DayOffReason).optional(),
  customReason: z.string().min(3).max(100).optional(),
  description: z.string().max(255).optional(),
  sendNotifications: z.boolean().optional()
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

export const DayOffStatusSchema = z.nativeEnum(DayOffStatus);

export const NotificationRecipientSchema = z.object({
  type: z.enum(['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']),
  id: z.string(),
  contact: z.string(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED']),
  error: z.string().optional()
});

// Type exports for inference
export type CreateDayOffInput = z.infer<typeof CreateDayOffRequestSchema>;
export type UpdateDayOffInput = z.infer<typeof UpdateDayOffRequestSchema>;
export type NotificationRecipientInput = z.infer<typeof NotificationRecipientSchema>;
