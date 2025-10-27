export interface ClassProfile {
  id: string;
  name: string;
  grade?: string;
  description?: string;
  teacherId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  name: string;
  grade?: string;
  description?: string;
}

export interface ClassFilters {
  search?: string;
  grade?: string;
  teacherId?: string;
  limit?: number;
  offset?: number;
}

export interface ClassListResponse {
  success: boolean;
  data: ClassProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ClassResponse {
  success: boolean;
  message?: string;
  data?: ClassProfile;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ClassSortCriteria {
  field: 'name' | 'grade' | 'id' | 'createdAt';
  direction: 'asc' | 'desc';
}

export enum BulkClassAction {
  DELETE = 'DELETE',
  UPDATE_GRADE = 'UPDATE_GRADE',
  ASSIGN_TEACHER = 'ASSIGN_TEACHER'
}

export interface BulkClassOperation {
  classIds: string[];
  action: BulkClassAction;
  data?: Record<string, any>;
}
