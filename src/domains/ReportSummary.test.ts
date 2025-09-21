import { ReportSummary } from './ReportSummary';
import { ReportBucket } from './ReportBucket';
import { Timeframe } from './Timeframe';

describe('ReportSummary', () => {
  const sampleBuckets: ReportBucket[] = [
    {
      bucketStartISO: '2025-09-01',
      present: 23,
      late: 2,
      absent: 1,
      excused: 0,
      earlyDismissal: 1
    },
    {
      bucketStartISO: '2025-09-08',
      present: 24,
      late: 1,
      absent: 1,
      excused: 0,
      earlyDismissal: 0
    }
  ];

  it('should create a weekly report summary', () => {
    const summary: ReportSummary = {
      timeframe: Timeframe.WEEKLY,
      periodStartISO: '2025-09-01',
      periodEndISO: '2025-09-15',
      buckets: sampleBuckets,
      ytdTotals: {
        present: 450,
        late: 23,
        absent: 12,
        excused: 5,
        earlyDismissal: 8
      }
    };

    expect(summary.timeframe).toBe(Timeframe.WEEKLY);
    expect(summary.periodStartISO).toBe('2025-09-01');
    expect(summary.periodEndISO).toBe('2025-09-15');
    expect(summary.buckets).toHaveLength(2);
    expect(summary.ytdTotals.present).toBe(450);
  });

  it('should create a monthly report summary', () => {
    const summary: ReportSummary = {
      timeframe: Timeframe.MONTHLY,
      periodStartISO: '2025-09-01',
      periodEndISO: '2025-09-30',
      buckets: sampleBuckets,
      ytdTotals: {
        present: 1200,
        late: 67,
        absent: 34,
        excused: 12,
        earlyDismissal: 23
      }
    };

    expect(summary.timeframe).toBe(Timeframe.MONTHLY);
    expect(summary.ytdTotals.present).toBeGreaterThan(summary.ytdTotals.late);
    expect(summary.ytdTotals.present).toBeGreaterThan(summary.ytdTotals.absent);
  });

  it('should create a daily report summary', () => {
    const dailyBucket: ReportBucket = {
      bucketStartISO: '2025-09-20',
      present: 25,
      late: 1,
      absent: 0,
      excused: 0,
      earlyDismissal: 1
    };

    const summary: ReportSummary = {
      timeframe: Timeframe.DAILY,
      periodStartISO: '2025-09-20',
      periodEndISO: '2025-09-20',
      buckets: [dailyBucket],
      ytdTotals: {
        present: 2340,
        late: 145,
        absent: 67,
        excused: 23,
        earlyDismissal: 89
      }
    };

    expect(summary.timeframe).toBe(Timeframe.DAILY);
    expect(summary.buckets).toHaveLength(1);
    expect(summary.periodStartISO).toBe(summary.periodEndISO);
  });

  it('should handle empty buckets array', () => {
    const summary: ReportSummary = {
      timeframe: Timeframe.WEEKLY,
      periodStartISO: '2025-09-01',
      periodEndISO: '2025-09-08',
      buckets: [],
      ytdTotals: {
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        earlyDismissal: 0
      }
    };

    expect(summary.buckets).toHaveLength(0);
    expect(summary.ytdTotals.present).toBe(0);
  });

  it('should maintain readonly properties', () => {
    const summary: ReportSummary = {
      timeframe: Timeframe.MONTHLY,
      periodStartISO: '2025-09-01',
      periodEndISO: '2025-09-30',
      buckets: sampleBuckets,
      ytdTotals: {
        present: 500,
        late: 25,
        absent: 10,
        excused: 3,
        earlyDismissal: 7
      }
    };

    // These should all compile without error due to readonly
    expect(summary.timeframe).toBeDefined();
    expect(summary.buckets).toBeDefined();
    expect(summary.ytdTotals).toBeDefined();
  });
});
