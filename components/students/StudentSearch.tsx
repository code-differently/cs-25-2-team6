'use client';

import React, { useState, useEffect } from 'react';
import { StudentFilters } from '../../src/services/hooks/useStudents';

interface StudentSearchProps {
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
  onSearch: (query: string) => void;
  studentCount: number;
}

export default function StudentSearch({
  filters,
  onFilterChange,
  onSearch,
  studentCount
}: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    const activeFilters = Object.values(filters).filter(value => value && value !== '');
    return activeFilters.length;
  };

  const gradeOptions = [
    'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'transferred', label: 'Transferred' }
  ];

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      {/* Main Search Bar */}
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
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            padding: '12px 16px',
            backgroundColor: showAdvancedFilters ? '#3b82f6' : 'white',
            color: showAdvancedFilters ? 'white' : '#374151',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔽 Filters
          {getActiveFilterCount() > 0 && (
            <span style={{
              backgroundColor: showAdvancedFilters ? 'white' : '#3b82f6',
              color: showAdvancedFilters ? '#3b82f6' : 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '12px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ❌ Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: showAdvancedFilters ? '16px' : '0'
      }}>
        <span style={{
          fontSize: '14px',
          color: '#111827',
          fontWeight: '500'
        }}>
          {studentCount} student{studentCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            Advanced Filters
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Grade Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '6px'
              }}>
                Grade
              </label>
              <select
                value={filters.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Grades</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '6px'
              }}>
                Class
              </label>
              <input
                type="text"
                placeholder="Enter class name..."
                value={filters.class || ''}
                onChange={(e) => handleFilterChange('class', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '6px'
              }}>
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enrollment Year Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '6px'
              }}>
                Enrollment Year
              </label>
              <select
                value={filters.enrollmentYear || ''}
                onChange={(e) => handleFilterChange('enrollmentYear', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Years</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {getActiveFilterCount() > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Active Filters:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <span
                      key={key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {key}: {value}
                      <button
                        onClick={() => handleFilterChange(key as keyof StudentFilters, '')}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: '0',
                          marginLeft: '2px'
                        }}
                      >
                        ❌
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}