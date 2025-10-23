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
        padding: '16px',
        color: '#111827'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Error</h3>
        <p style={{ margin: 0 }}>{error}</p>
        <button 
          onClick={refreshStudentList}
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
    );
  }

  return (
    <div style={{ padding: '0', minHeight: '70vh' }}>
      {/* Dashboard Header */}
      <div style={{ 
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '24px',
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
                backgroundColor: viewMode === 'list' ? '#3b82f6' : '#f3f4f6',
                color: viewMode === 'list' ? 'white' : '#374151',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📋 List View
            </button>
            <button
              onClick={() => handleViewModeChange('table')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'table' ? '#3b82f6' : '#f3f4f6',
                color: viewMode === 'table' ? 'white' : '#374151',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
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
          marginBottom: '16px',
          padding: '12px 20px',
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
              {selectedStudentIds.length} student(s) selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'activate' })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✅ Activate
              </button>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'deactivate' })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ⏸️ Deactivate
              </button>
              <button
                onClick={() => handleBulkActions(selectedStudentIds, { type: 'export' })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
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