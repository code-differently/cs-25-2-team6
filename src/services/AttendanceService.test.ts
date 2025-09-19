import { markAttendanceByName, StudentNotFoundError } from './AttendanceService';
import { AttendanceStatus } from '../domains/AttendanceStatus';

describe('AttendanceService', () => {
  it('marks PRESENT when onTime true and late false', () => {
    const record = markAttendanceByName({
      firstName: 'Alice',
      lastName: 'Smith',
      dateISO: '2025-09-18',
      onTime: true,
      late: false
    });
    expect(record.status).toBe(AttendanceStatus.PRESENT);
  });

  it('marks LATE when late true', () => {
    const record = markAttendanceByName({
      firstName: 'Bob',
      lastName: 'Jones',
      dateISO: '2025-09-18',
      late: true
    });
    expect(record.status).toBe(AttendanceStatus.LATE);
  });

  it('marks ABSENT when neither onTime nor late provided', () => {
    const record = markAttendanceByName({
      firstName: 'Alice',
      lastName: 'Smith',
      dateISO: '2025-09-18'
    });
    expect(record.status).toBe(AttendanceStatus.ABSENT);
  });

  it('throws StudentNotFoundError when student lookup fails', () => {
    expect(() =>
      markAttendanceByName({
        firstName: 'Nonexistent',
        lastName: 'Student',
        dateISO: '2025-09-18'
      })
    ).toThrow(StudentNotFoundError);
  });
});
