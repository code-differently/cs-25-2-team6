/**
 * Test file for class utility functions
 */

import {
  formatClassName,
  countStudentsInClass,
  getClassGradeDisplay,
  formatClassSummary,
  isClassEmpty,
  generateClassDisplayText,
  getClassEnrollmentStatus,
  getEnrollmentPercentage,
  filterClasses,
  sortClasses,
  validateClassData,
  getAvailableCapacity,
  canAcceptNewStudents,
  ClassProfile,
  ClassStudent
} from './classUtils';

import { Class } from '../../src/types/class';

// Mock data for testing
const mockClass: Class = {
  id: 'class-1',
  name: 'Mathematics',
  studentIds: ['student-1', 'student-2', 'student-3'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z'
};

const mockClassProfile: ClassProfile = {
  ...mockClass,
  grade: '5',
  subject: 'Math',
  teacher: 'Ms. Johnson',
  capacity: 25,
  status: 'active'
};

const mockClassStudents: ClassStudent[] = [
  {
    id: 'rel-1',
    classId: 'class-1',
    studentId: 'student-1',
    enrolledAt: new Date('2025-01-01'),
    status: 'enrolled'
  },
  {
    id: 'rel-2',
    classId: 'class-1',
    studentId: 'student-2',
    enrolledAt: new Date('2025-01-01'),
    status: 'enrolled'
  },
  {
    id: 'rel-3',
    classId: 'class-1',
    studentId: 'student-3',
    enrolledAt: new Date('2025-01-01'),
    status: 'pending'
  },
  {
    id: 'rel-4',
    classId: 'class-2',
    studentId: 'student-4',
    enrolledAt: new Date('2025-01-01'),
    status: 'enrolled'
  }
];

describe('Class Utility Functions', () => {
  describe('formatClassName', () => {
    it('should format class name without grade', () => {
      expect(formatClassName('Mathematics')).toBe('Mathematics');
    });

    it('should format class name with grade', () => {
      expect(formatClassName('Mathematics', '5')).toBe('Mathematics - Grade 5');
    });

    it('should handle kindergarten grade', () => {
      expect(formatClassName('Reading', 'K')).toBe('Reading - Grade K');
    });

    it('should not duplicate grade if already in name', () => {
      expect(formatClassName('Grade 5 Mathematics', '5')).toBe('Grade 5 Mathematics');
    });

    it('should handle empty name', () => {
      expect(formatClassName('')).toBe('');
    });
  });

  describe('countStudentsInClass', () => {
    it('should count enrolled students using relationships', () => {
      expect(countStudentsInClass('class-1', mockClassStudents)).toBe(2);
    });

    it('should count students using class data', () => {
      expect(countStudentsInClass('class-1', undefined, mockClass)).toBe(3);
    });

    it('should return 0 for non-existent class', () => {
      expect(countStudentsInClass('non-existent', mockClassStudents)).toBe(0);
    });

    it('should handle empty relationships', () => {
      expect(countStudentsInClass('class-1', [])).toBe(0);
    });
  });

  describe('getClassGradeDisplay', () => {
    it('should format numeric grade', () => {
      expect(getClassGradeDisplay('5')).toBe('Grade 5');
    });

    it('should format kindergarten', () => {
      expect(getClassGradeDisplay('K')).toBe('Grade K');
    });

    it('should handle undefined grade', () => {
      expect(getClassGradeDisplay()).toBe('Mixed Grades');
    });
  });

  describe('formatClassSummary', () => {
    it('should format complete class summary', () => {
      const summary = formatClassSummary(mockClassProfile, 20);
      expect(summary).toContain('Mathematics - Grade 5');
      expect(summary).toContain('20/25 students');
      expect(summary).toContain('Math');
      expect(summary).toContain('taught by Ms. Johnson');
    });

    it('should handle class without capacity', () => {
      const classWithoutCapacity = { ...mockClassProfile, capacity: undefined };
      const summary = formatClassSummary(classWithoutCapacity, 15);
      expect(summary).toContain('15 students');
    });

    it('should handle singular student count', () => {
      const summary = formatClassSummary(mockClassProfile, 1);
      expect(summary).toContain('1 student');
    });
  });

  describe('isClassEmpty', () => {
    it('should return false for class with students', () => {
      expect(isClassEmpty('class-1', mockClassStudents)).toBe(false);
    });

    it('should return true for empty class', () => {
      expect(isClassEmpty('class-3', mockClassStudents)).toBe(true);
    });
  });

  describe('generateClassDisplayText', () => {
    it('should generate display text with subject', () => {
      const displayText = generateClassDisplayText(mockClassProfile);
      expect(displayText).toContain('Mathematics - Grade 5');
    });

    it('should handle class without subject', () => {
      const classWithoutSubject = { ...mockClassProfile, subject: undefined };
      const displayText = generateClassDisplayText(classWithoutSubject);
      expect(displayText).toBe('Mathematics - Grade 5');
    });
  });

  describe('getClassEnrollmentStatus', () => {
    it('should return empty for 0 students', () => {
      expect(getClassEnrollmentStatus(0, 25)).toBe('empty');
    });

    it('should return available for normal enrollment', () => {
      expect(getClassEnrollmentStatus(10, 25)).toBe('available');
    });

    it('should return nearly-full for high enrollment', () => {
      expect(getClassEnrollmentStatus(22, 25)).toBe('nearly-full');
    });

    it('should return full for at capacity', () => {
      expect(getClassEnrollmentStatus(25, 25)).toBe('full');
    });

    it('should return over-capacity for exceeded capacity', () => {
      expect(getClassEnrollmentStatus(27, 25)).toBe('over-capacity');
    });
  });

  describe('getEnrollmentPercentage', () => {
    it('should calculate correct percentage', () => {
      expect(getEnrollmentPercentage(20, 25)).toBe(80);
    });

    it('should handle no capacity', () => {
      expect(getEnrollmentPercentage(20)).toBe(0);
    });

    it('should handle over capacity', () => {
      expect(getEnrollmentPercentage(30, 25)).toBe(120);
    });
  });

  describe('validateClassData', () => {
    it('should validate complete class data', () => {
      const result = validateClassData(mockClassProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing name', () => {
      const result = validateClassData({ name: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Class name is required');
    });

    it('should catch negative capacity', () => {
      const result = validateClassData({ name: 'Test', capacity: -5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Capacity cannot be negative');
    });

    it('should catch invalid grade', () => {
      const result = validateClassData({ name: 'Test', grade: 'Invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid grade level');
    });
  });

  describe('getAvailableCapacity', () => {
    it('should calculate available capacity', () => {
      expect(getAvailableCapacity(mockClassProfile, 20)).toBe(5);
    });

    it('should return 0 for full class', () => {
      expect(getAvailableCapacity(mockClassProfile, 25)).toBe(0);
    });

    it('should return null for no capacity limit', () => {
      const classWithoutCapacity = { ...mockClassProfile, capacity: undefined };
      expect(getAvailableCapacity(classWithoutCapacity, 20)).toBe(null);
    });
  });

  describe('canAcceptNewStudents', () => {
    it('should return true for available class', () => {
      expect(canAcceptNewStudents(mockClassProfile, 20)).toBe(true);
    });

    it('should return false for full class', () => {
      expect(canAcceptNewStudents(mockClassProfile, 25)).toBe(false);
    });

    it('should return false for inactive class', () => {
      const inactiveClass = { ...mockClassProfile, status: 'inactive' as const };
      expect(canAcceptNewStudents(inactiveClass, 10)).toBe(false);
    });

    it('should return true for class without capacity limit', () => {
      const classWithoutCapacity = { ...mockClassProfile, capacity: undefined };
      expect(canAcceptNewStudents(classWithoutCapacity, 100)).toBe(true);
    });
  });

  describe('filterClasses', () => {
    const mockClasses: ClassProfile[] = [
      mockClassProfile,
      {
        ...mockClass,
        id: 'class-2',
        name: 'Science',
        grade: '6',
        subject: 'Biology',
        teacher: 'Mr. Smith',
        status: 'inactive'
      }
    ];

    it('should filter by grade', () => {
      const filtered = filterClasses(mockClasses, { grade: '5' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('class-1');
    });

    it('should filter by status', () => {
      const filtered = filterClasses(mockClasses, { status: 'active' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('active');
    });

    it('should filter by search term', () => {
      const filtered = filterClasses(mockClasses, { searchTerm: 'math' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Mathematics');
    });
  });

  describe('sortClasses', () => {
    const mockClasses: ClassProfile[] = [
      { ...mockClassProfile, name: 'Zebra Class' },
      { ...mockClassProfile, name: 'Alpha Class' },
      { ...mockClassProfile, name: 'Beta Class' }
    ];

    it('should sort by name ascending', () => {
      const sorted = sortClasses(mockClasses, 'name', 'asc');
      expect(sorted[0].name).toBe('Alpha Class');
      expect(sorted[2].name).toBe('Zebra Class');
    });

    it('should sort by name descending', () => {
      const sorted = sortClasses(mockClasses, 'name', 'desc');
      expect(sorted[0].name).toBe('Zebra Class');
      expect(sorted[2].name).toBe('Alpha Class');
    });
  });
});

// Example usage demonstration
export function demonstrateClassUtils() {
  console.log('=== Class Utility Functions Demo ===');
  
  // Format class names
  console.log('Formatted class name:', formatClassName('Mathematics', '5'));
  
  // Count students
  const studentCount = countStudentsInClass('class-1', mockClassStudents, mockClass);
  console.log('Student count:', studentCount);
  
  // Generate class summary
  const summary = formatClassSummary(mockClassProfile, studentCount);
  console.log('Class summary:', summary);
  
  // Check enrollment status
  const enrollmentStatus = getClassEnrollmentStatus(studentCount, mockClassProfile.capacity);
  console.log('Enrollment status:', enrollmentStatus);
  
  // Validate class data
  const validation = validateClassData(mockClassProfile);
  console.log('Validation result:', validation);
  
  console.log('=== Demo Complete ===');
}