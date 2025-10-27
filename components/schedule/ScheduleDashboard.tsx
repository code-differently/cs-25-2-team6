'use client';

import React from 'react';
import { useScheduleCalendar } from '../../src/services/hooks/useScheduleCalendar';

interface ScheduleDashboardProps {
  selectedDate: Date;
}

const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({ selectedDate }) => {
  const { daysOff, events, isLoading } = useScheduleCalendar(selectedDate);

  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  // Calculate statistics
  const pendingDaysOff = daysOff.filter(day => day.status === 'pending').length;
  const approvedDaysOff = daysOff.filter(day => day.status === 'approved').length;
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  }).length;

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  }).length;

  if (isLoading) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px' 
      }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              height: '120px',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite'
            }}
          />
        ))}
      </div>
    );
  }


  
};

export default ScheduleDashboard;