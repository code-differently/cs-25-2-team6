'use client';

import React, { useState } from 'react';
import ClassCard from './ClassCard';
import { Class, SortCriteria } from '../../src/services/hooks/useClasses';

interface ClassesListProps {
  classes: Class[];
  loading: boolean;
  onSort: (criteria: SortCriteria) => void;
  onClassSelect: (classIds: string[]) => void;
  selectedClassIds: string[];
  onClassDetails: (classId: string) => void;
}

export default function ClassesList({
  classes,
  loading,
  onSort,
  onClassSelect,
  selectedClassIds,
  onClassDetails
}: ClassesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortField, setSortField] = useState<SortCriteria['field']>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortCriteria['field']) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort({ field, direction: newDirection });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const currentPageClasses = getCurrentPageClasses().map(classItem => classItem.id);
      const newSelected = [...new Set([...selectedClassIds, ...currentPageClasses])];
      onClassSelect(newSelected);
    } else {
      const currentPageClasses = getCurrentPageClasses().map(classItem => classItem.id);
      const newSelected = selectedClassIds.filter(id => !currentPageClasses.includes(id));
      onClassSelect(newSelected);
    }
  };

  const handleClassToggle = (classId: string, selected: boolean) => {
    if (selected) {
      onClassSelect([...selectedClassIds, classId]);
    } else {
      onClassSelect(selectedClassIds.filter(id => id !== classId));
    }
  };

  const getCurrentPageClasses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return classes.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const currentPageClasses = getCurrentPageClasses();

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: '220px',
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
      border: '1px solid #e5e7eb'
    }}>
      {/* List Header */}
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
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Classes ({classes.length})
          </h3>

          {/* Sort Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['name', 'subject', 'teacher', 'enrolledCount'].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field as SortCriteria['field'])}
                style={{
                  padding: '6px 12px',
                  backgroundColor: sortField === field ? '#3b82f6' : '#f3f4f6',
                  color: sortField === field ? 'white' : '#374151',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {field === 'name' && 'Name'}
                {field === 'subject' && 'Subject'}
                {field === 'teacher' && 'Teacher'}
                {field === 'enrolledCount' && 'Students'}
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Select All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={currentPageClasses.length > 0 && currentPageClasses.every(classItem => selectedClassIds.includes(classItem.id))}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#3b82f6'
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827' }}>
            Select all on this page
          </span>
        </div>
      </div>

      {/* Classes Grid */}
      <div style={{ padding: '24px' }}>
        {classes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#111827'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏫</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No classes found
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {currentPageClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classData={classItem}
                  selected={selectedClassIds.includes(classItem.id)}
                  onSelect={(selected) => handleClassToggle(classItem.id, selected)}
                  onViewDetails={() => onClassDetails(classItem.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
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
                  padding: '0 16px'
                }}>
                  Page {currentPage} of {totalPages}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}