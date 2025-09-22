import { DayOffReason } from './DayOffReason';

/**
 * ScheduledDayOff represents a planned day off for all students.
 * Used to mark holidays, professional development, report card days, etc.
 */
export interface ScheduledDayOff {
  /** ISO date string for the day off (YYYY-MM-DD) */
  dateISO: string;
  /** Reason for the day off */
  reason: DayOffReason;
  /** Scope of the day off (currently always 'ALL_STUDENTS') */
  scope: 'ALL_STUDENTS';
}
