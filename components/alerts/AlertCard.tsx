'use client';

import React from 'react';
import { AttendanceAlert } from '../../src/services/hooks/useAlerts';

interface AlertCardProps {
  alert: AttendanceAlert;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onStudentSelect: () => void;
}

export default function AlertCard({ alert, selected, onSelect, onStudentSelect }: AlertCardProps) {
const getSeverityColor = (severity: AttendanceAlert['severity']) => {
  switch (severity) {
    case 'high': return { border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#991b1b' };
    case 'medium': return { border: '1px solid #fde68a', backgroundColor: '#fffbeb', color: '#92400e' };
    case 'low': return { border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af' };
    default: return { border: '1px solid #d1d5db', backgroundColor: '#f9fafb', color: '#374151' };
  }
};  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'absence': return '📅';
      case 'tardy': return '⏰';
      case 'pattern': return '⚠️';
      case 'chronic': return '⚠️';
      default: return '⚠️';
    }
  };

  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: selected ? '#f0f9ff' : 'white',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      if (!selected) {
        e.currentTarget.style.backgroundColor = '#fafbfc';
      }
    }}
    onMouseLeave={(e) => {
      if (!selected) {
        e.currentTarget.style.backgroundColor = 'white';
      }
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        {/* Alert Content */}
        <div style={{
          flex: '1',
          minWidth: '0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6'
                }}
              />
              
              {/* Severity Badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: alert.severity === 'high' ? '#fee2e2' : 
                               alert.severity === 'medium' ? '#fef3c7' : '#dbeafe',
                color: alert.severity === 'high' ? '#dc2626' : 
                       alert.severity === 'medium' ? '#d97706' : '#2563eb'
              }}>
                {alert.severity.toUpperCase()}
              </span>
              
              {/* Type Icon & Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {getTypeIcon(alert.type)}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  textTransform: 'capitalize'
                }}>
                  {alert.type}
                </span>
              </div>
            </div>

            {/* Date */}
            <span style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {alert.triggerDate && !isNaN(new Date(alert.triggerDate).getTime())
                ? new Date(alert.triggerDate).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>

          {/* Student Name */}
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={onStudentSelect}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>{alert.studentName}</span>
            </button>
          </div>

          {/* Description */}
          <p style={{
            marginTop: '8px',
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {alert.description}
          </p>

          {/* Metadata */}
          {alert.metadata && (
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {alert.metadata.absenceCount && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  📅 {alert.metadata.absenceCount} absences
                </span>
              )}
              {alert.metadata.tardyCount && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: '#fed7aa',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  ⏰ {alert.metadata.tardyCount} tardies
                </span>
              )}
              {alert.metadata.attendanceRate && (
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: alert.metadata.attendanceRate >= 80 ? '#d1fae5' : '#fee2e2',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  📊 {alert.metadata.attendanceRate}% attendance
                </span>
              )}
            </div>
          )}

          {/* Status and Interventions */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: alert.status === 'active' ? '#fee2e2' :
                             alert.status === 'acknowledged' ? '#fef3c7' : '#d1fae5',
              color: alert.status === 'active' ? '#dc2626' :
                     alert.status === 'acknowledged' ? '#d97706' : '#059669'
            }}>
              {alert.status === 'active' ? '🔴' : alert.status === 'acknowledged' ? '🟡' : '🟢'}
              <span style={{ marginLeft: '4px', textTransform: 'capitalize' }}>
                {alert.status}
              </span>
            </span>
            
            {Array.isArray(alert.interventions) && alert.interventions.length > 0 && (
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                🛠️ {alert.interventions.length} intervention(s)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}