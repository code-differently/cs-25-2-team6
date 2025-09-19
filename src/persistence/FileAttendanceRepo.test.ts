import { FileAttendanceRepo } from './FileAttendanceRepo';
import { AttendanceRecord, AttendanceStatus, AttendanceFilter } from '../types/index';

const mockAttendanceData: AttendanceRecord[] = [
  { studentId: 'S001', date: '2024-01-15', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S002', date: '2024-01-15', status: AttendanceStatus.PRESENT, isLate: true },
  { studentId: 'S003', date: '2024-01-15', status: AttendanceStatus.ABSENT, isLate: false },
  { studentId: 'S001', date: '2024-01-16', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S002', date: '2024-01-16', status: AttendanceStatus.ABSENT, isLate: false },
  { studentId: 'S004', date: '2024-01-16', status: AttendanceStatus.PRESENT, isLate: true },
  { studentId: 'S005', date: '2024-01-17', status: AttendanceStatus.PRESENT, isLate: false },
  { studentId: 'S003', date: '2024-01-17', status: AttendanceStatus.EXCUSED, isLate: false },
  { studentId: 'S006', date: '2024-01-18', status: AttendanceStatus.PRESENT, isLate: false }
];

describe('FileAttendanceRepo', () => {
  let fileAttendanceRepo: FileAttendanceRepo;

  beforeEach(() => {
    fileAttendanceRepo = new FileAttendanceRepo();
    mockAttendanceData.forEach(record => fileAttendanceRepo.addRecord(record));
  });

  afterEach(() => {
    fileAttendanceRepo.clear();
  });

  describe('Edge Cases - Request Requirements', () => {
    
    describe('queryAttendance with empty studentIds array', () => {
      it('should return empty array when studentIds is empty array (short-circuit)', () => {
        const filter: AttendanceFilter = {
          studentIds: []
        };

        const result = fileAttendanceRepo.queryAttendance(filter);
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      it('should handle null and undefined studentIds arrays gracefully', () => {
        const filterWithNullIds: AttendanceFilter = {
          studentIds: null as any,
          dateISO: '2024-01-15'
        };

        const filterWithUndefinedIds: AttendanceFilter = {
          studentIds: undefined,
          dateISO: '2024-01-15'
        };

        const nullResult = fileAttendanceRepo.queryAttendance(filterWithNullIds);
        const undefinedResult = fileAttendanceRepo.queryAttendance(filterWithUndefinedIds);

        const expectedRecords = mockAttendanceData.filter(r => r.date === '2024-01-15');
        expect(nullResult.length).toBe(expectedRecords.length);
        expect(undefinedResult.length).toBe(expectedRecords.length);
      });
    });

    describe('Results returned in stable order', () => {
      it('should return results in a stable, documented order', () => {
        const filter: AttendanceFilter = {
          status: AttendanceStatus.PRESENT
        };

        const result1 = fileAttendanceRepo.queryAttendance(filter);
        const result2 = fileAttendanceRepo.queryAttendance(filter);

        expect(result1).toEqual(result2);
        
        for (let i = 1; i < result1.length; i++) {
          const prev = result1[i - 1];
          const current = result1[i];
          
          if (prev.date !== current.date) {
            expect(prev.date <= current.date).toBe(true);
          } else {
            expect(prev.studentId <= current.studentId).toBe(true);
          }
        }
      });
    });
  });

  describe('Standard functionality tests', () => {
    it('should filter by specific student IDs when provided', () => {
      const filter: AttendanceFilter = {
        studentIds: ['S001', 'S002']
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((record: AttendanceRecord) => 
        ['S001', 'S002'].includes(record.studentId)
      )).toBe(true);
    });

    it('should filter by date when provided', () => {
      const filter: AttendanceFilter = {
        dateISO: '2024-01-15'
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((record: AttendanceRecord) => record.date === '2024-01-15')).toBe(true);
    });

    it('should filter by status when provided', () => {
      const filter: AttendanceFilter = {
        status: AttendanceStatus.PRESENT
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((record: AttendanceRecord) => record.status === AttendanceStatus.PRESENT)).toBe(true);
    });

    it('should return all records when no filter provided', () => {
      const result = fileAttendanceRepo.queryAttendance({});
      expect(result.length).toBe(mockAttendanceData.length);
    });

    it('should filter by lastName when provided (stub implementation)', () => {
      const filter: AttendanceFilter = {
        lastName: 'Smith'
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.length).toBe(mockAttendanceData.length);
    });

    it('should use getAllRecords method to retrieve all records', () => {
      const result = fileAttendanceRepo.getAllRecords();
      
      expect(result.length).toBe(mockAttendanceData.length);
      expect(result).toEqual(fileAttendanceRepo.queryAttendance({}));
    });
  });

  describe('Edge cases and combinations', () => {
    it('should handle multiple filter combinations correctly', () => {
      const filter: AttendanceFilter = {
        studentIds: ['S001', 'S002'],
        dateISO: '2024-01-15',
        status: AttendanceStatus.PRESENT
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.every((record: AttendanceRecord) => 
        ['S001', 'S002'].includes(record.studentId) &&
        record.date === '2024-01-15' &&
        record.status === AttendanceStatus.PRESENT
      )).toBe(true);
    });

    it('should handle filter with lastName combined with other filters', () => {
      const filter: AttendanceFilter = {
        lastName: 'Smith',
        status: AttendanceStatus.PRESENT
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      
      expect(result.every((record: AttendanceRecord) => 
        record.status === AttendanceStatus.PRESENT
      )).toBe(true);
    });

    it('should return empty result when studentIds filter has no matches', () => {
      const filter: AttendanceFilter = {
        studentIds: ['NONEXISTENT']
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      expect(result).toEqual([]);
    });

    it('should return empty result when date filter has no matches', () => {
      const filter: AttendanceFilter = {
        dateISO: '2025-12-31'
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      expect(result).toEqual([]);
    });

    it('should return empty result when status filter has no matches', () => {
      fileAttendanceRepo.clear();
      fileAttendanceRepo.addRecord({
        studentId: 'S001',
        date: '2024-01-15',
        status: AttendanceStatus.PRESENT,
        isLate: false
      });

      const filter: AttendanceFilter = {
        status: AttendanceStatus.LATE
      };

      const result = fileAttendanceRepo.queryAttendance(filter);
      expect(result).toEqual([]);

      mockAttendanceData.forEach(record => fileAttendanceRepo.addRecord(record));
    });
  });
});