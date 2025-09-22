import { describe, it, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { StudentsCommand } from '../../src/cli/commands/students';
import { AttendanceCommand } from '../../src/cli/commands/attendance';
import { ScheduleCommand } from '../../src/cli/commands/schedule';
import { HistoryCommand } from '../../src/cli/commands/history';
import { FileAttendanceRepo } from '../../src/persistence/FileAttendanceRepo'; 

const studentsPath = path.resolve(__dirname, '../../src/persistence/students.json');
const attendancePath = path.resolve(__dirname, '../../src/persistence/attendance.json');
const schedulePath = path.resolve(__dirname, '../../src/persistence/scheduled_days_off.json');

beforeEach(() => {
  fs.writeFileSync(studentsPath, '[]', 'utf-8');
  fs.writeFileSync(attendancePath, '[]', 'utf-8');
  fs.writeFileSync(schedulePath, '[]', 'utf-8');
}); 


function getWeekend(dateStr: string): boolean {
   const date = new Date(dateStr);
   const day = date.getDay();
   return day === 0 || day === 6;
}


describe('Scheduled Days Off Integration', () => {
   it('should auto-excuse students and exclude planned/off days from reports', async () => {
       // Arrange: Create students
       const studentsCmd = new StudentsCommand();
       await studentsCmd.run(['add', '--first', 'Alice', '--last', 'Lee']);
       await studentsCmd.run(['add', '--first', 'Bob', '--last', 'Lee']);
       await studentsCmd.run(['add', '--first', 'Cara', '--last', 'Lee']);


       // Seed attendance for YTD totals
       const attendanceCmd = new AttendanceCommand();
       await attendanceCmd.run(['mark', '--first', 'Alice', '--last', 'Lee', '--date', '2025-09-10', '--on-time']);
       await attendanceCmd.run(['mark', '--first', 'Bob', '--last', 'Lee', '--date', '2025-09-10', '--late']);
       await attendanceCmd.run(['mark', '--first', 'Cara', '--last', 'Lee', '--date', '2025-09-10']); // ABSENT


       // Debug: Check all records before applying
       const attendanceRepo = new FileAttendanceRepo();
       const records_before = attendanceRepo.allAttendance();
       console.log('Records before apply:', records_before.length);
       
       // Act: plan and apply off day
       const D1 = '2025-09-15';
       const scheduleCmd = new ScheduleCommand();
       await scheduleCmd.run(['schedule', 'plan', '--date', D1, '--reason', 'HOLIDAY']);
       await scheduleCmd.run(['schedule', 'apply', '--date', D1]);

       // Debug: Check all records after applying
       const records_after = attendanceRepo.allAttendance();
       console.log('Records after apply:', records_after.length);
       console.log('All records:', records_after.map(r => ({ studentId: r.studentId, dateISO: r.dateISO, status: r.status })));

       // Assert: auto EXCUSED for all students on D1
       const records = attendanceRepo.allAttendance();
       const excusedOnD1 = records.filter((r: any) => r.dateISO === D1 && r.status === 'EXCUSED');
       expect(excusedOnD1.length).toBe(3);


       // Assert: reports exclude weekends & planned days
       const historyCmd = new HistoryCommand();
       const D0 = '2025-09-10';
       const D2 = '2025-09-17';
       let output = '';
       console.log = (msg: string) => { output = msg; };
       await historyCmd.run(['history', 'view', '--student-id', '1', '--view', 'daily', '--start', D0, '--end', D2]);
       const buckets = JSON.parse(output);
       // D1 should not increment present/late/absent (should be excluded from report)
       const d1Bucket = buckets.find((b: any) => b.date === D1);
       expect(d1Bucket).toBeUndefined(); // D1 should be excluded from buckets since it's a planned day off
       // Pick a weekend date W
       const W = '2025-09-14'; // Sunday
       expect(getWeekend(W)).toBe(true);
       const wBucket = buckets.find((b: any) => b.date === W);
       expect(wBucket).toBeUndefined();


       // Bonus: attempt to mark on off day
       await attendanceCmd.run(['mark', '--first', 'Alice', '--last', 'Lee', '--date', D1, '--on-time']);
       const recordsAfter = attendanceRepo.allAttendance();
       const aliceExcused = recordsAfter.find((r: any) => r.studentId.includes('Alice') && r.dateISO === D1 && r.status === 'EXCUSED');
       expect(aliceExcused).toBeDefined();
       console.log = msg => process.stdout.write(msg + '\n'); // restore
   });
});
