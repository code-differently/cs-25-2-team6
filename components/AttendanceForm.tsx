import { useState, useEffect } from 'react';
import './AttendanceForm.css';

interface AttendanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  classOptions: string[];
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  classStudents: any[];
  selectedDate: Date;
}

function AttendanceForm({
  isOpen,
  onClose,
  classOptions,
  selectedClass,
  setSelectedClass,
  classStudents,
  selectedDate
}: AttendanceFormProps) {
  // Always derive students from classStudents
  const students = classStudents.map(
    (s: any) => s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim()
  );

  // State for selection and status, reset when classStudents changes
  const [selectedStudents, setSelectedStudents] = useState<boolean[]>([]);
  const [studentStatus, setStudentStatus] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('Choose status...');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Reset selection and status when students change
  useEffect(() => {
    setSelectedStudents(students.map(() => true));
    setStudentStatus(students.map(() => ''));
    // eslint-disable-next-line
  }, [classStudents]);

  const toggleStudent = (index: number) => {
    const newSelected = [...selectedStudents];
    newSelected[index] = !newSelected[index];
    setSelectedStudents(newSelected);
  };

  const selectAll = () => setSelectedStudents(students.map(() => true));
  const deselectAll = () => setSelectedStudents(students.map(() => false));

  const selectedCount = selectedStudents.filter(s => s).length;

  const toggleSelectAll = () => {
    if (selectedCount === 0) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const updateStudentStatus = (studentIndex: number, status: string) => {
    const newStatus = [...studentStatus];
    newStatus[studentIndex] = status;
    setStudentStatus(newStatus);
  };

  const applyBulkStatus = () => {
    if (bulkStatus === 'Choose status...') return;
    const newStatus = [...studentStatus];
    selectedStudents.forEach((isSelected, index) => {
      if (isSelected) {
        newStatus[index] = bulkStatus;
      }
    });
    setStudentStatus(newStatus);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // Build attendanceUpdates for selected students
      const attendanceUpdates = classStudents
        .map((student: any, i: number) => {
          if (!selectedStudents[i]) return null;
          return {
            studentId: student.studentId,
            status: studentStatus[i] || 'Present',
            late: false, // You can add UI for this if needed
            earlyDismissal: false, // You can add UI for this if needed
            onTime: true, // You can add UI for this if needed
            excused: studentStatus[i] === 'Excused Absence'
          };
        })
        .filter(Boolean);

      const res = await fetch('/api/data/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          dateISO: selectedDate.toISOString().slice(0, 10),
          attendanceUpdates
        })
      });

      if (res.ok) {
        setMessage('Attendance saved successfully!');
        setIsError(false);
      } else {
        setMessage('Failed to save attendance. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Failed to save attendance. Please try again.');
      setIsError(true);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

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
          <select
            className="dropdown"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">-- Select Class --</option>
            {classOptions.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <div className="students-header">
            <h3>Students in {selectedClass || '...'}</h3>
            <button className="deselect-btn" onClick={toggleSelectAll}>
              {selectedCount === 0 ? 'Select All' : 'Deselect All'}
            </button>
          </div>

          {message && (
            <div className={isError ? 'error-message' : 'success-message'}>
              {message}
            </div>
          )}

          <div className="bulk-actions">
            <span className="selected-count">{selectedCount} students selected</span>
            <select
              className="status-dropdown"
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
            >
              <option>Choose status...</option>
              <option>Present</option>
              <option>Excused Absence</option>
              <option>Unexcused Absence</option>
              <option>Late</option>
            </select>
            <button className="apply-btn" onClick={applyBulkStatus}>Apply to Selected</button>
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
                <label>
                  <input
                    type="radio"
                    name={`student${i}`}
                    checked={studentStatus[i] === 'Present'}
                    onChange={() => updateStudentStatus(i, 'Present')}
                  /> Present
                </label>
                <label>
                  <input
                    type="radio"
                    name={`student${i}`}
                    checked={studentStatus[i] === 'Excused Absence'}
                    onChange={() => updateStudentStatus(i, 'Excused Absence')}
                  /> Excused Absence
                </label>
                <label>
                  <input
                    type="radio"
                    name={`student${i}`}
                    checked={studentStatus[i] === 'Unexcused Absence'}
                    onChange={() => updateStudentStatus(i, 'Unexcused Absence')}
                  /> Unexcused Absence
                </label>
                <label>
                  <input
                    type="radio"
                    name={`student${i}`}
                    checked={studentStatus[i] === 'Late'}
                    onChange={() => updateStudentStatus(i, 'Late')}
                  /> Late
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Saving...' : '✓ Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceForm;