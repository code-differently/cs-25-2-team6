import React from 'react';
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
  
  // Don't show the modal if it's not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Duplicate Record Found</h2>
        
        <p>A record already exists for this student on this date:</p>
        
        <div className="existing-record-details">
          <p><strong>Student Name:</strong> {existingRecord.studentName}</p>
          <p><strong>Date:</strong> {existingRecord.date}</p>
          <p><strong>Current Status:</strong> {existingRecord.attendanceStatus}</p>
        </div>
        
        <p>Would you like to update the existing record or cancel?</p>
        
        <div className="modal-buttons">
          <button onClick={onUpdate} className="update-button">
            Update Record
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}