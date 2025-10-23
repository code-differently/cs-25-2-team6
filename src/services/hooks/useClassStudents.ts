import { useState, useEffect, useCallback } from 'react';
import { Student } from './useStudents';

export interface ClassStudent extends Student {
  enrollmentDate: Date;
  dropDate?: Date;
  finalGrade?: string;
  attendanceRate: number;
  participationScore?: number;
  isActive: boolean;
}

export interface StudentAssignment {
  studentId: string;
  classId: string;
  action: 'add' | 'remove';
  enrollmentDate?: Date;
  notes?: string;
}

export function useClassStudents(classId: string) {
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassStudents = useCallback(async () => {
    if (!classId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual API call
      const mockClassStudents: ClassStudent[] = [];
      const mockAvailableStudents: Student[] = [];

      setClassStudents(mockClassStudents);
      setAvailableStudents(mockAvailableStudents);
    } catch (err) {
      setError('Failed to fetch class students');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const handleStudentAssignment = useCallback(async (
    studentIds: string[], 
    action: 'add' | 'remove',
    assignmentData?: Partial<StudentAssignment>
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (action === 'add') {
        // Move students from available to class students
        const studentsToAdd = availableStudents.filter(student => 
          studentIds.includes(student.id)
        );
        
        const newClassStudents: ClassStudent[] = studentsToAdd.map(student => ({
          ...student,
          enrollmentDate: assignmentData?.enrollmentDate || new Date(),
          isActive: true,
          attendanceRate: 0 // Will be calculated over time
        }));

        setClassStudents(prev => [...prev, ...newClassStudents]);
        setAvailableStudents(prev => prev.filter(student => 
          !studentIds.includes(student.id)
        ));
      } else if (action === 'remove') {
        // Move students from class students to available students
        const studentsToRemove = classStudents.filter(student => 
          studentIds.includes(student.id)
        );

        const removedStudents: Student[] = studentsToRemove.map(student => {
          const { enrollmentDate, dropDate, finalGrade, participationScore, isActive, ...baseStudent } = student;
          return baseStudent;
        });

        setAvailableStudents(prev => [...prev, ...removedStudents]);
        setClassStudents(prev => prev.map(student => 
          studentIds.includes(student.id)
            ? { ...student, isActive: false, dropDate: new Date() }
            : student
        ).filter(student => student.isActive)); // Remove inactive students from display
      }
    } catch (err) {
      setError(`Failed to ${action} students: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [classStudents, availableStudents]);

  const updateStudentGrade = useCallback(async (studentId: string, grade: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setClassStudents(prev => prev.map(student =>
        student.id === studentId
          ? { ...student, finalGrade: grade }
          : student
      ));
    } catch (err) {
      setError('Failed to update student grade');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAttendanceRate = useCallback(async (studentId: string, attendanceRate: number) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setClassStudents(prev => prev.map(student =>
        student.id === studentId
          ? { ...student, attendanceRate }
          : student
      ));
    } catch (err) {
      setError('Failed to update attendance rate');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshClassStudents = useCallback(() => {
    fetchClassStudents();
  }, [fetchClassStudents]);

  useEffect(() => {
    fetchClassStudents();
  }, [fetchClassStudents]);

  return {
    classStudents,
    availableStudents,
    loading,
    error,
    handleStudentAssignment,
    updateStudentGrade,
    updateAttendanceRate,
    refreshClassStudents
  };
}