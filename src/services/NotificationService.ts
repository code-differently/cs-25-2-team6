import { AttendanceAlert } from '../domains/AttendanceAlert';
import { AlertThreshold } from '../domains/AlertThreshold';
import { FileStudentRepo, Student } from '../persistence/FileStudentRepo';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Result of a notification operation
 */
export interface NotificationResult {
  success: boolean;
  message: string;
  notificationId?: string;
  error?: string;
}

/**
 * Interface for notification data
 */
export interface Notification {
  id: string;
  alertId: string;
  parentId: string;
  studentId: string;
  message: string;
  status: 'SENT' | 'READ' | 'FAILED';
  sentAt: Date;
  readAt?: Date;
  method: 'EMAIL' | 'SMS' | 'APP';
}

/**
 * Interface for notification filter options
 */
export interface NotificationFilters {
  parentId?: string;
  studentId?: string;
  status?: string;
}

/**
 * Interface for notification send options
 */
export interface NotificationOptions {
  alert: AttendanceAlert;
  parentIds: string[];
  customMessage?: string;
  sendEmail?: boolean;
  sendSMS?: boolean;
}

/**
 * Service for handling parent notifications about attendance alerts
 */
export class NotificationService {
  private studentRepo: FileStudentRepo;
  private notificationsFilePath: string;
  
  constructor(notificationsFilePath?: string) {
    this.studentRepo = new FileStudentRepo();
    this.notificationsFilePath = notificationsFilePath ?? path.join(process.cwd(), 'data', 'notifications.json');
    
    // Ensure parent directory exists
    const notificationsDir = path.dirname(this.notificationsFilePath);
    if (!fs.existsSync(notificationsDir)) {
      fs.mkdirSync(notificationsDir, { recursive: true });
    }

    // Create file if it doesn't exist
    if (!fs.existsSync(this.notificationsFilePath)) {
      fs.writeFileSync(this.notificationsFilePath, JSON.stringify([]));
    }
  }

  /**
   * Generate a notification to parents about an attendance alert
   * 
   * @param alert The alert that triggered the notification
   * @returns Result of the notification attempt
   */
  async generateParentNotification(alert: AttendanceAlert): Promise<NotificationResult> {
    try {
      // Get the student information
      const student = this.studentRepo.findStudentById(alert.studentId);
      
      if (!student) {
        return {
          success: false,
          message: `Student with ID ${alert.studentId} not found`,
          error: 'STUDENT_NOT_FOUND'
        };
      }
      
      // For now, this is a placeholder that would integrate with an actual notification system
      // In a real implementation, this would send an email, SMS, or use another notification channel
      
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      console.log(`[NOTIFICATION] Alert for ${student.firstName} ${student.lastName} (ID: ${student.id})`);
      console.log(`Type: ${alert.type}, Count: ${alert.count}, Period: ${alert.period}`);
      
      // Simulate a successful notification
      return {
        success: true,
        message: `Successfully sent notification to parents of ${student.firstName} ${student.lastName}`,
        notificationId
      };
    } catch (error) {
      console.error('Error generating parent notification:', error);
      return {
        success: false,
        message: 'Failed to generate parent notification',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Send notifications to parents about an alert
   * 
   * @param options Notification options
   * @returns Array of notification results
   */
  async sendNotification(options: NotificationOptions): Promise<NotificationResult[]> {
    const { alert, parentIds, customMessage, sendEmail = false, sendSMS = false } = options;
    const results: NotificationResult[] = [];
    
    try {
      // Get the student information
      const student = this.studentRepo.findStudentById(alert.studentId);
      
      if (!student) {
        return [{
          success: false,
          message: `Student with ID ${alert.studentId} not found`,
          error: 'STUDENT_NOT_FOUND'
        }];
      }
      
      // Generate default message if custom message is not provided
      const message = customMessage || this.formatNotificationMessage(alert, `${student.firstName} ${student.lastName}`);
      
      // Process each parent ID
      for (const parentId of parentIds) {
        // Determine notification methods
        const methods: ('EMAIL' | 'SMS' | 'APP')[] = ['APP'];
        if (sendEmail) methods.push('EMAIL');
        if (sendSMS) methods.push('SMS');
        
        for (const method of methods) {
          const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Create notification record
          const notification: Notification = {
            id: notificationId,
            alertId: alert.id,
            parentId,
            studentId: student.id,
            message,
            status: 'SENT',
            sentAt: new Date(),
            method
          };
          
          // Save notification
          this.saveNotification(notification);
          
          results.push({
            success: true,
            message: `Notification sent to parent ${parentId} via ${method}`,
            notificationId
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return [{
        success: false,
        message: 'Failed to send notifications',
        error: error instanceof Error ? error.message : String(error)
      }];
    }
  }

  /**
   * Get notifications with optional filters
   * 
   * @param filters Optional filters for notifications
   * @returns Array of notifications
   */
  getNotifications(filters: NotificationFilters = {}): Notification[] {
    try {
      const notifications = this.getAllNotifications();
      let filtered = [...notifications];
      
      // Apply filters
      if (filters.parentId) {
        filtered = filtered.filter(n => n.parentId === filters.parentId);
      }
      
      if (filters.studentId) {
        filtered = filtered.filter(n => n.studentId === filters.studentId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(n => n.status === filters.status);
      }
      
      return filtered;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }
  
  /**
   * Update the status of a notification
   * 
   * @param notificationId ID of the notification to update
   * @param status New status
   * @returns Success indicator
   */
  updateNotificationStatus(notificationId: string, status: 'SENT' | 'READ' | 'FAILED'): boolean {
    try {
      const notifications = this.getAllNotifications();
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex === -1) {
        return false;
      }
      
      notifications[notificationIndex].status = status;
      
      // If marking as read, update the readAt timestamp
      if (status === 'READ') {
        notifications[notificationIndex].readAt = new Date();
      }
      
      // Save updated notifications
      fs.writeFileSync(this.notificationsFilePath, JSON.stringify(notifications, null, 2));
      return true;
    } catch (error) {
      console.error('Error updating notification status:', error);
      return false;
    }
  }
  
  /**
   * Get all notifications
   * 
   * @returns Array of all notifications
   */
  private getAllNotifications(): Notification[] {
    try {
      const data = fs.readFileSync(this.notificationsFilePath, 'utf-8');
      const notifications = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return notifications.map((notification: any) => ({
        ...notification,
        sentAt: new Date(notification.sentAt),
        readAt: notification.readAt ? new Date(notification.readAt) : undefined
      }));
    } catch (error) {
      console.error('Error reading notifications:', error);
      return [];
    }
  }
  
  /**
   * Save a notification
   * 
   * @param notification Notification to save
   */
  private saveNotification(notification: Notification): void {
    try {
      const notifications = this.getAllNotifications();
      const existingIndex = notifications.findIndex(n => n.id === notification.id);
      
      if (existingIndex !== -1) {
        notifications[existingIndex] = notification;
      } else {
        notifications.push(notification);
      }
      
      fs.writeFileSync(this.notificationsFilePath, JSON.stringify(notifications, null, 2));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Format a notification message based on alert information
   * 
   * @param alert The attendance alert
   * @param student The student information
   * @returns Formatted notification message
   */
  private formatNotificationMessage(alert: AttendanceAlert, studentName: string): string {
    const alertTypeText = alert.type === 'ABSENCE' ? 'absences' : 'late arrivals';
    const periodText = alert.period === 'THIRTY_DAYS' ? 'in the last 30 days' : 'cumulatively this term';
    
    return `ATTENDANCE ALERT: ${studentName} has accumulated ${alert.count} ${alertTypeText} ${periodText}, ` +
      `which exceeds the threshold. Please contact the school to discuss attendance improvement strategies.`;
  }
}
