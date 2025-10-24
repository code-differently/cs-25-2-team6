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

// Student utility functions
export {
  formatStudentName as formatStudentNameUtil,
  generateStudentInitials,
  getStudentAvatarColor,
  formatStudentId,
  isRequiredField,
  formatGradeDisplay,
  validateStudentName,
  generateSearchableStudentName,
  parseStudentFullName,
  generateStudentDisplayName,
  getStudentAvatarProps,
  formatStudentContact,
  getStudentStatusBadgeProps,
  assessStudentDataCompleteness,
  sortStudents
} from './studentUtils';

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
