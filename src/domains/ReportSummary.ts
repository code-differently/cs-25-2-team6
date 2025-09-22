import { ReportBucket } from './ReportBucket';
import { Timeframe } from './Timeframe';

/**
 * ReportSummary represents a comprehensive attendance report with bucketed data
 * and year-to-date totals. Used for teacher dashboard and historical data viewing.
 * 
 * Example: September 2025 Monthly Report
 * - timeframe: MONTHLY
 * - periodStartISO: "2025-09-01"
 * - periodEndISO: "2025-09-30" 
 * - buckets: [week1, week2, week3, week4]
 * - ytdTotals: { present: 450, late: 23, absent: 12, excused: 5, earlyDismissal: 8 }
 */
export interface ReportSummary {
  /** The timeframe granularity for this report (DAILY, WEEKLY, MONTHLY) */
  readonly timeframe: Timeframe;
  
  /** ISO date string marking the start of the overall report period (YYYY-MM-DD) */
  readonly periodStartISO: string;
  
  /** ISO date string marking the end of the overall report period (YYYY-MM-DD) */
  readonly periodEndISO: string;
  
  /** Array of bucketed attendance data for the specified timeframe */
  readonly buckets: readonly ReportBucket[];
  
  /** Year-to-date totals across all attendance categories */
  readonly ytdTotals: {
    readonly present: number;
    readonly late: number;
    readonly absent: number;
    readonly excused: number;
    readonly earlyDismissal: number;
  };
}
