// Export all utility functions for easy importing
export {
  formatStudentName,
  getStatusBadgeColor,
  formatAttendancePercentage,
  isFilterActive,
  renderStatusIcon,
  calculateTableHeight
} from './reportUtils';

// Alert utility functions
export {
  getAlertSeverityColor,
  formatAlertDate,
  getAlertTypeIcon,
  isAlertUrgent,
  formatStudentAlertSummary,
  calculateAlertPriorityLevel
} from './alertUtils';

// Type exports for convenience
export type { ReportFilters } from '../../src/domains/ReportFilters';
export { AttendanceStatus } from '../../src/domains/AttendanceStatus';

// Alert type exports
export type {
  AlertSeverity,
  AlertType,
  PriorityLevel,
  AttendanceAlert
} from './alertUtils';
