// Export all utility functions for easy importing
export {
  formatStudentName,
  getStatusBadgeColor,
  formatAttendancePercentage,
  isFilterActive,
  renderStatusIcon,
  calculateTableHeight
} from './reportUtils';

// Export calendar utility functions
export {
  formatDisplayDate,
  getReasonDisplayColor,
  isWeekend,
  isScheduledDay,
  calculateAffectedStudentsText,
  renderCalendarDayContent
} from './calendarUtils';

// Type exports for convenience
export type { ReportFilters } from '../../src/domains/ReportFilters';
export { AttendanceStatus } from '../../src/domains/AttendanceStatus';
export { DayOffReason } from '../../src/domains/DayOffReason';
export type { DayOff } from '../../src/persistence/FileScheduleRepo';