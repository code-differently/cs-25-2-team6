"use client"

import React from 'react';
import './ScheduleConfirmationModal.css';

interface ScheduleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ScheduleConfirmationModal Component
 * 
 * Shows a success message after a day off has been scheduled successfully.
 * Simple confirmation with a checkmark and success message.
 */
export default function ScheduleConfirmationModal({ 
  isOpen, 
  onClose 
}: ScheduleConfirmationModalProps) {
  
  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h2>Day Off Scheduled Successfully!</h2>
        </div>

        {/* Success Message */}
        <div className="confirmation-content">
          <p>Your scheduled day off has been saved.</p>
          <p>All students will be automatically excused for this date.</p>
        </div>

        {/* Close Button */}
        <div className="confirmation-footer">
          <button 
            onClick={onClose}
            className="primary-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}