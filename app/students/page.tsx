'use client';

import React from 'react';
import StudentsDashboard from '@/components/students/StudentsDashboard';

export default function StudentsPage() {
  return (
    <div style={{
      maxWidth: '1152px',
      margin: '0 auto',
      padding: '32px 16px'
    }}>
      <h1 style={{
        fontSize: '30px',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '32px'
      }}>Student Management</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Page Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              👥 Student Records
            </h2>
            <p style={{
              color: '#6b7280'
            }}>
              Manage student information, track academic progress, and maintain comprehensive records for all enrolled students.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #10b981'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
              onClick={() => {
                // Handle add new student
              }}
            >
              ➕ Add Student
            </button>
            
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #3b82f6'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
              onClick={() => {
                // Handle import students
              }}
            >
              📤 Import
            </button>
            
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              onFocus={(e) => e.currentTarget.style.outline = '2px solid #6366f1'}
              onBlur={(e) => e.currentTarget.style.outline = 'none'}
              onClick={() => {
                // Handle export students
              }}
            >
              📥 Export
            </button>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '4px'
              }}>
                1,247
              </div>
              <div style={{
                fontSize: '14px',
                color: '#2563eb',
                fontWeight: '500'
              }}>
                Total Students
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#166534',
                marginBottom: '4px'
              }}>
                1,198
              </div>
              <div style={{
                fontSize: '14px',
                color: '#059669',
                fontWeight: '500'
              }}>
                Active Students
              </div>
            </div>

            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#92400e',
                marginBottom: '4px'
              }}>
                24
              </div>
              <div style={{
                fontSize: '14px',
                color: '#d97706',
                fontWeight: '500'
              }}>
                New This Month
              </div>
            </div>

            <div style={{
              backgroundColor: '#fdf2f8',
              border: '1px solid #fbcfe8',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#be185d',
                marginBottom: '4px'
              }}>
                95.2%
              </div>
              <div style={{
                fontSize: '14px',
                color: '#be185d',
                fontWeight: '500'
              }}>
                Avg Attendance
              </div>
            </div>
          </div>
        </div>

        {/* Main Students Dashboard */}
        <StudentsDashboard />

        {/* Footer Information */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            💡 Use the search and filter options to quickly find specific students. 
            Select multiple students to perform bulk actions like status updates or exports.
          </p>
        </div>
      </div>
    </div>
  );
}
