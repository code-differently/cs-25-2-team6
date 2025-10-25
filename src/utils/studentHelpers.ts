import { StudentFormData, StudentEditFormData } from '../types/studentForm';
import { StudentProfile, Student } from '../types/students';
import { NAME_VALIDATION } from '../constants/studentConstants';

export function sanitizeStudentInput(input: StudentFormData): StudentFormData {
  return {
    firstName: sanitizeNameField(input.firstName),
    lastName: sanitizeNameField(input.lastName),
    grade: sanitizeGradeField(input.grade)
  };
}

export function sanitizeNameField(name: string): string {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, NAME_VALIDATION.MAX_LENGTH);
}

export function sanitizeGradeField(grade?: string): string | undefined {
  if (!grade || grade.trim() === '') return undefined;
  
  return grade.trim().substring(0, 15);
}

export function transformFormDataToStudent(formData: StudentFormData, id: string): Student {
  const sanitized = sanitizeStudentInput(formData);
  
  return {
    id,
    firstName: sanitized.firstName,
    lastName: sanitized.lastName,
    grade: sanitized.grade
  };
}

export function transformStudentToFormData(student: Student): StudentFormData {
  return {
    firstName: student.firstName || '',
    lastName: student.lastName || '',
    grade: student.grade
  };
}

export function transformStudentToEditFormData(student: Student): StudentEditFormData {
  return {
    id: student.id,
    firstName: student.firstName || '',
    lastName: student.lastName || '',
    grade: student.grade
  };
}

export function formatStudentName(firstName: string, lastName: string): string {
  const cleanFirst = sanitizeNameField(firstName);
  const cleanLast = sanitizeNameField(lastName);
  
  return `${cleanFirst} ${cleanLast}`.trim();
}

export function formatStudentId(id: string): string {
  return id.toUpperCase().trim();
}

export function normalizeStudentData(data: Partial<StudentFormData>): StudentFormData {
  return {
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    grade: data.grade
  };
}

export function createStudentProfile(student: Student): StudentProfile {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: formatStudentName(student.firstName, student.lastName),
    grade: student.grade,
    buildingIds: ['MAIN']
  };
}

export function extractChangedFields(
  current: StudentFormData, 
  original: StudentFormData
): Partial<StudentFormData> {
  const changes: Partial<StudentFormData> = {};
  
  if (current.firstName !== original.firstName) {
    changes.firstName = current.firstName;
  }
  
  if (current.lastName !== original.lastName) {
    changes.lastName = current.lastName;
  }
  
  if (current.grade !== original.grade) {
    changes.grade = current.grade;
  }
  
  return changes;
}
