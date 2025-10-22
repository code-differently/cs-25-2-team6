import { Student } from '../../src/domains/Student';

// Alert severity levels
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Alert types for different scenarios
export type AlertType = 'attendance' | 'tardiness' | 'absence_pattern' | 'performance' | 'system';

// Priority levels for alert processing
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

// Comprehensive attendance alert interface
export interface AttendanceAlert {
  id: string;
  studentId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  isDismissed: boolean;
  metadata?: {
    attendanceCount?: number;
    absenceStreak?: number;
    tardinessCount?: number;
    attendanceRate?: number;
  };
}

/**
 * Maps alert severity levels to their corresponding colors
 * @param severity - The severity level of the alert
 * @returns Hex color code for the severity level
 */
export function getAlertSeverityColor(severity: AlertSeverity): string {
  const severityColors: Record<AlertSeverity, string> = {
    low: '#10b981',      // Green - minor issues
    medium: '#f59e0b',   // Yellow - moderate attention needed
    high: '#f97316',     // Orange - requires prompt action
    critical: '#ef4444'  // Red - immediate action required
  };
  
  return severityColors[severity] || severityColors.medium;
}

/**
 * Formats alert dates for display with relative time
 * @param date - The alert date to format
 * @returns Formatted date string (e.g., "2 hours ago", "Yesterday", "Oct 20")
 */
export function formatAlertDate(date: Date): string {
  const now = new Date();
  const alertDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Handle invalid dates
  if (isNaN(alertDate.getTime())) {
    return 'Invalid date';
  }

  // Less than 1 minute ago
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  // Less than 1 hour ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  // Less than 24 hours ago
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  // Yesterday
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  
  // Less than 7 days ago
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  // More than a week ago - show actual date
  return alertDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: alertDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Returns the appropriate icon identifier for different alert types
 * @param type - The type of alert
 * @returns Icon identifier string for the alert type
 */
export function getAlertTypeIcon(type: AlertType): string {
  const typeIcons: Record<AlertType, string> = {
    attendance: 'user-x',           // User with X for attendance issues
    tardiness: 'clock',             // Clock for tardiness alerts
    absence_pattern: 'trending-down', // Trending down for absence patterns
    performance: 'alert-triangle',   // Triangle for performance concerns
    system: 'bell'                  // Bell for system notifications
  };
  
  return typeIcons[type] || typeIcons.system;
}

/**
 * Determines if an alert requires urgent attention
 * @param alert - The attendance alert to evaluate
 * @returns True if the alert is urgent, false otherwise
 */
export function isAlertUrgent(alert: AttendanceAlert): boolean {
  // Critical severity is always urgent
  if (alert.severity === 'critical') {
    return true;
  }
  
  // High severity alerts are urgent if recent (within 24 hours)
  if (alert.severity === 'high') {
    const hoursSinceAlert = (new Date().getTime() - alert.date.getTime()) / (1000 * 60 * 60);
    return hoursSinceAlert <= 24;
  }
  
  // Check for urgent patterns based on metadata
  if (alert.metadata) {
    const { absenceStreak, attendanceRate, tardinessCount } = alert.metadata;
    
    // Urgent if absence streak is 3+ days
    if (absenceStreak && absenceStreak >= 3) {
      return true;
    }
    
    // Urgent if attendance rate drops below 80%
    if (attendanceRate && attendanceRate < 0.8) {
      return true;
    }
    
    // Urgent if tardiness count is excessive (5+ times)
    if (tardinessCount && tardinessCount >= 5) {
      return true;
    }
  }
  
  return false;
}

/**
 * Formats a summary message for student alerts
 * @param student - The student object
 * @param alertCount - Number of active alerts for the student
 * @returns Formatted summary string
 */
export function formatStudentAlertSummary(student: Student, alertCount: number): string {
  if (alertCount === 0) {
    return `${student.firstName} ${student.lastName} has no active alerts`;
  }
  
  if (alertCount === 1) {
    return `${student.firstName} ${student.lastName} has 1 active alert`;
  }
  
  // Multiple alerts - provide more context
  const alertText = alertCount <= 5 
    ? `${alertCount} active alerts` 
    : `${alertCount} active alerts (requires immediate attention)`;
    
  return `${student.firstName} ${student.lastName} has ${alertText}`;
}

/**
 * Calculates the priority level for an alert based on multiple factors
 * @param alert - The attendance alert to evaluate
 * @returns Priority level for processing and display
 */
export function calculateAlertPriorityLevel(alert: AttendanceAlert): PriorityLevel {
  let priorityScore = 0;
  
  // Base score from severity
  const severityScores: Record<AlertSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };
  priorityScore += severityScores[alert.severity];
  
  // Additional score from alert type
  const typeScores: Record<AlertType, number> = {
    system: 0,
    tardiness: 1,
    attendance: 2,
    absence_pattern: 3,
    performance: 2
  };
  priorityScore += typeScores[alert.type];
  
  // Time sensitivity - newer alerts get higher priority
  const hoursSinceAlert = (new Date().getTime() - alert.date.getTime()) / (1000 * 60 * 60);
  if (hoursSinceAlert <= 2) {
    priorityScore += 2; // Very recent
  } else if (hoursSinceAlert <= 24) {
    priorityScore += 1; // Recent
  }
  
  // Metadata-based adjustments
  if (alert.metadata) {
    const { absenceStreak, attendanceRate, tardinessCount } = alert.metadata;
    
    if (absenceStreak && absenceStreak >= 3) {
      priorityScore += 2;
    }
    
    if (attendanceRate && attendanceRate < 0.8) {
      priorityScore += 2;
    }
    
    if (tardinessCount && tardinessCount >= 5) {
      priorityScore += 1;
    }
  }
  
  // Unread alerts get slight priority boost
  if (!alert.isRead) {
    priorityScore += 1;
  }
  
  // Convert score to priority level
  if (priorityScore >= 8) {
    return 'urgent';
  } else if (priorityScore >= 6) {
    return 'high';
  } else if (priorityScore >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}