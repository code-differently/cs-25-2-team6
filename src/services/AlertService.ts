import { ReportService } from './ReportService';
import { AttendanceStatus } from '../domains/AttendanceStatus';

export interface AlertRules {
  absences30?: number;
  lates30?: number;
  absencesTotal?: number;
  latesTotal?: number;
}

export interface AlertResult {
  shouldAlert: boolean;
  reasons: string[];
}

export class AlertService {
  private reportService = new ReportService();

  checkThresholds(studentId: string, whenISO: string, rules: AlertRules): AlertResult {
    const reasons: string[] = [];
    // Last 30 days window
    const end = new Date(whenISO);
    const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
    const buckets = this.reportService.getHistoryByTimeframe({
      studentId,
      timeframe: 'DAILY',
      startISO: start.toISOString().slice(0, 10),
      endISO: end.toISOString().slice(0, 10)
    });
    let absences30 = 0, lates30 = 0;
    for (const b of buckets) {
      absences30 += b.absent;
      lates30 += b.late;
    }
    // All time (or YTD)
    const ytd = this.reportService.getYearToDateSummary(studentId);
    const absencesTotal = ytd.absent;
    const latesTotal = ytd.late;
    if (rules.absences30 !== undefined && absences30 >= rules.absences30) {
      reasons.push(`absences in last 30 days (${absences30}) >= threshold (${rules.absences30})`);
    }
    if (rules.lates30 !== undefined && lates30 >= rules.lates30) {
      reasons.push(`lates in last 30 days (${lates30}) >= threshold (${rules.lates30})`);
    }
    if (rules.absencesTotal !== undefined && absencesTotal >= rules.absencesTotal) {
      reasons.push(`total absences (${absencesTotal}) >= threshold (${rules.absencesTotal})`);
    }
    if (rules.latesTotal !== undefined && latesTotal >= rules.latesTotal) {
      reasons.push(`total lates (${latesTotal}) >= threshold (${rules.latesTotal})`);
    }
    return { shouldAlert: reasons.length > 0, reasons };
  }

  notifyIfBreached(studentId: string, whenISO: string, rules: AlertRules, notifier: { send: (payload: any) => void }): AlertResult {
    const result = this.checkThresholds(studentId, whenISO, rules);
    if (result.shouldAlert) {
      notifier.send({ studentId, whenISO, reasons: result.reasons });
    }
    return result;
  }
}
