export interface ClassStudent {
  classId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'active' | 'inactive' | 'pending';
}

export interface ClassStudentFilters {
  classId?: string;
  studentId?: string;
  status?: 'active' | 'inactive' | 'pending';
  enrolledAfter?: Date;
  enrolledBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface ClassStudentListResponse {
  success: boolean;
  data: ClassStudent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AssignmentResult {
  success: boolean;
  message?: string;
  assigned: string[];
  failed: Array<{
    studentId: string;
    reason: string;
  }>;
  duplicates: string[];
}

export interface StudentAssignmentData {
  classId: string;
  studentIds: string[];
  action: 'add' | 'remove';
  preserveHistory?: boolean;
}

export interface ClassStudentResponse {
  success: boolean;
  message?: string;
  data?: AssignmentResult;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface RelationshipValidationResult {
  isValid: boolean;
  conflicts: Array<{
    studentId: string;
    classId: string;
    reason: 'already_enrolled' | 'not_enrolled' | 'invalid_student' | 'invalid_class';
  }>;
  warnings: Array<{
    studentId: string;
    message: string;
  }>;
}
