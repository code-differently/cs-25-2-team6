import * as fs from 'fs';
import * as path from 'path';
import { AttendanceAlert, AlertStatus, AlertFilters, BatchAlertResult } from '../domains/AttendanceAlert';
import { AlertThreshold, AlertType, AlertPeriod } from '../domains/AlertThreshold';

/**
 * Repository for persisting and retrieving alert and threshold data
 */
export class FileAlertRepo {
  private alertsFilePath: string;
  private thresholdsFilePath: string;

  /**
   * Creates a new FileAlertRepo
   * 
   * @param alertsFilePath Path to alerts JSON file
   * @param thresholdsFilePath Path to thresholds JSON file
   */
  constructor(alertsFilePath?: string, thresholdsFilePath?: string) {
    // Set up file paths with defaults if not provided
    this.alertsFilePath = alertsFilePath ?? path.join(process.cwd(), 'data', 'alerts.json');
    this.thresholdsFilePath = thresholdsFilePath ?? path.join(process.cwd(), 'data', 'alert_thresholds.json');

    // Ensure parent directory exists
    const alertsDir = path.dirname(this.alertsFilePath);
    const thresholdsDir = path.dirname(this.thresholdsFilePath);

    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true });
    }

    if (!fs.existsSync(thresholdsDir)) {
      fs.mkdirSync(thresholdsDir, { recursive: true });
    }

    // Create files if they don't exist
    if (!fs.existsSync(this.alertsFilePath)) {
      fs.writeFileSync(this.alertsFilePath, JSON.stringify([]));
    }

    if (!fs.existsSync(this.thresholdsFilePath)) {
      fs.writeFileSync(this.thresholdsFilePath, JSON.stringify([]));
    }
  }

  // --- Alert Methods ---

  /**
   * Save an attendance alert
   */
  saveAlert(alert: AttendanceAlert): void {
    const alerts = this.getAllAlerts();
    const existingIndex = alerts.findIndex(a => a.id === alert.id);

    if (existingIndex !== -1) {
      alerts[existingIndex] = alert;
    } else {
      alerts.push(alert);
    }

    fs.writeFileSync(this.alertsFilePath, JSON.stringify(alerts, null, 2));
  }

  /**
   * Get all attendance alerts
   */
  getAllAlerts(): AttendanceAlert[] {
    try {
      const data = fs.readFileSync(this.alertsFilePath, 'utf-8');
      const alerts = JSON.parse(data);

      // Convert dates from strings back to Date objects
      return alerts.map((alert: any) => {
        // Extract first and last name if studentName is present
        let firstName, lastName;
        if (alert.studentName) {
          const nameParts = alert.studentName.split(' ');
          firstName = nameParts[0];
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        } else {
          firstName = alert.studentFirstName || '';
          lastName = alert.studentLastName || '';
        }
        
        // Extract details if present, ensure ISO format for absence/tardy dates
        const details = alert.details ? {
          absenceDates: Array.isArray(alert.details.absenceDates)
            ? alert.details.absenceDates.map((d: string) => new Date(d).toISOString().split('T')[0])
            : [],
          tardyDates: Array.isArray(alert.details.tardyDates)
            ? alert.details.tardyDates.map((d: string) => new Date(d).toISOString().split('T')[0])
            : [],
          threshold: alert.details.threshold,
          currentValue: alert.details.currentValue,
          averageMinutesLate: alert.details.averageMinutesLate,
          pattern: alert.details.pattern
        } : undefined;
        
        return new AttendanceAlert(
          alert.id,
          alert.studentId,
          alert.thresholdId || '',
          alert.type,
          alert.count || 0,
          alert.status || AlertStatus.ACTIVE,
          alert.period || 'ROLLING_30',
          alert.notificationSent || false,
          alert.timestamp ? new Date(alert.timestamp) : new Date(),
          alert.updatedAt ? new Date(alert.updatedAt) : new Date(),
          firstName,
          lastName,
          details
        );
      });
    } catch (error) {
      console.error('Error reading alerts file:', error);
      return [];
    }
  }

  /**
   * Get alerts by student ID
   */
  getAlertsByStudent(studentId: string): AttendanceAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.studentId === studentId);
  }

  /**
   * Get alerts with filters
   */
  getFilteredAlerts(filters: AlertFilters): AttendanceAlert[] {
    let alerts = this.getAllAlerts();

    // Apply filters
    if (filters.studentId) {
      alerts = alerts.filter(alert => alert.studentId === filters.studentId);
    }

    if (filters.status && filters.status.length > 0) {
      alerts = alerts.filter(alert => filters.status!.includes(alert.status));
    }

    if (filters.type && filters.type.length > 0) {
      alerts = alerts.filter(alert => filters.type!.includes(alert.type));
    }

    if (filters.period) {
      alerts = alerts.filter(alert => alert.period === filters.period);
    }

    if (filters.dateFrom) {
      alerts = alerts.filter(alert => new Date(alert.createdAt) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      alerts = alerts.filter(alert => new Date(alert.createdAt) <= new Date(filters.dateTo!));
    }

    return alerts;
  }

  /**
   * Delete an alert by ID
   */
  deleteAlert(alertId: string): boolean {
    const alerts = this.getAllAlerts();
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    
    if (filteredAlerts.length < alerts.length) {
      fs.writeFileSync(this.alertsFilePath, JSON.stringify(filteredAlerts, null, 2));
      return true;
    }
    
    return false;
  }

  /**
   * Get active alerts requiring intervention
   */
  getActiveAlerts(): AttendanceAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.status === AlertStatus.ACTIVE);
  }

  // --- Threshold Methods ---

  /**
   * Save an alert threshold
   */
  saveThreshold(threshold: AlertThreshold): void {
    const thresholds = this.getAllThresholds();
    const existingIndex = thresholds.findIndex(t => t.id === threshold.id);

    if (existingIndex !== -1) {
      thresholds[existingIndex] = threshold;
    } else {
      thresholds.push(threshold);
    }

    fs.writeFileSync(this.thresholdsFilePath, JSON.stringify(thresholds, null, 2));
  }

  /**
   * Get all alert thresholds
   */
  getAllThresholds(): AlertThreshold[] {
    try {
      const data = fs.readFileSync(this.thresholdsFilePath, 'utf-8');
      const thresholds = JSON.parse(data);

      // Convert dates from strings back to Date objects
      return thresholds.map((threshold: any) => {
        return new AlertThreshold(
          threshold.id,
          threshold.type,
          threshold.count,
          threshold.period,
          threshold.studentId,
          threshold.notifyParents,
          new Date(threshold.createdAt),
          new Date(threshold.updatedAt)
        );
      });
    } catch (error) {
      console.error('Error reading thresholds file:', error);
      return [];
    }
  }

  /**
   * Get global thresholds (not specific to any student)
   */
  getGlobalThresholds(): AlertThreshold[] {
    const thresholds = this.getAllThresholds();
    return thresholds.filter(threshold => threshold.studentId === null);
  }

  /**
   * Get thresholds for a specific student
   */
  getThresholdsByStudent(studentId: string): AlertThreshold[] {
    const thresholds = this.getAllThresholds();
    return thresholds.filter(threshold => threshold.studentId === studentId);
  }

  /**
   * Get thresholds by type
   */
  getThresholdsByType(type: AlertType): AlertThreshold[] {
    const thresholds = this.getAllThresholds();
    return thresholds.filter(threshold => threshold.type === type);
  }

  /**
   * Delete a threshold by ID
   */
  deleteThreshold(thresholdId: string): boolean {
    const thresholds = this.getAllThresholds();
    const filteredThresholds = thresholds.filter(threshold => threshold.id !== thresholdId);
    
    if (filteredThresholds.length < thresholds.length) {
      fs.writeFileSync(this.thresholdsFilePath, JSON.stringify(filteredThresholds, null, 2));
      return true;
    }
    
    return false;
  }

  /**
   * Get a threshold by ID
   */
  getThresholdById(thresholdId: string): AlertThreshold | null {
    const thresholds = this.getAllThresholds();
    const threshold = thresholds.find(t => t.id === thresholdId);
    return threshold || null;
  }

  /**
   * Get an alert by ID
   */
  getAlertById(alertId: string): AttendanceAlert | null {
    const alerts = this.getAllAlerts();
    const alert = alerts.find(a => a.id === alertId);
    return alert || null;
  }
}
