import { useState } from 'react';
import './AttendanceForm.css';

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function AttendanceForm({ isOpen, onClose }: AttendanceFormProps) {
  const [selectedStudents, setSelectedStudents] = useState([true, true, true, true, false]);
  const students = ['Bob Smith', 'Charlie Brown', 'Diana Martinez', 'Ethan Williams', 'Fiona Lee'];

  const toggleStudent = (index: number) => {
    const newSelected = [...selectedStudents];
    newSelected[index] = !newSelected[index];
    setSelectedStudents(newSelected);
  };

  const selectAll = () => {
    setSelectedStudents([true, true, true, true, true]);
  };

  const deselectAll = () => {
    setSelectedStudents([false, false, false, false, false]);
  };

  const toggleSelectAll = () => {
    if (selectedCount === 0) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const selectedCount = selectedStudents.filter(s => s).length;

  // Don't show modal if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-left">
            <span className="icon">👥</span>
            <h2>Record Attendance</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label className="label">Select Class</label>
          <select className="dropdown">
            <option>Math 101</option>
          </select>

          <div className="students-header">
            <h3>Students in Math 101</h3>
            <button className="deselect-btn" onClick={toggleSelectAll}>
              {selectedCount === 0 ? 'Select All' : 'Deselect All'}
            </button>
          </div>

          <div className="bulk-actions">
            <span className="selected-count">{selectedCount} students selected</span>
            <select className="status-dropdown">
              <option>Choose status...</option>
              <option>Present</option>
              <option>Excused Absence</option>
              <option>Unexcused Absence</option>
              <option>Late</option>
            </select>
            <button className="apply-btn">Apply to Selected</button>
          </div>

          {students.map((student, i) => (
            <div key={i} className="student-row">
              <label className="student-name">
                <input 
                  type="checkbox" 
                  checked={selectedStudents[i]}
                  onChange={() => toggleStudent(i)}
                />
                {student}
              </label>
              <div className="student-options">
                <label><input type="radio" name={`student${i}`} /> Present</label>
                <label><input type="radio" name={`student${i}`} /> Excused Absence</label>
                <label><input type="radio" name={`student${i}`} /> Unexcused Absence</label>
                <label><input type="radio" name={`student${i}`} /> Late</label>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="submit-btn">✓ Submit Attendance</button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceForm;