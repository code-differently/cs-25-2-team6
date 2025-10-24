import { ClassManagementService } from '../../src/services/ClassManagementService';
import { ClassProfile } from '../../src/domains/ClassProfile';
import { FileClassRepo } from '../../src/persistence/FileClassRepo';
import { FileClassStudentRepo } from '../../src/persistence/FileClassStudentRepo';
import { FileStudentRepo } from '../../src/persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../../src/persistence/FileAttendanceRepo';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';
import { AttendanceRecord } from '../../src/domains/AttendanceRecords';

describe('ClassManagementService', () => {
  let service: ClassManagementService;
  let classRepo: FileClassRepo;
  let classStudentRepo: FileClassStudentRepo;
  let studentRepo: FileStudentRepo;
  let attendanceRepo: FileAttendanceRepo;

  beforeEach(() => {
    classRepo = new FileClassRepo();
    classStudentRepo = new FileClassStudentRepo();
    studentRepo = new FileStudentRepo();
    attendanceRepo = new FileAttendanceRepo();
    service = new ClassManagementService(classRepo, classStudentRepo, studentRepo, attendanceRepo);
    // Add some students
    studentRepo.addStudent({ id: 's1', firstName: 'Alice', lastName: 'Smith' });
    studentRepo.addStudent({ id: 's2', firstName: 'Bob', lastName: 'Jones' });
  });

  it('creates a class with students', async () => {
    const classData: ClassProfile = { id: 'c1', name: 'Math' };
    const result = await service.createClassWithStudents(classData, ['s1', 's2']);
    expect(result.validation.valid).toBe(true);
    expect(result.class).toEqual(classData);
    expect(classStudentRepo.getStudentsInClass('c1')).toEqual(['s1', 's2']);
  });

  it('rejects duplicate student IDs', async () => {
    const classData: ClassProfile = { id: 'c2', name: 'Science' };
    const result = await service.createClassWithStudents(classData, ['s1', 's1']);
    expect(result.validation.valid).toBe(false);
    expect(result.validation.errors).toContain('Duplicate student ID: s1');
  });

  it('rejects non-existent student IDs', async () => {
    const classData: ClassProfile = { id: 'c3', name: 'History' };
    const result = await service.createClassWithStudents(classData, ['s1', 's3']);
    expect(result.validation.valid).toBe(false);
    expect(result.validation.errors).toContain('Student not found: s3');
  });

  it('removes students from class', async () => {
    const classData: ClassProfile = { id: 'c4', name: 'Art' };
    await service.createClassWithStudents(classData, ['s1', 's2']);
    await service.removeStudentsFromClass('c4', ['s1']);
    expect(classStudentRepo.getStudentsInClass('c4')).toEqual(['s2']);
  });

  it('cascade deletes students from class', async () => {
    const classData: ClassProfile = { id: 'c5', name: 'Music' };
    await service.createClassWithStudents(classData, ['s1', 's2']);
    await service.deleteClassSafely('c5', false);
    expect(classStudentRepo.getStudentsInClass('c5')).toEqual([]);
    expect(classRepo.findClassById('c5')).toBeUndefined();
  });

  it('attendance summary returns correct records', async () => {
    // Add attendance records
    attendanceRepo.saveAttendance(new AttendanceRecord({ studentId: 's1', dateISO: '2025-10-01', status: AttendanceStatus.PRESENT, late: false, earlyDismissal: false }));
    attendanceRepo.saveAttendance(new AttendanceRecord({ studentId: 's2', dateISO: '2025-10-02', status: AttendanceStatus.ABSENT, late: false, earlyDismissal: false }));
    const classData: ClassProfile = { id: 'c6', name: 'PE' };
    await service.createClassWithStudents(classData, ['s1', 's2']);
    const summary = await service.getClassAttendanceSummary('c6', { start: '2025-10-01', end: '2025-10-02' });
    expect(summary.attendanceRecords.length).toBe(2);
  });
});
