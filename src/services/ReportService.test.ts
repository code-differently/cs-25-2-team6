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
import { ScheduleService } from './ScheduleService';
jest.mock('./ScheduleService');

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

describe('ReportService User Story 3', () => {
  let service: ReportService;
  beforeEach(() => {
    service = new ReportService();
    // @ts-ignore
    (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
      // 2025-09-01 to 2025-09-10, present, late, absent, excused, earlyDismissal
      { studentId: 's1', dateISO: '2025-09-01', status: AttendanceStatus.PRESENT, earlyDismissal: false },
      { studentId: 's1', dateISO: '2025-09-02', status: AttendanceStatus.LATE, earlyDismissal: true },
      { studentId: 's1', dateISO: '2025-09-03', status: AttendanceStatus.ABSENT, earlyDismissal: false },
      { studentId: 's1', dateISO: '2025-09-04', status: AttendanceStatus.EXCUSED, earlyDismissal: false },
      { studentId: 's1', dateISO: '2025-09-05', status: AttendanceStatus.PRESENT, earlyDismissal: true },
      { studentId: 's1', dateISO: '2025-09-08', status: AttendanceStatus.LATE, earlyDismissal: false },
      { studentId: 's1', dateISO: '2025-09-09', status: AttendanceStatus.ABSENT, earlyDismissal: true },
      { studentId: 's1', dateISO: '2025-09-10', status: AttendanceStatus.PRESENT, earlyDismissal: false },
    ]);
  });

  it('daily grouping returns a bucket per calendar day with correct counts', () => {
    const buckets = service.getHistoryByTimeframe({ studentId: 's1', timeframe: 'DAILY', startISO: '2025-09-01', endISO: '2025-09-10' });
    expect(buckets).toHaveLength(8);
    expect(buckets[0]).toMatchObject({ date: '2025-09-01', present: 1 });
    expect(buckets[1]).toMatchObject({ date: '2025-09-02', late: 1, earlyDismissal: 1 });
    expect(buckets[2]).toMatchObject({ date: '2025-09-03', absent: 1 });
    expect(buckets[3]).toMatchObject({ date: '2025-09-04', excused: 1 });
    expect(buckets[4]).toMatchObject({ date: '2025-09-05', present: 1, earlyDismissal: 1 });
    expect(buckets[5]).toMatchObject({ date: '2025-09-08', late: 1 });
    expect(buckets[6]).toMatchObject({ date: '2025-09-09', absent: 1, earlyDismissal: 1 });
    expect(buckets[7]).toMatchObject({ date: '2025-09-10', present: 1 });
  });

  it('weekly grouping rolls up to the week start (Monday)', () => {
    const buckets = service.getHistoryByTimeframe({ studentId: 's1', timeframe: 'WEEKLY', startISO: '2025-09-01', endISO: '2025-09-10' });
    expect(buckets).toHaveLength(2);
    expect(buckets[0].date).toBe('2025-09-01'); // week of Sep 1
    expect(buckets[1].date).toBe('2025-09-08'); // week of Sep 8
    expect(buckets[0].present).toBe(2); // Sep 1, Sep 5
    expect(buckets[1].present).toBe(1); // Sep 10
  });

  it('monthly grouping rolls up to first-of-month', () => {
    const buckets = service.getHistoryByTimeframe({ studentId: 's1', timeframe: 'MONTHLY', startISO: '2025-09-01', endISO: '2025-09-10' });
    expect(buckets).toHaveLength(1);
    expect(buckets[0].date).toBe('2025-09-01');
    expect(buckets[0].present).toBe(3);
    expect(buckets[0].late).toBe(2);
    expect(buckets[0].absent).toBe(2);
    expect(buckets[0].excused).toBe(1);
    expect(buckets[0].earlyDismissal).toBe(3);
  });

  it('YTD summary totals match the underlying set', () => {
    const summary = service.getYearToDateSummary('s1', 2025);
    expect(summary).toEqual({ present: 3, late: 2, absent: 2, excused: 1, earlyDismissal: 3 });
  });

  it('Buckets returned in ascending order', () => {
    const buckets = service.getHistoryByTimeframe({ studentId: 's1', timeframe: 'DAILY', startISO: '2025-09-01', endISO: '2025-09-10' });
    for (let i = 1; i < buckets.length; i++) {
      expect(buckets[i].date >= buckets[i - 1].date).toBe(true);
    }
  });

  it('Edge case: no records returns empty array', () => {
    // @ts-ignore
    service.attendanceRepo.allAttendance = jest.fn().mockReturnValue([]);
    const buckets = service.getHistoryByTimeframe({ studentId: 's1', timeframe: 'DAILY', startISO: '2025-09-01', endISO: '2025-09-10' });
    expect(buckets).toEqual([]);
    const summary = service.getYearToDateSummary('s1', 2025);
    expect(summary).toEqual({ present: 0, late: 0, absent: 0, excused: 0, earlyDismissal: 0 });
  });

  describe('Weekly Bucketing Edge Cases', () => {
    beforeEach(() => {
      // Mock data spanning across week boundaries to test week start rule
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-09-13', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Saturday
        { studentId: 's1', dateISO: '2025-09-14', status: AttendanceStatus.LATE, earlyDismissal: false }, // Sunday  
        { studentId: 's1', dateISO: '2025-09-15', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // Monday
        { studentId: 's1', dateISO: '2025-09-21', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Sunday
        { studentId: 's1', dateISO: '2025-09-22', status: AttendanceStatus.LATE, earlyDismissal: false }, // Monday
      ]);
    });

    it('weekly buckets should start on Monday (documented choice)', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-09-13', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Saturday
        { studentId: 's1', dateISO: '2025-09-14', status: AttendanceStatus.LATE, earlyDismissal: false }, // Sunday  
        { studentId: 's1', dateISO: '2025-09-15', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // Monday
        { studentId: 's1', dateISO: '2025-09-21', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Sunday
        { studentId: 's1', dateISO: '2025-09-22', status: AttendanceStatus.LATE, earlyDismissal: false }, // Monday
      ]);
      
      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'WEEKLY', 
        startISO: '2025-09-13', 
        endISO: '2025-09-22' 
      });
      
      expect(buckets).toHaveLength(3);
      expect(buckets[0].date).toBe('2025-09-08'); // Week of Sep 8-14 (contains Sat 9/13, Sun 9/14)
      expect(buckets[1].date).toBe('2025-09-15'); // Week of Sep 15-21 (contains Mon 9/15, Sun 9/21) 
      expect(buckets[2].date).toBe('2025-09-22'); // Week of Sep 22-28 (contains Mon 9/22)
      
      // Saturday 9/13 and Sunday 9/14 should be in first week
      expect(buckets[0].present).toBe(1); // Saturday 9/13
      expect(buckets[0].late).toBe(1); // Sunday 9/14
      
      // Monday 9/15 and Sunday 9/21 should be in second week  
      expect(buckets[1].absent).toBe(1); // Monday 9/15
      expect(buckets[1].present).toBe(1); // Sunday 9/21
      
      // Monday 9/22 should be in third week
      expect(buckets[2].late).toBe(1); // Monday 9/22
    });

    it('weekly buckets should handle year boundary correctly', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-12-28', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Sunday
        { studentId: 's1', dateISO: '2025-12-29', status: AttendanceStatus.LATE, earlyDismissal: false }, // Monday
        { studentId: 's1', dateISO: '2026-01-01', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // Wednesday
        { studentId: 's1', dateISO: '2026-01-05', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Sunday
        { studentId: 's1', dateISO: '2026-01-06', status: AttendanceStatus.LATE, earlyDismissal: false }, // Monday
      ]);

      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'WEEKLY', 
        startISO: '2025-12-28', 
        endISO: '2026-01-06' 
      });

      expect(buckets).toHaveLength(3);
      expect(buckets[0].date).toBe('2025-12-22'); // Week containing Dec 28 (Sunday)
      expect(buckets[1].date).toBe('2025-12-29'); // Week containing Dec 29 (Monday) and Jan 1 (Wednesday)
      expect(buckets[2].date).toBe('2026-01-05'); // Week containing Jan 5 (Sunday) and Jan 6 (Monday)
    });

    it('weekly buckets with zero counts should not be returned', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-09-01', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Monday
        { studentId: 's1', dateISO: '2025-09-15', status: AttendanceStatus.LATE, earlyDismissal: false }, // Monday (2 weeks later)
      ]);

      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'WEEKLY', 
        startISO: '2025-09-01', 
        endISO: '2025-09-15' 
      });

      expect(buckets).toHaveLength(2); // Only weeks with data, empty week in between is not returned
      expect(buckets[0].date).toBe('2025-09-01'); // Week containing Sep 1 (Monday start of week)
      expect(buckets[1].date).toBe('2025-09-15'); // Week containing Sep 15 (Monday start of week)
    });
  });

  describe('Monthly Bucketing Edge Cases', () => {
    it('monthly buckets should handle February correctly in leap vs non-leap years', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2024-02-28', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Leap year
        { studentId: 's1', dateISO: '2024-02-29', status: AttendanceStatus.LATE, earlyDismissal: false }, // Leap day
        { studentId: 's1', dateISO: '2025-02-28', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // Non-leap year
      ]);

      // Test leap year February (2024)
      const leapYearBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2024-02-01', 
        endISO: '2024-02-29' 
      });
      expect(leapYearBuckets).toHaveLength(1);
      expect(leapYearBuckets[0].date).toBe('2024-02-01');
      expect(leapYearBuckets[0].present).toBe(1);
      expect(leapYearBuckets[0].late).toBe(1);

      // Test non-leap year February (2025)  
      const nonLeapYearBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2025-02-01', 
        endISO: '2025-02-28' 
      });
      expect(nonLeapYearBuckets).toHaveLength(1);
      expect(nonLeapYearBuckets[0].date).toBe('2025-02-01');
      expect(nonLeapYearBuckets[0].absent).toBe(1);
    });

    it('monthly buckets should handle months with different day counts consistently', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-04-30', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // April (30 days)
        { studentId: 's1', dateISO: '2025-05-31', status: AttendanceStatus.LATE, earlyDismissal: false }, // May (31 days)
        { studentId: 's1', dateISO: '2025-06-30', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // June (30 days)  
        { studentId: 's1', dateISO: '2025-07-31', status: AttendanceStatus.EXCUSED, earlyDismissal: false }, // July (31 days)
      ]);

      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2025-04-01', 
        endISO: '2025-07-31' 
      });

      expect(buckets).toHaveLength(4);
      expect(buckets[0].date).toBe('2025-04-01'); // April
      expect(buckets[1].date).toBe('2025-05-01'); // May
      expect(buckets[2].date).toBe('2025-06-01'); // June 
      expect(buckets[3].date).toBe('2025-07-01'); // July
      
      // Each month should correctly count its last day
      expect(buckets[0].present).toBe(1); // April 30
      expect(buckets[1].late).toBe(1); // May 31
      expect(buckets[2].absent).toBe(1); // June 30
      expect(buckets[3].excused).toBe(1); // July 31
    });

    it('monthly buckets with zero counts should not be returned', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-01-15', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // January
        { studentId: 's1', dateISO: '2025-03-15', status: AttendanceStatus.LATE, earlyDismissal: false }, // March (skip February)
        { studentId: 's1', dateISO: '2025-05-15', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // May (skip April)
      ]);

      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2025-01-01', 
        endISO: '2025-05-31' 
      });

      expect(buckets).toHaveLength(3); // Only months with data, empty months are not returned
      expect(buckets[0].date).toBe('2025-01-01');
      expect(buckets[1].date).toBe('2025-03-01');
      expect(buckets[2].date).toBe('2025-05-01');
      // February and April should be missing since they have zero counts
    });

    it('monthly buckets should handle year transitions correctly', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-12-15', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // December 2025
        { studentId: 's1', dateISO: '2025-12-31', status: AttendanceStatus.LATE, earlyDismissal: false }, // Last day of 2025
        { studentId: 's1', dateISO: '2026-01-01', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // First day of 2026
        { studentId: 's1', dateISO: '2026-01-15', status: AttendanceStatus.EXCUSED, earlyDismissal: false }, // January 2026
      ]);

      const buckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2025-12-01', 
        endISO: '2026-01-31' 
      });

      expect(buckets).toHaveLength(2);
      expect(buckets[0].date).toBe('2025-12-01'); // December 2025
      expect(buckets[1].date).toBe('2026-01-01'); // January 2026
      
      expect(buckets[0].present).toBe(1);
      expect(buckets[0].late).toBe(1);
      expect(buckets[1].absent).toBe(1);  
      expect(buckets[1].excused).toBe(1);
    });
  });

  describe('Zero Count Buckets Edge Cases', () => {
    it('should document that zero count buckets are NOT returned by default', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([]);

      // Test daily buckets with no data
      const dailyBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'DAILY', 
        startISO: '2025-09-01', 
        endISO: '2025-09-07' 
      });
      expect(dailyBuckets).toEqual([]); // Empty array, not days with zero counts

      // Test weekly buckets with no data  
      const weeklyBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'WEEKLY', 
        startISO: '2025-09-01', 
        endISO: '2025-09-30' 
      });
      expect(weeklyBuckets).toEqual([]); // Empty array, not weeks with zero counts

      // Test monthly buckets with no data
      const monthlyBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'MONTHLY', 
        startISO: '2025-01-01', 
        endISO: '2025-12-31' 
      });
      expect(monthlyBuckets).toEqual([]); // Empty array, not months with zero counts
    });

    it('should verify sparse data does not return intermediate zero buckets', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: 's1', dateISO: '2025-09-01', status: AttendanceStatus.PRESENT, earlyDismissal: false }, // Monday
        { studentId: 's1', dateISO: '2025-09-05', status: AttendanceStatus.LATE, earlyDismissal: false }, // Friday (same week)
        { studentId: 's1', dateISO: '2025-09-15', status: AttendanceStatus.ABSENT, earlyDismissal: false }, // Monday (2 weeks later)
      ]);

      // Daily timeframe should not return days without data
      const dailyBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'DAILY', 
        startISO: '2025-09-01', 
        endISO: '2025-09-15' 
      });
      expect(dailyBuckets).toHaveLength(3); // Only the 3 days with data
      expect(dailyBuckets[0].date).toBe('2025-09-01');
      expect(dailyBuckets[1].date).toBe('2025-09-05');
      expect(dailyBuckets[2].date).toBe('2025-09-15');
      // Sept 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14 should NOT be returned

      // Weekly timeframe should not return weeks without data  
      const weeklyBuckets = service.getHistoryByTimeframe({ 
        studentId: 's1', 
        timeframe: 'WEEKLY', 
        startISO: '2025-09-01', 
        endISO: '2025-09-15' 
      });
      expect(weeklyBuckets).toHaveLength(2); // Only 2 weeks with data
      expect(weeklyBuckets[0].date).toBe('2025-09-01'); // Week containing Sep 1 (Monday) & Sep 5 (Friday) 
      expect(weeklyBuckets[1].date).toBe('2025-09-15'); // Week containing Sep 15 (Monday)
      // The week of Sep 8-14 with no data should NOT be returned
    });
  });

  describe('ReportService Planned/Weekend Exclusion', () => {
    let service: ReportService;
    let scheduleServiceMock: any;
    beforeEach(() => {
      service = new ReportService();
      scheduleServiceMock = { isOffDay: jest.fn() };
      (service as any).scheduleService = scheduleServiceMock;
    });

    it('excludes weekends/planned days from daily/weekly/monthly/YTD totals', () => {
      // Mock attendance records for 3 days: one normal, one weekend, one planned
      // 2025-09-18 (Thu), 2025-09-20 (Sat), 2025-09-21 (Sun), 2025-09-22 (Mon, planned)
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.PRESENT, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-20', status: AttendanceStatus.LATE, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-21', status: AttendanceStatus.ABSENT, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-22', status: AttendanceStatus.PRESENT, earlyDismissal: false },
      ]);
      // Only 2025-09-18 is not off day
      scheduleServiceMock.isOffDay.mockImplementation((dateISO: string) => ['2025-09-20','2025-09-21','2025-09-22'].includes(dateISO));
      const buckets = service.getHistoryByTimeframe({ studentId: '1', timeframe: 'DAILY', startISO: '2025-09-18', endISO: '2025-09-22' });
      expect(buckets).toHaveLength(1);
      expect(buckets[0].date).toBe('2025-09-18');
      expect(buckets[0].present).toBe(1);
      // YTD summary
      const summary = service.getYearToDateSummary('1', 2025);
      expect(summary.present).toBe(1);
      expect(summary.late).toBe(0);
      expect(summary.absent).toBe(0);
      expect(summary.excused).toBe(0);
    });

    it('EXCUSED records never increment late/absent/present', () => {
      (service as any).attendanceRepo.allAttendance = jest.fn().mockReturnValue([
        { studentId: '1', dateISO: '2025-09-18', status: AttendanceStatus.EXCUSED, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-19', status: AttendanceStatus.PRESENT, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-20', status: AttendanceStatus.LATE, earlyDismissal: false },
        { studentId: '1', dateISO: '2025-09-21', status: AttendanceStatus.ABSENT, earlyDismissal: false },
      ]);
      scheduleServiceMock.isOffDay.mockReturnValue(false);
      const buckets = service.getHistoryByTimeframe({ studentId: '1', timeframe: 'DAILY', startISO: '2025-09-18', endISO: '2025-09-21' });
      expect(buckets).toHaveLength(4);
      expect(buckets[0].excused).toBe(1);
      expect(buckets[0].present).toBe(0);
      expect(buckets[0].late).toBe(0);
      expect(buckets[0].absent).toBe(0);
      // YTD summary
      const summary = service.getYearToDateSummary('1', 2025);
      expect(summary.excused).toBe(1);
      expect(summary.present).toBe(1);
      expect(summary.late).toBe(1);
      expect(summary.absent).toBe(1);
    });
  });
});
