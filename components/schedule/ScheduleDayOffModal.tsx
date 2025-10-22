"use client"

import React, { useState } from 'react';
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

// Schedule Day Off Modal - lets teachers create school-wide attendance exceptions
export default function ScheduleDayOffModal({
  isOpen,
  formData,
  reasonOptions,
  onFormChange,
  onSubmit,
  onCancel,
  onReasonSelect
}: ScheduleDayOffModalProps) {
  
  const [errors, setErrors] = useState<any>({});

  if (!isOpen) return null;

  // Update form field and clear any error
  const updateField = (field: keyof ScheduleFormData, value: string | number) => {
    onFormChange({ ...formData, [field]: value });
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
  };

  // Check if form is valid
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.reason) newErrors.reason = 'Please select a reason';
    if (formData.reason === 'Other' && !formData.customReason?.trim()) {
      newErrors.customReason = 'Please specify the custom reason';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content schedule-day-off-modal">
        
        <div className="modal-header">
          <h2>Schedule Day Off</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="schedule-form">
            
            <div className="form-group">
              <label htmlFor="scheduleDate" className="form-label">
                Date <span className="required-asterisk">*</span>
              </label>
              <input
                type="date"
                id="scheduleDate"
                className={`form-input ${errors.date ? 'error' : ''}`}
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                required
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="scheduleReason" className="form-label">
                Reason <span className="required-asterisk">*</span>
              </label>
              <div className="reason-input-group">
                <select
                  id="scheduleReason"
                  className={`form-select ${errors.reason ? 'error' : ''}`}
                  value={formData.reason}
                  onChange={(e) => updateField('reason', e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  {reasonOptions.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                <button type="button" className="reason-select-btn" onClick={onReasonSelect}>
                  Browse Reasons
                </button>
              </div>
              {errors.reason && <span className="error-message">{errors.reason}</span>}
            </div>

            {formData.reason === 'Other' && (
              <div className="form-group">
                <label htmlFor="customReason" className="form-label">
                  Custom Reason <span className="required-asterisk">*</span>
                </label>
                <textarea
                  id="customReason"
                  className={`form-textarea ${errors.customReason ? 'error' : ''}`}
                  value={formData.customReason || ''}
                  onChange={(e) => updateField('customReason', e.target.value)}
                  placeholder="Please specify the reason for this day off..."
                  rows={3}
                  required
                />
                {errors.customReason && <span className="error-message">{errors.customReason}</span>}
              </div>
            )}

            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <strong>Automatic Excused Absence</strong>
                <p>All students will be automatically marked as "excused absent" for this date.</p>
              </div>
            </div>

            {formData.date && (
              <div className="affected-classes-section">
                <h3>Affected Classes Preview</h3>
                <div className="classes-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Students:</span>
                    <span className="summary-value">{formData.affectedStudentCount || 250}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">All Grade Levels:</span>
                    <span className="summary-value">K-12</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-btn submit-btn"
            onClick={handleSubmit}
            disabled={!formData.date || !formData.reason}
          >
            Schedule Day Off
          </button>
        </div>

      </div>
    </div>
  );
}