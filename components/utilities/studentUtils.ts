/**
 * Student Management Utility Functions
 * Provides common operations for student data manipulation and formatting
 */

// Student field configuration
const REQUIRED_STUDENT_FIELDS = [
  'firstName',
  'lastName',
  'studentId',
  'grade',
  'email'
];

// Avatar color palette
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#F8D7DA', '#D1ECF1', '#D4EDDA', '#FFF3CD', '#E2E3E5'
];

/**
 * Formats a student's full name from first and last name components
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @returns Formatted full name
 */
export function formatStudentName(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return 'Unknown Student';
  
  const cleanFirstName = firstName?.trim() || '';
  const cleanLastName = lastName?.trim() || '';
  
  if (!cleanFirstName) return cleanLastName;
  if (!cleanLastName) return cleanFirstName;
  
  return `${cleanFirstName} ${cleanLastName}`;
}

/**
 * Generates initials from a student's first and last name
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @returns Student initials (typically 2 characters)
 */
export function generateStudentInitials(firstName: string, lastName: string): string {
  const cleanFirstName = firstName?.trim() || '';
  const cleanLastName = lastName?.trim() || '';
  
  if (!cleanFirstName && !cleanLastName) return '??';
  
  const firstInitial = cleanFirstName[0]?.toUpperCase() || '';
  const lastInitial = cleanLastName[0]?.toUpperCase() || '';
  
  if (!firstInitial) return lastInitial + '?';
  if (!lastInitial) return firstInitial + '?';
  
  return firstInitial + lastInitial;
}

/**
 * Gets a consistent avatar color for a student based on their ID
 * @param studentId - Unique student identifier
 * @returns Hex color code for avatar background
 */
export function getStudentAvatarColor(studentId: string): string {
  if (!studentId) return AVATAR_COLORS[0];
  
  // Create a simple hash from the student ID
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    const char = studentId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value to ensure positive index
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

/**
 * Formats a student ID for display purposes
 * @param id - Raw student ID
 * @returns Formatted student ID string
 */
export function formatStudentId(id: string): string {
  if (!id) return 'N/A';
  
  const cleanId = id.trim().toUpperCase();
  
  // Handle different ID formats
  if (cleanId.match(/^\d+$/)) {
    // Numeric ID - pad with zeros if needed
    return `STU${cleanId.padStart(4, '0')}`;
  }
  
  if (cleanId.startsWith('STU')) {
    // Already formatted
    return cleanId;
  }
  
  if (cleanId.match(/^[A-Z]{2,3}\d+$/)) {
    // Alpha-numeric format (e.g., CS123, MAT456)
    return cleanId;
  }
  
  // Default format
  return `ID-${cleanId}`;
}

/**
 * Determines if a field is required for student forms
 * @param fieldName - Name of the field to check
 * @returns True if field is required
 */
export function isRequiredField(fieldName: string): boolean {
  return REQUIRED_STUDENT_FIELDS.includes(fieldName.toLowerCase());
}

/**
 * Formats grade level for consistent display
 * @param grade - Grade level (can be string or number)
 * @returns Formatted grade display string
 */
export function formatGradeDisplay(grade?: string | number): string {
  if (grade === null || grade === undefined || grade === '') {
    return 'Not Assigned';
  }
  
  const gradeStr = String(grade).trim().toUpperCase();
  
  // Handle special cases
  if (gradeStr === 'K' || gradeStr === 'KINDERGARTEN') {
    return 'Kindergarten';
  }
  
  if (gradeStr === 'PK' || gradeStr === 'PRE-K' || gradeStr === 'PREKINDERGARTEN') {
    return 'Pre-K';
  }
  
  // Handle numeric grades
  const numericGrade = parseInt(gradeStr, 10);
  if (!isNaN(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
    const suffix = getOrdinalSuffix(numericGrade);
    return `${numericGrade}${suffix} Grade`;
  }
  
  // Handle other cases
  return gradeStr;
}

/**
 * Helper function to get ordinal suffix for numbers
 * @param num - Number to get suffix for
 * @returns Ordinal suffix (st, nd, rd, th)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Validates student name components
 * @param firstName - First name to validate
 * @param lastName - Last name to validate
 * @returns Validation result with errors
 */
export function validateStudentName(firstName: string, lastName: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!firstName?.trim()) {
    errors.push('First name is required');
  } else if (firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (!lastName?.trim()) {
    errors.push('Last name is required');
  } else if (lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates a search-friendly version of student name
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @returns Lowercase searchable string
 */
export function generateSearchableStudentName(firstName: string, lastName: string): string {
  const fullName = formatStudentName(firstName, lastName);
  return fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Extracts first and last names from a full name string
 * @param fullName - Complete name string
 * @returns Object with firstName and lastName
 */
export function parseStudentFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  if (!fullName?.trim()) {
    return { firstName: '', lastName: '' };
  }
  
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }
  
  if (nameParts.length === 2) {
    return { firstName: nameParts[0], lastName: nameParts[1] };
  }
  
  // For more than 2 parts, first word is first name, rest is last name
  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(' ')
  };
}

/**
 * Generates a student display name with optional ID
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @param studentId - Optional student ID
 * @param includeId - Whether to include ID in display
 * @returns Formatted display name
 */
export function generateStudentDisplayName(
  firstName: string,
  lastName: string,
  studentId?: string,
  includeId: boolean = false
): string {
  const name = formatStudentName(firstName, lastName);
  
  if (includeId && studentId) {
    const formattedId = formatStudentId(studentId);
    return `${name} (${formattedId})`;
  }
  
  return name;
}

/**
 * Gets avatar props for StudentAvatar component
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @param studentId - Student ID
 * @param avatarUrl - Optional avatar image URL
 * @returns Props object for StudentAvatar component
 */
export function getStudentAvatarProps(
  firstName: string,
  lastName: string,
  studentId: string,
  avatarUrl?: string
) {
  return {
    firstName,
    lastName,
    fullName: formatStudentName(firstName, lastName),
    avatarUrl,
    backgroundColor: getStudentAvatarColor(studentId),
    studentId,
    ariaLabel: `Avatar for ${formatStudentName(firstName, lastName)}`
  };
}

/**
 * Formats student contact information
 * @param email - Student email
 * @param phone - Student phone number
 * @returns Formatted contact string
 */
export function formatStudentContact(email?: string, phone?: string): string {
  const contacts: string[] = [];
  
  if (email?.trim()) {
    contacts.push(email.trim());
  }
  
  if (phone?.trim()) {
    // Basic phone formatting
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      const formatted = `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}`;
      contacts.push(formatted);
    } else {
      contacts.push(phone.trim());
    }
  }
  
  return contacts.join(' • ') || 'No contact info';
}

/**
 * Gets student status badge props
 * @param status - Student enrollment status
 * @param grade - Student grade level
 * @returns Props for StudentBadge component
 */
export function getStudentStatusBadgeProps(
  status: 'enrolled' | 'pending' | 'dropped' | 'graduated' | 'transferred' | 'inactive',
  grade?: string
) {
  const baseProps = {
    status,
    size: 'small' as const,
    showDot: true
  };
  
  if (grade) {
    return {
      ...baseProps,
      children: `${formatGradeDisplay(grade)} - ${status.charAt(0).toUpperCase() + status.slice(1)}`
    };
  }
  
  return {
    ...baseProps,
    children: status.charAt(0).toUpperCase() + status.slice(1)
  };
}

/**
 * Checks if student data is complete
 * @param studentData - Student data object
 * @returns Completeness assessment
 */
export function assessStudentDataCompleteness(studentData: {
  firstName?: string;
  lastName?: string;
  studentId?: string;
  grade?: string;
  email?: string;
  [key: string]: any;
}): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const missingFields: string[] = [];
  
  REQUIRED_STUDENT_FIELDS.forEach(field => {
    if (!studentData[field]?.toString().trim()) {
      missingFields.push(field);
    }
  });
  
  const completionPercentage = Math.round(
    ((REQUIRED_STUDENT_FIELDS.length - missingFields.length) / REQUIRED_STUDENT_FIELDS.length) * 100
  );
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  };
}

/**
 * Sorts students by various criteria
 * @param students - Array of student objects
 * @param sortBy - Sort criteria
 * @param direction - Sort direction
 * @returns Sorted student array
 */
export function sortStudents<T extends { firstName?: string; lastName?: string; studentId?: string; grade?: string }>(
  students: T[],
  sortBy: 'name' | 'lastName' | 'id' | 'grade' = 'name',
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...students].sort((a, b) => {
    let aValue: string;
    let bValue: string;
    
    switch (sortBy) {
      case 'name':
        aValue = formatStudentName(a.firstName || '', a.lastName || '').toLowerCase();
        bValue = formatStudentName(b.firstName || '', b.lastName || '').toLowerCase();
        break;
      case 'lastName':
        aValue = (a.lastName || '').toLowerCase();
        bValue = (b.lastName || '').toLowerCase();
        break;
      case 'id':
        aValue = a.studentId || '';
        bValue = b.studentId || '';
        break;
      case 'grade':
        aValue = a.grade || '';
        bValue = b.grade || '';
        break;
      default:
        aValue = formatStudentName(a.firstName || '', a.lastName || '').toLowerCase();
        bValue = formatStudentName(b.firstName || '', b.lastName || '').toLowerCase();
    }
    
    const comparison = aValue.localeCompare(bValue);
    return direction === 'desc' ? -comparison : comparison;
  });
}