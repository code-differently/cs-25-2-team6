import { ReportService } from './ReportService';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { AttendanceAlert, AlertStatus, AlertFilters, BatchAlertResult } from '../domains/AttendanceAlert';
import { AlertThreshold, AlertType, AlertPeriod, ValidationResult } from '../domains/AlertThreshold';
import { FileAlertRepo } from '../persistence/FileAlertRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileScheduleRepo } from '../persistence/FileScheduleRepo';
import { NotificationService, NotificationResult } from './NotificationService';

export interface AlertRules {
  absences30?: number;
  lates30?: number;
  absencesTotal?: number;
  latesTotal?: number;
}

// Legacy interface - kept for backward compatibility
export interface AlertResult {
  shouldAlert: boolean;
  reasons: string[];
}

// New interface for threshold checking
export interface ThresholdResult {
  triggered: boolean;
  alert?: AttendanceAlert;
  currentCount: number;
  thresholdCount: number;
}

export class AlertService {
  private reportService = new ReportService();
  private alertRepo: FileAlertRepo;
  private attendanceRepo: FileAttendanceRepo;
  private studentRepo: FileStudentRepo;
  private scheduleRepo: FileScheduleRepo;
  private notificationService: NotificationService;
  
  constructor() {
    this.alertRepo = new FileAlertRepo();
    this.attendanceRepo = new FileAttendanceRepo();
    this.studentRepo = new FileStudentRepo();
    this.scheduleRepo = new FileScheduleRepo();
    this.notificationService = new NotificationService();
  }

  /**
   * Legacy method for checking thresholds - kept for backward compatibility
   */
  checkThresholds(studentId: string, whenISO: string, rules: AlertRules): AlertResult {
    const reasons: string[] = [];
    // Last 30 days window
    const end = new Date(whenISO);
    const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
    const buckets = this.reportService.getHistoryByTimeframe({
      studentId,
      timeframe: 'DAILY',
      startISO: start.toISOString().slice(0, 10),
      endISO: end.toISOString().slice(0, 10)
    });
    let absences30 = 0, lates30 = 0;
    for (const b of buckets) {
      absences30 += b.absent;
      lates30 += b.late;
    }
    // All time (or YTD)
    const ytd = this.reportService.getYearToDateSummary(studentId);
    const absencesTotal = ytd.absent;
    const latesTotal = ytd.late;
    // Debug output (remove after fixing)
    // console.log(`Debug AlertService: studentId=${studentId}, ytd=${JSON.stringify(ytd)}, buckets.length=${buckets.length}`);
    if (rules.absences30 !== undefined && absences30 >= rules.absences30) {
      reasons.push(`absences in last 30 days (${absences30}) >= threshold (${rules.absences30})`);
    }
    if (rules.lates30 !== undefined && lates30 >= rules.lates30) {
      reasons.push(`lates in last 30 days (${lates30}) >= threshold (${rules.lates30})`);
    }
    if (rules.absencesTotal !== undefined && absencesTotal >= rules.absencesTotal) {
      reasons.push(`total absences (${absencesTotal}) >= threshold (${rules.absencesTotal})`);
    }
    if (rules.latesTotal !== undefined && latesTotal >= rules.latesTotal) {
      reasons.push(`total lates (${latesTotal}) >= threshold (${rules.latesTotal})`);
    }
    return { shouldAlert: reasons.length > 0, reasons };
  }

  /**
   * Legacy method for notification - kept for backward compatibility
   */
  notifyIfBreached(studentId: string, whenISO: string, rules: AlertRules, notifier: { send: (payload: any) => void }): AlertResult {
    const result = this.checkThresholds(studentId, whenISO, rules);
    if (result.shouldAlert) {
      notifier.send({ studentId, whenISO, reasons: result.reasons });
    }
    return result;
  }

  /**
   * Calculate attendance alerts based on attendance records
   * 
   * @param timeframe Whether to check 30-day window or cumulative records
   * @returns Array of triggered alerts
   */
  async calculateAttendanceAlerts(timeframe: 'THIRTY_DAYS' | 'CUMULATIVE'): Promise<AttendanceAlert[]> {
    const period = timeframe === 'THIRTY_DAYS' ? AlertPeriod.THIRTY_DAYS : AlertPeriod.CUMULATIVE;
    const triggeredAlerts: AttendanceAlert[] = [];
    
    // Get all students
    const students = this.studentRepo.allStudents();
    
    // Get applicable thresholds
    const thresholds = this.alertRepo.getAllThresholds().filter(t => t.period === period);
    
    // Process each student
    for (const student of students) {
      // Get student-specific thresholds, falling back to global thresholds
      const studentThresholds = thresholds.filter(t => t.studentId === student.id);
      const globalThresholds = thresholds.filter(t => t.studentId === null);
      
      // Apply student-specific thresholds if available, otherwise use global
      const applicableThresholds = studentThresholds.length > 0 ? studentThresholds : globalThresholds;
      
      // Check each threshold
      for (const threshold of applicableThresholds) {
        // Get attendance records for this student
        const attendanceRecords = this.getAttendanceRecords(student.id, timeframe);
        
        // Check if the threshold is violated
        const result = this.checkThresholdViolations(attendanceRecords, threshold);
        
        // If threshold violated, create or update alert
        if (result.triggered && result.alert) {
          triggeredAlerts.push(result.alert);
          this.alertRepo.saveAlert(result.alert);
        }
      }
    }
    
    return triggeredAlerts;
  }

  /**
   * Check if attendance records violate a threshold
   * 
   * @param attendanceRecords Attendance records to check
   * @param threshold Threshold to check against
   * @returns Result of the threshold check
   */
  checkThresholdViolations(attendanceRecords: any[], threshold: AlertThreshold): ThresholdResult {
    // Count relevant attendance issues based on threshold type
    let count = 0;
    
    if (threshold.type === AlertType.ABSENCE) {
      // Count unexcused absences
      count = attendanceRecords.filter(record => 
        record.status === AttendanceStatus.ABSENT
      ).length;
    } else if (threshold.type === AlertType.LATENESS) {
      // Count late arrivals
      count = attendanceRecords.filter(record => 
        record.status === AttendanceStatus.LATE
      ).length;
    } else if (threshold.type === AlertType.CUMULATIVE) {
      // Count both absences and latenesses
      count = attendanceRecords.filter(record => 
        record.status === AttendanceStatus.ABSENT || 
        record.status === AttendanceStatus.LATE
      ).length;
    }
    
    // Check if threshold is violated
    const triggered = count >= threshold.count;
    
    // Prepare result
    const result: ThresholdResult = {
      triggered,
      currentCount: count,
      thresholdCount: threshold.count
    };
    
    // If triggered, create or update an alert
    if (triggered) {
      // Extract student ID from the first record
      const studentId = attendanceRecords.length > 0 ? attendanceRecords[0].studentId : '';
      
      // Look for an existing active alert for this student and threshold
      const existingAlerts = this.alertRepo.getFilteredAlerts({
        studentId,
        type: [threshold.type],
        period: threshold.period,
        status: [AlertStatus.ACTIVE]
      });
      
      if (existingAlerts.length > 0) {
        // Update existing alert
        const alert = existingAlerts[0];
        alert.updateCount(count);
        result.alert = alert;
      } else {
        // Create new alert
        result.alert = AttendanceAlert.createNew(
          studentId,
          threshold.id,
          threshold.type,
          count,
          threshold.period
        );
      }
    }
    
    return result;
  }

  /**
   * Process automatic alerts and send notifications if configured
   * 
   * @returns Results of batch processing
   */
  async processAutomaticAlerts(): Promise<BatchAlertResult> {
    const result: BatchAlertResult = {
      processed: 0,
      triggered: 0,
      notificationsSent: 0,
      errors: []
    };
    
    try {
      // Calculate alerts for both timeframes
      const thirtyDayAlerts = await this.calculateAttendanceAlerts('THIRTY_DAYS');
      const cumulativeAlerts = await this.calculateAttendanceAlerts('CUMULATIVE');
      
      // Combine alerts
      const allAlerts = [...thirtyDayAlerts, ...cumulativeAlerts];
      result.processed = allAlerts.length;
      result.triggered = allAlerts.length;
      
      // Send notifications if configured
      for (const alert of allAlerts) {
        // Get the threshold that triggered this alert
        const threshold = this.alertRepo.getThresholdById(alert.thresholdId);
        
        // If threshold configured for parent notification and notification not yet sent
        if (threshold && threshold.notifyParents && !alert.notificationSent) {
          const notificationResult = await this.notificationService.generateParentNotification(alert);
          
          if (notificationResult.success) {
            alert.markParentNotified();
            this.alertRepo.saveAlert(alert);
            result.notificationsSent++;
          } else {
            result.errors.push(`Failed to notify parents for alert ${alert.id}: ${notificationResult.error}`);
          }
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Error processing alerts: ${errorMessage}`);
      return result;
    }
  }

  /**
   * Validate threshold settings for business rules
   * 
   * @param threshold Threshold settings to validate
   * @returns Validation result
   */
  validateThresholdSettings(threshold: AlertThreshold): ValidationResult {
    const errors: string[] = [];
    
    // Count must be positive
    if (threshold.count <= 0) {
      errors.push('Threshold count must be greater than zero');
    }
    
    // Must have a valid type
    if (!Object.values(AlertType).includes(threshold.type)) {
      errors.push('Invalid alert type');
    }
    
    // Must have a valid period
    if (!Object.values(AlertPeriod).includes(threshold.period)) {
      errors.push('Invalid alert period');
    }
    
    // If student-specific, verify student exists
    if (threshold.studentId !== null) {
      const student = this.studentRepo.findStudentById(threshold.studentId);
      if (!student) {
        errors.push(`Student with ID ${threshold.studentId} not found`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get alerts requiring intervention based on filters
   * 
   * @param filters Filters to apply
   * @returns Filtered alerts
   */
  async getAlertsRequiringIntervention(filters: AlertFilters): Promise<AttendanceAlert[]> {
    // Default to active alerts if no status filter provided
    if (!filters.status || filters.status.length === 0) {
      filters.status = [AlertStatus.ACTIVE];
    }
    
    return this.alertRepo.getFilteredAlerts(filters);
  }

  /**
   * Clear/dismiss an alert
   * 
   * @param alertId ID of the alert to dismiss
   * @returns Whether the operation was successful
   */
  dismissAlert(alertId: string): boolean {
    const alert = this.alertRepo.getFilteredAlerts({}).find(a => a.id === alertId);
    
    if (!alert) {
      return false;
    }
    
    alert.dismiss();
    this.alertRepo.saveAlert(alert);
    return true;
  }

  /**
   * Create or update an alert threshold
   * 
   * @param threshold The threshold to save
   * @returns Whether the operation was successful
   */
  saveThreshold(threshold: AlertThreshold): boolean {
    const validationResult = this.validateThresholdSettings(threshold);
    
    if (!validationResult.valid) {
      return false;
    }
    
    this.alertRepo.saveThreshold(threshold);
    return true;
  }

  /**
   * Get attendance records for a student within a specific timeframe
   * 
   * @param studentId Student ID
   * @param timeframe '30-DAY' or 'CUMULATIVE'
   * @returns Array of attendance records
   */
  private getAttendanceRecords(studentId: string, timeframe: 'THIRTY_DAYS' | 'CUMULATIVE'): any[] {
    // For 30-day timeframe, calculate date range
    if (timeframe === 'THIRTY_DAYS') {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Format dates as ISO strings (YYYY-MM-DD)
      const startDate = this.formatDateISO(thirtyDaysAgo);
      const endDate = this.formatDateISO(today);
      
      // Get records within date range
      return this.attendanceRepo.findByStudentAndDateRange(
        studentId,
        startDate,
        endDate
      ).filter((record: any) => !this.isScheduledDayOff(record.dateISO));
    } else {
      // For cumulative, get all records
      return this.attendanceRepo.findAllByStudent(studentId)
        .filter((record: any) => !this.isScheduledDayOff(record.dateISO));
    }
  }

  /**
   * Check if a date is a scheduled day off
   * 
   * @param dateISO Date in ISO format (YYYY-MM-DD)
   * @returns Whether the date is a scheduled day off
   */
  private isScheduledDayOff(dateISO: string): boolean {
    // Use schedule repository to check if this is a planned day off
    return this.scheduleRepo.hasDayOff(dateISO);
  }

  /**
   * Format a date as ISO string (YYYY-MM-DD)
   * 
   * @param date Date to format
   * @returns Formatted date string
   */
  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
