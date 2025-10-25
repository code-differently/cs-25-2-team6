'use client';

import React, { useState } from 'react';
import StudentAssignmentInterface from './StudentAssignmentInterface';
import { useClassStudents } from '../../src/services/hooks/useClassStudents';

interface ClassStudentsPanelProps {
  classId: string;
  onClose: () => void;
}

export default function ClassStudentsPanel({
  classId,
  onClose
}: ClassStudentsPanelProps) {
  const [activeView, setActiveView] = useState<'enrolled' | 'assign'>('enrolled');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const {
    classStudents,
    availableStudents,
    loading,
    error,
    handleStudentAssignment,
    updateStudentGrade,
    updateAttendanceRate,
    refreshClassStudents
  } = useClassStudents(classId);

  const handleStudentToggle = (studentId: string, selected: boolean) => {
    if (selected) {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    } else {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    }
  };

  const handleBulkRemove = async () => {
    if (selectedStudentIds.length === 0) return;
    
    try {
      await handleStudentAssignment(selectedStudentIds, 'remove');
      setSelectedStudentIds([]);
    } catch (err) {
      console.error('Failed to remove students:', err);
    }
  };

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          color: '#111827'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
          <button 
            onClick={refreshClassStudents}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            👥 Class Students Management
          </h2>
          
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Classes
          </button>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveView('enrolled')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeView === 'enrolled' ? '#3b82f6' : '#f3f4f6',
              color: activeView === 'enrolled' ? 'white' : '#374151',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📋 Enrolled Students ({classStudents.length})
          </button>
          
          <button
            onClick={() => setActiveView('assign')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeView === 'assign' ? '#3b82f6' : '#f3f4f6',
              color: activeView === 'assign' ? 'white' : '#374151',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ➕ Assign Students
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '24px' }}>
        {activeView === 'enrolled' ? (
          <div>
            {/* Bulk Actions Bar */}
            {selectedStudentIds.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
                    {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleBulkRemove}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🗑️ Remove from Class
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enrolled Students List */}
            {loading ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    height: '80px',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    borderRadius: '8px'
                  }}></div>
                ))}
              </div>
            ) : classStudents.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#111827'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No students enrolled
                </h3>
                <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                  Use the "Assign Students" tab to add students to this class
                </p>
                <button
                  onClick={() => setActiveView('assign')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ➕ Assign Students
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px'
              }}>
                {classStudents.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      padding: '16px',
                      backgroundColor: selectedStudentIds.includes(student.id) ? '#eff6ff' : '#fafbfc',
                      border: `1px solid ${selectedStudentIds.includes(student.id) ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => handleStudentToggle(student.id, e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b82f6'
                      }}
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 4px 0'
                          }}>
                            {student.firstName} {student.lastName}
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {student.email} • Grade {student.grade}
                          </p>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: student.attendanceRate > 85 ? '#10b981' : 
                                    student.attendanceRate > 70 ? '#f59e0b' : '#ef4444'
                            }}>
                              {student.attendanceRate.toFixed(1)}%
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              Attendance
                            </div>
                          </div>
                          
                          {student.finalGrade && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#111827'
                              }}>
                                {student.finalGrade}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280'
                              }}>
                                Grade
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <StudentAssignmentInterface
            classId={classId}
            availableStudents={availableStudents}
            onStudentAssign={handleStudentAssignment}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}