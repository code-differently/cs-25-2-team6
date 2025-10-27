import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useStudentModals, Student, StudentFormData } from '../../hooks/useStudentModals';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  student?: Student | null;
  onStudentSaved?: (student: Student) => void;
}

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

const classOptions = [
  { value: 'Class A', label: 'Class A' },
  { value: 'Class B', label: 'Class B' },
  { value: 'Class C', label: 'Class C' }
];

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
    handleStudentFormSubmit,
    handleFormValidation,
    handleModalClose
  } = useStudentModals({
    onStudentAdded: onStudentSaved,
    onStudentUpdated: onStudentSaved
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        status: student.status || 'active',
        className: (student as any).className || ''
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
        status: 'active',
        className: ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, student]);

  const handleInputChange = useCallback((field: keyof StudentFormData | 'className', value: string) => {
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
      await handleStudentFormSubmit({
        mode,
        student,
        formData,
        onStudentSaved: (savedStudent: Student) => {
          if (onStudentSaved) onStudentSaved(savedStudent);
          handleClose();
        }
      });
    } catch (error) {
      // Optionally show error message
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
    if (type === 'select' && options) {
      return (
        <div>
          <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
          <select
            value={value}
            onChange={e => handleInputChange(field, e.target.value)}
            className={`dropdown${error ? ' border-red-500' : ''}`}
            disabled={field === 'studentId' && mode === 'edit'}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {error && <p className="error-message">{error}</p>}
        </div>
      );
    }
    if (type === 'textarea') {
      return (
        <div>
          <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
          <textarea
            value={value}
            onChange={e => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors${error ? ' border-red-500 focus:ring-red-500' : ' border-gray-300'}`}
            placeholder={`Enter ${label.toLowerCase()}`}
            disabled={field === 'studentId' && mode === 'edit'}
            required={required}
            rows={3}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
      );
    }
    return (
      <div>
        <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <input
          type={type}
          value={value}
          onChange={e => handleInputChange(field, e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors${error ? ' border-red-500 focus:ring-red-500' : ' border-gray-300'}`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={field === 'studentId' && mode === 'edit'}
          required={required}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }, [formData, validationErrors, handleInputChange, mode]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal bg-white rounded-lg shadow-lg p-6 relative" style={{ maxWidth: 1000, width: '90%' }}>
        <div className="modal-header flex items-center justify-between mb-4">
          <div className="header-left flex items-center">
            <span className="icon text-2xl mr-2">👤</span>
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Add New Student' : 'Edit Student'}
              {mode === 'edit' && student && (
                <span style={{ fontWeight: 400, fontSize: 18, marginLeft: 8 }}>
                  ({student.firstName} {student.lastName})
                </span>
              )}
            </h2>
          </div>
          <button className="close-btn absolute top-2 right-2 text-2xl" onClick={handleClose} disabled={isLoading} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="students-header">
              <h3>Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('firstName', 'First Name', 'text', true)}
              {renderField('lastName', 'Last Name', 'text', true)}
              {renderField('studentId', 'Student ID', 'text', true)}
              {renderField('grade', 'Grade', 'select', true, gradeOptions)}
              <div>
                <label className="label">Class Name<span className="text-red-500 ml-1">*</span></label>
                <select
                  value={formData.className || ''}
                  onChange={e => handleInputChange('className', e.target.value)}
                  className={`dropdown${validationErrors.className ? ' border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Class</option>
                  {classOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {validationErrors.className && <p className="error-message">{validationErrors.className}</p>}
              </div>
              {renderField('dateOfBirth', 'Date of Birth', 'date')}
              {renderField('email', 'Email', 'email', true)}
            </div>
            <div className="students-header" style={{ marginTop: 30 }}>
              <h3>Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('phone', 'Student Phone', 'tel')}
              {renderField('parentEmail', 'Parent/Guardian Email', 'email')}
              {renderField('parentPhone', 'Parent/Guardian Phone', 'tel')}
              {renderField('emergencyContact', 'Emergency Contact', 'text')}
              {renderField('emergencyPhone', 'Emergency Phone', 'tel')}
            </div>
            <div className="students-header" style={{ marginTop: 30 }}>
              <h3>Additional Information</h3>
            </div>
            <div className="space-y-4">
              {renderField('address', 'Address', 'textarea')}
              {renderField('medicalNotes', 'Medical Information', 'textarea')}
            </div>
            <div className="modal-footer flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="cancel-btn px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Saving...</span>
                ) : (
                  mode === 'create' ? 'Add Student' : 'Save Student'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return mounted ? ReactDOM.createPortal(modalContent, document.body) : null;
};

export default StudentFormModal;