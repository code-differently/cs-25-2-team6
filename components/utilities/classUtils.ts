export interface ClassProfile {
  id: string;
  name: string;
  grade?: string;
  description?: string;
  teacher?: string;
  subject?: string;
  capacity?: number;
  status?: 'active' | 'inactive' | 'archived' | 'draft';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClassStudent {
  id: string;
  classId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'enrolled' | 'pending' | 'dropped' | 'completed';
}

const GRADE_LEVELS = [
  'PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', 
  '7th', '8th', '9th', '10th', '11th', '12th'
];

export function formatClassName(name: string, grade?: string): string {
  if (!name) return 'Unnamed Class';
  
  const cleanName = name.trim();
  if (!grade) return cleanName;
  
  const cleanGrade = grade.trim();
  if (cleanName.toLowerCase().includes(cleanGrade.toLowerCase())) {
    return cleanName;
  }
  
  return `${cleanName} - ${getClassGradeDisplay(cleanGrade)}`;
}

export function countStudentsInClass(classId: string, relationships: ClassStudent[]): number {
  if (!classId || !relationships) return 0;
  
  return relationships.filter(rel => 
    rel.classId === classId && 
    rel.status === 'enrolled'
  ).length;
}

export function getClassGradeDisplay(grade?: string | number): string {
  if (grade === null || grade === undefined || grade === '') {
    return 'All Grades';
  }
  
  const gradeStr = String(grade).trim().toUpperCase();
  
  if (gradeStr === 'K' || gradeStr === 'KINDERGARTEN') {
    return 'Kindergarten';
  }
  
  if (gradeStr === 'PK' || gradeStr === 'PRE-K' || gradeStr === 'PREKINDERGARTEN') {
    return 'Pre-K';
  }
  
  const numericGrade = parseInt(gradeStr, 10);
  if (!isNaN(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
    const suffix = getOrdinalSuffix(numericGrade);
    return `${numericGrade}${suffix} Grade`;
  }
  
  return gradeStr.charAt(0).toUpperCase() + gradeStr.slice(1).toLowerCase();
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export function formatClassSummary(classData: ClassProfile, studentCount: number): string {
  if (!classData) return 'No class data available';
  
  const className = formatClassName(classData.name, classData.grade);
  const gradeInfo = classData.grade ? ` (${getClassGradeDisplay(classData.grade)})` : '';
  const teacherInfo = classData.teacher ? ` - ${classData.teacher}` : '';
  const capacityInfo = classData.capacity ? ` - ${studentCount}/${classData.capacity} students` : ` - ${studentCount} students`;
  
  return `${className}${gradeInfo}${teacherInfo}${capacityInfo}`;
}

export function isClassEmpty(classId: string, relationships: ClassStudent[]): boolean {
  return countStudentsInClass(classId, relationships) === 0;
}

export function generateClassDisplayText(classData: ClassProfile): string {
  if (!classData) return 'Unknown Class';
  
  const className = formatClassName(classData.name, classData.grade);
  const subject = classData.subject ? ` (${classData.subject})` : '';
  const teacher = classData.teacher ? ` - ${classData.teacher}` : '';
  
  return `${className}${subject}${teacher}`;
}

export function getClassEnrollmentStatus(currentCount: number, capacity?: number): 'available' | 'full' | 'overbooked' | 'unknown' {
  if (!capacity || capacity <= 0) return 'unknown';
  
  if (currentCount < capacity) return 'available';
  if (currentCount === capacity) return 'full';
  return 'overbooked';
}

export function getEnrollmentPercentage(currentCount: number, capacity?: number): number {
  if (!capacity || capacity <= 0) return 0;
  return Math.round((currentCount / capacity) * 100);
}

export function filterClasses(
  classes: ClassProfile[], 
  criteria: {
    grade?: string;
    teacher?: string;
    subject?: string;
    status?: string;
    searchTerm?: string;
  }
): ClassProfile[] {
  if (!classes) return [];
  
  return classes.filter(classData => {
    if (criteria.grade && classData.grade !== criteria.grade) {
      return false;
    }
    
    if (criteria.teacher && 
        (!classData.teacher || !classData.teacher.toLowerCase().includes(criteria.teacher.toLowerCase()))) {
      return false;
    }
    
    if (criteria.subject && 
        (!classData.subject || !classData.subject.toLowerCase().includes(criteria.subject.toLowerCase()))) {
      return false;
    }
    
    if (criteria.status && classData.status !== criteria.status) {
      return false;
    }
    
    if (criteria.searchTerm) {
      const searchLower = criteria.searchTerm.toLowerCase();
      const searchableText = [
        classData.name,
        classData.description,
        classData.teacher,
        classData.subject,
        classData.grade
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
}

export function sortClasses(
  classes: ClassProfile[], 
  sortBy: 'name' | 'grade' | 'teacher' | 'subject' | 'capacity' | 'status' = 'name',
  order: 'asc' | 'desc' = 'asc'
): ClassProfile[] {
  if (!classes) return [];
  
  const sorted = [...classes].sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';
    
    switch (sortBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'grade':
        aValue = a.grade || '';
        bValue = b.grade || '';
        break;
      case 'teacher':
        aValue = a.teacher || '';
        bValue = b.teacher || '';
        break;
      case 'subject':
        aValue = a.subject || '';
        bValue = b.subject || '';
        break;
      case 'capacity':
        aValue = a.capacity || 0;
        bValue = b.capacity || 0;
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
  
  return sorted;
}

export function validateClassData(classData: Partial<ClassProfile>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!classData.name || classData.name.trim().length === 0) {
    errors.push('Class name is required');
  }
  
  if (classData.name && classData.name.trim().length > 100) {
    errors.push('Class name must be 100 characters or less');
  }
  
  if (classData.capacity && classData.capacity < 0) {
    errors.push('Class capacity cannot be negative');
  }
  
  if (classData.capacity && classData.capacity > 1000) {
    errors.push('Class capacity seems unrealistic (max 1000)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getAvailableCapacity(classData: ClassProfile, currentCount: number): number {
  if (!classData.capacity) return Infinity;
  return Math.max(0, classData.capacity - currentCount);
}

export function canAcceptNewStudents(classData: ClassProfile, currentCount: number, newStudents: number = 1): boolean {
  if (!classData.capacity) return true;
  return (currentCount + newStudents) <= classData.capacity;
}