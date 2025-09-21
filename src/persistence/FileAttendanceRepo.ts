import * as fs from "fs";
import * as path from "path";
import { AttendanceRecord } from "../domains/AttendanceRecords";
import { AttendanceStatus } from "../domains/AttendanceStatus";

export class FileAttendanceRepo {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, "attendance.json");
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  saveAttendance(record: AttendanceRecord): void {
    const records = this.allAttendance();
    
    const recordData = {
      studentId: record.studentId,
      dateISO: record.dateISO,
      status: record.status,
      late: record.late,
      earlyDismissal: record.earlyDismissal,
      onTime: record.onTime,
      excused: record.excused,
    };
    
    records.push(recordData);
    fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
  }

  allAttendance(): AttendanceRecord[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      if (data.trim() === '') {
        // File is empty, initialize with empty array
        fs.writeFileSync(this.filePath, JSON.stringify([]));
        return [];
      }
      const recordsData = JSON.parse(data);
      return recordsData.map((data: any) => new AttendanceRecord({
        studentId: data.studentId,
        dateISO: data.dateISO,
        status: data.status as AttendanceStatus,
        late: data.late,
        earlyDismissal: data.earlyDismissal,
      }));
    } catch (error) {
      // If file is corrupted or invalid JSON, reset to empty array
      fs.writeFileSync(this.filePath, JSON.stringify([]));
      return [];
    }
  }

  findAttendanceBy(studentId: string, dateISO: string): AttendanceRecord | undefined {
    const records = this.allAttendance();
    return records.find(r => r.studentId === studentId && r.dateISO === dateISO);
  }

  // New filtering methods for CLI functionality
  findAttendanceByDate(dateISO: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.dateISO === dateISO);
  }

  findAttendanceByStatus(status: AttendanceStatus): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.status === status);
  }

  getLateListByDate(dateISO: string): AttendanceRecord[] {
    const records = this.findAttendanceByDate(dateISO);
    return records.filter(record => record.late === true);
  }

  getEarlyDismissalListByDate(dateISO: string): AttendanceRecord[] {
    const records = this.findAttendanceByDate(dateISO);
    return records.filter(record => record.earlyDismissal === true);
  }

  getLateListByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.studentId === studentId && record.late === true);
  }

  getEarlyDismissalListByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records.filter(record => record.studentId === studentId && record.earlyDismissal === true);
  }

  findByStudentAndDateRange(studentId: string, startISO: string, endISO: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records
      .filter(record => record.studentId === studentId && record.dateISO >= startISO && record.dateISO <= endISO)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  findAllByStudent(studentId: string): AttendanceRecord[] {
    const records = this.allAttendance();
    return records
      .filter(record => record.studentId === studentId)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  clearAll(): void {
    fs.writeFileSync(this.filePath, JSON.stringify([]));
  }
}
