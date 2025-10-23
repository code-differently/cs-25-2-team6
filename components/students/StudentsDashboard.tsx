'use client';

import React, { useState } from 'react';
import StudentsList from './StudentsList';
import StudentTable from './StudentTable';
import StudentSearch from './StudentSearch';
import { useStudents, StudentFilters } from '../../src/services/hooks/useStudents';

export default function StudentsDashboard() {
  const [filters, setFilters] = useState<StudentFilters>({});
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const {
    students,
    loading,
    error,
    handleStudentSearch,
    handleStudentSort,
    handleStudentFilter,
    handleBulkActions,
    refreshStudentList
  } = useStudents(filters);

  const handleFilterChange = (newFilters: StudentFilters) => {
    setFilters(newFilters);
  };

  const handleViewModeChange = (mode: 'list' | 'table') => {
    setViewMode(mode);
  };

  const handleStudentSelection = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds);
  };

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{ 
          color: '#991b1b', 
          fontWeight: '600', 
          marginBottom: '8px',
          margin: 0
        }}>Error</h3>
        <p style={{ 
          color: '#b91c1c', 
          marginBottom: '12px',
          margin: 0
        }}>{error}</p>
        <button 
          onClick={refreshStudentList}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #fecaca'}
          onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Dashboard Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
            👥 Students Management
          </h2>
          
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleViewModeChange('list')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? '#2563eb' : '#f3f4f6',
                color: viewMode === 'list' ? 'white' : '#374151'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              📋 List View
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#2563eb' : '#f3f4f6',
                color: viewMode === 'table' ? 'white' : '#374151'
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'table') {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'table') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              📊 Table View
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <StudentSearch
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleStudentSearch}
          studentCount={students.length}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedStudentIds.length > 0 && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: '#1d4ed8', 
              fontWeight: '500' 
            }}>
              {selectedStudentIds.length} student(s) selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'activate' })}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#059669',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                ✅ Activate
              </button>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'deactivate' })}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#d97706',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              >
                ⏸️ Deactivate
              </button>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'export' })}
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                📤 Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Display */}
      {viewMode === 'list' ? (
        <StudentsList
          students={students}
          loading={loading}
          onSort={handleStudentSort}
          onStudentSelect={handleStudentSelection}
          selectedStudentIds={selectedStudentIds}
        />
      ) : (
        <StudentTable
          students={students}
          loading={loading}
          onSort={handleStudentSort}
          onBulkAction={handleBulkActions}
          onStudentSelect={handleStudentSelection}
          selectedStudentIds={selectedStudentIds}
        />
      )}
    </div>
  );
}