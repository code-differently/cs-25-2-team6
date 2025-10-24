export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade?: string;
  buildingIds: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string;
}

export interface StudentFilters {
  search?: string;
  grade?: string;
  limit?: number;
  offset?: number;
}

export interface StudentListResponse {
  success: boolean;
  data: StudentProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface StudentResponse {
  success: boolean;
  message?: string;
  data?: StudentProfile;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface StudentSortCriteria {
  field: 'firstName' | 'lastName' | 'fullName' | 'grade' | 'id';
  direction: 'asc' | 'desc';
}

export enum BulkAction {
  DELETE = 'DELETE',
  UPDATE_GRADE = 'UPDATE_GRADE',
  ASSIGN_BUILDING = 'ASSIGN_BUILDING'
}

export interface BulkStudentOperation {
  studentIds: string[];
  action: BulkAction;
  data?: Record<string, any>;
}
