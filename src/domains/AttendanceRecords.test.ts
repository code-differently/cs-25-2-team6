import { AttendanceRecord } from './AttendanceRecords';
import { AttendanceStatus } from './AttendanceStatus';
import { DomainValidationError, InvalidDateError } from './domain-errors';

describe('AttendanceRecord', () => {
  it('should create a record with valid studentId, date, and status', () => {
    const r = new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.PRESENT });
    expect(r.studentId).toBe('1');
    expect(r.dateISO).toBe('2025-09-18');
    expect(r.status).toBe(AttendanceStatus.PRESENT);
  });

  it('should throw error for invalid date', () => {
    expect(() => new AttendanceRecord({ studentId: '1', dateISO: '2025-13-01', status: AttendanceStatus.PRESENT })).toThrow(InvalidDateError);
  });

  it('should throw error for missing status', () => {
    expect(() => new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: undefined as any })).toThrow(DomainValidationError);
  });

  it('should set late to true if status is LATE', () => {
    const r = new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.LATE });
    expect(r.late).toBe(true);
  });

  it('should set onTime to true if status is PRESENT and not late', () => {
    const r = new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.PRESENT });
    expect(r.onTime).toBe(true);
  });

  it('should throw error if EXCUSED or ABSENT is marked late or early', () => {
    expect(() => new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.EXCUSED, late: true })).toThrow(DomainValidationError);
    expect(() => new AttendanceRecord({ studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.ABSENT, earlyDismissal: true })).toThrow(DomainValidationError);
  });

  it('can construct a record that includes earlyDismissal = true', () => {
    const r = new AttendanceRecord({
      studentId: '1',
      dateISO: '2025-09-18',
      status: AttendanceStatus.PRESENT,
      earlyDismissal: true
    });
    expect(r.earlyDismissal).toBe(true);
  });

  it('absence of earlyDismissal means not early dismissal (false)', () => {
    const r = new AttendanceRecord({
      studentId: '1',
      dateISO: '2025-09-18',
      status: AttendanceStatus.PRESENT
    });
    expect(r.earlyDismissal).toBe(false);
  });
});
