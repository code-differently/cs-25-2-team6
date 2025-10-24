/**
 * Class Management Components and Utilities
 * Centralized exports for all class-related UI components and utility functions
 */

// UI Components
export { default as ClassBadge } from '../ui/ClassBadge';
export type { ClassBadgeProps } from '../ui/ClassBadge';

export { default as StudentCounter } from '../ui/StudentCounter';
export type { StudentCounterProps } from '../ui/StudentCounter';

export { default as ClassGradeIndicator } from '../ui/ClassGradeIndicator';
export type { ClassGradeIndicatorProps } from '../ui/ClassGradeIndicator';

export { default as AssignmentButton } from '../ui/AssignmentButton';
export type { AssignmentButtonProps } from '../ui/AssignmentButton';

export { default as ClassStatusIcon } from '../ui/ClassStatusIcon';
export type { ClassStatusIconProps } from '../ui/ClassStatusIcon';

// Utility Functions
export {
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
  canAcceptNewStudents
} from './classUtils';

// Types
export type { ClassProfile, ClassStudent } from './classUtils';

// Re-export core class types for convenience
export type { Class, CreateClassRequest, UpdateClassRequest, ClassValidationResult } from '../../src/types/class';
export { Student } from '../../src/domains/Student';

// CSS Import
import './Classes.css';