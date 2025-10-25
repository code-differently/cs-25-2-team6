import React, { useState, useEffect, useCallback } from 'react';
import { useStudentModals, Student, StudentFormData } from '../../hooks/useStudentModals';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  student?: Student | null;
  onStudentSaved?: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  student,
  onStudentSaved
}) => {
  const {
    formData,
    setFormData,
    validationErrors,
    hasUnsavedChanges,
    modalState,
    handleStudentFormSubmit,
    handleFormValidation,
    handleModalClose
  } = useStudentModals({
    onStudentAdded: onStudentSaved,
    onStudentUpdated: onStudentSaved
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'edit' && student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        studentId: student.studentId || '',
        grade: student.grade || '',
        dateOfBirth: student.dateOfBirth || '',
        phone: student.phone || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        medicalNotes: student.medicalNotes || '',
        status: student.status || 'active'
      });
    } else if (isOpen && mode === 'create') {
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
        status: 'active'
      });
    }
  }, [isOpen, mode, student, setFormData]);

  const handleInputChange = useCallback((field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (submitAttempted) {
      handleFormValidation({ ...formData, [field]: value });
    }
  }, [formData, handleFormValidation, setFormData, submitAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    const errors = handleFormValidation(formData);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await handleStudentFormSubmit(formData, mode);
      handleClose();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const canClose = handleModalClose(hasUnsavedChanges);
      if (!canClose) return;
    }
    
    setSubmitAttempted(false);
    setIsLoading(false);
    onClose();
  }, [hasUnsavedChanges, handleModalClose, onClose]);

  const renderField = useCallback((
    field: keyof StudentFormData,
    label: string,
    type: string = 'text',
    required: boolean = false,
    options?: { value: string; label: string }[]
  ) => {
    const error = validationErrors[field as keyof typeof validationErrors];
    const value = formData[field] || '';

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {type === 'select' && options ? (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={field === 'studentId' && mode === 'edit'}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
            required={required}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
            disabled={field === 'studentId' && mode === 'edit'}
            required={required}
          />
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }, [formData, validationErrors, handleInputChange, mode]);

  if (!isOpen) return null;

  const gradeOptions = [
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden">
        <div className="flex flex-col h-full max-h-screen">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Add New Student' : 'Edit Student'}
                {mode === 'edit' && student && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({student.firstName} {student.lastName})
                  </span>
                )}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={isLoading}
              >
                ×
              </button>
            </div>
            {hasUnsavedChanges && (
              <p className="text-sm text-yellow-600 mt-1">
                You have unsaved changes
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('firstName', 'First Name', 'text', true)}
                  {renderField('lastName', 'Last Name', 'text', true)}
                  {renderField('studentId', 'Student ID', 'text', true)}
                  {renderField('grade', 'Grade', 'select', true, gradeOptions)}
                  {renderField('dateOfBirth', 'Date of Birth', 'date')}
                  {renderField('email', 'Email', 'email', true)}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('phone', 'Student Phone', 'tel')}
                  {renderField('parentEmail', 'Parent/Guardian Email', 'email')}
                  {renderField('parentPhone', 'Parent/Guardian Phone', 'tel')}
                  {renderField('emergencyContact', 'Emergency Contact', 'text')}
                  {renderField('emergencyPhone', 'Emergency Phone', 'tel')}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  {renderField('address', 'Address', 'textarea')}
                  {renderField('medicalNotes', 'Medical Information', 'textarea')}
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                mode === 'create' ? 'Add Student' : 'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;
