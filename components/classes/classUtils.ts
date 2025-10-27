/**
 * Class Management Utility Functions
 * Provides common operations for class data manipulation and formatting
 */

import { Class } from '../../src/types/class';
import { Student } from '../../src/domains/Student';

// Extended interface for UI display purposes
export interface ClassProfile extends Class {
  grade?: string;
  description?: string;
  subject?: string;
  teacher?: string;
  capacity?: number;
  status?: 'active' | 'inactive' | 'pending' | 'full' | 'cancelled';
}

export interface ClassStudent {
  id: string;
  classId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'enrolled' | 'pending' | 'dropped' | 'completed';
}

/**
 * Formats a class name with optional grade information
 * @param name - The base class name
 * @param grade - Optional grade level (e.g., "3", "K", "12")
 * @returns Formatted class name string
 */
export function formatClassName(name: string, grade?: string): string {
  if (!name) return '';
  
  // Clean and trim the name
  const cleanName = name.trim();
  
  if (!grade) {
    return cleanName;
  }
  
  // Format grade display
  const formattedGrade = formatGradeLevel(grade);
  
  // Check if grade is already in the name
  const gradePattern = new RegExp(`\\b${grade}\\b|\\bgrade\\s*${grade}\\b`, 'i');
  if (gradePattern.test(cleanName)) {
    return cleanName;
  }
  
  // Add grade to the name
  return `${cleanName} - Grade ${formattedGrade}`;
}

/**
 * Counts the number of students enrolled in a specific class
 * @param classId - The unique class identifier
 * @param relationships - Array of class-student relationships (optional - can also use class.studentIds)
 * @param classData - Optional class data containing studentIds
 * @returns Number of enrolled students
 */
export function countStudentsInClass(
  classId: string, 
  relationships?: ClassStudent[], 
  classData?: Class
): number {
  if (!classId) return 0;
  
  // If class data is provided, use studentIds array
  if (classData && classData.studentIds) {
    return classData.studentIds.length;
  }
  
  // Otherwise use relationships array
  if (!relationships) return 0;
  
  return relationships.filter(
    relationship => 
      relationship.classId === classId && 
      relationship.status === 'enrolled'
  ).length;
}

/**
 * Gets formatted display text for class grade level
 * @param grade - Grade level (e.g., "K", "1", "2", "12")
 * @returns Formatted grade display string
 */
export function getClassGradeDisplay(grade?: string): string {
  if (!grade) return 'Mixed Grades';
  
  const formattedGrade = formatGradeLevel(grade);
  return `Grade ${formattedGrade}`;
}

/**
 * Formats a comprehensive class summary with student count
 * @param classData - Class profile information
 * @param studentCount - Current number of enrolled students
 * @returns Formatted summary string
 */
export function formatClassSummary(classData: ClassProfile, studentCount: number): string {
  if (!classData) return '';
  
  const parts: string[] = [];
  
  // Add class name with grade
  const className = formatClassName(classData.name, classData.grade);
  parts.push(className);
  
  // Add student count information
  if (classData.capacity) {
    parts.push(`${studentCount}/${classData.capacity} students`);
  } else {
    parts.push(`${studentCount} student${studentCount !== 1 ? 's' : ''}`);
  }
  
  // Add subject if available
  if (classData.subject) {
    parts.push(classData.subject);
  }
  
  // Add teacher if available
  if (classData.teacher) {
    parts.push(`taught by ${classData.teacher}`);
  }
  
  return parts.join(' • ');
}

/**
 * Checks if a class has no enrolled students
 * @param classId - The unique class identifier
 * @param relationships - Array of class-student relationships (optional)
 * @param classData - Optional class data containing studentIds
 * @returns True if class has no enrolled students
 */
export function isClassEmpty(
  classId: string, 
  relationships?: ClassStudent[], 
  classData?: Class
): boolean {
  return countStudentsInClass(classId, relationships, classData) === 0;
}

/**
 * Generates display text for class information
 * @param classData - Class profile information
 * @returns Formatted display text
 */
export function generateClassDisplayText(classData: ClassProfile): string {
  if (!classData) return '';
  
  const parts: string[] = [];
  
  // Primary class name with grade
  const className = formatClassName(classData.name, classData.grade);
  parts.push(className);
  
  // Add subject in parentheses if different from name
  if (classData.subject && !classData.name.toLowerCase().includes(classData.subject.toLowerCase())) {
    parts.push(`(${classData.subject})`);
  }
  
  return parts.join(' ');
}

/**
 * Helper function to format grade levels consistently
 * @param grade - Raw grade input
 * @returns Formatted grade string
 */
function formatGradeLevel(grade: string): string {
  const trimmedGrade = grade.trim().toUpperCase();
  
  // Handle special cases
  if (trimmedGrade === 'K' || trimmedGrade === 'KINDERGARTEN') {
    return 'K';
  }
  
  if (trimmedGrade === 'PK' || trimmedGrade === 'PRE-K' || trimmedGrade === 'PREKINDERGARTEN') {
    return 'Pre-K';
  }
  
  // Handle numeric grades
  const numericGrade = parseInt(trimmedGrade, 10);
  if (!isNaN(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
    return numericGrade.toString();
  }
  
  // Return as-is for other cases
  return trimmedGrade;
}

/**
 * Gets class enrollment status based on student count and capacity
 * @param studentCount - Current number of enrolled students
 * @param capacity - Maximum class capacity
 * @returns Enrollment status
 */
export function getClassEnrollmentStatus(
  studentCount: number, 
  capacity?: number
): 'empty' | 'available' | 'nearly-full' | 'full' | 'over-capacity' {
  if (studentCount === 0) return 'empty';
  if (!capacity) return 'available';
  
  const percentage = (studentCount / capacity) * 100;
  
  if (studentCount > capacity) return 'over-capacity';
  if (percentage >= 100) return 'full';
  if (percentage >= 85) return 'nearly-full';
  return 'available';
}

/**
 * Calculates enrollment percentage for a class
 * @param studentCount - Current number of enrolled students
 * @param capacity - Maximum class capacity
 * @returns Enrollment percentage (0-100+)
 */
export function getEnrollmentPercentage(studentCount: number, capacity?: number): number {
  if (!capacity || capacity === 0) return 0;
  return Math.round((studentCount / capacity) * 100);
}

/**
 * Filters classes by various criteria
 * @param classes - Array of class profiles
 * @param filters - Filter criteria
 * @returns Filtered array of classes
 */
export function filterClasses(
  classes: ClassProfile[], 
  filters: {
    grade?: string;
    subject?: string;
    status?: string;
    teacher?: string;
    searchTerm?: string;
  }
): ClassProfile[] {
  return classes.filter(classItem => {
    // Grade filter
    if (filters.grade && classItem.grade !== filters.grade) {
      return false;
    }
    
    // Subject filter
    if (filters.subject && classItem.subject !== filters.subject) {
      return false;
    }
    
    // Status filter
    if (filters.status && classItem.status !== filters.status) {
      return false;
    }
    
    // Teacher filter
    if (filters.teacher && classItem.teacher !== filters.teacher) {
      return false;
    }
    
    // Search term filter (searches name, subject, teacher)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchableText = [
        classItem.name,
        classItem.subject,
        classItem.teacher,
        classItem.description
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sorts classes by specified criteria
 * @param classes - Array of class profiles
 * @param sortBy - Sorting criteria
 * @param direction - Sort direction
 * @returns Sorted array of classes
 */
export function sortClasses(
  classes: ClassProfile[], 
  sortBy: 'name' | 'grade' | 'subject' | 'teacher' | 'createdAt' | 'updatedAt' = 'name',
  direction: 'asc' | 'desc' = 'asc'
): ClassProfile[] {
  return [...classes].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'grade':
        aValue = parseGradeForSorting(a.grade);
        bValue = parseGradeForSorting(b.grade);
        break;
      case 'subject':
        aValue = a.subject?.toLowerCase() || '';
        bValue = b.subject?.toLowerCase() || '';
        break;
      case 'teacher':
        aValue = a.teacher?.toLowerCase() || '';
        bValue = b.teacher?.toLowerCase() || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt || 0);
        bValue = new Date(b.updatedAt || 0);
        break;
      default:
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
    }
    
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    return direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Helper function to parse grade for sorting purposes
 * @param grade - Grade string
 * @returns Numeric value for sorting
 */
function parseGradeForSorting(grade?: string): number {
  if (!grade) return 999; // Put undefined grades at the end
  
  const trimmedGrade = grade.trim().toUpperCase();
  
  if (trimmedGrade === 'PK' || trimmedGrade === 'PRE-K') return -1;
  if (trimmedGrade === 'K' || trimmedGrade === 'KINDERGARTEN') return 0;
  
  const numericGrade = parseInt(trimmedGrade, 10);
  if (!isNaN(numericGrade)) return numericGrade;
  
  return 999; // Put non-numeric grades at the end
}

/**
 * Validates class data for completeness and correctness
 * @param classData - Class profile to validate
 * @returns Validation result with any errors
 */
export function validateClassData(classData: Partial<ClassProfile>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required fields
  if (!classData.name?.trim()) {
    errors.push('Class name is required');
  }
  
  // Validate capacity
  if (classData.capacity !== undefined) {
    if (classData.capacity < 0) {
      errors.push('Capacity cannot be negative');
    }
    if (!Number.isInteger(classData.capacity)) {
      errors.push('Capacity must be a whole number');
    }
  }
  
  // Validate grade
  if (classData.grade) {
    const validGrades = ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const normalizedGrade = classData.grade.trim().toUpperCase();
    if (!validGrades.includes(normalizedGrade) && isNaN(parseInt(normalizedGrade, 10))) {
      errors.push('Invalid grade level');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets available capacity for a class
 * @param classData - Class profile information
 * @param studentCount - Current number of enrolled students
 * @returns Available spots or null if no capacity limit
 */
export function getAvailableCapacity(classData: ClassProfile, studentCount: number): number | null {
  if (!classData.capacity) return null;
  return Math.max(0, classData.capacity - studentCount);
}

/**
 * Checks if a class can accept new students
 * @param classData - Class profile information
 * @param studentCount - Current number of enrolled students
 * @returns True if class can accept new students
 */
export function canAcceptNewStudents(classData: ClassProfile, studentCount: number): boolean {
  if (classData.status === 'inactive' || classData.status === 'cancelled') {
    return false;
  }
  
  if (!classData.capacity) return true;
  
  return studentCount < classData.capacity;
}