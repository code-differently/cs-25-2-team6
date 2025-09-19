import { ReportService } from './ReportService';
import { AttendanceRecord, AttendanceStatus, Student } from '../types/index';

const mockStudents: Student[] = [
  { id: 'S001', firstName: 'John', lastName: 'Smith', email: 'john.smith@school.edu' },
  { id: 'S002', firstName: 'Jane', lastName: 'smith', email: 'jane.smith@school.edu' },
  { id: 'S003', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@school.edu' },
  { id: 'S004', firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@school.edu' },
  { id: 'S005', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@school.edu' }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  { studentId: 'S001', date: '2024-01-15', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S001', date: '2024-01-16', status: AttendanceStatus.PRESENT, isLate: true },
  { studentId: 'S002', date: '2024-01-15', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S002', date: '2024-01-16', status: AttendanceStatus.ABSENT, isLate: false },
  { studentId: 'S003', date: '2024-01-15', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S003', date: '2024-01-16', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S004', date: '2024-01-15', status: AttendanceStatus.ABSENT, isLate: false },
  { studentId: 'S005', date: '2024-01-17', status: AttendanceStatus.PRESENT, isLate: true }
];

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    mockStudents.forEach(student => reportService.addStudent(student));
    mockAttendanceRecords.forEach(record => reportService.addAttendanceRecord(record));
  });

  afterEach(() => {
    reportService.clear();
  });

  describe('Edge Cases - Request Requirements', () => {
    
    describe('Unknown lastName filter', () => {
      it('should return empty array for unknown lastName (not error)', () => {
        const result = reportService.getAttendanceByLastName('UnknownLastName');
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      it('should return empty array for non-existent lastName variations', () => {
        const testCases = ['', 'xyz', 'NonExistent', '123', 'Special@Name'];
        
        testCases.forEach(lastName => {
          const result = reportService.getAttendanceByLastName(lastName);
          expect(result).toEqual([]);
          expect(Array.isArray(result)).toBe(true);
        });
      });

      it('should handle null and undefined lastName gracefully', () => {
        const nullResult = reportService.getAttendanceByLastName(null as any);
        const undefinedResult = reportService.getAttendanceByLastName(undefined as any);
        
        expect(nullResult).toEqual([]);
        expect(undefinedResult).toEqual([]);
      });
    });

    describe('Case-insensitive lastName filter', () => {
      it('should filter by lastName case-insensitively', () => {
        const exactCaseResult = reportService.getAttendanceByLastName('Smith');
        expect(exactCaseResult.length).toBeGreaterThan(0);
        
        const upperCaseResult = reportService.getAttendanceByLastName('SMITH');
        const lowerCaseResult = reportService.getAttendanceByLastName('smith');
        const mixedCaseResult = reportService.getAttendanceByLastName('sMiTh');
        
        expect(upperCaseResult).toEqual(exactCaseResult);
        expect(lowerCaseResult).toEqual(exactCaseResult);
        expect(mixedCaseResult).toEqual(exactCaseResult);
        
        const allSmithIds = exactCaseResult.map((record: AttendanceRecord) => record.studentId).sort();
        expect(allSmithIds).toContain('S001');
        expect(allSmithIds).toContain('S002');
      });

      it('should handle case-insensitive matching with accented characters', () => {
        const accentedStudent = { id: 'S006', firstName: 'José', lastName: 'García', email: 'jose.garcia@school.edu' };
        reportService.addStudent(accentedStudent);
        reportService.addAttendanceRecord({ 
          studentId: 'S006', 
          date: '2024-01-15', 
          status: AttendanceStatus.PRESENT, 
          isLate: false 
        });

        const result1 = reportService.getAttendanceByLastName('García');
        const result2 = reportService.getAttendanceByLastName('garcia');
        const result3 = reportService.getAttendanceByLastName('GARCÍA');
        
        expect(result1.length).toBeGreaterThan(0);
        expect(result2).toEqual(result1);
        expect(result3).toEqual(result1);
      });
    });

    describe('Combined lastName and dateISO filter - AND behavior', () => {
      it('should apply both lastName and dateISO filters with AND logic', () => {
        const lastName = 'Smith';
        const dateISO = '2024-01-15';
        
        const combinedResult = reportService.getAttendanceByLastNameAndDate(lastName, dateISO);
        
        combinedResult.forEach((record: AttendanceRecord) => {
          expect(record.date).toBe(dateISO);
          
          const student = mockStudents.find(s => s.id === record.studentId);
          expect(student?.lastName.toLowerCase()).toBe(lastName.toLowerCase());
        });
        
        const expectedStudentIds = ['S001', 'S002'];
        const actualStudentIds = combinedResult.map((r: AttendanceRecord) => r.studentId).sort();
        expect(actualStudentIds).toEqual(expectedStudentIds.sort());
        
        const lastNameOnlyResult = reportService.getAttendanceByLastName(lastName);
        expect(combinedResult.length).toBeLessThanOrEqual(lastNameOnlyResult.length);
        
        const dateOnlyResult = reportService.getAttendanceByDate(dateISO);
        expect(combinedResult.length).toBeLessThanOrEqual(dateOnlyResult.length);
      });

      it('should return empty array when no records match both conditions', () => {
        const result1 = reportService.getAttendanceByLastNameAndDate('Smith', '2024-01-20');
        expect(result1).toEqual([]);
        
        const result2 = reportService.getAttendanceByLastNameAndDate('NonExistent', '2024-01-15');
        expect(result2).toEqual([]);
        
        const result3 = reportService.getAttendanceByLastNameAndDate('NonExistent', '2024-01-20');
        expect(result3).toEqual([]);
      });

      it('should handle case-insensitive lastName with specific date', () => {
        const testCases = [
          { lastName: 'SMITH', dateISO: '2024-01-15' },
          { lastName: 'smith', dateISO: '2024-01-15' },
          { lastName: 'Smith', dateISO: '2024-01-15' }
        ];
        
        const expectedResult = reportService.getAttendanceByLastNameAndDate('Smith', '2024-01-15');
        
        testCases.forEach(({ lastName, dateISO }) => {
          const result = reportService.getAttendanceByLastNameAndDate(lastName, dateISO);
          expect(result).toEqual(expectedResult);
        });
      });

      it('should verify AND behavior vs OR behavior explicitly', () => {
        const lastName = 'Johnson';
        const dateISO = '2024-01-16';
        
        const andResult = reportService.getAttendanceByLastNameAndDate(lastName, dateISO);
        
        
        const lastNameResult = reportService.getAttendanceByLastName(lastName);
        const dateResult = reportService.getAttendanceByDate(dateISO);
        const simulatedOrResult = [...lastNameResult, ...dateResult];
        
        expect(andResult.length).toBeLessThanOrEqual(simulatedOrResult.length);
        
        
        andResult.forEach((record: AttendanceRecord) => {
          expect(lastNameResult.some((r: AttendanceRecord) => 
            r.studentId === record.studentId && r.date === record.date
          )).toBe(true);
          expect(dateResult.some((r: AttendanceRecord) => 
            r.studentId === record.studentId && r.date === record.date
          )).toBe(true);
        });
      });
    });

    describe('Additional edge cases for robustness', () => {
      it('should handle empty string filters appropriately', () => {
        const emptyLastNameResult = reportService.getAttendanceByLastName('');
        const emptyDateResult = reportService.getAttendanceByDate('');
        const emptyCombinedResult = reportService.getAttendanceByLastNameAndDate('', '');
        
        expect(emptyLastNameResult).toEqual([]);
        expect(emptyDateResult).toEqual([]);
        expect(emptyCombinedResult).toEqual([]);
      });

      it('should handle whitespace-only filters', () => {
        const whitespaceLastName = reportService.getAttendanceByLastName('   ');
        const whitespaceDate = reportService.getAttendanceByDate('   ');
        
        expect(whitespaceLastName).toEqual([]);
        expect(whitespaceDate).toEqual([]);
      });

      it('should maintain data integrity across multiple filter operations', () => {
        const originalRecordCount = mockAttendanceRecords.length;
        
        reportService.getAttendanceByLastName('Smith');
        reportService.getAttendanceByDate('2024-01-15');
        reportService.getAttendanceByLastNameAndDate('Johnson', '2024-01-16');
        
        const allRecords = reportService.getAllAttendanceRecords();
        expect(allRecords.length).toBe(originalRecordCount);
      });
    });
  });

  describe('Standard functionality tests', () => {
    it('should filter attendance records by lastName correctly', () => {
      const smithRecords = reportService.getAttendanceByLastName('Smith');
      expect(smithRecords.length).toBeGreaterThan(0);
      
      smithRecords.forEach((record: AttendanceRecord) => {
        const student = mockStudents.find(s => s.id === record.studentId);
        expect(student?.lastName.toLowerCase()).toBe('smith');
      });
    });

    it('should filter attendance records by date correctly', () => {
      const dateRecords = reportService.getAttendanceByDate('2024-01-15');
      expect(dateRecords.length).toBeGreaterThan(0);
      
      dateRecords.forEach((record: AttendanceRecord) => {
        expect(record.date).toBe('2024-01-15');
      });
    });

    it('should return all attendance records when no filters applied', () => {
      const allRecords = reportService.getAllAttendanceRecords();
      expect(allRecords.length).toBe(mockAttendanceRecords.length);
    });
  });
});