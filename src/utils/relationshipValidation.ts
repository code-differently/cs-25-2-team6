import { validateStudentId } from './studentValidation';
import { validateClassId } from './classValidation';
import { CLASS_FORM_LIMITS, CLASS_VALIDATION_MESSAGES } from '../constants/classConstants';
import { 
  StudentAssignmentData, 
  AssignmentResult,
  RelationshipValidationResult,
  ClassStudent 
} from '../types/classStudent';

export function validateStudentAssignment(
  classId: string, 
  studentIds: string[], 
  action: 'add' | 'remove',
  existingRelationships: ClassStudent[] = [],
  existingStudentIds: string[] = [],
  existingClassIds: string[] = []
): RelationshipValidationResult {
  const conflicts: RelationshipValidationResult['conflicts'] = [];
  const warnings: RelationshipValidationResult['warnings'] = [];

  // Validate class ID
  const classValidation = validateClassId(classId, existingClassIds);
  if (!classValidation.isValid) {
    conflicts.push({
      studentId: '',
      classId,
      reason: 'invalid_class'
    });
  }

  // Check class capacity
  const currentEnrollment = existingRelationships.filter(
    rel => rel.classId === classId && rel.status === 'active'
  ).length;

  if (action === 'add' && currentEnrollment + studentIds.length > CLASS_FORM_LIMITS.MAX_STUDENTS_PER_CLASS) {
    warnings.push({
      studentId: '',
      message: CLASS_VALIDATION_MESSAGES.TOO_MANY_STUDENTS
    });
  }

  // Validate each student
  for (const studentId of studentIds) {
    // Validate student ID format and existence
    const studentValidation = validateStudentId(studentId, existingStudentIds);
    if (!studentValidation.isValid) {
      conflicts.push({
        studentId,
        classId,
        reason: 'invalid_student'
      });
      continue;
    }

    // Check relationship conflicts
    const isEnrolled = existingRelationships.some(
      rel => rel.classId === classId && rel.studentId === studentId && rel.status === 'active'
    );

    if (action === 'add' && isEnrolled) {
      conflicts.push({
        studentId,
        classId,
        reason: 'already_enrolled'
      });
    } else if (action === 'remove' && !isEnrolled) {
      conflicts.push({
        studentId,
        classId,
        reason: 'not_enrolled'
      });
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
    warnings
  };
}

export function validateClassStudentRelationships(
  assignmentData: StudentAssignmentData,
  existingRelationships: ClassStudent[] = [],
  existingStudentIds: string[] = [],
  existingClassIds: string[] = []
): RelationshipValidationResult {
  return validateStudentAssignment(
    assignmentData.classId,
    assignmentData.studentIds,
    assignmentData.action,
    existingRelationships,
    existingStudentIds,
    existingClassIds
  );
}

export function isStudentInClass(
  studentId: string, 
  classId: string, 
  relationships: ClassStudent[]
): boolean {
  return relationships.some(
    rel => rel.studentId === studentId && 
           rel.classId === classId && 
           rel.status === 'active'
  );
}

export function getClassCapacityInfo(
  classId: string, 
  relationships: ClassStudent[]
): { current: number; max: number; available: number } {
  const current = relationships.filter(
    rel => rel.classId === classId && rel.status === 'active'
  ).length;
  
  const max = CLASS_FORM_LIMITS.MAX_STUDENTS_PER_CLASS;
  const available = max - current;

  return { current, max, available };
}

export function sanitizeRelationshipData(data: StudentAssignmentData): StudentAssignmentData {
  return {
    classId: data.classId.trim(),
    studentIds: data.studentIds.map(id => id.trim()).filter(id => id.length > 0),
    action: data.action,
    preserveHistory: data.preserveHistory
  };
}

export function createAssignmentResult(
  assignedIds: string[],
  failedIds: Array<{ studentId: string; reason: string }>,
  duplicateIds: string[]
): AssignmentResult {
  return {
    success: failedIds.length === 0,
    message: failedIds.length === 0 
      ? `Successfully processed ${assignedIds.length} student assignments`
      : `Processed ${assignedIds.length} assignments with ${failedIds.length} failures`,
    assigned: assignedIds,
    failed: failedIds,
    duplicates: duplicateIds
  };
}
