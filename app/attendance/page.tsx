'use client';

import React, { useState, useEffect } from 'react';
import DataPicker, { dateHelpers, dateValidators } from '../../components/DataPicker';
import StudentList from '../../components/StudentList';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  earlyDismissal: boolean;
  date: string;
}

interface FormErrors {
  date?: string;
  students?: string;
  general?: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(dateHelpers.today());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to load students');
      
      const data = await response.json();
      setStudents(data);
      
      const initialRecords: Record<string, AttendanceRecord> = {};
      data.forEach((student: Student) => {
        initialRecords[student.id] = {
          studentId: student.id,
          status: 'PRESENT',
          earlyDismissal: false,
          date: selectedDate
        };
      });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      setErrors({ general: 'Failed to load students. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate date
    if (!selectedDate) {
      newErrors.date = 'Date is required';
    } else if (dateHelpers.isFuture(selectedDate)) {
      newErrors.date = 'Cannot record attendance for future dates';
    }

    // Remove the validation that requires changes - let users submit all PRESENT
    // This allows bulk operations and default submissions

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle attendance change (unified handler for the StudentList component)
  const handleAttendanceChange = (studentId: string, field: 'status' | 'earlyDismissal', value: any) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        date: selectedDate
      }
    }));
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    
    // Custom validation
    const error = dateValidators.notFuture(newDate);
    setDateError(error);
    
    // Update all records with new date
    setAttendanceRecords(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        updated[studentId] = { ...updated[studentId], date: newDate };
      });
      return updated;
    });
    setErrors({}); // Clear errors when date changes
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare attendance data for submission
      const attendanceData = Object.values(attendanceRecords).map(record => ({
        studentId: record.studentId,
        status: record.status,
        earlyDismissal: record.earlyDismissal,
        date: record.date
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          records: attendanceData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit attendance');
      }

      // Success - show confirmation and reset form
      alert('Attendance recorded successfully!');
      
      // Reset to default state
      const resetRecords: Record<string, AttendanceRecord> = {};
      students.forEach(student => {
        resetRecords[student.id] = {
          studentId: student.id,
          status: 'PRESENT',
          earlyDismissal: false,
          date: selectedDate
        };
      });
      setAttendanceRecords(resetRecords);

    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to submit attendance' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Record Attendance</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection using DataPicker component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <DataPicker
            label="Attendance Date"
            value={selectedDate}
            onChange={handleDateChange}
            error={dateError || errors.date}
            required
            maxDate={dateHelpers.today()}
            placeholder="Select attendance date..."
          />
        </div>

        {/* Student List Component - replaces the old manual student list */}
        <StudentList
          students={students}
          attendanceRecords={attendanceRecords}
          onAttendanceChange={handleAttendanceChange}
          date={selectedDate}
          loading={loading}
          showBulkControls={true}
          showEarlyDismissal={true}
          className="mb-6"
        />

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {students.length > 0 && (
              <>
                Ready to submit attendance for {students.length} students on{' '}
                {new Date(selectedDate).toLocaleDateString()}
              </>
            )}
          </div>
          
          <button
            type="submit"
            disabled={submitting || students.length === 0}
            className={`px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              submitting || students.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {submitting ? 'Recording...' : 'Record Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
}