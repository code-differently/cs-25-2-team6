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

      it('should short-circuit immediately with empty studentIds regardless of other filters', () => {
        const filterWithDateAndEmptyIds: AttendanceFilter = {
          studentIds: [],
          dateISO: '2024-01-15'
        };

        const filterWithStatusAndEmptyIds: AttendanceFilter = {
          studentIds: [],
          status: AttendanceStatus.PRESENT
        };

        const filterWithAllAndEmptyIds: AttendanceFilter = {
          studentIds: [],
          dateISO: '2024-01-15',
          status: AttendanceStatus.PRESENT,
          lastName: 'Smith'
        };

        expect(fileAttendanceRepo.queryAttendance(filterWithDateAndEmptyIds)).toEqual([]);
        expect(fileAttendanceRepo.queryAttendance(filterWithStatusAndEmptyIds)).toEqual([]);
        expect(fileAttendanceRepo.queryAttendance(filterWithAllAndEmptyIds)).toEqual([]);
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

      it('should differentiate between empty array and undefined studentIds', () => {
        const emptyArrayFilter: AttendanceFilter = {
          studentIds: [],
          dateISO: '2024-01-15'
        };

        const undefinedFilter: AttendanceFilter = {
          dateISO: '2024-01-15'
        };

        const emptyResult = fileAttendanceRepo.queryAttendance(emptyArrayFilter);
        const undefinedResult = fileAttendanceRepo.queryAttendance(undefinedFilter);

        expect(emptyResult).toEqual([]);

        
        expect(undefinedResult.length).toBeGreaterThan(0);
        expect(undefinedResult.every((record: AttendanceRecord) => record.date === '2024-01-15')).toBe(true);
      });
    });

    describe('Results returned in stable order', () => {
      it('should return results in a stable, documented order', () => {
        const filter: AttendanceFilter = {
          status: AttendanceStatus.PRESENT
        };

        const result1 = fileAttendanceRepo.queryAttendance(filter);
        const result2 = fileAttendanceRepo.queryAttendance(filter);
        const result3 = fileAttendanceRepo.queryAttendance(filter);

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
        
        
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

      it('should maintain stable order with different filter combinations', () => {
        const testFilters: AttendanceFilter[] = [
          { dateISO: '2024-01-15' },
          { status: AttendanceStatus.PRESENT },
          { studentIds: ['S001', 'S002', 'S003'] },
          { dateISO: '2024-01-16', status: AttendanceStatus.PRESENT }
        ];

        testFilters.forEach((filter, index) => {
          const result1 = fileAttendanceRepo.queryAttendance(filter);
          const result2 = fileAttendanceRepo.queryAttendance(filter);
          
          expect(result1).toEqual(result2);
          
          const isStablySorted = result1.every((record: AttendanceRecord, i: number) => {
            if (i === 0) return true;
            const prev = result1[i - 1];
            return prev.date < record.date || 
                   (prev.date === record.date && prev.studentId <= record.studentId);
          });
          
          expect(isStablySorted).toBe(true);
        });
      });

      it('should maintain order stability when records are added or modified', () => {
        const initialFilter: AttendanceFilter = { status: AttendanceStatus.PRESENT };
        const initialResult = fileAttendanceRepo.queryAttendance(initialFilter);
        
        
        const newRecord: AttendanceRecord = {
          studentId: 'S007',
          date: '2024-01-15',
          status: AttendanceStatus.PRESENT,
          isLate: false
        };
        fileAttendanceRepo.addRecord(newRecord);
        
        const afterAddResult = fileAttendanceRepo.queryAttendance(initialFilter);
        
        
        const isOrderCorrect = afterAddResult.every((record: AttendanceRecord, i: number) => {
          if (i === 0) return true;
          const prev = afterAddResult[i - 1];
          return prev.date < record.date || 
                 (prev.date === record.date && prev.studentId <= record.studentId);
        });
        
        expect(isOrderCorrect).toBe(true);
        expect(afterAddResult.length).toBe(initialResult.length + 1);
      });

      it('should document the specific ordering algorithm in test description', () => {
        const allRecords = fileAttendanceRepo.queryAttendance({});
        
        expect(allRecords.length).toBeGreaterThan(0);
        
        let prevDate = '';
        let prevStudentId = '';
        
        allRecords.forEach((record: AttendanceRecord, index: number) => {
          if (index === 0) {
            prevDate = record.date;
            prevStudentId = record.studentId;
            return;
          }
          
          if (record.date > prevDate) {
            prevDate = record.date;
            prevStudentId = record.studentId;
          } else if (record.date === prevDate) {
            expect(record.studentId >= prevStudentId).toBe(true);
            prevStudentId = record.studentId;
          } else {
            fail(`Ordering violation: ${record.date} should not come after ${prevDate}`);
          }
        });
      });
    });

    describe('Additional edge cases for robustness', () => {
      it('should handle complex filter combinations with empty studentIds', () => {
        const complexFilter: AttendanceFilter = {
          studentIds: [],
          dateISO: '2024-01-15',
          status: AttendanceStatus.PRESENT,
          lastName: 'Smith'
        };

        const result = fileAttendanceRepo.queryAttendance(complexFilter);
        expect(result).toEqual([]);
      });

      it('should handle large studentIds arrays efficiently', () => {
        const largeStudentIds = Array.from({ length: 1000 }, (_, i) => `S${String(i).padStart(3, '0')}`);
        
        const filter: AttendanceFilter = {
          studentIds: largeStudentIds
        };

        const start = Date.now();
        const result = fileAttendanceRepo.queryAttendance(filter);
        const end = Date.now();

        expect(end - start).toBeLessThan(100);
        
        
        expect(result.every((record: AttendanceRecord) => 
          mockAttendanceData.some(mock => mock.studentId === record.studentId)
        )).toBe(true);
      });

      it('should maintain data integrity during query operations', () => {
        const originalCount = mockAttendanceData.length;
        
        fileAttendanceRepo.queryAttendance({ studentIds: [] });
        fileAttendanceRepo.queryAttendance({ studentIds: ['S001'] });
        fileAttendanceRepo.queryAttendance({ dateISO: '2024-01-15' });
        
        const allRecords = fileAttendanceRepo.queryAttendance({});
        expect(allRecords.length).toBe(originalCount);
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
  });
});