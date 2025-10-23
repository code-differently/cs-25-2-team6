'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ClassesDashboard from '@/components/classes/ClassesDashboard';

export default function ClassesPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Page Header */}
        <div style={{ 
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#111827',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🏫 Class Management
              </h1>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '16px',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Manage class schedules, student assignments, and track class attendance across all courses.
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  // Handle add new class
                }}
              >
                ➕ Add Class
              </button>
              
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  // Handle import classes
                }}
              >
                📤 Import
              </button>
              
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  // Handle export classes
                }}
              >
                📥 Export
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '4px'
              }}>
                24
              </div>
              <div style={{
                fontSize: '14px',
                color: '#1e40af',
                fontWeight: '500'
              }}>
                Total Classes
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#166534',
                marginBottom: '4px'
              }}>
                18
              </div>
              <div style={{
                fontSize: '14px',
                color: '#166534',
                fontWeight: '500'
              }}>
                Active Classes
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px',
              border: '1px solid #fde68a'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#92400e',
                marginBottom: '4px'
              }}>
                567
              </div>
              <div style={{
                fontSize: '14px',
                color: '#92400e',
                fontWeight: '500'
              }}>
                Total Enrollments
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#fdf2f8',
              borderRadius: '8px',
              border: '1px solid #fbcfe8'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#be185d',
                marginBottom: '4px'
              }}>
              89.5%
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

        {/* Main Classes Dashboard */}
        <ClassesDashboard />

        {/* Footer Information */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            💡 Use the class management tools to organize courses, assign students, and monitor attendance. 
            Click on any class to view detailed student information and attendance records.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}