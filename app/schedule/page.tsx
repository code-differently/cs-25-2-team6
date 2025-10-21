'use client';

import React, { useState } from 'react';
import ScheduleDashboard from '../../components/schedule/ScheduleDashboard';
import ScheduleCalendar from '../../components/schedule/ScheduleCalendar';
import ScheduledEventsList from '../../components/schedule/ScheduledEventsList';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '8px' 
        }}>
          Schedule Management
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Manage schedules, days off, and events
        </p>
      </div>

      {/* Dashboard Overview */}
      <div style={{ marginBottom: '32px' }}>
        <ScheduleDashboard selectedDate={selectedDate} />
      </div>

      {/* View Toggle */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setView('calendar')}
          style={{
            backgroundColor: view === 'calendar' ? '#3b82f6' : '#f3f4f6',
            color: view === 'calendar' ? 'white' : '#374151',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Calendar View
        </button>
        <button
          onClick={() => setView('list')}
          style={{
            backgroundColor: view === 'list' ? '#3b82f6' : '#f3f4f6',
            color: view === 'list' ? 'white' : '#374151',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          List View
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: view === 'calendar' ? '2fr 1fr' : '1fr',
        gap: '24px' 
      }}>
        {view === 'calendar' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <ScheduleCalendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        )}
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <ScheduledEventsList 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}