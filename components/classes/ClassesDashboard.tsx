'use client';

import React, { useState } from 'react';
import ClassesList from './ClassesList';
import ClassStudentsPanel from './ClassStudentsPanel';
import { useClasses, ClassFilters } from '../../src/services/hooks/useClasses';

export default function ClassesDashboard() {
  const [filters, setFilters] = useState<ClassFilters>({});
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showStudentsPanel, setShowStudentsPanel] = useState(false);

  const {
    classes,
    loading,
    error,
    handleClassSearch,
    handleClassSort,
    handleClassFilter,
    handleBulkClassActions,
    refreshClassData
  } = useClasses(filters);

  const handleFilterChange = (newFilters: ClassFilters) => {
    setFilters(newFilters);
  };

  const handleClassSelection = (classIds: string[]) => {
    setSelectedClassIds(classIds);
  };

  const handleClassDetails = (classId: string) => {
    setSelectedClass(classId);
    setShowStudentsPanel(true);
  };

  const handleCloseStudentsPanel = () => {
    setShowStudentsPanel(false);
    setSelectedClass(null);
  };

  // Update search in filters on every keystroke
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  // Subject filter handler
  const handleSubjectFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, subject: e.target.value || undefined }));
  };

  // Status filter handler
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value || undefined }));
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
          onClick={refreshClassData}
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
            🏫 Classes Management
          </h2>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowStudentsPanel(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: !showStudentsPanel ? '#3b82f6' : '#f3f4f6',
                color: !showStudentsPanel ? 'white' : '#374151',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📋 Classes View
            </button>
            {selectedClass && (
              <button
                onClick={() => setShowStudentsPanel(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showStudentsPanel ? '#3b82f6' : '#f3f4f6',
                  color: showStudentsPanel ? 'white' : '#374151',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                👥 Students Panel
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px'
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
              placeholder="Search classes by name, subject, or teacher..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                color: '#111827',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <select
            onChange={handleSubjectFilter}
            style={{
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#111827',
              minWidth: '150px'
            }}
            value={filters.subject || ''}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
            <option value="Physical Education">Physical Education</option>
          </select>

          <select
            onChange={handleStatusFilter}
            style={{
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#111827',
              minWidth: '120px'
            }}
            value={filters.status || ''}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Results Count */}
        <div style={{
          fontSize: '14px',
          color: '#111827',
          fontWeight: '500'
        }}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} found
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedClassIds.length > 0 && !showStudentsPanel && (
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
              {selectedClassIds.length} class{selectedClassIds.length !== 1 ? 'es' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleBulkClassActions(selectedClassIds, { type: 'activate' })}
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
                onClick={() => handleBulkClassActions(selectedClassIds, { type: 'deactivate' })}
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
                onClick={() => handleBulkClassActions(selectedClassIds, { type: 'export' })}
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

      {/* Main Content */}
      {showStudentsPanel && selectedClass ? (
        <ClassStudentsPanel
          classId={selectedClass}
          onClose={handleCloseStudentsPanel}
        />
      ) : (
        <ClassesList
          classes={classes}
          loading={loading}
          onSort={handleClassSort}
          onClassSelect={handleClassSelection}
          selectedClassIds={selectedClassIds}
          onClassDetails={handleClassDetails}
        />
      )}
    </div>
  );
}