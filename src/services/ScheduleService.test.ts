import { ScheduleService } from './ScheduleService';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';

jest.mock('../persistence/FileStudentRepo');
jest.mock('../persistence/FileAttendanceRepo');

describe('ScheduleService', () => {
  let service: ScheduleService;
  let studentRepo: any;
  let attendanceRepo: any;
  let scheduleRepo: any;

  beforeEach(() => {
    service = new ScheduleService();
    studentRepo = { allStudents: jest.fn().mockReturnValue([]) };
    attendanceRepo = { 
      findAttendanceBy: jest.fn(), 
      saveAttendance: jest.fn(),
      allAttendance: jest.fn().mockReturnValue([])
    };
    scheduleRepo = { saveDayOff: jest.fn(), isPlannedDayOff: jest.fn(), hasDayOff: jest.fn() };
    (service as any).studentRepo = studentRepo;
    (service as any).attendanceRepo = attendanceRepo;
    (service as any).scheduleRepo = scheduleRepo;
  });

  it('isWeekend returns true for Sat/Sun; false otherwise', () => {
    expect(service.isWeekend('2025-09-20')).toBe(true); // Saturday
    expect(service.isWeekend('2025-09-21')).toBe(true); // Sunday
    expect(service.isWeekend('2025-09-22')).toBe(false); // Monday
  });

  it('planDayOff then isPlannedDayOff returns true', () => {
    scheduleRepo.hasDayOff.mockReturnValue(true);
    service.planDayOff({ dateISO: '2025-09-23', reason: 'HOLIDAY' });
    expect(scheduleRepo.saveDayOff).toHaveBeenCalledWith({ dateISO: '2025-09-23', reason: 'HOLIDAY', scope: 'ALL_STUDENTS' });
    expect(service.isPlannedDayOff('2025-09-23')).toBe(true);
  });

  it('isOffDay true when weekend OR planned', () => {
    // First call: not planned, not weekend; second call: planned
    scheduleRepo.hasDayOff.mockImplementation((dateISO: string) => dateISO === '2025-09-23');
    expect(service.isOffDay('2025-09-20')).toBe(true); // Saturday
    expect(service.isOffDay('2025-09-22')).toBe(false); // Monday, not planned
    expect(service.isOffDay('2025-09-23')).toBe(true); // planned
  });

  it('applyPlannedDayOffToAllStudents creates one EXCUSED record per student (idempotent on repeat)', () => {
    const students = [
      { id: '1', firstName: 'A', lastName: 'B' },
      { id: '2', firstName: 'C', lastName: 'D' }
    ];
    studentRepo.allStudents.mockReturnValue(students);
    attendanceRepo.findAttendanceBy.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined).mockReturnValue(undefined);
    const count = service.applyPlannedDayOffToAllStudents('2025-09-24');
    expect(count).toBe(2);
    expect(attendanceRepo.saveAttendance).toHaveBeenCalledTimes(2);
    // Idempotency: if already exists, should not create again
    attendanceRepo.findAttendanceBy.mockReturnValue({ studentId: '1', dateISO: '2025-09-24', status: AttendanceStatus.EXCUSED, late: false, earlyDismissal: false, onTime: false, excused: true });
    const count2 = service.applyPlannedDayOffToAllStudents('2025-09-24');
    expect(count2).toBe(0);
    expect(attendanceRepo.saveAttendance).toHaveBeenCalledTimes(2);
  });
});
