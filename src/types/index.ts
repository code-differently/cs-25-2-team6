export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  isLate: boolean;
  earlyDismissal?: boolean;
}

export interface AttendanceFilter {
  studentIds?: string[];
  dateISO?: string;
  status?: AttendanceStatus;
  lastName?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}
