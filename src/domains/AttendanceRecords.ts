import { AttendanceStatus } from './AttendanceStatus';
import { DomainValidationError, InvalidDateError } from './domain-errors';
import { isDateISO } from './dateUtils';

export class AttendanceRecord {
  public readonly studentId: string;
  public readonly dateISO: string;
  public readonly status: AttendanceStatus;
  public readonly late: boolean;
  public readonly earlyDismissal: boolean;
  public readonly onTime: boolean;
  public readonly excused: boolean;

  constructor(params: {
    studentId: string;
    dateISO: string;
    status: AttendanceStatus;
    late?: boolean;
    earlyDismissal?: boolean;
  }) {
    const studentId = params.studentId?.trim();
    if (!studentId) throw new DomainValidationError('AttendanceRecord.studentId must be non-empty');
    if (!isDateISO(params.dateISO)) throw new InvalidDateError(params.dateISO);
    if (!params.status) throw new DomainValidationError('AttendanceRecord.status is required');

    const status = params.status;
    const late = Boolean(params.late);
    const early = Boolean(params.earlyDismissal);

    // EXCUSED & ABSENT cannot be late/early.
    if (status === AttendanceStatus.EXCUSED && (late || early)) {
      throw new DomainValidationError('EXCUSED cannot be late or earlyDismissal');
    }
    if (status === AttendanceStatus.ABSENT && (late || early)) {
      throw new DomainValidationError('ABSENT cannot be late or earlyDismissal');
    }

    // Normalize lateness:
    const normalizedLate =
      status === AttendanceStatus.LATE ? true
      : status === AttendanceStatus.PRESENT ? late
      : false;

    const normalizedEarly =
      (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) ? early : false;

    this.studentId = studentId;
    this.dateISO = params.dateISO;
    this.status = status;
    this.late = normalizedLate;
    this.earlyDismissal = normalizedEarly;
    this.onTime = (status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) ? !normalizedLate : false;
    this.excused = status === AttendanceStatus.EXCUSED;
  }
}
