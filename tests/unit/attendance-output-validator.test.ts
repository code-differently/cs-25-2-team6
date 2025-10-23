import { validateAttendanceOutput } from '../../src/utils/attendance-output-validator';

describe('Attendance Output Validator', () => {
  test('should detect valid output with proper student records', () => {
    const goodOutput = {
      naturalLanguageAnswer: `John Smith (S1001) has been absent 5 times this semester. Mary Johnson (S1002) has an excellent attendance record.`,
      structuredData: {
        students: [
          {
            firstName: 'John',
            lastName: 'Smith',
            studentId: 'S1001',
            absences: ['2025-09-10', '2025-09-15', '2025-09-22', '2025-10-01', '2025-10-10'],
            attendanceRate: 75
          },
          {
            firstName: 'Mary',
            lastName: 'Johnson',
            studentId: 'S1002',
            absences: [],
            attendanceRate: 100
          }
        ]
      }
    };
    
    const result = validateAttendanceOutput(goodOutput);
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
    expect(result.summary.mentionedInNL).toBe(2);
    expect(result.summary.presentInStructuredData).toBe(2);
  });
  
  test('should detect placeholder students and missing data', () => {
    const badOutput = {
      naturalLanguageAnswer: `John Smith (S1001) has been absent 5 times this semester. Unknown Student has also missed several days.`,
      structuredData: {
        students: [
          {
            firstName: 'John',
            lastName: 'Smith',
            studentId: 'S1001',
            absences: ['2025-09-10', '2025-09-15', '2025-09-22', '2025-10-01', '2025-10-10'],
            attendanceRate: 75
          },
          {
            firstName: 'Unknown Student',
            absences: ['2025-10-01', '2025-10-05']
          }
        ]
      }
    };
    
    const result = validateAttendanceOutput(badOutput);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.summary.placeholdersFound).toBe(1);
  });
  
  test('should attempt auto-fix when enabled', () => {
    const fixableOutput = {
      naturalLanguageAnswer: `John Smith (S1001) has been absent 5 times this semester. Mary Johnson (S1002) has an excellent attendance record.`,
      structuredData: {
        students: [
          {
            firstName: 'John',
            lastName: 'Smith',
            studentId: 'S1001',
            absences: ['2025-09-10', '2025-09-15', '2025-09-22', '2025-10-01', '2025-10-10'],
            attendanceRate: 75
          },
          {
            firstName: 'Mary',
            lastName: 'Johnson',
            // Missing studentId that should be auto-fixed
            absences: [],
            attendanceRate: 100
          }
        ]
      }
    };
    
    const result = validateAttendanceOutput(fixableOutput, { autoFix: true });
    expect(result.autoFixes?.applied).toBe(true);
    expect(result.autoFixes?.details.length).toBeGreaterThan(0);
    if (result.autoFixes?.fixedStructuredData) {
      expect(result.autoFixes.fixedStructuredData.students[1].studentId).toBe('S1002');
    }
  });
});
