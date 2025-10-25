'use client';

import React, { useState } from 'react';
import { Student } from '../../src/services/hooks/useStudents';

interface StudentAssignmentInterfaceProps {
  classId: string;
  availableStudents: Student[];
  onStudentAssign: (studentIds: string[], action: 'add' | 'remove') => Promise<void>;
  loading: boolean;
}

export default function StudentAssignmentInterface({
  classId,
  availableStudents,
  onStudentAssign,
  loading
}: StudentAssignmentInterfaceProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter available students based on search and filters
  const filteredStudents = availableStudents.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = filterGrade === '' || student.grade === filterGrade;
    const matchesStatus = filterStatus === '' || student.status === filterStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleStudentToggle = (studentId: string, selected: boolean) => {
    if (selected) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allFilteredIds = filteredStudents.map(student => student.id);
      const newSelected = [...new Set([...selectedStudents, ...allFilteredIds])];
      setSelectedStudents(newSelected);
    } else {
      const filteredIds = filteredStudents.map(student => student.id);
      setSelectedStudents(selectedStudents.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return;

    setIsAssigning(true);
    try {
      await onStudentAssign(selectedStudents, 'add');
      setSelectedStudents([]);
    } catch (err) {
      console.error('Failed to assign students:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const allFilteredSelected = filteredStudents.length > 0 && 
    filteredStudents.every(student => selectedStudents.includes(student.id));

  return (
    <div>
      {/* Search and Filters */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px'
            }}>
              🔍
            </div>
            <input
              type="text"
              placeholder="Search available students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                color: '#111827',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#111827',
              minWidth: '120px'
            }}
          >
            <option value="">All Grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#111827',
              minWidth: '120px'
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#111827',
            fontWeight: '500'
          }}>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available
          </div>

          {selectedStudents.length > 0 && (
            <button
              onClick={handleAssignStudents}
              disabled={isAssigning}
              style={{
                padding: '8px 16px',
                backgroundColor: isAssigning ? '#9ca3af' : '#10b981',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: isAssigning ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isAssigning ? '⏳ Assigning...' : `➕ Assign ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Select All */}
      {filteredStudents.length > 0 && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#3b82f6'
              }}
            />
            <span style={{ fontSize: '14px', color: '#111827' }}>
              Select all students on this page
            </span>
          </div>
        </div>
      )}

      {/* Students List */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px'
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: '100px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '8px'
            }}></div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#111827',
          backgroundColor: '#fafbfc',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No students available
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {searchQuery || filterGrade || filterStatus ? 
              'Try adjusting your search or filter criteria' : 
              'All students are already enrolled in classes'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px'
        }}>
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              style={{
                padding: '16px',
                backgroundColor: selectedStudents.includes(student.id) ? '#eff6ff' : 'white',
                border: `2px solid ${selectedStudents.includes(student.id) ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleStudentToggle(student.id, !selectedStudents.includes(student.id))}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStudentToggle(student.id, e.target.checked);
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6',
                    marginTop: '2px'
                  }}
                />
                
                <div style={{ flex: 1 }}>
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
                    margin: '0 0 8px 0'
                  }}>
                    {student.email}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '12px'
                  }}>
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      Grade {student.grade}
                    </span>
                    
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: student.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: student.status === 'active' ? '#166534' : '#92400e',
                      borderRadius: '4px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                paddingTop: '8px',
                borderTop: '1px solid #f1f5f9'
              }}>
                ID: {student.id} • Attendance: {student.attendanceRate}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Summary */}
      {selectedStudents.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '4px'
              }}>
                Ready to assign {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#0369a1'
              }}>
                These students will be enrolled in the class immediately
              </div>
            </div>
            
            <button
              onClick={handleAssignStudents}
              disabled={isAssigning}
              style={{
                padding: '10px 20px',
                backgroundColor: isAssigning ? '#9ca3af' : '#0369a1',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: isAssigning ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isAssigning ? '⏳ Assigning...' : '✅ Confirm Assignment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}