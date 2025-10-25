/**
 * Alert calculation engine for attendance threshold monitoring
 * 
 * This module provides the core business logic for calculating student alerts
 * based on attendance patterns and configured thresholds.
 * 
 * @fileoverview Attendance alert calculation utilities for User Story 4
 * @version 1.0.0
 */

import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { AlertType, AlertPeriod } from '../domains/AlertThreshold';
import { SimpleAlertCalculationResult } from '../types/alerts';
import { SimpleThresholdFormData } from '../types/thresholds';
import { TIME_CONSTANTS } from '../constants/alertConstants';

/**
 * Calculates alert status for a student based on attendance records and thresholds
 */
export function calculateStudentAlerts(
  studentId: string,
  attendanceRecords: AttendanceRecord[],
  thresholds: SimpleThresholdFormData
): SimpleAlertCalculationResult {
  // Filter records for this specific student
  const studentRecords = attendanceRecords.filter(record => record.studentId === studentId);

  // Calculate current counts
  const absences30Day = countAbsencesInPeriod(studentRecords, TIME_CONSTANTS.THIRTY_DAYS);
  const absencesCumulative = countAbsencesCumulative(studentRecords);
  const lateness30Day = countLatenessInPeriod(studentRecords, TIME_CONSTANTS.THIRTY_DAYS);
  const latenessCumulative = countLatenessCumulative(studentRecords);

  // Check which thresholds are triggered
  const triggeredAlerts = [];

  if (absences30Day >= thresholds.absences30Day) {
    triggeredAlerts.push({
      type: AlertType.ABSENCE,
      period: AlertPeriod.THIRTY_DAYS,
      currentCount: absences30Day,
      thresholdCount: thresholds.absences30Day
    });
  }

  if (absencesCumulative >= thresholds.absencesCumulative) {
    triggeredAlerts.push({
      type: AlertType.ABSENCE,
      period: AlertPeriod.CUMULATIVE,
      currentCount: absencesCumulative,
      thresholdCount: thresholds.absencesCumulative
    });
  }

  if (lateness30Day >= thresholds.lateness30Day) {
    triggeredAlerts.push({
      type: AlertType.LATENESS,
      period: AlertPeriod.THIRTY_DAYS,
      currentCount: lateness30Day,
      thresholdCount: thresholds.lateness30Day
    });
  }

  if (latenessCumulative >= thresholds.latenessCumulative) {
    triggeredAlerts.push({
      type: AlertType.LATENESS,
      period: AlertPeriod.CUMULATIVE,
      currentCount: latenessCumulative,
      thresholdCount: thresholds.latenessCumulative
    });
  }

  return {
    studentId,
    absences30Day,
    absencesCumulative,
    lateness30Day,
    latenessCumulative,
    thresholds: {
      absences30Day: thresholds.absences30Day,
      absencesCumulative: thresholds.absencesCumulative,
      lateness30Day: thresholds.lateness30Day,
      latenessCumulative: thresholds.latenessCumulative
    },
    triggeredAlerts
  };
}

/**
 * Counts absences within a specific time period (rolling window)
 */
export function countAbsencesInPeriod(records: AttendanceRecord[], days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return records.filter(record => {
    const recordDate = new Date(record.dateISO);
    return recordDate >= cutoffDate && 
           (record.status === AttendanceStatus.ABSENT);
  }).length;
}

/**
 * Counts total cumulative absences for all time
 */
export function countAbsencesCumulative(records: AttendanceRecord[]): number {
  return records.filter(record => 
    record.status === AttendanceStatus.ABSENT
  ).length;
}

/**
 * Counts lateness within a specific time period (rolling window)
 */
export function countLatenessInPeriod(records: AttendanceRecord[], days: number): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return records.filter(record => {
    const recordDate = new Date(record.dateISO);
    return recordDate >= cutoffDate && 
           (record.status === AttendanceStatus.LATE || record.late === true);
  }).length;
}

/**
 * Counts total cumulative lateness for all time
 */
export function countLatenessCumulative(records: AttendanceRecord[]): number {
  return records.filter(record => 
    record.status === AttendanceStatus.LATE || record.late === true
  ).length;
}

/**
 * Calculates how many days a student has been over a specific threshold
 */
export function calculateDaysOverThreshold(
  records: AttendanceRecord[],
  threshold: number,
  type: 'absence' | 'lateness'
): number {
  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
  );

  let count = 0;
  let daysOver = 0;

  for (const record of sortedRecords) {
    // Count relevant events
    if (type === 'absence' && record.status === AttendanceStatus.ABSENT) {
      count++;
    } else if (type === 'lateness' && (record.status === AttendanceStatus.LATE || record.late === true)) {
      count++;
    }

    // Check if we're over threshold
    if (count >= threshold) {
      daysOver++;
    }
  }

  return daysOver;
}

/**
 * Batch calculates alerts for multiple students
 */
export function calculateBatchAlerts(
  studentIds: string[],
  attendanceRecords: AttendanceRecord[],
  thresholds: SimpleThresholdFormData
): SimpleAlertCalculationResult[] {
  return studentIds.map(studentId => 
    calculateStudentAlerts(studentId, attendanceRecords, thresholds)
  );
}

/**
 * Filters attendance records within a date range
 */
export function filterRecordsByDateRange(
  records: AttendanceRecord[],
  startDate: Date,
  endDate: Date
): AttendanceRecord[] {
  return records.filter(record => {
    const recordDate = new Date(record.dateISO);
    return recordDate >= startDate && recordDate <= endDate;
  });
}

/**
 * Gets recent attendance trend for a student
 */
export function getAttendanceTrend(
  records: AttendanceRecord[],
  days: number = 14
): {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentRecords = records.filter(record => {
    const recordDate = new Date(record.dateISO);
    return recordDate >= cutoffDate;
  });

  const totalDays = recentRecords.length;
  const presentDays = recentRecords.filter(r => 
    r.status === AttendanceStatus.PRESENT
  ).length;
  const absentDays = recentRecords.filter(r => 
    r.status === AttendanceStatus.ABSENT
  ).length;
  const lateDays = recentRecords.filter(r => 
    r.status === AttendanceStatus.LATE || r.late === true
  ).length;

  const attendanceRate = totalDays > 0 ? 
    ((presentDays + lateDays) / totalDays) * 100 : 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendanceRate: Math.round(attendanceRate * 100) / 100 // Round to 2 decimal places
  };
}

/**
 * Checks if a student is approaching any threshold (within 1-2 occurrences)
 */
export function isApproachingThreshold(
  calculation: SimpleAlertCalculationResult,
  warningBuffer: number = 2
): {
  absences30Day: boolean;
  absencesCumulative: boolean;
  lateness30Day: boolean;
  latenessCumulative: boolean;
} {
  return {
    absences30Day: calculation.absences30Day >= (calculation.thresholds.absences30Day - warningBuffer),
    absencesCumulative: calculation.absencesCumulative >= (calculation.thresholds.absencesCumulative - warningBuffer),
    lateness30Day: calculation.lateness30Day >= (calculation.thresholds.lateness30Day - warningBuffer),
    latenessCumulative: calculation.latenessCumulative >= (calculation.thresholds.latenessCumulative - warningBuffer)
  };
}

/**
 * Utility function to validate date ranges for calculations
 */
export function validateDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate && 
         startDate <= new Date() && 
         endDate <= new Date();
}
