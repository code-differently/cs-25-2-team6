import { ScheduleService } from './ScheduleService';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';

const TEST_STUDENTS = [
  { id: '1', firstName: 'Alice', lastName: 'Smith' },
  { id: '2', firstName: 'Bob', lastName: 'Jones' },
  { id: '3', firstName: 'Charlie', lastName: 'Brown' }
];

describe('ScheduleService', () => {
  const service = new ScheduleService();
  const studentRepo = new FileStudentRepo();
  const attendanceRepo = new FileAttendanceRepo();

  beforeEach(() => {
    // Clear and add test students
    const fs = require('fs');
    fs.writeFileSync(studentRepo['filePath'], JSON.stringify([]));
    fs.writeFileSync(attendanceRepo['filePath'], JSON.stringify([]));
    TEST_STUDENTS.forEach(s => studentRepo.saveStudent(s));
  });

  describe('applyPlannedDayOffToAllStudents', () => {
    it('creates EXCUSED records for all students on planned day off', () => {
      const dateISO = '2025-09-23'; // A Monday
      
      service.applyPlannedDayOffToAllStudents(dateISO);
      
      const allRecords = attendanceRepo.allAttendance();
      const excusedRecords = allRecords.filter(record => 
        record.dateISO === dateISO && record.status === AttendanceStatus.EXCUSED
      );
      
      expect(excusedRecords).toHaveLength(TEST_STUDENTS.length);
      TEST_STUDENTS.forEach(student => {
        const studentRecord = excusedRecords.find(record => record.studentId === student.id);
        expect(studentRecord).toBeDefined();
        expect(studentRecord!.status).toBe(AttendanceStatus.EXCUSED);
      });
    });

    it('is idempotent - running twice does not duplicate EXCUSED entries', () => {
      const dateISO = '2025-09-23'; // A Monday
      
      // Run the method first time
      service.applyPlannedDayOffToAllStudents(dateISO);
      const recordsAfterFirst = attendanceRepo.allAttendance();
      const excusedAfterFirst = recordsAfterFirst.filter(record => 
        record.dateISO === dateISO && record.status === AttendanceStatus.EXCUSED
      );
      
      // Run the method second time
      service.applyPlannedDayOffToAllStudents(dateISO);
      const recordsAfterSecond = attendanceRepo.allAttendance();
      const excusedAfterSecond = recordsAfterSecond.filter(record => 
        record.dateISO === dateISO && record.status === AttendanceStatus.EXCUSED
      );
      
      // Should have same number of records - no duplicates created
      expect(excusedAfterFirst).toHaveLength(TEST_STUDENTS.length);
      expect(excusedAfterSecond).toHaveLength(TEST_STUDENTS.length);
      expect(recordsAfterFirst).toHaveLength(recordsAfterSecond.length);
      
      // Verify each student has exactly one record for this date
      TEST_STUDENTS.forEach(student => {
        const studentRecords = recordsAfterSecond.filter(record => 
          record.studentId === student.id && record.dateISO === dateISO
        );
        expect(studentRecords).toHaveLength(1);
        expect(studentRecords[0].status).toBe(AttendanceStatus.EXCUSED);
      });
    });

    it('does not overwrite existing attendance records', () => {
      const dateISO = '2025-09-23'; // A Tuesday
      
      // Create an existing PRESENT record for Alice
      const existingRecord = new AttendanceRecord({
        studentId: '1', // Alice's ID
        dateISO,
        status: AttendanceStatus.PRESENT
      });
      attendanceRepo.saveAttendance(existingRecord);
      
      // Apply planned day off
      service.applyPlannedDayOffToAllStudents(dateISO);
      
      const allRecords = attendanceRepo.allAttendance();
      const dateRecords = allRecords.filter(record => record.dateISO === dateISO);
      
      // Should have records for all students
      expect(dateRecords).toHaveLength(TEST_STUDENTS.length);
      
      // Alice should still have PRESENT status (not overwritten)
      const aliceRecord = dateRecords.find(record => record.studentId === '1');
      expect(aliceRecord!.status).toBe(AttendanceStatus.PRESENT);
      
      // Bob and Charlie should have EXCUSED status
      const bobRecord = dateRecords.find(record => record.studentId === '2');
      const charlieRecord = dateRecords.find(record => record.studentId === '3');
      expect(bobRecord!.status).toBe(AttendanceStatus.EXCUSED);
      expect(charlieRecord!.status).toBe(AttendanceStatus.EXCUSED);
    });
  });

  describe('isOffDay', () => {
    it('returns true for weekend days (Saturday) without planned activities', () => {
      const saturday = '2025-09-21'; // A Saturday
      
      expect(service.isOffDay(saturday)).toBe(true);
    });

    it('returns true for weekend days (Sunday) without planned activities', () => {
      const sunday = '2025-09-22'; // A Sunday
      
      expect(service.isOffDay(sunday)).toBe(true);
    });

    it('returns false for weekend days with planned activities', () => {
      const saturday = '2025-09-21'; // A Saturday
      
      // Add a PRESENT record for Saturday (special event/makeup day)
      const weekendRecord = new AttendanceRecord({
        studentId: '1',
        dateISO: saturday,
        status: AttendanceStatus.PRESENT
      });
      attendanceRepo.saveAttendance(weekendRecord);
      
      expect(service.isOffDay(saturday)).toBe(false);
    });

    it('returns true for planned weekdays marked as day off for all students', () => {
      const monday = '2025-09-23'; // A Monday
      
      // Apply planned day off for all students
      service.applyPlannedDayOffToAllStudents(monday);
      
      expect(service.isOffDay(monday)).toBe(true);
    });

    it('returns false for regular weekdays without any attendance records', () => {
      const tuesday = '2025-09-23'; // A Tuesday
      
      expect(service.isOffDay(tuesday)).toBe(false);
    });

    it('returns false for weekdays with mixed attendance (not all students excused)', () => {
      const wednesday = '2025-09-24'; // A Wednesday
      
      // Add EXCUSED for some students but not all
      const excusedRecord = new AttendanceRecord({
        studentId: '1', // Alice only
        dateISO: wednesday,
        status: AttendanceStatus.EXCUSED
      });
      attendanceRepo.saveAttendance(excusedRecord);
      
      const presentRecord = new AttendanceRecord({
        studentId: '2', // Bob is present
        dateISO: wednesday,
        status: AttendanceStatus.PRESENT
      });
      attendanceRepo.saveAttendance(presentRecord);
      
      expect(service.isOffDay(wednesday)).toBe(false);
    });

    it('returns false when no students exist in the system', () => {
      // Clear all students
      const fs = require('fs');
      fs.writeFileSync(studentRepo['filePath'], JSON.stringify([]));
      
      const monday = '2025-09-23'; // A Monday  
      const saturday = '2025-09-21'; // A Saturday
      
      // Should return false for both weekdays and weekends when no students exist
      expect(service.isOffDay(monday)).toBe(false);
      expect(service.isOffDay(saturday)).toBe(false);
    });
  });

  describe('Integration with ReportService', () => {
    const ReportService = require('./ReportService').ReportService;
    let reportService: any;

    beforeEach(() => {
      reportService = new ReportService();
    });

    it('when all days in a range are off days, result totals are all zeros (empty buckets)', () => {
      const monday = '2025-09-23';    // Monday
      const tuesday = '2025-09-24';   // Tuesday  
      const wednesday = '2025-09-25'; // Wednesday

      // Apply planned day off for all students across multiple days
      service.applyPlannedDayOffToAllStudents(monday);
      service.applyPlannedDayOffToAllStudents(tuesday);
      service.applyPlannedDayOffToAllStudents(wednesday);

      // Verify all days are considered off days
      expect(service.isOffDay(monday)).toBe(true);
      expect(service.isOffDay(tuesday)).toBe(true);
      expect(service.isOffDay(wednesday)).toBe(true);

      // Get daily buckets for the range - should return empty array since all days are off
      const dailyBuckets = reportService.getHistoryByTimeframe({
        studentId: '1', // Alice
        timeframe: 'DAILY',
        startISO: monday,
        endISO: wednesday
      });

      // When all days are off days (EXCUSED only), no "active school" buckets should be returned
      // The buckets will exist but show only EXCUSED counts, no late/absent/present
      expect(dailyBuckets).toHaveLength(3); // One bucket per day
      
      dailyBuckets.forEach((bucket: any) => {
        expect(bucket.present).toBe(0);  // No present days
        expect(bucket.late).toBe(0);     // No late days  
        expect(bucket.absent).toBe(0);   // No absent days
        expect(bucket.excused).toBe(1);  // All days are excused
        expect(bucket.earlyDismissal).toBe(0); // No early dismissals
      });

      // Weekly summary should also show zeros for active attendance
      const weeklyBuckets = reportService.getHistoryByTimeframe({
        studentId: '1',
        timeframe: 'WEEKLY', 
        startISO: monday,
        endISO: wednesday
      });

      expect(weeklyBuckets).toHaveLength(1); // All dates fall in same week
      expect(weeklyBuckets[0].present).toBe(0);
      expect(weeklyBuckets[0].late).toBe(0);
      expect(weeklyBuckets[0].absent).toBe(0);
      expect(weeklyBuckets[0].excused).toBe(3); // 3 excused days
      expect(weeklyBuckets[0].earlyDismissal).toBe(0);
    });

    it('EXCUSED records on non-off days still do not count towards late/absent totals', () => {
      const monday = '2025-01-06';    // Regular school day (past date)
      const tuesday = '2025-01-07';   // Regular school day
      const wednesday = '2025-01-08'; // Regular school day

      // Create mixed attendance: some students present, some excused, some late/absent
      // Alice - EXCUSED (sick day on regular school day)
      const aliceExcused = new AttendanceRecord({
        studentId: '1',
        dateISO: monday,
        status: AttendanceStatus.EXCUSED
      });
      attendanceRepo.saveAttendance(aliceExcused);

      // Bob - LATE
      const bobLate = new AttendanceRecord({
        studentId: '2',
        dateISO: monday,
        status: AttendanceStatus.LATE
      });
      attendanceRepo.saveAttendance(bobLate);

      // Charlie - ABSENT  
      const charlieAbsent = new AttendanceRecord({
        studentId: '3',
        dateISO: monday,
        status: AttendanceStatus.ABSENT
      });
      attendanceRepo.saveAttendance(charlieAbsent);

      // This is NOT an off day since not all students are excused
      expect(service.isOffDay(monday)).toBe(false);

      // Verify EXCUSED doesn't count toward late/absent in individual student reports
      const aliceSummary = reportService.getYearToDateSummary('1'); // Alice
      
      expect(aliceSummary.present).toBe(0);
      expect(aliceSummary.late).toBe(0);     // EXCUSED should not count as late
      expect(aliceSummary.absent).toBe(0);   // EXCUSED should not count as absent
      expect(aliceSummary.excused).toBe(1);  // Should count as excused
      expect(aliceSummary.earlyDismissal).toBe(0);

      const bobSummary = reportService.getYearToDateSummary('2'); // Bob
      expect(bobSummary.late).toBe(1);       // Bob was late
      expect(bobSummary.absent).toBe(0);
      expect(bobSummary.excused).toBe(0);

      const charlieSummary = reportService.getYearToDateSummary('3'); // Charlie  
      expect(charlieSummary.late).toBe(0);
      expect(charlieSummary.absent).toBe(1);  // Charlie was absent
      expect(charlieSummary.excused).toBe(0);

      // Daily bucket should show correct segregation
      const dailyBucket = reportService.getHistoryByTimeframe({
        studentId: '1', // Alice only
        timeframe: 'DAILY',
        startISO: monday,
        endISO: monday
      });

      expect(dailyBucket).toHaveLength(1);
      expect(dailyBucket[0].present).toBe(0);
      expect(dailyBucket[0].late).toBe(0);    // Alice's EXCUSED doesn't count as late
      expect(dailyBucket[0].absent).toBe(0);  // Alice's EXCUSED doesn't count as absent  
      expect(dailyBucket[0].excused).toBe(1); // Alice's EXCUSED counts properly
    });

    it('mixed off days and school days show correct totals', () => {
      const monday = '2025-09-23';     // Planned day off (all students excused)
      const tuesday = '2025-09-24';    // Regular school day with mixed attendance  
      const wednesday = '2025-09-25';  // Regular school day with mixed attendance

      // Monday: Planned day off for everyone
      service.applyPlannedDayOffToAllStudents(monday);

      // Tuesday: Mixed attendance on regular school day
      const alicePresentTue = new AttendanceRecord({
        studentId: '1',
        dateISO: tuesday,
        status: AttendanceStatus.PRESENT
      });
      attendanceRepo.saveAttendance(alicePresentTue);

      const bobLateTue = new AttendanceRecord({
        studentId: '2', 
        dateISO: tuesday,
        status: AttendanceStatus.LATE
      });
      attendanceRepo.saveAttendance(bobLateTue);

      // Wednesday: More mixed attendance
      const aliceExcusedWed = new AttendanceRecord({
        studentId: '1',
        dateISO: wednesday,
        status: AttendanceStatus.EXCUSED  // Individual sick day
      });
      attendanceRepo.saveAttendance(aliceExcusedWed);

      const charlieAbsentWed = new AttendanceRecord({
        studentId: '3',
        dateISO: wednesday,
        status: AttendanceStatus.ABSENT
      });
      attendanceRepo.saveAttendance(charlieAbsentWed);

      // Verify off day detection
      expect(service.isOffDay(monday)).toBe(true);    // All excused = off day
      expect(service.isOffDay(tuesday)).toBe(false);  // Mixed attendance = school day
      expect(service.isOffDay(wednesday)).toBe(false); // Mixed attendance = school day

      // Weekly summary should correctly aggregate
      const weeklyBuckets = reportService.getHistoryByTimeframe({
        studentId: '1', // Alice
        timeframe: 'WEEKLY',
        startISO: monday,
        endISO: wednesday
      });

      expect(weeklyBuckets).toHaveLength(1); // Same week
      expect(weeklyBuckets[0].present).toBe(1);   // Tuesday present
      expect(weeklyBuckets[0].late).toBe(0);      // No late days for Alice
      expect(weeklyBuckets[0].absent).toBe(0);    // No absent days for Alice
      expect(weeklyBuckets[0].excused).toBe(2);   // Monday (planned) + Wednesday (individual)
      expect(weeklyBuckets[0].earlyDismissal).toBe(0);

      // Bob's summary (was late on Tuesday, nothing else)
      const bobWeekly = reportService.getHistoryByTimeframe({
        studentId: '2',
        timeframe: 'WEEKLY',
        startISO: monday,
        endISO: wednesday
      });

      expect(bobWeekly[0].present).toBe(0);
      expect(bobWeekly[0].late).toBe(1);      // Tuesday late
      expect(bobWeekly[0].absent).toBe(0);
      expect(bobWeekly[0].excused).toBe(1);   // Monday planned day off
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple calls to applyPlannedDayOffToAllStudents across different dates', () => {
      const monday = '2025-09-23';
      const tuesday = '2025-09-24';
      
      // Apply to both dates
      service.applyPlannedDayOffToAllStudents(monday);
      service.applyPlannedDayOffToAllStudents(tuesday);
      
      const allRecords = attendanceRepo.allAttendance();
      
      // Should have excused records for all students on both dates
      const mondayRecords = allRecords.filter(r => r.dateISO === monday);
      const tuesdayRecords = allRecords.filter(r => r.dateISO === tuesday);
      
      expect(mondayRecords).toHaveLength(TEST_STUDENTS.length);
      expect(tuesdayRecords).toHaveLength(TEST_STUDENTS.length);
      
      // All should be EXCUSED
      mondayRecords.forEach(record => expect(record.status).toBe(AttendanceStatus.EXCUSED));
      tuesdayRecords.forEach(record => expect(record.status).toBe(AttendanceStatus.EXCUSED));
    });

    it('correctly handles isOffDay for dates at year boundaries', () => {
      // New Year's Day 2026 (Wednesday)
      const newYearsDay = '2026-01-01';
      
      // Mark as planned day off
      service.applyPlannedDayOffToAllStudents(newYearsDay);
      
      expect(service.isOffDay(newYearsDay)).toBe(true);
      
      // Previous year's New Year's Eve (Tuesday)
      const newYearsEve = '2025-12-31';
      expect(service.isOffDay(newYearsEve)).toBe(false); // Regular Tuesday
    });

    it('maintains idempotency even with existing mixed attendance records', () => {
      const thursday = '2025-09-25';
      
      // Create some initial records
      const presentRecord = new AttendanceRecord({
        studentId: '1',
        dateISO: thursday,
        status: AttendanceStatus.PRESENT
      });
      attendanceRepo.saveAttendance(presentRecord);
      
      // Apply planned day off (should not affect Alice who is already PRESENT)
      service.applyPlannedDayOffToAllStudents(thursday);
      service.applyPlannedDayOffToAllStudents(thursday); // Second call
      
      const allRecords = attendanceRepo.allAttendance();
      const thursdayRecords = allRecords.filter(r => r.dateISO === thursday);
      
      // Should have exactly 3 records (one per student)
      expect(thursdayRecords).toHaveLength(TEST_STUDENTS.length);
      
      // Alice should still be PRESENT
      const aliceRecord = thursdayRecords.find(r => r.studentId === '1');
      expect(aliceRecord!.status).toBe(AttendanceStatus.PRESENT);
      
      // Bob and Charlie should be EXCUSED
      const bobRecord = thursdayRecords.find(r => r.studentId === '2');
      const charlieRecord = thursdayRecords.find(r => r.studentId === '3');
      expect(bobRecord!.status).toBe(AttendanceStatus.EXCUSED);
      expect(charlieRecord!.status).toBe(AttendanceStatus.EXCUSED);
    });
  });
});