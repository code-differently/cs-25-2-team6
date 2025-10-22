'use client';

import React from 'react';
import { useScheduleCalendar } from '../../src/services/hooks/useScheduleCalendar';
import CalendarGrid from './CalendarGrid';

interface ScheduleCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onDateClick?: (date: Date) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ 
  selectedDate, 
  onDateSelect,
  onDateClick 
}) => {
  const {
    currentDate,
    handleCalendarNavigation,
    refreshScheduleData,
    isLoading,
    error
  } = useScheduleCalendar(selectedDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div>
      {/* Calendar Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#111827',
          margin: 0
        }}>
          {currentMonth} {currentYear}
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleCalendarNavigation('prev')}
            disabled={isLoading}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: '#374151',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            ← Previous
          </button>
          
          <button
            onClick={() => handleCalendarNavigation('today')}
            disabled={isLoading}
            style={{
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: 'white',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            Today
          </button>
          
          <button
            onClick={() => handleCalendarNavigation('next')}
            disabled={isLoading}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: '#374151',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            Next →
          </button>
          
          <button
            onClick={refreshScheduleData}
            disabled={isLoading}
            style={{
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: 'white',
              fontWeight: '500',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onDateClick={onDateClick}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ScheduleCalendar;