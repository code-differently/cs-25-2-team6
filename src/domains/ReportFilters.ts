import { AttendanceStatus } from './AttendanceStatus';

/**
 * ReportFilters is a type alias for filtering attendance reports.
 * All fields are optional and can be used in any combination.
 */
export type ReportFilters = {
  lastName?: string;
  status?: AttendanceStatus;
  dateISO?: string;
};
