import { AttendanceAlert } from '../domains/AttendanceAlert';
import { AlertThreshold } from '../domains/AlertThreshold';
import { FileStudentRepo } from '../persistence/FileStudentRepo';

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
 * Service for handling parent notifications about attendance alerts
 */
export class NotificationService {
  private studentRepo: FileStudentRepo;
  
  constructor() {
    this.studentRepo = new FileStudentRepo();
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
      
      console.log(`[NOTIFICATION] Alert for ${student.name} (ID: ${student.id})`);
      console.log(`Type: ${alert.type}, Count: ${alert.count}, Period: ${alert.period}`);
      
      // Simulate a successful notification
      return {
        success: true,
        message: `Successfully sent notification to parents of ${student.name}`,
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
