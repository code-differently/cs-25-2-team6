/**
 * Data validation exports for User Story 1
 */

// Type definitions
export * from './types/class';
export * from './types/attendance';

// Validation utilities
export * from './utils/attendance-validation';
export * from './utils/attendance-helpers';

// Constants and labels
export * from './constants/attendance-form';

// Re-export existing domain types for convenience
export { AttendanceStatus } from './domains/AttendanceStatus';
export { Student } from './domains/Student';
export { AttendanceRecord } from './domains/AttendanceRecords';
