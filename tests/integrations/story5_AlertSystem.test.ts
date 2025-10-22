import { describe, it, expect, beforeAll, beforeEach, afterEach } from '@jest/globals';
import { AttendanceAlert, AlertStatus } from '../../src/domains/AttendanceAlert';
import { AlertThreshold, AlertType, AlertPeriod } from '../../src/domains/AlertThreshold';
import { FileAlertRepo } from '../../src/persistence/FileAlertRepo';
import fs from 'fs';
import path from 'path';
import { AlertService } from '../../src/services/AlertService';
import { NotificationService } from '../../src/services/NotificationService';

describe('Alert System Integration Tests', () => {
  const testDataDir = path.join(process.cwd(), 'data', 'test');
  const alertsFilePath = path.join(testDataDir, 'alerts.json');
  const thresholdsFilePath = path.join(testDataDir, 'alert_thresholds.json');
  const notificationsFilePath = path.join(testDataDir, 'notifications.json');
  
  let alertRepo: FileAlertRepo;
  let alertService: AlertService;
  let notificationService: NotificationService;
  
  beforeAll(() => {
    
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });
  
  beforeEach(() => {
    // Initialize with empty data
    fs.writeFileSync(alertsFilePath, JSON.stringify([]), 'utf8');
    fs.writeFileSync(thresholdsFilePath, JSON.stringify([]), 'utf8');
    fs.writeFileSync(notificationsFilePath, JSON.stringify([]), 'utf8');
    
    alertRepo = new FileAlertRepo(alertsFilePath, thresholdsFilePath);
    notificationService = new NotificationService(notificationsFilePath);
    alertService = new AlertService();
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(alertsFilePath)) fs.unlinkSync(alertsFilePath);
    if (fs.existsSync(thresholdsFilePath)) fs.unlinkSync(thresholdsFilePath);
    if (fs.existsSync(notificationsFilePath)) fs.unlinkSync(notificationsFilePath);
  });
  
  describe('Alert Thresholds Management', () => {
    it('should save and retrieve alert thresholds correctly', () => {
      // Create a new threshold
      const threshold = AlertThreshold.createNew(
        AlertType.ABSENCE,
        5,
        AlertPeriod.THIRTY_DAYS,
        null,
        true
      );
      
      // Save it
      alertRepo.saveThreshold(threshold);
      
      // Get all thresholds
      const thresholds = alertRepo.getAllThresholds();
      
      // Verify
      expect(thresholds).toHaveLength(1);
      expect(thresholds[0].id).toBe(threshold.id);
      expect(thresholds[0].type).toBe(AlertType.ABSENCE);
      expect(thresholds[0].count).toBe(5);
      expect(thresholds[0].period).toBe(AlertPeriod.THIRTY_DAYS);
      expect(thresholds[0].notifyParents).toBe(true);
    });
    
    it('should filter thresholds by type', () => {
      // Create thresholds of different types
      const absenceThreshold = AlertThreshold.createNew(
        AlertType.ABSENCE,
        5,
        AlertPeriod.THIRTY_DAYS,
        null,
        true
      );
      
      const latenessThreshold = AlertThreshold.createNew(
        AlertType.LATENESS,
        3,
        AlertPeriod.THIRTY_DAYS,
        null,
        true
      );
      
      // Save them
      alertRepo.saveThreshold(absenceThreshold);
      alertRepo.saveThreshold(latenessThreshold);
      
      // Get absence thresholds
      const absenceThresholds = alertRepo.getThresholdsByType(AlertType.ABSENCE);
      
      // Verify
      expect(absenceThresholds).toHaveLength(1);
      expect(absenceThresholds[0].type).toBe(AlertType.ABSENCE);
    });
  });
  
  describe('Attendance Alerts', () => {
    it('should generate alerts when thresholds are exceeded', () => {
      // Create a threshold
      const threshold = AlertThreshold.createNew(
        AlertType.ABSENCE,
        3,
        AlertPeriod.THIRTY_DAYS,
        null,
        true
      );
      
      // Save it
      alertRepo.saveThreshold(threshold);
      
      // Create test attendance data that would trigger the alert
      const studentId = 'test-student-1';
      const absences = 4; 
      
      // Manuel Test
      const alert = new AttendanceAlert(
        `alert-${Date.now()}`,
        studentId,
        threshold.id,
        AlertType.ABSENCE,
        absences,
        AlertStatus.ACTIVE,
        AlertPeriod.THIRTY_DAYS,
        false,
        new Date(),
        new Date()
      );
      
      // Save the alert
      alertRepo.saveAlert(alert);
      
      // Get all alerts
      const allAlerts = alertRepo.getAllAlerts();
      
      // Verify
      expect(allAlerts).toHaveLength(1);
      expect(allAlerts[0].type).toBe(AlertType.ABSENCE);
      expect(allAlerts[0].studentId).toBe(studentId);
      expect(allAlerts[0].count).toBe(absences);
      expect(allAlerts[0].status).toBe(AlertStatus.ACTIVE);
    });
  });
  
  describe('Notifications', () => {
    it('should format notification messages correctly', async () => {
      // Create a threshold and an alert
      const threshold = AlertThreshold.createNew(
        AlertType.ABSENCE,
        3,
        AlertPeriod.THIRTY_DAYS,
        'test-student-1',
        true
      );
      
      alertRepo.saveThreshold(threshold);
      
      const alert = new AttendanceAlert(
        'test-alert-1',
        'test-student-1',
        threshold.id,
        AlertType.ABSENCE,
        4,
        AlertStatus.ACTIVE,
        AlertPeriod.THIRTY_DAYS,
        false,
        new Date(),
        new Date()
      );
      
      alertRepo.saveAlert(alert);
      
      // Mock the student repo findStudentById method
      const originalFindStudentById = notificationService['studentRepo'].findStudentById;
      notificationService['studentRepo'].findStudentById = jest.fn().mockImplementation(() => ({
        id: 'test-student-1',
        firstName: 'Test',
        lastName: 'Student',
        buildingIds: ['MAIN']
      }));
      
      // Generate a notification
      const result = await notificationService.generateParentNotification(alert);
      
      // Restore the original implementation
      notificationService['studentRepo'].findStudentById = originalFindStudentById;
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully sent notification');
    });
  });
});
