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
      // Fetch students for the class from the API
      const response = await fetch(`/api/data/students?class=${encodeURIComponent(classId)}`);
      const students = await response.json();
      // Normalize to ClassStudent[]
      const classStudents: ClassStudent[] = (students || []).map((student: any) => ({
        ...student,
        enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate) : new Date(),
        isActive: student.isActive !== undefined ? student.isActive : true,
        attendanceRate: student.attendanceRate || 0
      }));
      setClassStudents(classStudents);
      // Optionally, fetch available students (not in this class)
      // const availableResponse = await fetch('/api/data/students');
      // const allStudents = await availableResponse.json();
      // setAvailableStudents(allStudents.filter((s: any) => s.class !== classId));
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
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            grade: student.grade,
            class: student.class,
            status: student.status,
            dateOfBirth: student.dateOfBirth,
            enrollmentDate: student.enrollmentDate || new Date(),
            guardianName: (student as any).guardianName || '',
            guardianPhone: (student as any).guardianPhone || '',
            guardianEmail: (student as any).guardianEmail || '',
            emergencyContact: (student as any).emergencyContact || '',
            address: (student as any).address || '',
            lastActivity: student.lastActivity,
            attendanceRate: student.attendanceRate || 0
          };
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