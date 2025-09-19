// Minimal stub error for missing student
export class StudentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StudentNotFoundError';
  }
}

// In-memory stub persistence for students and attendance
const students = [
  { id: '1', firstName: 'Alice', lastName: 'Smith' },
  { id: '2', firstName: 'Bob', lastName: 'Jones' },
];

const attendanceRecords: any[] = [];

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface MarkAttendanceParams {
  firstName: string;
  lastName: string;
  dateISO: string;
  onTime?: boolean;
  late?: boolean;
  earlyDismissal?: boolean;
}

export function inferStatusFromFlags(flags: { onTime?: boolean; late?: boolean }): AttendanceStatus {
  if (flags.late) return 'LATE';
  if (flags.onTime) return 'PRESENT';
  return 'ABSENT';
}

export function markAttendanceByName(params: MarkAttendanceParams) {
  const { firstName, lastName, dateISO, onTime, late, earlyDismissal } = params;
  const student = students.find(
    s => s.firstName === firstName && s.lastName === lastName
  );
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