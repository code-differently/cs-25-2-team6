import { AlertService, AlertRules } from './AlertService';
import { ReportService } from './ReportService';
import { AttendanceStatus } from '../domains/AttendanceStatus';

describe('AlertService', () => {
  let alertService: AlertService;
  let mockReportService: ReportService;
  let mockNotifier: { send: jest.Mock };

  beforeEach(() => {
    mockReportService = {
      getHistoryByTimeframe: jest.fn(),
      getYearToDateSummary: jest.fn(),
    } as any;
    alertService = new AlertService();
    // @ts-ignore
    alertService.reportService = mockReportService;
    mockNotifier = { send: jest.fn() };
  });

  it('breaches absences30 when count >= rule', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { absent: 2, late: 0 },
      { absent: 1, late: 0 },
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ absent: 3, late: 0 });
    const rules: AlertRules = { absences30: 3 };
    const result = alertService.checkThresholds('s1', '2025-09-20', rules);
    expect(result.shouldAlert).toBe(true);
    expect(result.reasons[0]).toMatch(/absences in last 30 days/);
  });

  it('breaches lates30 when count >= rule', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { absent: 0, late: 2 },
      { absent: 0, late: 2 },
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ absent: 0, late: 4 });
    const rules: AlertRules = { lates30: 4 };
    const result = alertService.checkThresholds('s1', '2025-09-20', rules);
    expect(result.shouldAlert).toBe(true);
    expect(result.reasons[0]).toMatch(/lates in last 30 days/);
  });

  it('breaches absencesTotal/latesTotal when totals >= rules', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { absent: 1, late: 1 },
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ absent: 5, late: 6 });
    const rules: AlertRules = { absencesTotal: 5, latesTotal: 6 };
    const result = alertService.checkThresholds('s1', '2025-09-20', rules);
    expect(result.shouldAlert).toBe(true);
    expect(result.reasons).toEqual([
      expect.stringMatching(/total absences/),
      expect.stringMatching(/total lates/),
    ]);
  });

  it('no alert when under thresholds', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { absent: 1, late: 1 },
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ absent: 2, late: 2 });
    const rules: AlertRules = { absences30: 3, lates30: 3, absencesTotal: 3, latesTotal: 3 };
    const result = alertService.checkThresholds('s1', '2025-09-20', rules);
    expect(result.shouldAlert).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it('notifies when breach detected', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { bucketStartISO: '2025-09-01', present: 10, late: 1, absent: 2, excused: 0, earlyDismissal: 0 }
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ present: 100, late: 5, absent: 10, excused: 0, earlyDismissal: 2 });
    const mockNotifier = { send: jest.fn() };
    const rules: AlertRules = { absences30: 2 };
    const result = alertService.notifyIfBreached('s1', '2025-09-20', rules, mockNotifier);
    expect(result.shouldAlert).toBe(true);
    expect(mockNotifier.send).toHaveBeenCalledTimes(1);
    expect(mockNotifier.send).toHaveBeenCalledWith({ studentId: 's1', whenISO: '2025-09-20', reasons: expect.any(Array) });
  });

  // Edge Cases: 30-day window boundaries, EXCUSED status, multiple reasons
  describe('Edge Cases', () => {
    
    it('should include records on the exact start date of 30-day window', () => {
      // Setup: Create records where the 30th day ago has critical attendance data
      const endDate = '2025-10-15';  // End date for threshold check
      const startDate = '2025-09-16'; // Exactly 30 days ago (inclusive)
      
      // Mock daily buckets - only the start date has attendance data
      const mockBuckets = [
        { bucketStartISO: startDate, present: 0, late: 2, absent: 1, excused: 0, earlyDismissal: 0 },
        { bucketStartISO: '2025-09-17', present: 1, late: 0, absent: 0, excused: 0, earlyDismissal: 0 },
      ];
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 50, late: 2, absent: 1, excused: 5, earlyDismissal: 2
      });
      
      const rules: AlertRules = { lates30: 1 }; // Should trigger since we have 2 lates in 30-day window
      const result = alertService.checkThresholds('student1', endDate, rules);
      
      expect(result.shouldAlert).toBe(true);
      expect(result.reasons).toContain('lates in last 30 days (2) >= threshold (1)');
      
      // Verify the correct date range was requested (30 days inclusive)
      expect(mockReportService.getHistoryByTimeframe).toHaveBeenCalledWith({
        studentId: 'student1',
        timeframe: 'DAILY',
        startISO: startDate,  // Should include exactly 30 days ago
        endISO: endDate
      });
    });

    it('should not count EXCUSED entries in absence or lateness counters', () => {
      // Setup: Student has many EXCUSED days but few actual absences/lates
      const mockBuckets = [
        { bucketStartISO: '2025-09-16', present: 5, late: 1, absent: 1, excused: 10, earlyDismissal: 0 },
        { bucketStartISO: '2025-09-17', present: 3, late: 0, absent: 0, excused: 8, earlyDismissal: 0 },
        { bucketStartISO: '2025-09-18', present: 2, late: 0, absent: 1, excused: 12, earlyDismissal: 0 },
      ];
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 100, late: 2, absent: 3, excused: 50, earlyDismissal: 5
      });
      
      const rules: AlertRules = { 
        absences30: 5,    // Should NOT trigger (only 2 actual absences, not 30 excused)
        lates30: 3,       // Should NOT trigger (only 1 late, not counting excused)
        absencesTotal: 10, // Should NOT trigger (only 3 total absences)
        latesTotal: 5     // Should NOT trigger (only 2 total lates)
      };
      
      const result = alertService.checkThresholds('student1', '2025-10-15', rules);
      
      // All thresholds should remain unbreached because EXCUSED is counted separately
      expect(result.shouldAlert).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    it('should trigger multiple alert reasons when multiple thresholds are breached', () => {
      // Setup: Student exceeds multiple thresholds simultaneously
      const mockBuckets = [
        { bucketStartISO: '2025-09-16', present: 0, late: 8, absent: 6, excused: 0, earlyDismissal: 0 },
        { bucketStartISO: '2025-09-17', present: 1, late: 5, absent: 4, excused: 1, earlyDismissal: 0 },
      ];
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 20, late: 25, absent: 18, excused: 2, earlyDismissal: 1
      });
      
      const rules: AlertRules = { 
        absences30: 8,    // Should trigger (10 absences >= 8)
        lates30: 10,      // Should trigger (13 lates >= 10)
        absencesTotal: 15, // Should trigger (18 total absences >= 15)
        latesTotal: 20    // Should trigger (25 total lates >= 20)
      };
      
      const result = alertService.checkThresholds('student1', '2025-10-15', rules);
      
      expect(result.shouldAlert).toBe(true);
      expect(result.reasons).toHaveLength(4); // All four thresholds breached
      
      // Verify all expected reasons are present
      expect(result.reasons).toContain('absences in last 30 days (10) >= threshold (8)');
      expect(result.reasons).toContain('lates in last 30 days (13) >= threshold (10)');
      expect(result.reasons).toContain('total absences (18) >= threshold (15)');
      expect(result.reasons).toContain('total lates (25) >= threshold (20)');
    });

    it('should handle exact threshold boundary conditions', () => {
      // Setup: Values exactly at threshold boundaries
      const mockBuckets = [
        { bucketStartISO: '2025-09-16', present: 20, late: 5, absent: 3, excused: 0, earlyDismissal: 0 },
      ];
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 180, late: 10, absent: 7, excused: 2, earlyDismissal: 3
      });
      
      const rules: AlertRules = { 
        absences30: 3,    // Should trigger (3 >= 3)
        lates30: 6,       // Should NOT trigger (5 < 6)
        absencesTotal: 7, // Should trigger (7 >= 7) 
        latesTotal: 11    // Should NOT trigger (10 < 11)
      };
      
      const result = alertService.checkThresholds('student1', '2025-10-15', rules);
      
      expect(result.shouldAlert).toBe(true);
      expect(result.reasons).toHaveLength(2);
      expect(result.reasons).toContain('absences in last 30 days (3) >= threshold (3)');
      expect(result.reasons).toContain('total absences (7) >= threshold (7)');
      
      // Verify the non-triggering conditions are not included
      expect(result.reasons.some((r: string) => r.includes('lates in last 30 days'))).toBe(false);
      expect(result.reasons.some((r: string) => r.includes('total lates'))).toBe(false);
    });

    it('should handle 30-day window with no attendance data', () => {
      // Setup: Empty buckets for 30-day period 
      const mockBuckets: any[] = []; // No attendance records in the window
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 50, late: 2, absent: 1, excused: 0, earlyDismissal: 0
      });
      
      const rules: AlertRules = { 
        absences30: 1,    // Should NOT trigger (0 absences < threshold 1)
        lates30: 1,       // Should NOT trigger (0 lates < threshold 1)
        absencesTotal: 0  // Should trigger (1 total absence >= 0)
      };
      
      const result = alertService.checkThresholds('student1', '2025-10-15', rules);
      
      expect(result.shouldAlert).toBe(true);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons).toContain('total absences (1) >= threshold (0)');
    });

    it('should correctly differentiate between 29-day and 30-day windows', () => {
      // Setup: Critical attendance data exactly 30 days ago vs 29 days ago
      const endDate = '2025-10-15';
      const day30Ago = '2025-09-16';  // Should be included in 30-day window
      const day29Ago = '2025-09-17';  // Should be included in 30-day window
      
      const mockBuckets = [
        { bucketStartISO: day30Ago, present: 0, late: 0, absent: 1, excused: 0, earlyDismissal: 0 }, // Day 30 - included
        { bucketStartISO: day29Ago, present: 0, late: 1, absent: 0, excused: 0, earlyDismissal: 0 }, // Day 29 - included
      ];
      
      (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue(mockBuckets);
      (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({
        present: 100, late: 1, absent: 1, excused: 0, earlyDismissal: 0
      });
      
      const rules: AlertRules = { 
        absences30: 1,    // Should trigger (1 absence from day 30)
        lates30: 1        // Should trigger (1 late from day 29)
      };
      
      const result = alertService.checkThresholds('student1', endDate, rules);
      
      expect(result.shouldAlert).toBe(true);
      expect(result.reasons).toHaveLength(2);
      expect(result.reasons).toContain('absences in last 30 days (1) >= threshold (1)');
      expect(result.reasons).toContain('lates in last 30 days (1) >= threshold (1)');
      
      // Verify correct window calculation: should request from day30Ago to endDate
      expect(mockReportService.getHistoryByTimeframe).toHaveBeenCalledWith({
        studentId: 'student1',
        timeframe: 'DAILY',
        startISO: day30Ago,
        endISO: endDate
      });
    });
  });
});
