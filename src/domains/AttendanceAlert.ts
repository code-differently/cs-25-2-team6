import { AlertType, AlertPeriod } from './AlertThreshold';

/**
 * Status of an attendance alert
 */
export enum AlertStatus {
  ACTIVE = 'ACTIVE',           // Alert is active and needs attention
  DISMISSED = 'DISMISSED',     // Alert was manually cleared by teacher
  PARENT_NOTIFIED = 'PARENT_NOTIFIED', // Parents have been notified
  RESOLVED = 'RESOLVED'        // Student's attendance has improved
}

/**
 * Represents an alert for a student who has crossed an attendance threshold
 */
export class AttendanceAlert {
  /**
   * Creates a new AttendanceAlert
   * 
   * @param id Unique identifier for the alert
   * @param studentId ID of the student with attendance issue
   * @param thresholdId ID of the threshold that triggered this alert
   * @param type Type of attendance issue (absence, lateness, cumulative)
   * @param count Current count of absences/latenesses
   * @param status Current status of the alert
   * @param period Time period this alert covers (30 days or cumulative)
   * @param notificationSent Whether a notification has been sent to parents
   * @param createdAt Creation timestamp
   * @param updatedAt Last update timestamp
   */
  constructor(
    public readonly id: string,
    public studentId: string,
    public thresholdId: string,
    public type: AlertType,
    public count: number,
    public status: AlertStatus,
    public period: AlertPeriod,
    public notificationSent: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Factory method to create a new AttendanceAlert with a generated ID
   */
  static createNew(
    studentId: string,
    thresholdId: string,
    type: AlertType,
    count: number,
    period: AlertPeriod
  ): AttendanceAlert {
    return new AttendanceAlert(
      `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      studentId,
      thresholdId,
      type,
      count,
      AlertStatus.ACTIVE,
      period
    );
  }

  /**
   * Mark the alert as dismissed by a teacher
   */
  dismiss(): void {
    this.status = AlertStatus.DISMISSED;
    this.updatedAt = new Date();
  }

  /**
   * Mark the alert as having parent notification sent
   */
  markParentNotified(): void {
    this.status = AlertStatus.PARENT_NOTIFIED;
    this.notificationSent = true;
    this.updatedAt = new Date();
  }

  /**
   * Mark the alert as resolved (attendance has improved)
   */
  resolve(): void {
    this.status = AlertStatus.RESOLVED;
    this.updatedAt = new Date();
  }

  /**
   * Update the count of absences/latenesses
   */
  updateCount(newCount: number): void {
    this.count = newCount;
    this.updatedAt = new Date();
  }
}

/**
 * Filter options for retrieving alerts
 */
export interface AlertFilters {
  studentId?: string;
  status?: AlertStatus[];
  type?: AlertType[];
  period?: AlertPeriod;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Result of an alert calculation process
 */
export interface AlertResult {
  triggered: boolean;
  alert?: AttendanceAlert;
  currentCount: number;
  thresholdCount: number;
}

/**
 * Result of batch alert processing
 */
export interface BatchAlertResult {
  processed: number;
  triggered: number;
  notificationsSent: number;
  errors: string[];
}

/**
 * Notification result for parent alerts
 */
export interface NotificationResult {
  success: boolean;
  alertId: string;
  method: 'email' | 'sms' | 'app';
  sentAt: Date;
  recipientId: string;
  error?: string;
}

/**
 * Alert statistics for dashboard display
 */
export interface AlertStatistics {
  totalActive: number;
  newToday: number;
  resolvedToday: number;
  byType: Record<AlertType, number>;
  studentsWithAlerts: number;
  pendingNotifications: number;
  averageResolutionTime: number; // in hours
}

/**
 * Alert trend data for analytics
 */
export interface AlertTrend {
  period: string; // ISO date
  newAlerts: number;
  resolvedAlerts: number;
  activeAlerts: number;
  byType: Record<AlertType, number>;
}

/**
 * Extended AttendanceAlert methods for User Story 4 functionality
 */
declare module './AttendanceAlert' {
  namespace AttendanceAlert {
    interface AttendanceAlert {
      /**
       * Check if this alert requires immediate attention
       */
      isUrgent(): boolean;
      
      /**
       * Get the number of days this alert has been active
       */
      getDaysActive(): number;
      
      /**
       * Check if parent notification is overdue
       */
      isNotificationOverdue(): boolean;
      
      /**
       * Get severity level based on count vs threshold
       */
      getSeverityLevel(): import('../types/alerts').AlertSeverity;
      
      /**
       * Calculate priority score for sorting
       */
      getPriorityScore(): number;
    }
  }
}
