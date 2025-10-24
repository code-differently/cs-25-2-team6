/**
 * Test file for student utility functions
 */

import {
  formatStudentName,
  generateStudentInitials,
  getStudentAvatarColor,
  formatStudentId,
  isRequiredField,
  formatGradeDisplay,
  validateStudentName,
  generateSearchableStudentName,
  parseStudentFullName,
  generateStudentDisplayName,
  getStudentAvatarProps,
  formatStudentContact,
  getStudentStatusBadgeProps,
  assessStudentDataCompleteness,
  sortStudents
} from './studentUtils';

// Mock student data for testing
const mockStudents = [
  {
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU001',
    grade: '10',
    email: 'john.doe@school.edu'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: 'STU002',
    grade: 'K',
    email: 'jane.smith@school.edu'
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    studentId: 'STU003',
    grade: '12',
    email: 'alice.johnson@school.edu'
  }
];

describe('Student Utility Functions', () => {
  describe('formatStudentName', () => {
    it('should format complete names correctly', () => {
      expect(formatStudentName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle missing first name', () => {
      expect(formatStudentName('', 'Doe')).toBe('Doe');
    });

    it('should handle missing last name', () => {
      expect(formatStudentName('John', '')).toBe('John');
    });

    it('should handle completely missing names', () => {
      expect(formatStudentName('', '')).toBe('Unknown Student');
    });

    it('should trim whitespace', () => {
      expect(formatStudentName('  John  ', '  Doe  ')).toBe('John Doe');
    });
  });

  describe('generateStudentInitials', () => {
    it('should generate initials from first and last name', () => {
      expect(generateStudentInitials('John', 'Doe')).toBe('JD');
    });

    it('should handle missing last name', () => {
      expect(generateStudentInitials('John', '')).toBe('J?');
    });

    it('should handle missing first name', () => {
      expect(generateStudentInitials('', 'Doe')).toBe('D?');
    });

    it('should handle completely missing names', () => {
      expect(generateStudentInitials('', '')).toBe('??');
    });

    it('should convert to uppercase', () => {
      expect(generateStudentInitials('john', 'doe')).toBe('JD');
    });
  });

  describe('getStudentAvatarColor', () => {
    it('should return consistent colors for same ID', () => {
      const color1 = getStudentAvatarColor('STU001');
      const color2 = getStudentAvatarColor('STU001');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different IDs', () => {
      const color1 = getStudentAvatarColor('STU001');
      const color2 = getStudentAvatarColor('STU002');
      expect(color1).not.toBe(color2);
    });

    it('should return valid hex color', () => {
      const color = getStudentAvatarColor('STU001');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should handle empty ID', () => {
      const color = getStudentAvatarColor('');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('formatStudentId', () => {
    it('should format numeric IDs', () => {
      expect(formatStudentId('123')).toBe('STU0123');
    });

    it('should preserve already formatted IDs', () => {
      expect(formatStudentId('STU001')).toBe('STU001');
    });

    it('should handle alpha-numeric IDs', () => {
      expect(formatStudentId('CS123')).toBe('CS123');
    });

    it('should handle empty ID', () => {
      expect(formatStudentId('')).toBe('N/A');
    });

    it('should convert to uppercase', () => {
      expect(formatStudentId('stu001')).toBe('STU001');
    });
  });

  describe('isRequiredField', () => {
    it('should identify required fields', () => {
      expect(isRequiredField('firstName')).toBe(true);
      expect(isRequiredField('lastName')).toBe(true);
      expect(isRequiredField('studentId')).toBe(true);
      expect(isRequiredField('grade')).toBe(true);
      expect(isRequiredField('email')).toBe(true);
    });

    it('should identify non-required fields', () => {
      expect(isRequiredField('phone')).toBe(false);
      expect(isRequiredField('address')).toBe(false);
      expect(isRequiredField('notes')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isRequiredField('FIRSTNAME')).toBe(true);
      expect(isRequiredField('LastName')).toBe(true);
    });
  });

  describe('formatGradeDisplay', () => {
    it('should format numeric grades', () => {
      expect(formatGradeDisplay('1')).toBe('1st Grade');
      expect(formatGradeDisplay('2')).toBe('2nd Grade');
      expect(formatGradeDisplay('3')).toBe('3rd Grade');
      expect(formatGradeDisplay('4')).toBe('4th Grade');
      expect(formatGradeDisplay('11')).toBe('11th Grade');
      expect(formatGradeDisplay('12')).toBe('12th Grade');
    });

    it('should format kindergarten', () => {
      expect(formatGradeDisplay('K')).toBe('Kindergarten');
      expect(formatGradeDisplay('KINDERGARTEN')).toBe('Kindergarten');
    });

    it('should format pre-k', () => {
      expect(formatGradeDisplay('PK')).toBe('Pre-K');
      expect(formatGradeDisplay('PRE-K')).toBe('Pre-K');
    });

    it('should handle undefined/empty grades', () => {
      expect(formatGradeDisplay()).toBe('Not Assigned');
      expect(formatGradeDisplay('')).toBe('Not Assigned');
      expect(formatGradeDisplay(null as any)).toBe('Not Assigned');
    });

    it('should handle number input', () => {
      expect(formatGradeDisplay(5)).toBe('5th Grade');
    });
  });

  describe('validateStudentName', () => {
    it('should validate complete names', () => {
      const result = validateStudentName('John', 'Doe');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing first name', () => {
      const result = validateStudentName('', 'Doe');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First name is required');
    });

    it('should catch missing last name', () => {
      const result = validateStudentName('John', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Last name is required');
    });

    it('should catch short names', () => {
      const result = validateStudentName('J', 'D');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First name must be at least 2 characters');
      expect(result.errors).toContain('Last name must be at least 2 characters');
    });
  });

  describe('generateSearchableStudentName', () => {
    it('should create searchable format', () => {
      const searchable = generateSearchableStudentName('John', 'Doe');
      expect(searchable).toBe('john doe');
    });

    it('should remove special characters', () => {
      const searchable = generateSearchableStudentName("John-Paul", "O'Connor");
      expect(searchable).toBe('johnpaul oconnor');
    });
  });

  describe('parseStudentFullName', () => {
    it('should parse two-part names', () => {
      const result = parseStudentFullName('John Doe');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should handle single names', () => {
      const result = parseStudentFullName('John');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('');
    });

    it('should handle multiple last names', () => {
      const result = parseStudentFullName('John Michael Doe Smith');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Michael Doe Smith');
    });

    it('should handle empty input', () => {
      const result = parseStudentFullName('');
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
    });
  });

  describe('generateStudentDisplayName', () => {
    it('should create display name without ID', () => {
      const displayName = generateStudentDisplayName('John', 'Doe', 'STU001', false);
      expect(displayName).toBe('John Doe');
    });

    it('should create display name with ID', () => {
      const displayName = generateStudentDisplayName('John', 'Doe', 'STU001', true);
      expect(displayName).toBe('John Doe (STU001)');
    });
  });

  describe('getStudentAvatarProps', () => {
    it('should return proper avatar props', () => {
      const props = getStudentAvatarProps('John', 'Doe', 'STU001');
      expect(props.firstName).toBe('John');
      expect(props.lastName).toBe('Doe');
      expect(props.fullName).toBe('John Doe');
      expect(props.studentId).toBe('STU001');
      expect(props.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(props.ariaLabel).toBe('Avatar for John Doe');
    });
  });

  describe('formatStudentContact', () => {
    it('should format email only', () => {
      const contact = formatStudentContact('john@school.edu');
      expect(contact).toBe('john@school.edu');
    });

    it('should format phone only', () => {
      const contact = formatStudentContact(undefined, '1234567890');
      expect(contact).toBe('(123) 456-7890');
    });

    it('should format both email and phone', () => {
      const contact = formatStudentContact('john@school.edu', '1234567890');
      expect(contact).toBe('john@school.edu • (123) 456-7890');
    });

    it('should handle no contact info', () => {
      const contact = formatStudentContact();
      expect(contact).toBe('No contact info');
    });
  });

  describe('getStudentStatusBadgeProps', () => {
    it('should create status badge props', () => {
      const props = getStudentStatusBadgeProps('enrolled', '10');
      expect(props.status).toBe('enrolled');
      expect(props.size).toBe('small');
      expect(props.showDot).toBe(true);
      expect(props.children).toContain('10th Grade');
      expect(props.children).toContain('Enrolled');
    });

    it('should handle status without grade', () => {
      const props = getStudentStatusBadgeProps('pending');
      expect(props.children).toBe('Pending');
    });
  });

  describe('assessStudentDataCompleteness', () => {
    it('should assess complete data', () => {
      const assessment = assessStudentDataCompleteness({
        firstName: 'John',
        lastName: 'Doe',
        studentId: 'STU001',
        grade: '10',
        email: 'john@school.edu'
      });
      expect(assessment.isComplete).toBe(true);
      expect(assessment.missingFields).toHaveLength(0);
      expect(assessment.completionPercentage).toBe(100);
    });

    it('should assess incomplete data', () => {
      const assessment = assessStudentDataCompleteness({
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(assessment.isComplete).toBe(false);
      expect(assessment.missingFields).toContain('studentId');
      expect(assessment.missingFields).toContain('grade');
      expect(assessment.missingFields).toContain('email');
      expect(assessment.completionPercentage).toBe(40); // 2 out of 5 fields
    });
  });

  describe('sortStudents', () => {
    it('should sort by name ascending', () => {
      const sorted = sortStudents(mockStudents, 'name', 'asc');
      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Jane');
      expect(sorted[2].firstName).toBe('John');
    });

    it('should sort by name descending', () => {
      const sorted = sortStudents(mockStudents, 'name', 'desc');
      expect(sorted[0].firstName).toBe('John');
      expect(sorted[1].firstName).toBe('Jane');
      expect(sorted[2].firstName).toBe('Alice');
    });

    it('should sort by last name', () => {
      const sorted = sortStudents(mockStudents, 'lastName', 'asc');
      expect(sorted[0].lastName).toBe('Doe');
      expect(sorted[1].lastName).toBe('Johnson');
      expect(sorted[2].lastName).toBe('Smith');
    });

    it('should sort by student ID', () => {
      const sorted = sortStudents(mockStudents, 'id', 'asc');
      expect(sorted[0].studentId).toBe('STU001');
      expect(sorted[1].studentId).toBe('STU002');
      expect(sorted[2].studentId).toBe('STU003');
    });
  });
});

// Example usage demonstration
export function demonstrateStudentUtils() {
  console.log('=== Student Utility Functions Demo ===');
  
  // Format student names
  console.log('Student name:', formatStudentName('John', 'Doe'));
  
  // Generate initials
  console.log('Initials:', generateStudentInitials('John', 'Doe'));
  
  // Get avatar color
  console.log('Avatar color:', getStudentAvatarColor('STU001'));
  
  // Format ID
  console.log('Formatted ID:', formatStudentId('123'));
  
  // Check required fields
  console.log('Is firstName required?', isRequiredField('firstName'));
  
  // Format grade
  console.log('Grade display:', formatGradeDisplay('10'));
  
  // Assess data completeness
  const completeness = assessStudentDataCompleteness({
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU001'
  });
  console.log('Data completeness:', completeness);
  
  console.log('=== Demo Complete ===');
}