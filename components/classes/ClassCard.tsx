'use client';

import React from 'react';
import { Class } from '../../src/services/hooks/useClasses';

interface ClassCardProps {
  classData: Class;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onViewDetails: () => void;
}

export default function ClassCard({
  classData,
  selected,
  onSelect,
  onViewDetails
}: ClassCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'inactive':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'completed':
        return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const statusColor = getStatusColor(classData.status);
  const capacityPercentage = (classData.enrolledCount / classData.capacity) * 100;

  const getDayAbbreviation = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
        boxShadow: selected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => onSelect(!selected)}
    >
      {/* Selection Indicator */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#3b82f6'
          }}
        />
      )}

      {/* Card Header */}
      <div style={{
        padding: '20px 20px 16px 20px',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: '1.3'
            }}>
              {classData.name}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 8px 0'
            }}>
              {classData.subject} • Grade {classData.grade}
            </p>
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: '4px 8px',
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'capitalize',
              border: `1px solid ${statusColor.border}`
            }}
          >
            {classData.status}
          </div>
        </div>

        {/* Teacher Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>👨‍🏫</span>
          <span style={{
            fontSize: '14px',
            color: '#374151',
            fontWeight: '500'
          }}>
            {classData.teacher}
          </span>
        </div>

        {/* Schedule Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <span style={{
            fontSize: '14px',
            color: '#374151'
          }}>
            {getDayAbbreviation(classData.schedule.dayOfWeek)} • {classData.schedule.startTime} - {classData.schedule.endTime}
          </span>
        </div>

        {/* Room Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>🏛️</span>
          <span style={{
            fontSize: '14px',
            color: '#374151'
          }}>
            Room {classData.schedule.room}
          </span>
        </div>
      </div>

      {/* Card Body - Enrollment Info */}
      <div style={{ padding: '16px 20px' }}>
        {/* Enrollment Progress */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Enrollment
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {classData.enrolledCount}/{classData.capacity}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f1f5f9',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${Math.min(capacityPercentage, 100)}%`,
                height: '100%',
                backgroundColor: capacityPercentage > 90 ? '#ef4444' : 
                                capacityPercentage > 75 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Attendance Rate */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Attendance Rate
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: classData.attendanceRate > 85 ? '#10b981' : 
                  classData.attendanceRate > 70 ? '#f59e0b' : '#ef4444'
          }}>
            {classData.attendanceRate.toFixed(1)}%
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            👥 View Students
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit class
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✏️ Edit
          </button>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          {classData.semester} {classData.year}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Last activity: {new Date(classData.lastActivity).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}