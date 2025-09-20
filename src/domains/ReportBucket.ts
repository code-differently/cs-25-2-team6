/**
 * ReportBucket represents attendance counts for a specific time period.
 * Used to group attendance data by daily, weekly, or monthly timeframes.
 * 
 * Example: Week of Sept 15-21, 2025
 * - bucketStartISO: "2025-09-15"
 * - present: 23, late: 2, absent: 1, excused: 0, earlyDismissal: 1
 */
export interface ReportBucket {
  /** ISO date string marking the start of this time period (YYYY-MM-DD) */
  readonly bucketStartISO: string;
  
  /** Count of students marked present in this time period */
  readonly present: number;
  
  /** Count of students marked late in this time period */
  readonly late: number;
  
  /** Count of students marked absent in this time period */
  readonly absent: number;
  
  /** Count of students marked excused in this time period */
  readonly excused: number;
  
  /** Count of students with early dismissal in this time period */
  readonly earlyDismissal: number;
}
