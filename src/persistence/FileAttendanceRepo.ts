import { AttendanceRecord, AttendanceFilter, AttendanceStatus } from '../types/index';


export class FileAttendanceRepo {
  private attendanceRecords: AttendanceRecord[] = [];

  addRecord(record: AttendanceRecord): void {
    this.attendanceRecords.push(record);
  }

  
  clear(): void {
    this.attendanceRecords = [];
  }

 
  queryAttendance(filter: AttendanceFilter): AttendanceRecord[] {
    let results = [...this.attendanceRecords];

    if (filter.studentIds !== undefined && filter.studentIds !== null && Array.isArray(filter.studentIds)) {
      if (filter.studentIds.length === 0) {
        return [];
      }
      results = results.filter(record => filter.studentIds!.includes(record.studentId));
    }

    if (filter.dateISO) {
      results = results.filter(record => record.date === filter.dateISO);
    }

    if (filter.status) {
      results = results.filter(record => record.status === filter.status);
    }

    if (filter.lastName) {
      results = results.filter(record => {
        return true;
      });
    }

    
    results.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.studentId.localeCompare(b.studentId);
    });

    return results;
  }

  getAllRecords(): AttendanceRecord[] {
    return this.queryAttendance({});
  }
}