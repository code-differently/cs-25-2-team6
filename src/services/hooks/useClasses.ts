import { useState, useEffect, useCallback } from 'react';

export interface Class {
  id: string;
  name: string;
  subject: string;
  grade: string;
  teacher: string;
  teacherEmail: string;
  schedule: {
    dayOfWeek: string[];
    startTime: string;
    endTime: string;
    room: string;
  };
  semester: string;
  year: number;
  capacity: number;
  enrolledCount: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  description?: string;
  attendanceRate: number;
  lastActivity: Date;
}

export interface ClassFilters {
  search?: string;
  subject?: string;
  grade?: string;
  teacher?: string;
  status?: string;
  semester?: string;
  year?: string;
}

export interface SortCriteria {
  field: 'name' | 'subject' | 'grade' | 'teacher' | 'enrolledCount' | 'attendanceRate' | 'startDate';
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'complete' | 'cancel' | 'delete' | 'export';
  data?: any;
}

export function useClasses(filters: ClassFilters = {}) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({
    field: 'name',
    direction: 'asc'
  });

  const fetchClasses = useCallback(async (currentFilters: ClassFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from API
      const response = await fetch('/api/classes');
      const data = await response.json();
      // Normalize API data fields
      const normalizedClasses: Class[] = (data.classes || []).map((cls: any) => ({
        id: cls.id || cls.classId || '',
        name: cls.name || cls.className || '',
        subject: cls.subject || '',
        grade: cls.grade || '',
        teacher: cls.teacher || '',
        teacherEmail: cls.teacherEmail || '',
        schedule: cls.schedule || { dayOfWeek: [], startTime: '', endTime: '', room: '' },
        semester: cls.semester || '',
        year: cls.year ? Number(cls.year) : new Date().getFullYear(),
        capacity: cls.capacity ? Number(cls.capacity) : 0,
        enrolledCount: cls.enrolledCount ? Number(cls.enrolledCount) : 0,
        status: cls.status || 'active',
        startDate: cls.startDate ? new Date(cls.startDate) : new Date(),
        endDate: cls.endDate ? new Date(cls.endDate) : new Date(),
        description: cls.description || '',
        attendanceRate: cls.attendanceRate ? Number(cls.attendanceRate) : 0,
        lastActivity: cls.lastActivity ? new Date(cls.lastActivity) : new Date()
      }));

      // Apply filters to normalized data
      let filteredClasses = normalizedClasses;
      // Apply search filter (case-insensitive, multiple fields)
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredClasses = filteredClasses.filter((classItem: Class) => {
          return (
            (classItem.name && classItem.name.toLowerCase().includes(searchTerm)) ||
            (classItem.id && classItem.id.toLowerCase().includes(searchTerm)) ||
            (classItem.subject && classItem.subject.toLowerCase().includes(searchTerm)) ||
            (classItem.teacher && classItem.teacher.toLowerCase().includes(searchTerm)) ||
            (classItem.grade && classItem.grade.toLowerCase().includes(searchTerm)) ||
            (classItem.status && classItem.status.toLowerCase().includes(searchTerm)) ||
            (classItem.semester && classItem.semester.toLowerCase().includes(searchTerm))
          );
        });
      }
      // Apply subject filter
      if (currentFilters.subject) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.subject === currentFilters.subject
        );
      }
      // Apply grade filter
      if (currentFilters.grade) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.grade === currentFilters.grade
        );
      }
      // Apply teacher filter
      if (currentFilters.teacher) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.teacher.toLowerCase().includes(currentFilters.teacher!.toLowerCase())
        );
      }
      // Apply status filter
      if (currentFilters.status) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.status === currentFilters.status
        );
      }
      // Apply semester filter
      if (currentFilters.semester) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.semester === currentFilters.semester
        );
      }
      // Apply year filter
      if (currentFilters.year) {
        filteredClasses = filteredClasses.filter((classItem: Class) =>
          classItem.year.toString() === currentFilters.year
        );
      }

      setClasses(filteredClasses);
    } catch (err) {
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClassSearch = useCallback((query: string) => {
    const searchFilters = { ...filters, search: query };
    fetchClasses(searchFilters);
  }, [filters, fetchClasses]);

  const handleClassSort = useCallback((criteria: SortCriteria) => {
    setSortCriteria(criteria);
    const sortedClasses = [...classes].sort((a, b) => {
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
    setClasses(sortedClasses);
  }, [classes]);

  const handleClassFilter = useCallback((filterType: string, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    fetchClasses(newFilters);
  }, [filters, fetchClasses]);

  const handleBulkClassActions = useCallback(async (classIds: string[], action: BulkAction) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Implement bulk action logic based on action type
      switch (action.type) {
        case 'activate':
          setClasses(prev => prev.map(classItem => 
            classIds.includes(classItem.id) 
              ? { ...classItem, status: 'active' as const }
              : classItem
          ));
          break;
        case 'deactivate':
          setClasses(prev => prev.map(classItem => 
            classIds.includes(classItem.id) 
              ? { ...classItem, status: 'inactive' as const }
              : classItem
          ));
          break;
        case 'complete':
          setClasses(prev => prev.map(classItem => 
            classIds.includes(classItem.id) 
              ? { ...classItem, status: 'completed' as const }
              : classItem
          ));
          break;
        case 'cancel':
          setClasses(prev => prev.map(classItem => 
            classIds.includes(classItem.id) 
              ? { ...classItem, status: 'cancelled' as const }
              : classItem
          ));
          break;
        case 'delete':
          setClasses(prev => prev.filter(classItem => !classIds.includes(classItem.id)));
          break;
        case 'export':
          // Handle export logic
          console.log('Exporting classes:', classIds);
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

  const refreshClassData = useCallback(() => {
    fetchClasses(filters);
  }, [filters, fetchClasses]);

  useEffect(() => {
    fetchClasses(filters);
  }, [fetchClasses, filters]);

  return {
    classes,
    loading,
    error,
    sortCriteria,
    handleClassSearch,
    handleClassSort,
    handleClassFilter,
    handleBulkClassActions,
    refreshClassData
  };
}