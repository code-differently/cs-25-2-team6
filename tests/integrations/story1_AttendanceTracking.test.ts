import { describe, it, expect, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { StudentsCommand } from '../../src/cli/commands/students';
import { AttendanceCommand } from '../../src/cli/commands/attendance';
import { FileAttendanceRepo } from '../../src/persistence/FileAttendanceRepo';
import { FileStudentRepo } from '../../src/persistence/FileStudentRepo';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';

const studentsPath = path.resolve(__dirname, '../../src/persistence/students.json');
const attendancePath = path.resolve(__dirname, '../../src/persistence/attendance.json');

beforeEach(() => {
  fs.writeFileSync(studentsPath, '[]', 'utf-8');
  fs.writeFileSync(attendancePath, '[]', 'utf-8');
});

describe('Attendance Tracker Integration', () => {
  it('should add a student and mark attendance correctly', async () => {
    // Arrange: Add Ava Carter
    const studentsCmd = new StudentsCommand();
    await studentsCmd.run(['add', '--first', 'Ava', '--last', 'Carter']);

    // Get studentId from repo
    const studentRepo = new FileStudentRepo();
    const studentId = studentRepo.findStudentIdByName('Ava', 'Carter');
    expect(studentId).toBeDefined();

    // Act: Mark PRESENT for 2025-09-17
    const attendanceCmd = new AttendanceCommand();
    await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Carter', '--date', '2025-09-17', '--on-time']);

    // Assert: PRESENT record exists for Ava on 2025-09-17
    const repo = new FileAttendanceRepo();
    let records = repo.allAttendance();
    console.log('Attendance records after marking PRESENT:', records);
    const presentRecord = records.find(
      r => r.studentId === studentId && r.dateISO === '2025-09-17' && r.status === AttendanceStatus.PRESENT
    );
    expect(presentRecord).toBeDefined();

    // Act: Mark ABSENT for 2025-09-18 (no flags)
    await attendanceCmd.run(['mark', '--first', 'Ava', '--last', 'Carter', '--date', '2025-09-18']);

    // Assert: ABSENT record exists for Ava on 2025-09-18
    records = repo.allAttendance();
    console.log('Attendance records after marking ABSENT:', records);
    const absentRecord = records.find(
      r => r.studentId === studentId && r.dateISO === '2025-09-18' && r.status === AttendanceStatus.ABSENT
    );
    expect(absentRecord).toBeDefined();
  });
});