'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ClassesDashboard from '@/components/classes/ClassesDashboard';
import Link from 'next/link';

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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              <Link href="/settings" style={{
                display: 'inline-block',
                marginTop: '0',
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}>
                👥 Go to Student Management
              </Link>
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