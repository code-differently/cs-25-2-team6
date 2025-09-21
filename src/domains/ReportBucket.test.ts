import { ReportBucket } from './ReportBucket';

describe('ReportBucket', () => {
  it('should create a valid report bucket with all attendance counts', () => {
    const bucket: ReportBucket = {
      bucketStartISO: '2025-09-15',
      present: 23,
      late: 2,
      absent: 1,
      excused: 0,
      earlyDismissal: 1
    };

    expect(bucket.bucketStartISO).toBe('2025-09-15');
    expect(bucket.present).toBe(23);
    expect(bucket.late).toBe(2);
    expect(bucket.absent).toBe(1);
    expect(bucket.excused).toBe(0);
    expect(bucket.earlyDismissal).toBe(1);
  });

  it('should handle zero counts for all attendance categories', () => {
    const emptyBucket: ReportBucket = {
      bucketStartISO: '2025-09-22',
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      earlyDismissal: 0
    };

    expect(emptyBucket.present).toBe(0);
    expect(emptyBucket.late).toBe(0);
    expect(emptyBucket.absent).toBe(0);
    expect(emptyBucket.excused).toBe(0);
    expect(emptyBucket.earlyDismissal).toBe(0);
  });

  it('should support daily bucket creation', () => {
    const dailyBucket: ReportBucket = {
      bucketStartISO: '2025-09-20',
      present: 25,
      late: 1,
      absent: 0,
      excused: 0,
      earlyDismissal: 2
    };

    expect(dailyBucket.bucketStartISO).toBe('2025-09-20');
    expect(dailyBucket.present + dailyBucket.late + dailyBucket.absent + dailyBucket.excused).toBe(26);
  });

  it('should support weekly bucket creation', () => {
    const weeklyBucket: ReportBucket = {
      bucketStartISO: '2025-09-15', // Monday start of week
      present: 115,
      late: 8,
      absent: 3,
      excused: 2,
      earlyDismissal: 5
    };

    expect(weeklyBucket.bucketStartISO).toBe('2025-09-15');
    expect(weeklyBucket.present).toBeGreaterThan(weeklyBucket.late);
  });

  it('should support monthly bucket creation', () => {
    const monthlyBucket: ReportBucket = {
      bucketStartISO: '2025-09-01', // First day of September
      present: 450,
      late: 23,
      absent: 12,
      excused: 5,
      earlyDismissal: 8
    };

    expect(monthlyBucket.bucketStartISO).toBe('2025-09-01');
    expect(monthlyBucket.present).toBeGreaterThan(monthlyBucket.late + monthlyBucket.absent);
  });
});
