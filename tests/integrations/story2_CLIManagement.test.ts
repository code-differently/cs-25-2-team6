import { describe, it, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { StudentsCommand } from '../../src/cli/commands/students';
import { AttendanceCommand } from '../../src/cli/commands/attendance';
import { ReportCommand } from '../../src/cli/commands/report';

const studentsPath = path.resolve(__dirname, '../../src/persistence/students.json');
const attendancePath = path.resolve(__dirname, '../../src/persistence/attendance.json');

function parseJsonOutput(output: string) {
    try {
        return JSON.parse(output);
    } catch {
        return null;
    }
}

describe('CLI Management Integration', () => {
    beforeEach(() => {
        fs.writeFileSync(studentsPath, '[]', 'utf-8');
        fs.writeFileSync(attendancePath, '[]', 'utf-8');
    });

    it('should filter and report attendance records correctly', async () => {
        // Arrange: Seed students
        const studentsCmd = new StudentsCommand();
        await studentsCmd.run(['add', '--first', 'Ava', '--last', 'Smith']);
        await studentsCmd.run(['add', '--first', 'Ben', '--last', 'Smith']);

        // Seed attendance records
        const attendanceCmd = new AttendanceCommand();
        await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Smith', '--date', '2025-09-17', '--on-time']); // PRESENT
        await attendanceCmd.run(['mark', '--first', 'Ben', '--last', 'Smith', '--date', '2025-09-17', '--late']); // LATE
        await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Smith', '--date', '2025-09-18']); // ABSENT
        await attendanceCmd.run(['mark', '--first', 'Ben', '--last', 'Smith', '--date', '2025-09-18', '--late', '--early-dismissal']); // LATE + earlyDismissal

        // Act & Assert: report filter --status LATE
        const reportCmd = new ReportCommand();
        let output = '';
        const originalLog = console.log;
        console.log = (msg: string) => { output = msg; };
        await reportCmd.run(['filter', '--status', 'LATE']);
        let result = parseJsonOutput(output);
        expect(result.every((r: any) => r.status === 'LATE')).toBe(true);

        // report filter --date 2025-09-17
        await reportCmd.run(['filter', '--date', '2025-09-17']);
        result = parseJsonOutput(output);
        expect(result.every((r: any) => r.dateISO === '2025-09-17')).toBe(true);

        // report filter --last Smith
        await reportCmd.run(['filter', '--last', 'Smith']);
        result = parseJsonOutput(output);
        // Smith students are always the first two added, so their IDs are Ava_Smith and Ben_Smith
        expect(result.every((r: any) => ['Ava_Smith', 'Ben_Smith'].includes(r.studentId))).toBe(true);

        // report late --date 2025-09-18
        await reportCmd.run(['late', '--date', '2025-09-18']);
        result = parseJsonOutput(output);
        expect(result.every((r: any) => r.status === 'LATE' && r.dateISO === '2025-09-18')).toBe(true);

        // report early --last Smith
        await reportCmd.run(['early', '--last', 'Smith']);
        result = parseJsonOutput(output);
        expect(result.every((r: any) => r.earlyDismissal === true && ['Ava_Smith', 'Ben_Smith'].includes(r.studentId))).toBe(true);
        console.log = originalLog;
    });
});
