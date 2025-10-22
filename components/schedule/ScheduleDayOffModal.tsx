"use client"

import React, { useState, useEffect } from 'react';
import './ScheduleDayOffModal.css';
import { ScheduleFormData } from '@/hooks/useScheduleModals';

interface ScheduleDayOffModalProps {
  isOpen: boolean;
  formData: ScheduleFormData;
  reasonOptions: string[];
  onFormChange: (data: ScheduleFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onReasonSelect: () => void;
}

/**
 * ScheduleDayOffModal Component
 * 
 * Main modal for scheduling a day off that will automatically excuse all students.
 * This is the primary interface teachers use to create school-wide attendance exceptions.
 * 
 * Features:
 * - Date picker with required field validation
 * - Reason dropdown with custom reason option
 * - Blue info box explaining the automatic excuse action
 * - Affected classes preview section
 * - Form validation before submission
 */
export default function ScheduleDayOffModal({
  isOpen,
  formData,
  reasonOptions,
  onFormChange,
  onSubmit,
  onCancel,
  onReasonSelect
}: ScheduleDayOffModalProps) {
  
  // Local state for form validation errors
  const [errors, setErrors] = useState<any>({});
  
  // Local state for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  /**
   * Updates a specific field in the form data
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const handleInputChange = (field: keyof ScheduleFormData, value: string | number) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    onFormChange(updatedData);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Validates the form data before submission
   * @returns Object containing any validation errors
   */
  const validateForm = () => {
    const newErrors: any = {};
    
    // Check required date field
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    // Check required reason field
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }
    
    // If "Other" is selected, custom reason is required
    if (formData.reason === 'Other' && !formData.customReason?.trim()) {
      newErrors.customReason = 'Please specify the custom reason';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission
   * Validates form data and calls onSubmit if valid
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      onSubmit();
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculates estimated number of affected students
   * This is a simplified calculation for demonstration
   */
  const getAffectedStudentCount = () => {
    // In a real app, this would be calculated based on actual enrollment data
    return formData.affectedStudentCount || 250; // Default estimate
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content schedule-day-off-modal">
        
        {/* Modal Header with dark grey background */}
        <div className="modal-header">
          <h2>Schedule Day Off</h2>
          <button 
            className="close-button" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body with form */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="schedule-form">
            
            {/* Date Selection Field */}
            <div className="form-group">
              <label htmlFor="scheduleDate" className="form-label">
                Date <span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                id="scheduleDate"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Reason Selection Field */}
            <div className="form-group">
              <label htmlFor="scheduleReason" className="form-label">
                Reason <span className="required-asterisk">*</span>
              </label>
              <div className="reason-input-group">
                <select
                  id="scheduleReason"
                  className={`form-select ${errors.reason ? 'error' : ''}`}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="reason-select-btn"
                  onClick={onReasonSelect}
                >
                  Browse Reasons
                </button>
              </div>
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>

            {/* Custom Reason Field (only shows when "Other" is selected) */}
            {formData.reason === 'Other' && (
              <div className="form-group">
                <label htmlFor="customReason" className="form-label">
                  Custom Reason <span className="required-asterisk">*</span>
                </label>
                <textarea
                  id="customReason"
                  className={`form-textarea ${errors.customReason ? 'error' : ''}`}
                  value={formData.customReason || ''}
                  onChange={(e) => handleInputChange('customReason', e.target.value)}
                  placeholder="Please specify the reason for this day off..."
                  rows={3}
                  required
                />
                {errors.customReason && <span className="error-message">{errors.customReason}</span>}
              </div>
            )}

            {/* Blue Info Box explaining automatic excuse action */}
            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <strong>Automatic Excused Absence</strong>
                <p>All students will be automatically marked as "excused absent" for this date. This day will be excluded from attendance rate calculations in reports.</p>
              </div>
            </div>

            {/* Affected Classes Preview Section */}
            {formData.date && (
              <div className="affected-classes-section">
                <h3>Affected Classes Preview</h3>
                <div className="classes-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Students:</span>
                    <span className="summary-value">{getAffectedStudentCount()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">All Grade Levels:</span>
                    <span className="summary-value">K-12</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Modal Footer with action buttons */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-btn submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.date || !formData.reason}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Day Off'}
          </button>
        </div>

      </div>
    </div>
  );
}