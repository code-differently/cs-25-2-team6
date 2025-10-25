/**
 * Unit tests for database context formatter utilities
 * 
 * These tests validate the functionality of the utilities that prepare
 * database records for LLM consumption, including date formatting,
 * record formatting, and context preparation.
 */

import { 
  formatDate,
  DateFormatStyle,
  formatAttendanceForLLM,
  formatStudentsForLLM,
  prepareAttendanceContext,
  AttendanceRecordContext,
  adaptDomainToContext
} from '../../src/utils/db-context-formatter';

import { AttendanceRecord } from '../../src/domains/AttendanceRecords';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';

describe('Database Context Formatter', () => {
  // Mock date for consistent testing
  const mockToday = new Date('2025-10-22T12:00:00Z');
  const originalDateNow = Date.now;

  beforeAll(() => {
    // Mock Date.now() to return our fixed date
    global.Date.now = jest.fn(() => mockToday.getTime());
  });

  afterAll(() => {
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });

  describe('formatDate', () => {
    test('should format date in short style', () => {
      // Ensure we use UTC timezone to avoid test differences
      const result = formatDate('2025-10-15', DateFormatStyle.SHORT, 'UTC');
      expect(result).toBe('10/15/2025');
    });

    test('should format date in medium style', () => {
      const result = formatDate('2025-10-15', DateFormatStyle.MEDIUM, 'UTC');
      expect(result).toBe('Oct 15, 2025');
    });

    test('should format date in long style', () => {
      const result = formatDate('2025-10-15', DateFormatStyle.LONG, 'UTC');
      expect(result).toBe('October 15, 2025');
    });

    test('should format date in ISO style', () => {
      const result = formatDate('2025-10-15', DateFormatStyle.ISO);
      expect(result).toBe('2025-10-15');
    });

    test('should handle invalid dates gracefully', () => {
      const result = formatDate('not-a-date', DateFormatStyle.MEDIUM);
      expect(result).toBe('not-a-date');
    });
  });

  describe('adaptDomainToContext', () => {
    test('should convert domain AttendanceRecord to AttendanceRecordContext', () => {
      // Create a domain AttendanceRecord
      const domainRecord = new AttendanceRecord({
        studentId: 'student123',
        dateISO: '2025-10-15',
        status: AttendanceStatus.PRESENT,
        late: false
      });

      // Convert to context
      const contextRecord = adaptDomainToContext(domainRecord);

      // Verify conversion
      expect(contextRecord.studentId).toBe('student123');
      expect(contextRecord.date).toBe('2025-10-15');
      expect(contextRecord.status).toBe(AttendanceStatus.PRESENT);
      expect(contextRecord.late).toBe(false);
    });
  });

  describe('formatAttendanceForLLM', () => {
    test('should format attendance records for LLM consumption', () => {
      // Create test records
      const domainRecords = [
        new AttendanceRecord({
          studentId: 'student123',
          dateISO: '2025-10-15',
          status: AttendanceStatus.PRESENT,
          late: false
        }),
        new AttendanceRecord({
          studentId: 'student123',
          dateISO: '2025-10-16',
          status: AttendanceStatus.ABSENT,
          late: false
        })
      ];

      // Student info for context
      const studentInfo = [
        { id: 'student123', firstName: 'John', lastName: 'Doe', grade: '10' }
      ];

      // Format records
      const formatted = formatAttendanceForLLM(domainRecords, {
        studentInfo,
        dateFormat: DateFormatStyle.MEDIUM,
        timezone: 'UTC'
      });

      // Verify formatting
      expect(formatted.length).toBe(2);
      expect(formatted[0].formattedDate).toBe('Oct 15, 2025');
      expect(formatted[0].studentName).toBe('John Doe');
      expect(formatted[0].studentGrade).toBe('10');
      expect(formatted[1].status).toBe(AttendanceStatus.ABSENT);
    });

    test('should handle empty records gracefully', () => {
      const formatted = formatAttendanceForLLM([]);
      expect(formatted).toEqual([]);
    });

    test('should truncate excessive records', () => {
      // Create many records
      const manyRecords = Array.from({ length: 100 }, (_, i) => 
        new AttendanceRecord({
          studentId: `student${i}`,
          dateISO: '2025-10-15',
          status: AttendanceStatus.PRESENT,
          late: false
        })
      );

      // Format with max limit
      const formatted = formatAttendanceForLLM(manyRecords, {
        maxRecords: 20,
        summarize: false
      });

      // Should be truncated
      expect(formatted.length).toBe(20);
    });
  });

  describe('prepareAttendanceContext', () => {
    test('should prepare comprehensive context string for LLM', () => {
      // Create test records
      const domainRecords = [
        new AttendanceRecord({
          studentId: 'student123',
          dateISO: '2025-10-15',
          status: AttendanceStatus.PRESENT,
          late: false
        })
      ];

      // Student info
      const studentInfo = [
        { id: 'student123', firstName: 'John', lastName: 'Doe', grade: '10' }
      ];

      // Prepare context
      const context = prepareAttendanceContext(
        domainRecords,
        studentInfo,
        "What is John's attendance?"
      );

      // Verify context string
      expect(context).toContain('ATTENDANCE RECORDS');
      expect(context).toContain('STUDENT INFORMATION');
      expect(context).toContain('John Doe');
      expect(context).toContain('2025-10-15');
    });
  });
});
