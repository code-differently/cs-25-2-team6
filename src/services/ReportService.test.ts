// Place mocks at the very top before any imports
jest.mock('../persistence/FileStudentRepo', () => {
  return {
    FileStudentRepo: jest.fn().mockImplementation(() => ({
      allStudents: () => [
        { id: '1', firstName: 'Alice', lastName: 'Smith' },
        { id: '2', firstName: 'Bob', lastName: 'Smith' },
        { id: '3', firstName: 'Charlie', lastName: 'Jones' }
      ]
    }))
  };
});

jest.mock('../persistence/FileAttendanceRepo', () => {
  return {
    FileAttendanceRepo: jest.fn().mockImplementation(() => ({
      allAttendance: () => [
        // 2025-09-17
        { studentId: '1', dateISO: '2025-09-17', status: 'PRESENT', earlyDismissal: false },
        { studentId: '2', dateISO: '2025-09-17', status: 'LATE', earlyDismissal: true },
        { studentId: '3', dateISO: '2025-09-17', status: 'ABSENT', earlyDismissal: false },
        // 2025-09-18
        { studentId: '1', dateISO: '2025-09-18', status: 'LATE', earlyDismissal: false },
        { studentId: '2', dateISO: '2025-09-18', status: 'LATE', earlyDismissal: false },
        { studentId: '3', dateISO: '2025-09-18', status: 'PRESENT', earlyDismissal: true },
        // 2025-09-19
        { studentId: '1', dateISO: '2025-09-19', status: 'PRESENT', earlyDismissal: true },
        { studentId: '2', dateISO: '2025-09-19', status: 'PRESENT', earlyDismissal: true }
      ]
    }))
  };
});

import { ReportService } from './ReportService';
import { AttendanceStatus } from '../domains/AttendanceStatus';

describe('ReportService', () => {
  const service = new ReportService();

  it('filterAttendanceBy with status only returns expected records', () => {
    const result = service.filterAttendanceBy({ status: AttendanceStatus.LATE });
    expect(result).toHaveLength(3);
    expect(result.some(r => r.studentId === '1' && r.status === AttendanceStatus.LATE)).toBe(true); // Alice Smith
    expect(result.some(r => r.studentId === '2' && r.status === AttendanceStatus.LATE && r.dateISO === '2025-09-17')).toBe(true); // Bob Smith 2025-09-17
    expect(result.some(r => r.studentId === '2' && r.status === AttendanceStatus.LATE && r.dateISO === '2025-09-18')).toBe(true); // Bob Smith 2025-09-18
  });

  it('filterAttendanceBy with date only returns expected records', () => {
    const result = service.filterAttendanceBy({ dateISO: '2025-09-17' });
    expect(result).toHaveLength(3);
    expect(result.every(r => r.dateISO === '2025-09-17')).toBe(true);
  });

  it('filterAttendanceBy with lastName only returns records for all students with that last name', () => {
    const result = service.filterAttendanceBy({ lastName: 'Smith' });
    expect(result.every(r => ['1', '2'].includes(r.studentId))).toBe(true);
  });

  it('filterAttendanceBy with lastName + status + date returns correct AND subset', () => {
    const result = service.filterAttendanceBy({
      lastName: 'Smith',
      status: AttendanceStatus.LATE,
      dateISO: '2025-09-18'
    });
    expect(result).toHaveLength(2);
    expect(result.every(r => ['1', '2'].includes(r.studentId) && r.status === AttendanceStatus.LATE && r.dateISO === '2025-09-18')).toBe(true);
  });

  it('getLateListBy with date returns only LATE for that date', () => {
    const result = service.getLateListBy({ dateISO: '2025-09-18' });
    expect(result).toHaveLength(2);
    expect(result.every(r => r.status === AttendanceStatus.LATE && r.dateISO === '2025-09-18')).toBe(true);
  });

  it('getEarlyDismissalListBy with lastName returns only earlyDismissal = true for that individual', () => {
    const result = service.getEarlyDismissalListBy({ lastName: 'Smith' });
    expect(result).toHaveLength(3); // Bob Smith (2025-09-17, 2025-09-19), Alice Smith (2025-09-19)
    expect(result.some(r => r.studentId === '2' && r.earlyDismissal && r.dateISO === '2025-09-17')).toBe(true);
    expect(result.some(r => r.studentId === '2' && r.earlyDismissal && r.dateISO === '2025-09-19')).toBe(true);
    expect(result.some(r => r.studentId === '1' && r.earlyDismissal && r.dateISO === '2025-09-19')).toBe(true);
  });

  it('Case-insensitive lastName matching verified via Student repo resolution', () => {
    const result = service.filterAttendanceBy({ lastName: 'smith' });
    expect(result.every(r => ['1', '2'].includes(r.studentId))).toBe(true);
  });

  // Edge Cases
  it('filterAttendanceBy with non-existent lastName returns empty array', () => {
    const result = service.filterAttendanceBy({ lastName: 'NonExistent' });
    expect(result).toHaveLength(0);
  });

  it('filterAttendanceBy with non-existent date returns empty array', () => {
    const result = service.filterAttendanceBy({ dateISO: '2025-01-01' });
    expect(result).toHaveLength(0);
  });

  it('filterAttendanceBy with empty options returns all attendance records', () => {
    const result = service.filterAttendanceBy({});
    expect(result).toHaveLength(8); // All mock records
  });

  it('filterAttendanceBy with ABSENT status returns only absent records', () => {
    const result = service.filterAttendanceBy({ status: AttendanceStatus.ABSENT });
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe('3');
    expect(result[0].dateISO).toBe('2025-09-17');
    expect(result[0].status).toBe(AttendanceStatus.ABSENT);
  });

  it('filterAttendanceBy with PRESENT status returns only present records', () => {
    const result = service.filterAttendanceBy({ status: AttendanceStatus.PRESENT });
    expect(result).toHaveLength(4);
    expect(result.every(r => r.status === AttendanceStatus.PRESENT)).toBe(true);
  });

  it('filterAttendanceBy with impossible combination returns empty array', () => {
    const result = service.filterAttendanceBy({
      lastName: 'Smith',
      status: AttendanceStatus.ABSENT,
      dateISO: '2025-09-17'
    });
    expect(result).toHaveLength(0); // No Smith student is absent on 2025-09-17
  });

  it('filterAttendanceBy with mixed case lastName works correctly', () => {
    const result1 = service.filterAttendanceBy({ lastName: 'SMITH' });
    const result2 = service.filterAttendanceBy({ lastName: 'Smith' });
    const result3 = service.filterAttendanceBy({ lastName: 'smith' });
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1.length).toBeGreaterThan(0);
  });

  it('getLateListBy with non-existent date returns empty array', () => {
    const result = service.getLateListBy({ dateISO: '2025-01-01' });
    expect(result).toHaveLength(0);
  });

  it('getLateListBy with non-existent lastName returns empty array', () => {
    const result = service.getLateListBy({ lastName: 'NonExistent' });
    expect(result).toHaveLength(0);
  });

  it('getLateListBy with empty options returns all late records', () => {
    const result = service.getLateListBy({});
    expect(result).toHaveLength(3); // All LATE records
    expect(result.every(r => r.status === AttendanceStatus.LATE)).toBe(true);
  });

  it('getLateListBy with specific student and date combination', () => {
    const result = service.getLateListBy({ lastName: 'Smith', dateISO: '2025-09-17' });
    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe('2'); // Bob Smith late on 2025-09-17
    expect(result[0].status).toBe(AttendanceStatus.LATE);
  });

  it('getEarlyDismissalListBy with non-existent date returns empty array', () => {
    const result = service.getEarlyDismissalListBy({ dateISO: '2025-01-01' });
    expect(result).toHaveLength(0);
  });

  it('getEarlyDismissalListBy with non-existent lastName returns empty array', () => {
    const result = service.getEarlyDismissalListBy({ lastName: 'NonExistent' });
    expect(result).toHaveLength(0);
  });

  it('getEarlyDismissalListBy with empty options returns all early dismissal records', () => {
    const result = service.getEarlyDismissalListBy({});
    expect(result).toHaveLength(4); // All earlyDismissal = true records
    expect(result.every(r => r.earlyDismissal === true)).toBe(true);
  });

  it('getEarlyDismissalListBy with specific date filters correctly', () => {
    const result = service.getEarlyDismissalListBy({ dateISO: '2025-09-19' });
    expect(result).toHaveLength(2); // Alice and Bob both have early dismissal on 2025-09-19
    expect(result.every(r => r.dateISO === '2025-09-19' && r.earlyDismissal === true)).toBe(true);
  });

  it('getEarlyDismissalListBy with lastName Jones returns only Charlie early dismissals', () => {
    const result = service.getEarlyDismissalListBy({ lastName: 'Jones' });
    expect(result).toHaveLength(1); // Only Charlie (studentId '3') has early dismissal
    expect(result[0].studentId).toBe('3');
    expect(result[0].dateISO).toBe('2025-09-18');
    expect(result[0].earlyDismissal).toBe(true);
  });

  it('getEarlyDismissalListBy with impossible combination returns empty array', () => {
    const result = service.getEarlyDismissalListBy({ lastName: 'Jones', dateISO: '2025-09-17' });
    expect(result).toHaveLength(0); // Charlie has no early dismissal on 2025-09-17
  });

  it('filterAttendanceBy sorts results deterministically by date then studentId', () => {
    const result = service.filterAttendanceBy({ lastName: 'Smith' });
    // Should be sorted by dateISO first, then studentId
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];
      const dateComparison = prev.dateISO.localeCompare(curr.dateISO);
      if (dateComparison === 0) {
        expect(prev.studentId.localeCompare(curr.studentId)).toBeLessThanOrEqual(0);
      } else {
        expect(dateComparison).toBeLessThan(0);
      }
    }
  });

  it('getEarlyDismissalListBy sorts results deterministically by date then studentId', () => {
    const result = service.getEarlyDismissalListBy({});
    // Should be sorted by dateISO first, then studentId
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1];
      const curr = result[i];
      const dateComparison = prev.dateISO.localeCompare(curr.dateISO);
      if (dateComparison === 0) {
        expect(prev.studentId.localeCompare(curr.studentId)).toBeLessThanOrEqual(0);
      } else {
        expect(dateComparison).toBeLessThan(0);
      }
    }
  });
});
