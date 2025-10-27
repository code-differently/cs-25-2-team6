import { useState, useCallback } from 'react';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  grade: string;
  dateOfBirth: string;
  phone?: string;
  parentEmail?: string;
  parentPhone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'pending' | 'graduated';
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  grade: string;
  dateOfBirth: string;
  phone?: string;
  parentEmail?: string;
  parentPhone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  status: 'active' | 'inactive' | 'pending' | 'graduated';
  className?: string; // <-- Added className here
}

export interface FormValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  studentId?: string;
  grade?: string;
  dateOfBirth?: string;
  phone?: string;
  parentEmail?: string;
  className?: string;
}

export interface DependencyResult {
  hasAttendanceRecords: boolean;
  hasReports: boolean;
  hasAlerts: boolean;
  attendanceCount: number;
  reportCount: number;
  alertCount: number;
  canDelete: boolean;
  warnings: string[];
}

interface ModalState {
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isBulkActionsModalOpen: boolean;
  showDependencyWarning: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseStudentModalsOptions {
  onStudentAdded?: (student: Student) => void;
  onStudentUpdated?: (student: Student) => void;
  onStudentsDeleted?: (studentIds: string[]) => void;
  checkDependencies?: (student: Student) => Promise<DependencyResult>;
}

export const useStudentModals = (options: UseStudentModalsOptions = {}) => {
  const [modalState, setModalState] = useState<ModalState>({
    isAddModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isBulkActionsModalOpen: false,
    showDependencyWarning: false,
    isLoading: false,
    error: null,
  });

  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    grade: '',
    dateOfBirth: '',
    phone: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalNotes: '',
    status: 'active',
  });

  const [originalFormData, setOriginalFormData] = useState<StudentFormData>(formData);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [dependencyResult, setDependencyResult] = useState<DependencyResult | null>(null);

  // Check if form has unsaved changes
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);

  // Form validation function
  const handleFormValidation = useCallback((data: StudentFormData): FormValidationErrors => {
    const errors: FormValidationErrors = {};

    // Required field validation
    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    } else if (data.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    } else if (data.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    }

    if (!data.studentId?.trim()) {
      errors.studentId = 'Student ID is required';
    } else if (data.studentId.length < 3) {
      errors.studentId = 'Student ID must be at least 3 characters';
    }

    if (!data.grade?.trim()) {
      errors.grade = 'Grade is required';
    }

    if (!data.dateOfBirth?.trim()) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = 'Birth date cannot be in the future';
      }
    }

    // Optional field validation
    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (data.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail)) {
      errors.parentEmail = 'Please enter a valid parent email address';
    }

    setValidationErrors(errors);
    return errors;
  }, []);

  // Form submission handler (real API integration)
  const handleStudentFormSubmit = useCallback(async (
    { mode, student, formData, onStudentSaved }: {
      mode: 'create' | 'edit',
      student?: Student | null,
      formData: StudentFormData,
      onStudentSaved?: (student: Student) => void
    }
  ): Promise<void> => {
    try {
      let endpoint = '/api/students';
      let method = 'POST';
      let body: any = formData;
      if (mode === 'edit' && student && student.studentId) {
        endpoint = `/api/students/${student.studentId}`;
        method = 'PUT';
        body = formData;
      } else if (mode === 'create') {
        // For POST, send { className, student }
        const { className, ...studentFields } = formData;
        body = { className, student: studentFields };
        endpoint = '/api/data/students'; // <-- Fix endpoint for POST
      }
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${mode === 'create' ? 'add' : 'update'} student: ${errorText}`);
      }
      const savedStudent = await response.json();
      if (onStudentSaved) {
        onStudentSaved(savedStudent);
      }
    } catch (error) {
      // Optionally show error message
      // console.error('Form submission failed:', error);
      throw error;
    }
  }, []);

  // Delete confirmation handler
  const handleDeleteConfirmation = useCallback(async (student: Student): Promise<void> => {
    try {
      setCurrentStudent(student);
      setModalState(prev => ({ ...prev, isLoading: true }));

      // Check dependencies if function provided
      if (options.checkDependencies) {
        const dependencies = await options.checkDependencies(student);
        setDependencyResult(dependencies);

        if (!dependencies.canDelete) {
          setModalState(prev => ({
            ...prev,
            showDependencyWarning: true,
            isLoading: false
          }));
          return;
        }
      }

      setModalState(prev => ({
        ...prev,
        isDeleteModalOpen: true,
        isLoading: false
      }));
    } catch (error) {
      setModalState(prev => ({
        ...prev,
        error: 'Failed to check student dependencies',
        isLoading: false
      }));
    }
  }, [options]);

  // Show dependency warning
  const showDependencyWarning = useCallback((dependencies: DependencyResult): void => {
    setDependencyResult(dependencies);
    setModalState(prev => ({ ...prev, showDependencyWarning: true }));
  }, []);

  // Modal close handler
  const handleModalClose = useCallback((hasUnsavedChanges: boolean): boolean => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) {
        return false;
      }
    }

    // Reset form to original state
    setFormData(originalFormData);
    setValidationErrors({});
    setModalState(prev => ({
      ...prev,
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      isBulkActionsModalOpen: false,
      showDependencyWarning: false,
      error: null,
    }));

    return true;
  }, [originalFormData]);

  // Modal actions
  const modalActions = {
    openAddModal: () => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        grade: '',
        dateOfBirth: '',
        phone: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalNotes: '',
        status: 'active',
      });
      setOriginalFormData(formData);
      setValidationErrors({});
      setModalState(prev => ({ ...prev, isAddModalOpen: true }));
    },

    openEditModal: (student: Student) => {
      setCurrentStudent(student);
      const editFormData = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId,
        grade: student.grade,
        dateOfBirth: student.dateOfBirth,
        phone: student.phone || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        medicalNotes: student.medicalNotes || '',
        status: student.status,
      };
      setFormData(editFormData);
      setOriginalFormData(editFormData);
      setValidationErrors({});
      setModalState(prev => ({ ...prev, isEditModalOpen: true }));
    },

    openBulkActionsModal: () => {
      setModalState(prev => ({ ...prev, isBulkActionsModalOpen: true }));
    },

    closeAllModals: () => {
      handleModalClose(hasUnsavedChanges);
    },
  };

  return {
    modalState,
    modalActions,
    formData,
    setFormData,
    originalFormData,
    validationErrors,
    hasUnsavedChanges,
    currentStudent,
    dependencyResult,
    handleStudentFormSubmit,
    handleDeleteConfirmation,
    showDependencyWarning,
    handleFormValidation,
    handleModalClose,
  };
};