'use client';

import React, { useState, useEffect } from 'react';

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

interface StudentListProps {
  students: Student[];
  attendanceRecords: Record<string, AttendanceRecord>;
  onAttendanceChange: (studentId: string, field: 'status' | 'earlyDismissal', value: any) => void;
  date: string;
  loading?: boolean;
  className?: string;
  showBulkControls?: boolean;
  showEarlyDismissal?: boolean;
}

const ATTENDANCE_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'text-green-600' },
  { value: 'LATE', label: 'Late', color: 'text-yellow-600' },
  { value: 'ABSENT', label: 'Absent', color: 'text-red-600' },
  { value: 'EXCUSED', label: 'Excused', color: 'text-blue-600' },
] as const;

export default function StudentList({
  students,
  attendanceRecords,
  onAttendanceChange,
  date,
  loading = false,
  className = '',
  showBulkControls = true,
  showEarlyDismissal = true,
}: StudentListProps) {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'>('PRESENT');

  // Clear selections when students change
  useEffect(() => {
    setSelectedStudents(new Set());
  }, [students]);

  // Handle individual student selection
  const handleStudentSelect = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Handle select all functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(students.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = () => {
    selectedStudents.forEach(studentId => {
      onAttendanceChange(studentId, 'status', bulkStatus);
    });
  };

  // Handle bulk early dismissal toggle
  const handleBulkEarlyDismissal = (earlyDismissal: boolean) => {
    selectedStudents.forEach(studentId => {
      onAttendanceChange(studentId, 'earlyDismissal', earlyDismissal);
    });
  };

  // Handle individual attendance status change
  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    onAttendanceChange(studentId, 'status', status);
  };

  // Handle individual early dismissal change
  const handleEarlyDismissalChange = (studentId: string, earlyDismissal: boolean) => {
    onAttendanceChange(studentId, 'earlyDismissal', earlyDismissal);
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    return ATTENDANCE_OPTIONS.find(opt => opt.value === status)?.color || 'text-gray-600';
  };

  // Calculate selection stats
  const allSelected = students.length > 0 && selectedStudents.size === students.length;
  const someSelected = selectedStudents.size > 0 && selectedStudents.size < students.length;

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.25" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">Please add students to start recording attendance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* Header with bulk controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Students ({students.length})
          </h2>
          {selectedStudents.size > 0 && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {selectedStudents.size} selected
            </span>
          )}
        </div>

        {showBulkControls && (
          <div className="flex items-center space-x-3">
            {/* Select All Checkbox */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Select All</span>
            </label>

            {/* Bulk Status Dropdown */}
            {selectedStudents.size > 0 && (
              <>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as typeof bulkStatus)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ATTENDANCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleBulkStatusChange}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Apply to Selected
                </button>

                {showEarlyDismissal && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkEarlyDismissal(true)}
                      className="text-sm bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-500"
                    >
                      Mark Early
                    </button>
                    <button
                      onClick={() => handleBulkEarlyDismissal(false)}
                      className="text-sm bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
                    >
                      Clear Early
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {students.map((student) => {
          const record = attendanceRecords[student.id];
          const isSelected = selectedStudents.has(student.id);

          return (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Student Selection and Info */}
              <div className="flex items-center space-x-4 flex-1">
                {showBulkControls && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                )}
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {student.id}
                  </div>
                </div>
              </div>

              {/* Attendance Controls */}
              <div className="flex items-center space-x-4">
                {/* Status Dropdown */}
                <select
                  value={record?.status || 'PRESENT'}
                  onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceRecord['status'])}
                  className={`text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getStatusColor(record?.status || 'PRESENT')
                  }`}
                >
                  {ATTENDANCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Early Dismissal Checkbox */}
                {showEarlyDismissal && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={record?.earlyDismissal || false}
                      onChange={(e) => handleEarlyDismissalChange(student.id, e.target.checked)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Early</span>
                  </label>
                )}

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    record?.status === 'PRESENT' ? 'bg-green-500' :
                    record?.status === 'LATE' ? 'bg-yellow-500' :
                    record?.status === 'ABSENT' ? 'bg-red-500' :
                    record?.status === 'EXCUSED' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  {record?.earlyDismissal && (
                    <span className="text-xs text-orange-600 font-medium">ED</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {students.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Date: {new Date(date).toLocaleDateString()}</span>
            <div className="flex space-x-4">
              {ATTENDANCE_OPTIONS.map(option => {
                const count = students.filter(s => 
                  attendanceRecords[s.id]?.status === option.value
                ).length;
                return (
                  <span key={option.value} className={option.color}>
                    {option.label}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { Student, AttendanceRecord };