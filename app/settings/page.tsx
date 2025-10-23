'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StudentsDashboard from '@/components/students/StudentsDashboard';
import ClassesDashboard from '@/components/classes/ClassesDashboard';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'classes'>('students');

  return (
    <DashboardLayout>
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
        }}>Settings</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Management Tabs */}
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
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                ⚙️ Management Dashboard
              </h2>
              
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '8px'
              }}>
                <button
                  onClick={() => setActiveTab('students')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activeTab === 'students' ? '#3b82f6' : 'transparent',
                    color: activeTab === 'students' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'students') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'students') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  👥 Student Management
                </button>
                
                <button
                  onClick={() => setActiveTab('classes')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: activeTab === 'classes' ? '#3b82f6' : 'transparent',
                    color: activeTab === 'classes' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'classes') {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'classes') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  🏫 Class Management
                </button>
              </div>
              
              {/* Tab Description */}
              <div style={{
                padding: '16px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {activeTab === 'students' ? (
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Manage student information, track academic progress, and maintain comprehensive records for all enrolled students.
                  </p>
                ) : (
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Organize class schedules, manage student assignments, and monitor class attendance across all courses.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Dashboard Content */}
          {activeTab === 'students' ? (
            <StudentsDashboard />
          ) : (
            <ClassesDashboard />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}