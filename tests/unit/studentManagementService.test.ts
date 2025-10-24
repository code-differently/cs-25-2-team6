import { StudentManagementService } from '../../src/services/StudentManagementService';
import { FileStudentRepo } from '../../src/persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../../src/persistence/FileAttendanceRepo';
import { StudentProfile } from '../../src/domains/StudentProfile';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';

describe('StudentManagementService', () => {
  let service: StudentManagementService;
  let repo: FileStudentRepo;
  let attendanceRepo: FileAttendanceRepo;

  beforeEach(() => {
    repo = new FileStudentRepo('test_students.json');
    attendanceRepo = new FileAttendanceRepo('test_attendance.json');
    service = new StudentManagementService(repo, attendanceRepo);
    repo.clearAll();
    attendanceRepo.saveMany([]);
  });

  it('should create a student with valid data', async () => {
    const student: StudentProfile = { id: 'stu1', firstName: 'Alice', lastName: 'Smith', grade: 'A' };
    const result = await service.createStudentProfile(student);
    expect(result.validation.valid).toBe(true);
    expect(result.student).toMatchObject(student);
  });

  it('should not create a student with duplicate ID', async () => {
    const student: StudentProfile = { id: 'stu1', firstName: 'Alice', lastName: 'Smith' };
    await service.createStudentProfile(student);
    const result = await service.createStudentProfile(student);
    expect(result.validation.valid).toBe(false);
    expect(result.validation.errors).toContain('ID is not unique');
  });

  it('should update a student profile', async () => {
    const student: StudentProfile = { id: 'stu2', firstName: 'Bob', lastName: 'Jones' };
    await service.createStudentProfile(student);
    const updates = { grade: 'B' };
    const result = await service.updateStudentProfile('stu2', updates);
    expect(result.validation.valid).toBe(true);
    expect(result.student?.grade).toBe('B');
  });

  it('should delete a student and cascade attendance', async () => {
    const student: StudentProfile = { id: 'stu3', firstName: 'Carol', lastName: 'Lee' };
    await service.createStudentProfile(student);
    attendanceRepo.saveAttendance({ studentId: 'stu3', dateISO: '2025-10-24', status: AttendanceStatus.PRESENT, late: false, earlyDismissal: false, onTime: true, excused: false });
    const deleted = await service.deleteStudentProfile('stu3', { cascade: true });
    expect(deleted).toBe(true);
    const attendance = attendanceRepo.getRecordsByStudentId('stu3');
    expect(attendance.length).toBe(0);
  });

  it('should prevent deletion if dependencies exist', async () => {
    const student: StudentProfile = { id: 'stu4', firstName: 'Dan', lastName: 'Kim' };
    await service.createStudentProfile(student);
    attendanceRepo.saveAttendance({ studentId: 'stu4', dateISO: '2025-10-24', status: AttendanceStatus.PRESENT, late: false, earlyDismissal: false, onTime: true, excused: false });
    await expect(service.deleteStudentProfile('stu4', { preventIfDependencies: true })).rejects.toThrow('Cannot delete student: dependencies exist');
  });

  it('should handle bulk operations', async () => {
    const ops = [
      { type: 'create', data: { id: 'stu5', firstName: 'Eve', lastName: 'Moss', grade: 'C' } },
      { type: 'update', id: 'stu5', data: { id: 'stu5', firstName: 'Eve', lastName: 'Moss', grade: 'C' } },
      { type: 'delete', id: 'stu5' }
    ];
    const results = await service.bulkStudentOperations(ops);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);
    expect(results[2].success).toBe(true);
  });
});
