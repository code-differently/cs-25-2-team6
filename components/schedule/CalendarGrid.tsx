'use client';

import React from 'react';
import { useScheduleCalendar } from '../../src/services/hooks/useScheduleCalendar';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  isLoading: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onDateClick,
  isLoading
}) => {
  const {
    renderCalendarMonth,
    getEventsForDate,
    getDaysOffForDate
  } = useScheduleCalendar();

  const today = new Date();
  const daysInMonth = renderCalendarMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayStatus = (date: Date) => {
    const events = getEventsForDate(date);
    const daysOff = getDaysOffForDate(date);
    
    if (daysOff.length > 0) {
      const hasApproved = daysOff.some(day => day.status === 'approved');
      const hasPending = daysOff.some(day => day.status === 'pending');
      
      if (hasApproved) return { type: 'dayoff-approved', color: '#dc2626' };
      if (hasPending) return { type: 'dayoff-pending', color: '#f59e0b' };
    }
    
    if (events.length > 0) {
      return { type: 'event', color: '#3b82f6' };
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div style={{ opacity: 0.5 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Day headers */}
          {dayNames.map(day => (
            <div
              key={day}
              style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days skeleton */}
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                minHeight: '80px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px'
              }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)', 
      gap: '1px',
      backgroundColor: '#e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Day headers */}
      {dayNames.map(day => (
        <div
          key={day}
          style={{
            backgroundColor: '#f9fafb',
            padding: '12px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}
        >
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {daysInMonth.map((date, index) => {
        const dayStatus = getDayStatus(date);
        const events = getEventsForDate(date);
        const daysOff = getDaysOffForDate(date);
        
        return (
          <div
            key={index}
            onClick={() => {
              onDateSelect(date);
              if (onDateClick) {
                onDateClick(date);
              }
            }}
            style={{
              backgroundColor: 'white',
              minHeight: '80px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              opacity: isCurrentMonth(date) ? 1 : 0.4,
              borderLeft: isSelected(date) ? '3px solid #3b82f6' : 'none'
            }}
          >
            {/* Date number */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: isToday(date) ? 'bold' : 'normal',
                color: isToday(date) ? '#3b82f6' : isCurrentMonth(date) ? '#111827' : '#9ca3af',
                backgroundColor: isToday(date) ? '#dbeafe' : 'transparent',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {date.getDate()}
              </span>
              
              {/* Status indicator */}
              {dayStatus && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dayStatus.color
                }} />
              )}
            </div>
            
            {/* Events and days off indicators */}
            <div style={{ flex: 1, fontSize: '10px' }}>
              {events.slice(0, 2).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {event.title}
                </div>
              ))}
              
              {daysOff.slice(0, 1).map((dayOff, dayOffIndex) => (
                <div
                  key={dayOffIndex}
                  style={{
                    backgroundColor: dayOff.status === 'approved' ? '#fecaca' : '#fed7aa',
                    color: dayOff.status === 'approved' ? '#991b1b' : '#9a3412',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {dayOff.teacherName} - {dayOff.type}
                </div>
              ))}
              
              {/* Show more indicator */}
              {(events.length + daysOff.length) > 3 && (
                <div style={{
                  color: '#6b7280',
                  fontSize: '9px',
                  fontStyle: 'italic'
                }}>
                  +{(events.length + daysOff.length) - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;