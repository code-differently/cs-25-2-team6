/**
 * Class management types - students belong to one class at a time
 */

export interface Class {
  id: string;
  name: string;
  studentIds: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateClassRequest {
  name: string;
}

export interface UpdateClassRequest {
  name?: string;
  addStudentIds?: string[];
  removeStudentIds?: string[];
}

export interface ClassValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
