import React, { useState } from 'react';
import DuplicateConfirmationModal from './DuplicateConfirmationModal';

export default function AttendanceFormExample() {
  const [showModal, setShowModal] = useState(false);
  
  // Example existing record data
  const existingRecord = {
    studentName: "John Smith",
    date: "2025-10-17",
    attendanceStatus: "Present"
  };
  
  const handleUpdate = () => {
    console.log("Updating existing record...");
    setShowModal(false);
    // Add your update logic here
  };
  
  const handleCancel = () => {
    console.log("Cancelled update");
    setShowModal(false);
  };
  
  const handleSubmitAttendance = () => {
    // This would normally check for duplicates first
    // If duplicate found, show modal
    setShowModal(true);
  };
  
  return (
    <div>
      <h1>Attendance Form</h1>
      
      <button onClick={handleSubmitAttendance}>
        Submit Attendance (Test Modal)
      </button>
      
      <DuplicateConfirmationModal
        isOpen={showModal}
        existingRecord={existingRecord}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}