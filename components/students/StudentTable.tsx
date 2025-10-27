'use client';

import React, { useState } from 'react';
import { Student, SortCriteria, BulkAction } from '../../src/services/hooks/useStudents';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onSort: (criteria: SortCriteria) => void;
  onBulkAction: (studentIds: string[], action: BulkAction) => void;
  onStudentSelect: (studentIds: string[]) => void;
  selectedStudentIds: string[];
}

export default function StudentTable({
  students,
  loading,
  onSort,
  onBulkAction,
  onStudentSelect,
  selectedStudentIds
}: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortCriteria['field']>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortCriteria['field']) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort({ field, direction: newDirection });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const currentPageStudents = getCurrentPageStudents().map(student => student.id);
      const newSelected = [...new Set([...selectedStudentIds, ...currentPageStudents])];
      onStudentSelect(newSelected);
    } else {
      const currentPageStudents = getCurrentPageStudents().map(student => student.id);
      const newSelected = selectedStudentIds.filter(id => !currentPageStudents.includes(id));
      onStudentSelect(newSelected);
    }
  };

  const handleStudentToggle = (studentId: string, selected: boolean) => {
    if (selected) {
      onStudentSelect([...selectedStudentIds, studentId]);
    } else {
      onStudentSelect(selectedStudentIds.filter(id => id !== studentId));
    }
  };

  const getCurrentPageStudents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'inactive':
        return { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'graduated':
        return { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'transferred':
        return { backgroundColor: '#f3e8ff', color: '#7c2d12', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
    }
  };

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const currentPageStudents = getCurrentPageStudents();

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              height: '60px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '8px'
            }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Students Table ({students.length})
        </h3>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
                width: '50px'
              }}>
                <input
                  type="checkbox"
                  checked={currentPageStudents.length > 0 && currentPageStudents.every(student => selectedStudentIds.includes(student.id))}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
              </th>
              
              {[
                { field: 'firstName', label: 'First Name' },
                { field: 'lastName', label: 'Last Name' },
                { field: 'grade', label: 'Grade' },
                { field: 'gpa', label: 'GPA' },
                { field: 'attendanceRate', label: 'Attendance' }
              ].map(({ field, label }) => (
                <th
                  key={field}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort(field as SortCriteria['field'])}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {label}
                    <span style={{ opacity: sortField === field ? 1 : 0.3 }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  </div>
                </th>
              ))}
              
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Status
              </th>
              
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {currentPageStudents.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: '#111827'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    No students found
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    Try adjusting your search or filter criteria
                  </p>
                </td>
              </tr>
            ) : (
              currentPageStudents.map((student, index) => (
                <tr
                  key={student.id}
                  style={{
                    backgroundColor: selectedStudentIds.includes(student.id) ? '#f0f9ff' : index % 2 === 0 ? 'white' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => handleStudentToggle(student.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                    />
                  </td>
                  
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#111827'
                  }}>
                    {student.firstName}
                  </td>
                  
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {student.lastName}
                  </td>
                  
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#111827'
                  }}>
                    {student.grade}
                  </td>
                  
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: student.gpa && student.gpa >= 3.5 ? '#10b981' : student.gpa && student.gpa >= 2.5 ? '#f59e0b' : '#ef4444'
                  }}>
                    {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                  </td>
                  
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: student.attendanceRate >= 95 ? '#10b981' : student.attendanceRate >= 85 ? '#f59e0b' : '#ef4444'
                  }}>
                    {student.attendanceRate}%
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <span style={getStatusStyle(student.status)}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        👁️
                      </button>
                      <button
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#111827' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} students
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : '#3b82f6',
                color: currentPage === 1 ? '#9ca3af' : 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ← Previous
            </button>
            
            <span style={{ 
              fontSize: '14px', 
              color: '#111827',
              padding: '0 12px'
            }}>
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#3b82f6',
                color: currentPage === totalPages ? '#9ca3af' : 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}