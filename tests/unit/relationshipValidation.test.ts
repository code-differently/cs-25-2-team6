import {
  validateStudentAssignment,
  validateClassStudentRelationships,
  isStudentInClass,
  getClassCapacityInfo,
  sanitizeRelationshipData,
  createAssignmentResult
} from '../../src/utils/relationshipValidation';
import { ClassStudent, StudentAssignmentData } from '../../src/types/classStudent';

describe('Relationship Validation', () => {
  const mockStudentIds = ['STU001', 'STU002', 'STU003'];
  const mockClassIds = ['CLS001', 'CLS002'];
  const mockRelationships: ClassStudent[] = [
    {
      classId: 'CLS001',
      studentId: 'STU001',
      enrolledAt: new Date('2025-01-01'),
      status: 'active'
    },
    {
      classId: 'CLS001',
      studentId: 'STU002',
      enrolledAt: new Date('2025-01-01'),
      status: 'active'
    }
  ];

  describe('validateStudentAssignment', () => {
    it('should validate adding new student to class', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['STU003'],
        'add',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect invalid class ID', () => {
      const result = validateStudentAssignment(
        'INVALID_CLASS',
        ['STU003'],
        'add',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toBe('invalid_class');
    });

    it('should detect invalid student ID', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['INVALID_STUDENT'],
        'add',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toBe('invalid_student');
    });

    it('should detect duplicate enrollment', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['STU001'], // Already enrolled
        'add',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toBe('already_enrolled');
    });

    it('should detect student not enrolled for removal', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['STU003'], // Not enrolled
        'remove',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].reason).toBe('not_enrolled');
    });

    it('should validate removing enrolled student', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['STU001'], // Already enrolled
        'remove',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should warn about class capacity limits', () => {
      // Create a class with many students approaching limit
      const manyStudents = Array.from({ length: 50 }, (_, i) => `STU${String(i + 100).padStart(3, '0')}`);
      const largeRelationships: ClassStudent[] = manyStudents.map(studentId => ({
        classId: 'CLS001',
        studentId,
        enrolledAt: new Date('2025-01-01'),
        status: 'active' as const
      }));

      const result = validateStudentAssignment(
        'CLS001',
        Array.from({ length: 60 }, (_, i) => `STU${String(i + 200).padStart(3, '0')}`), // Adding 60 more
        'add',
        largeRelationships,
        [...mockStudentIds, ...manyStudents, ...Array.from({ length: 60 }, (_, i) => `STU${String(i + 200).padStart(3, '0')}`)],
        mockClassIds
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toBe('Cannot assign more than 100 students to a class');
    });

    it('should handle multiple validation errors', () => {
      const result = validateStudentAssignment(
        'CLS001',
        ['STU001', 'INVALID_STUDENT'], // One duplicate, one invalid
        'add',
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(2);
      expect(result.conflicts.some(c => c.reason === 'already_enrolled')).toBe(true);
      expect(result.conflicts.some(c => c.reason === 'invalid_student')).toBe(true);
    });
  });

  describe('validateClassStudentRelationships', () => {
    it('should validate assignment data structure', () => {
      const assignmentData: StudentAssignmentData = {
        classId: 'CLS001',
        studentIds: ['STU003'],
        action: 'add',
        preserveHistory: true
      };

      const result = validateClassStudentRelationships(
        assignmentData,
        mockRelationships,
        mockStudentIds,
        mockClassIds
      );

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('isStudentInClass', () => {
    it('should return true for enrolled student', () => {
      const result = isStudentInClass('STU001', 'CLS001', mockRelationships);
      expect(result).toBe(true);
    });

    it('should return false for non-enrolled student', () => {
      const result = isStudentInClass('STU003', 'CLS001', mockRelationships);
      expect(result).toBe(false);
    });

    it('should return false for inactive enrollment', () => {
      const relationshipsWithInactive: ClassStudent[] = [
        ...mockRelationships,
        {
          classId: 'CLS001',
          studentId: 'STU003',
          enrolledAt: new Date('2025-01-01'),
          status: 'inactive'
        }
      ];

      const result = isStudentInClass('STU003', 'CLS001', relationshipsWithInactive);
      expect(result).toBe(false);
    });
  });

  describe('getClassCapacityInfo', () => {
    it('should return correct capacity information', () => {
      const result = getClassCapacityInfo('CLS001', mockRelationships);
      expect(result.current).toBe(2);
      expect(result.max).toBe(100);
      expect(result.available).toBe(98);
    });

    it('should handle empty class', () => {
      const result = getClassCapacityInfo('CLS002', mockRelationships);
      expect(result.current).toBe(0);
      expect(result.max).toBe(100);
      expect(result.available).toBe(100);
    });

    it('should only count active enrollments', () => {
      const relationshipsWithInactive: ClassStudent[] = [
        ...mockRelationships,
        {
          classId: 'CLS001',
          studentId: 'STU003',
          enrolledAt: new Date('2025-01-01'),
          status: 'inactive'
        }
      ];

      const result = getClassCapacityInfo('CLS001', relationshipsWithInactive);
      expect(result.current).toBe(2); // Should not count inactive
    });
  });

  describe('sanitizeRelationshipData', () => {
    it('should trim whitespace from IDs', () => {
      const data: StudentAssignmentData = {
        classId: '  CLS001  ',
        studentIds: ['  STU001  ', '  STU002  '],
        action: 'add',
        preserveHistory: true
      };

      const result = sanitizeRelationshipData(data);
      expect(result.classId).toBe('CLS001');
      expect(result.studentIds).toEqual(['STU001', 'STU002']);
      expect(result.action).toBe('add');
      expect(result.preserveHistory).toBe(true);
    });

    it('should filter out empty student IDs', () => {
      const data: StudentAssignmentData = {
        classId: 'CLS001',
        studentIds: ['STU001', '', '  ', 'STU002'],
        action: 'add'
      };

      const result = sanitizeRelationshipData(data);
      expect(result.studentIds).toEqual(['STU001', 'STU002']);
    });
  });

  describe('createAssignmentResult', () => {
    it('should create successful result', () => {
      const result = createAssignmentResult(
        ['STU001', 'STU002'],
        [],
        []
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed 2 student assignments');
      expect(result.assigned).toEqual(['STU001', 'STU002']);
      expect(result.failed).toEqual([]);
      expect(result.duplicates).toEqual([]);
    });

    it('should create failure result', () => {
      const result = createAssignmentResult(
        ['STU001'],
        [{ studentId: 'STU002', reason: 'Already enrolled' }],
        ['STU003']
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Processed 1 assignments with 1 failures');
      expect(result.assigned).toEqual(['STU001']);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].studentId).toBe('STU002');
      expect(result.duplicates).toEqual(['STU003']);
    });

    it('should handle empty results', () => {
      const result = createAssignmentResult([], [], []);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed 0 student assignments');
    });
  });
});
