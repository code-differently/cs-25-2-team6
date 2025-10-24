import { useState, useEffect, useCallback } from 'react';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  class: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  enrollmentDate: Date;
  dateOfBirth: Date;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  emergencyContact: string;
  medicalNotes?: string;
  gpa?: number;
  attendanceRate: number;
  lastActivity: Date;
}

export interface StudentFilters {
  search?: string;
  grade?: string;
  class?: string;
  status?: string;
  enrollmentYear?: string;
}

export interface SortCriteria {
  field: 'firstName' | 'lastName' | 'grade' | 'class' | 'gpa' | 'attendanceRate' | 'enrollmentDate';
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'transfer' | 'graduate' | 'delete' | 'export';
  data?: any;
}

export function useStudents(filters: StudentFilters = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({
    field: 'lastName',
    direction: 'asc'
  });

  const fetchStudents = useCallback(async (currentFilters: StudentFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to fetched data
      let filteredStudents: Student[] = [];
      
      // Apply search filter
      if (currentFilters.search) {
        filteredStudents = filteredStudents.filter(student =>
          student.firstName.toLowerCase().includes(currentFilters.search!.toLowerCase()) ||
          student.lastName.toLowerCase().includes(currentFilters.search!.toLowerCase()) ||
          student.email.toLowerCase().includes(currentFilters.search!.toLowerCase()) ||
          student.id.toLowerCase().includes(currentFilters.search!.toLowerCase())
        );
      }

      // Apply grade filter
      if (currentFilters.grade) {
        filteredStudents = filteredStudents.filter(student =>
          student.grade === currentFilters.grade
        );
      }

      // Apply class filter
      if (currentFilters.class) {
        filteredStudents = filteredStudents.filter(student =>
          student.class.toLowerCase().includes(currentFilters.class!.toLowerCase())
        );
      }

      // Apply status filter
      if (currentFilters.status) {
        filteredStudents = filteredStudents.filter(student =>
          student.status === currentFilters.status
        );
      }

      // Apply enrollment year filter
      if (currentFilters.enrollmentYear) {
        filteredStudents = filteredStudents.filter(student =>
          student.enrollmentDate.getFullYear().toString() === currentFilters.enrollmentYear
        );
      }

      setStudents(filteredStudents);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStudentSearch = useCallback((query: string) => {
    const searchFilters = { ...filters, search: query };
    fetchStudents(searchFilters);
  }, [filters, fetchStudents]);

  const handleStudentSort = useCallback((criteria: SortCriteria) => {
    setSortCriteria(criteria);
    const sortedStudents = [...students].sort((a, b) => {
      const aValue = a[criteria.field];
      const bValue = b[criteria.field];
      
      // Handle undefined values - put them at the end
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (criteria.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (criteria.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        if (criteria.direction === 'asc') {
          return aValue.getTime() - bValue.getTime();
        } else {
          return bValue.getTime() - aValue.getTime();
        }
      }
      
      // Fallback for mixed types
      if (criteria.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    setStudents(sortedStudents);
  }, [students]);

  const handleStudentFilter = useCallback((filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    fetchStudents(newFilters);
  }, [filters, fetchStudents]);

  const handleBulkActions = useCallback(async (studentIds: string[], action: BulkAction) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Implement bulk action logic based on action type
      switch (action.type) {
        case 'activate':
          setStudents(prev => prev.map(student => 
            studentIds.includes(student.id) 
              ? { ...student, status: 'active' as const }
              : student
          ));
          break;
        case 'deactivate':
          setStudents(prev => prev.map(student => 
            studentIds.includes(student.id) 
              ? { ...student, status: 'inactive' as const }
              : student
          ));
          break;
        case 'graduate':
          setStudents(prev => prev.map(student => 
            studentIds.includes(student.id) 
              ? { ...student, status: 'graduated' as const }
              : student
          ));
          break;
        case 'transfer':
          setStudents(prev => prev.map(student => 
            studentIds.includes(student.id) 
              ? { ...student, status: 'transferred' as const }
              : student
          ));
          break;
        case 'delete':
          setStudents(prev => prev.filter(student => !studentIds.includes(student.id)));
          break;
        case 'export':
          // Handle export logic
          console.log('Exporting students:', studentIds);
          break;
        default:
          throw new Error(`Unknown bulk action: ${action.type}`);
      }
    } catch (err) {
      setError(`Failed to perform bulk action: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStudentList = useCallback(() => {
    fetchStudents(filters);
  }, [filters, fetchStudents]);

  useEffect(() => {
    fetchStudents(filters);
  }, [fetchStudents, filters]);

  return {
    students,
    loading,
    error,
    sortCriteria,
    handleStudentSearch,
    handleStudentSort,
    handleStudentFilter,
    handleBulkActions,
    refreshStudentList
  };
}