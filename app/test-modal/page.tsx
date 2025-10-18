"use client"

import { useState } from 'react';
import DuplicateConfirmationModal from '../../components/DuplicateConfirmationModal';
import AttendanceForm from '../../components/AttendanceForm';

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  
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
      <h1>Component Testing Page</h1>
      
      {/* Modal Test Section */}
      <section style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h2>Test DuplicateConfirmationModal</h2>
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
      </section>

      {/* Attendance Form Test Section */}
      <section>
        <h2>Test AttendanceForm</h2>
        <p>The attendance form modal with responsive grid layout:</p>
        
        <button 
          onClick={() => setShowAttendanceForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Attendance Form
        </button>
        
        <AttendanceForm 
          isOpen={showAttendanceForm}
          onClose={() => setShowAttendanceForm(false)}
        />
      </section>
    </div>
  );
}