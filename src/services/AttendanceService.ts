import { Student } from '../domains/Student';
import { AttendanceStatus } from '../domains/AttendanceStatus';
import { StudentRoster } from '../domains/StudentRoster';

export class StudentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

// Use StudentRoster for student persistence
const studentRoster = new StudentRoster();
studentRoster.addStudent(new Student({ id: '1', firstName: 'Alice', lastName: 'Smith' }));
studentRoster.addStudent(new Student({ id: '2', firstName: 'Bob', lastName: 'Jones' }));

const attendanceRecords: any[] = [];

export interface MarkAttendanceParams {
  firstName: string;
  lastName: string;
  dateISO: string;
  onTime?: boolean;
  late?: boolean;
  earlyDismissal?: boolean;
}

export function inferStatusFromFlags(flags: { onTime?: boolean; late?: boolean }): AttendanceStatus {
  if (flags.late) return AttendanceStatus.LATE;
  if (flags.onTime) return AttendanceStatus.PRESENT;
  return AttendanceStatus.ABSENT;
}

export function markAttendanceByName(params: MarkAttendanceParams) {
  const { firstName, lastName, dateISO, onTime, late, earlyDismissal } = params;
  const student = studentRoster
    .listAll()
    .find(s => s.firstName === firstName && s.lastName === lastName);
  if (!student) throw new StudentNotFoundError(`Student ${firstName} ${lastName} not found`);
  const status = inferStatusFromFlags({ onTime, late });
  const record = {
    studentId: student.id,
    dateISO,
    status,
    flags: { onTime, late, earlyDismissal }
  };
  attendanceRecords.push(record);
  return record;
}
//check for additional functions for SCheduledDayOff 
//HOLIDAY, PROFESSIONAL_DEVELOPMENT,REPORT_CARD_CONFERENCES, OTHER