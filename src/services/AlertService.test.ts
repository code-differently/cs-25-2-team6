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

  it('notifyIfBreached calls notifier.send exactly once with expected payload', () => {
    (mockReportService.getHistoryByTimeframe as jest.Mock).mockReturnValue([
      { absent: 2, late: 2 },
    ]);
    (mockReportService.getYearToDateSummary as jest.Mock).mockReturnValue({ absent: 2, late: 2 });
    const rules: AlertRules = { absences30: 2 };
    const result = alertService.notifyIfBreached('s1', '2025-09-20', rules, mockNotifier);
    expect(result.shouldAlert).toBe(true);
    expect(mockNotifier.send).toHaveBeenCalledTimes(1);
    expect(mockNotifier.send).toHaveBeenCalledWith({ studentId: 's1', whenISO: '2025-09-20', reasons: expect.any(Array) });
  });
});
