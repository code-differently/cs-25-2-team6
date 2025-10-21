// Export all utility functions for easy importing
export {
  formatStudentName,
  getStatusBadgeColor,
  formatAttendancePercentage,
  isFilterActive,
  renderStatusIcon,
  calculateTableHeight
} from './reportUtils';

// Type exports for convenience
export type { ReportFilters } from '../../src/domains/ReportFilters';
export { AttendanceStatus } from '../../src/domains/AttendanceStatus';