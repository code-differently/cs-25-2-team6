import { describe, it, expect } from '@jest/globals';
import { StudentsCommand } from '../../src/cli/commands/students';
import { AttendanceCommand } from '../../src/cli/commands/attendance';
//import { allAttendance } from '../../src/reports/allAttendance';

describe('Attendance Tracker Integration', () => {
    it('should add a student and mark attendance correctly', async () => {
        // Arrange: Add Ava Carter
        const studentsCmd = new StudentsCommand();
        await studentsCmd.run(['add', '--first', 'Ava', '--last', 'Carter']);

        // Act: Mark ON_TIME for 2025-09-17
        const attendanceCmd = new AttendanceCommand();
        await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Carter', '--date', '2025-09-17', '--on-time']);

        // Assert: PRESENT record exists for Ava on 2025-09-17
        const records = await allAttendance();
        const presentRecord = records.find(r => r.first === 'Ava' && r.last === 'Carter' && r.date === '2025-09-17' && r.status === 'ON_TIME');
        expect(presentRecord).toBeDefined();

        // Act: Mark ABSENT for 2025-09-18 (no flags)
        await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Carter', '--date', '2025-09-18']);

        // Assert: ABSENT record exists for Ava on 2025-09-18
        const absentRecord = records.find(r => r.first === 'Ava' && r.last === 'Carter' && r.date === '2025-09-18' && r.status === 'ABSENT');
        expect(absentRecord).toBeDefined();
    });
});