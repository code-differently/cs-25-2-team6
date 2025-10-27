'use client';

import React from 'react';
import { Student } from '../../src/services/hooks/useStudents';

interface StudentCardProps {
  student: Student;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}

export default function StudentCard({ student, selected, onSelect }: StudentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
      case 'inactive':
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
      case 'graduated':
        return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'transferred':
        return { backgroundColor: '#f3e8ff', color: '#7c2d12', border: '1px solid #e9d5ff' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 5) return '#ef4444'; // Elementary - Red
    if (gradeNum <= 8) return '#f59e0b'; // Middle - Orange
    return '#3b82f6'; // High School - Blue
  };

  const formatGPA = (gpa?: number) => {
    return gpa ? gpa.toFixed(2) : 'N/A';
  };

  return (
    <div style={{
      backgroundColor: selected ? '#f0f9ff' : 'white',
      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: selected ? '0 4px 6px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onClick={() => onSelect(!selected)}
    onMouseEnter={(e) => {
      if (!selected) {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (!selected) {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
    >
      {/* Selection Checkbox */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px'
      }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          style={{
            width: '18px',
            height: '18px',
            accentColor: '#3b82f6'
          }}
        />
      </div>

      {/* Student Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {student.firstName} {student.lastName}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              ID: {student.id}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          ...getStatusColor(student.status)
        }}>
          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </div>
      </div>

      {/* Student Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Grade
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: getGradeColor(student.grade)
          }}>
            {student.grade}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Class
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827'
          }}>
            {student.class}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            GPA
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: student.gpa && student.gpa >= 3.5 ? '#10b981' : student.gpa && student.gpa >= 2.5 ? '#f59e0b' : '#ef4444'
          }}>
            {formatGPA(student.gpa)}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Attendance
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: student.attendanceRate >= 95 ? '#10b981' : student.attendanceRate >= 85 ? '#f59e0b' : '#ef4444'
          }}>
            {student.attendanceRate}%
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '6px'
        }}>
          Guardian
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#111827',
          marginBottom: '2px'
        }}>
          {student.guardianName}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {student.guardianPhone}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle view student details
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          👁️ View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle edit student
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle contact guardian
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#f59e0b',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          📞 Contact
        </button>
      </div>
    </div>
  );
}