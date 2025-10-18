"use client"

import { useState } from 'react';
import DuplicateConfirmationModal from '../../components/DuplicateConfirmationModal';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);
  
  const sampleRecord = {
    studentName: "John Smith",
    date: "2025-10-17",
    attendanceStatus: "Present"
  };
  
  const handleUpdate = () => {
    console.log("Update clicked!");
    // Modal will show confirmation automatically
  };
  
  const handleCancel = () => {
    console.log("Cancel clicked!");
    setShowModal(false);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>DuplicateConfirmationModal Test Page</h1>
      <p>Click the button below to test the modal:</p>
      
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Show Duplicate Modal
      </button>
      
      <DuplicateConfirmationModal
        isOpen={showModal}
        existingRecord={sampleRecord}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}