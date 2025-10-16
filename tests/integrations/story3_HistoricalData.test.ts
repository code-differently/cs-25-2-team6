import { describe, it, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { StudentsCommand } from '../../src/cli/commands/students';
import { AttendanceCommand } from '../../src/cli/commands/attendance';
import { HistoryCommand } from '../../src/cli/commands/history';
import { AlertsCommand } from '../../src/cli/commands/alerts';

const studentsPath = path.resolve(__dirname, '../../src/persistence/students.json');
const attendancePath = path.resolve(__dirname, '../../src/persistence/attendance.json');
const alertRulesPath = path.resolve(__dirname, '../../src/persistence/alert_rules.json');
const schedulePath = path.resolve(__dirname, '../../src/persistence/scheduled_days_off.json');

beforeEach(() => {
  fs.writeFileSync(studentsPath, '[]', 'utf-8');
  fs.writeFileSync(attendancePath, '[]', 'utf-8');
  fs.writeFileSync(alertRulesPath, '[]', 'utf-8');
  fs.writeFileSync(schedulePath, '[]', 'utf-8');
});


function captureConsole(fn: () => Promise<void>) {
   let output = '';
   const originalLog = console.log;
   console.log = (msg: string) => { output += msg + '\n'; };
   return fn().then(() => {
       console.log = originalLog;
       return output;
   });
}


describe('Historical Data Integration', () => {
   it('should support digital log, rollups, YTD, and alerts', async () => {
       // Arrange: Create student
       const studentsCmd = new StudentsCommand();
       await studentsCmd.run(['add', '--first', 'Sam', '--last', 'Taylor']);
       const studentId = 'Sam_Taylor'; // Based on the ID generation pattern


       // Seed attendance for ~45 days
       const attendanceCmd = new AttendanceCommand();
       const startDate = new Date('2025-08-01');
       for (let i = 0; i < 45; i++) {
           const date = new Date(startDate);
           date.setDate(startDate.getDate() + i);
           const iso = date.toISOString().slice(0, 10);
           if (i % 10 === 0) {
               await attendanceCmd.run(['mark', '--first', 'Sam', '--last', 'Taylor', '--date', iso, '--excused']); // EXCUSED
           } else if (i % 7 === 0) {
               await attendanceCmd.run(['mark', '--first', 'Sam', '--last', 'Taylor', '--date', iso, '--late']); // LATE
           } else if (i % 5 === 0) {
               await attendanceCmd.run(['mark', '--first', 'Sam', '--last', 'Taylor', '--date', iso]); // ABSENT
           } else {
               await attendanceCmd.run(['mark', '--first', 'Sam', '--last', 'Taylor', '--date', iso, '--on-time']); // PRESENT
           }
       }


       // Set alert thresholds
       const alertsCmd = new AlertsCommand();
       await alertsCmd.run(['alerts', 'set', '--absences30', '3', '--lates30', '3', '--absencesTotal', '5', '--latesTotal', '5']);


       // Act & Assert: history view daily
       const historyCmd = new HistoryCommand();
       const D1 = '2025-08-01';
       const D2 = '2025-09-14';
       let output = '';
       console.log = (msg: string) => { output = msg; };
       await historyCmd.run(['view', '--student-id', studentId, '--view', 'daily', '--start', D1, '--end', D2]);
       let buckets = JSON.parse(output);
       expect(Array.isArray(buckets)).toBe(true);
       expect(buckets.length).toBeGreaterThan(0);


       // Act & Assert: weekly view
       await historyCmd.run(['view', '--student-id', studentId, '--view', 'weekly', '--start', D1, '--end', D2]);
       buckets = JSON.parse(output);
       expect(Array.isArray(buckets)).toBe(true);
       expect(buckets.length).toBeGreaterThan(0);


       // Act & Assert: monthly view
       await historyCmd.run(['view', '--student-id', studentId, '--view', 'monthly', '--start', D1, '--end', D2]);
       buckets = JSON.parse(output);
       expect(Array.isArray(buckets)).toBe(true);
       expect(buckets.length).toBeGreaterThan(0);


       // Act & Assert: YTD
       await historyCmd.run(['ytd', '--student-id', studentId]);
       const ytdSummary = JSON.parse(output);
       expect(ytdSummary.absent).toBeGreaterThanOrEqual(0);
       expect(ytdSummary.late).toBeGreaterThanOrEqual(0);
       expect(ytdSummary.excused).toBeGreaterThanOrEqual(0);


       // Act & Assert: alerts check (should emit ALERT)
       const D_end = D2;
       const alertOutput = await captureConsole(() => alertsCmd.run(['alerts', 'check', '--student-id', studentId, '--on', D_end]));
       expect(alertOutput).toMatch(/ALERT:/);


       // Lower counts or raise thresholds, assert no alert
       await alertsCmd.run(['alerts', 'set', '--absences30', '100', '--lates30', '100', '--absencesTotal', '100', '--latesTotal', '100']);
       const noAlertOutput = await captureConsole(() => alertsCmd.run(['alerts', 'check', '--student-id', studentId, '--on', D_end]));
       expect(noAlertOutput).not.toMatch(/ALERT:/);
       console.log = msg => process.stdout.write(msg + '\n'); // restore
   });
});
