"use client"

import React, { useState } from 'react';
import './DuplicateConfirmationModal.css';

interface ExistingRecord {
  studentName: string;
  date: string;
  attendanceStatus: string;
}

interface DuplicateConfirmationModalProps {
  isOpen: boolean;
  existingRecord: ExistingRecord;
  onUpdate: () => void;
  onCancel: () => void;
}

export default function DuplicateConfirmationModal({ 
  isOpen, 
  existingRecord, 
  onUpdate, 
  onCancel 
}: DuplicateConfirmationModalProps) {
  
  const [isUpdated, setIsUpdated] = useState(false);
  
  // Don't show the modal if it's not open
  if (!isOpen) {
    return null;
  }

  const handleUpdate = () => {
    setIsUpdated(true);
    onUpdate();
  };

  const handleClose = () => {
    setIsUpdated(false);
    onCancel();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!isUpdated ? (
          <>
            <h2>Duplicate Record Found</h2>
            
            <p>A record already exists for this student on this date:</p>
            
            <div className="existing-record-details">
              <p><strong>Student Name:</strong> {existingRecord.studentName}</p>
              <p><strong>Date:</strong> {existingRecord.date}</p>
              <p><strong>Current Status:</strong> {existingRecord.attendanceStatus}</p>
            </div>
            
            <p>Would you like to update the existing record or cancel?</p>
            
            <div className="modal-buttons">
              <button onClick={handleUpdate} className="update-button">
                Update Record
              </button>
              <button onClick={onCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="confirmation-message">
            <h3>✅ Record Updated Successfully!</h3>
            <p>The attendance record for {existingRecord.studentName} on {existingRecord.date} has been updated.</p>
            <button onClick={handleClose} className="close-button">
              Close
            </button>
          </div>
        )}
        </div>
      </div>
  );
}