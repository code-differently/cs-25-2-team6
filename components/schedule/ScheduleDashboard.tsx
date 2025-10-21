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

  const dashboardCards = [
    {
      title: 'Pending Requests',
      value: pendingDaysOff,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Approved Days Off',
      value: approvedDaysOff,
      icon: '✅',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents,
      icon: '📅',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Today\'s Events',
      value: todayEvents,
      icon: '🎯',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    }
  ];

  return (
    <div>
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#111827',
        marginBottom: '16px' 
      }}>
        Schedule Overview
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px' 
      }}>
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${card.color}20`
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#6b7280',
                margin: 0
              }}>
                {card.title}
              </h3>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                {card.icon}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: card.color,
              marginBottom: '4px'
            }}>
              {card.value}
            </div>
            
            <div style={{ 
              fontSize: '12px', 
              color: '#9ca3af' 
            }}>
              This month
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleDashboard;