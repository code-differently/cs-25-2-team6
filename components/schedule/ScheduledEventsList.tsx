'use client';

import React, { useState } from 'react';
import { useScheduleCalendar } from '../../src/services/hooks/useScheduleCalendar';

interface ScheduledEventsListProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const ScheduledEventsList: React.FC<ScheduledEventsListProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const {
    events,
    daysOff,
    getEventsForDate,
    getDaysOffForDate,
    isLoading,
    refreshScheduleData
  } = useScheduleCalendar();

  const [activeTab, setActiveTab] = useState<'events' | 'daysoff'>('events');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedDateDaysOff = getDaysOffForDate(selectedDate);

  // Inject required days off
  const requiredDaysOff = [
    {
      id: 'pd-2025-10-31',
      date: '2025-10-31',
      type: 'Professional Development',
      reason: 'Professional Development Day',
      status: 'approved',
      teacherName: 'All Students'
    },
    {
      id: 'thanksgiving-2025-11-26',
      date: '2025-11-26',
      type: 'Holiday',
      reason: 'Thanksgiving Break',
      status: 'approved',
      teacherName: 'Building Closed'
    },
    {
      id: 'thanksgiving-2025-11-27',
      date: '2025-11-27',
      type: 'Holiday',
      reason: 'Thanksgiving Break',
      status: 'approved',
      teacherName: 'Building Closed'
    },
    {
      id: 'thanksgiving-2025-11-28',
      date: '2025-11-28',
      type: 'Holiday',
      reason: 'Thanksgiving Break',
      status: 'approved',
      teacherName: 'Building Closed'
    }
  ];

  // Combine daysOff with requiredDaysOff for filtering
  const allDaysOff = [...daysOff, ...requiredDaysOff];

  // Filter days off based on filterStatus
  const filteredDaysOff = (filterStatus === 'all'
    ? allDaysOff
    : allDaysOff.filter(dayOff => dayOff.status === filterStatus)
  ).filter(dayOff => dayOff.teacherName !== 'John Smith' && dayOff.teacherName !== 'Jane Doe');
  

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#3b82f6';
      case 'class': return '#10b981';
      case 'event': return '#8b5cf6';
      case 'holiday': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#111827',
          marginBottom: '16px' 
        }}>
          Schedule Details
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '16px',
                height: '80px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px' 
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#111827',
          margin: 0
        }}>
          Schedule Details
        </h3>
        
        <button
          onClick={refreshScheduleData}
          style={{
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            color: '#374151',
            fontSize: '12px'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Selected Date Info */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#475569',
          margin: '0 0 4px 0'
        }}>
          Selected Date
        </h4>
        <p style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1e293b',
          margin: 0
        }}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '16px'
      }}>
        
        <button
          onClick={() => setActiveTab('daysoff')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            color: activeTab === 'daysoff' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'daysoff' ? '600' : '400',
            borderBottom: activeTab === 'daysoff' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: '14px'
          }}
        >
          Days Off ({selectedDateDaysOff.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'events' ? (
        <div>
          {/* Selected Date Events */}
          {selectedDateEvents.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Events for Selected Date
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      border: `1px solid ${getEventTypeColor(event.type)}40`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {event.title}
                      </h5>
                      <span style={{
                        backgroundColor: getEventTypeColor(event.type),
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        {event.type}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: '0 0 4px 0'
                    }}>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                    
                    {event.location && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                      }}>
                        📍 {event.location}
                      </p>
                    )}
                    
                    {event.description && (
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#374151',
                        margin: 0
                      }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Upcoming Events */}
          <div>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              All Upcoming Events
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => (
                  <div
                    key={event.id}
                    onClick={() => onDateSelect(new Date(event.date))}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = getEventTypeColor(event.type);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {event.title}
                      </h5>
                      <span style={{
                        backgroundColor: getEventTypeColor(event.type),
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        {event.type}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {formatDate(event.date)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Filter for days off */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              fontSize: '12px', 
              color: '#374151', 
              marginBottom: '4px',
              display: 'block'
            }}>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#374151',
                width: '100%'
              }}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Selected Date Days Off */}
          {selectedDateDaysOff.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                Days Off for Selected Date
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedDateDaysOff.map(dayOff => (
                  <div
                    key={dayOff.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      border: `1px solid ${getStatusColor(dayOff.status)}40`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {dayOff.teacherName}
                      </h5>
                      <span style={{
                        backgroundColor: getStatusColor(dayOff.status),
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        {dayOff.status}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: '0 0 4px 0'
                    }}>
                      Type: {dayOff.type}
                    </p>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#374151',
                      margin: 0
                    }}>
                      {dayOff.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Days Off */}
          <div>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              Upcoming Days Off
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredDaysOff
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(dayOff => (
                  <div
                    key={dayOff.id}
                    onClick={() => onDateSelect(new Date(dayOff.date))}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = getStatusColor(dayOff.status);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {dayOff.teacherName}
                      </h5>
                      <span style={{
                        backgroundColor: getStatusColor(dayOff.status),
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        {dayOff.status}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {formatDate(dayOff.date)} • {dayOff.type} • {dayOff.reason}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'events' && events.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Events Scheduled</h4>
          <p style={{ fontSize: '14px' }}>No events are currently scheduled.</p>
        </div>
      )}

      {activeTab === 'daysoff' && filteredDaysOff.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏖️</div>
          <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Days Off Requests</h4>
          <p style={{ fontSize: '14px' }}>No days off requests match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default ScheduledEventsList;