import { AttendanceService, StudentNotFoundError } from './AttendanceService';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';

const TEST_STUDENTS = [
  { id: '1', firstName: 'Alice', lastName: 'Smith' },
  { id: '2', firstName: 'Bob', lastName: 'Jones' }
];

describe('AttendanceService', () => {
  const service = new AttendanceService();
  const studentRepo = new FileStudentRepo();

  beforeEach(() => {
    // Clear and add test students
    const fs = require('fs');
    fs.writeFileSync(studentRepo['filePath'], JSON.stringify([]));
    TEST_STUDENTS.forEach(s => studentRepo.saveStudent(s));
  });

  it('marks PRESENT when onTime true and late false', () => {
    const record = service.markAttendanceByName({
      firstName: 'Alice',
      lastName: 'Smith',
      dateISO: '2025-09-18',
      onTime: true,
      late: false
    });
    expect(record.status).toBe(AttendanceStatus.PRESENT);
  });

  it('marks LATE when late true', () => {
    const record = service.markAttendanceByName({
      firstName: 'Bob',
      lastName: 'Jones',
      dateISO: '2025-09-18',
      late: true
    });
    expect(record.status).toBe(AttendanceStatus.LATE);
  });

  it('marks ABSENT when neither onTime nor late provided', () => {
    const record = service.markAttendanceByName({
      firstName: 'Alice',
      lastName: 'Smith',
      dateISO: '2025-09-18'
    });
    expect(record.status).toBe(AttendanceStatus.ABSENT);
  });

  it('throws StudentNotFoundError when student lookup fails', () => {
    expect(() =>
      service.markAttendanceByName({
        firstName: 'Nonexistent',
        lastName: 'Student',
        dateISO: '2025-09-18'
      })
    ).toThrow(StudentNotFoundError);
  });
});
