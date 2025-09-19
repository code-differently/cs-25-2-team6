import { AttendanceStatus } from './AttendanceStatus';

describe('AttendanceStatus', () => {
  it('enum contains required values (PRESENT, LATE, ABSENT, EXCUSED)', () => {
    expect(AttendanceStatus.PRESENT).toBe('PRESENT');
    expect(AttendanceStatus.LATE).toBe('LATE');
    expect(AttendanceStatus.ABSENT).toBe('ABSENT');
    expect(AttendanceStatus.EXCUSED).toBe('EXCUSED');
  });

  it('has all values needed for reporting services', () => {
    const allValues = Object.values(AttendanceStatus);
    expect(allValues).toContain('PRESENT');
    expect(allValues).toContain('LATE');
    expect(allValues).toContain('ABSENT');
    expect(allValues).toContain('EXCUSED');
    expect(allValues).toHaveLength(4);
  });
});
