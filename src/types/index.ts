export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // ISO date string format (YYYY-MM-DD)
  status: AttendanceStatus;
  isLate: boolean;
  notes?: string;
}

export interface AttendanceFilter {
  lastName?: string;
  dateISO?: string;
  status?: AttendanceStatus;
  studentIds?: string[];
}

export interface ReportFilter extends AttendanceFilter {
  startDate?: string;
  endDate?: string;
}