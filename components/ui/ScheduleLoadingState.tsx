import React from 'react';

interface ScheduleLoadingStateProps {
  message?: string;
  showCalendar?: boolean;
  showEvents?: boolean;
  className?: string;
}

const ScheduleLoadingState: React.FC<ScheduleLoadingStateProps> = ({
  message = "Loading schedule...",
  showCalendar = false,
  showEvents = false,
  className = ''
}) => {
  const CalendarSkeleton = () => (
    <div className="schedule-loading__calendar">
      <div className="calendar-header-skeleton">
        <div className="skeleton-box calendar-nav"></div>
        <div className="skeleton-box calendar-title"></div>
        <div className="skeleton-box calendar-nav"></div>
      </div>
      <div className="calendar-weekdays">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton-box weekday-skeleton"></div>
        ))}
      </div>
      <div className="calendar-grid-skeleton">
        {Array.from({ length: 35 }, (_, i) => (
          <div key={i} className="skeleton-box calendar-day-skeleton"></div>
        ))}
      </div>
    </div>
  );

  const EventsSkeleton = () => (
    <div className="schedule-loading__events">
      <div className="skeleton-box events-title"></div>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="event-skeleton">
          <div className="skeleton-box event-date"></div>
          <div className="skeleton-box event-content">
            <div className="skeleton-box event-title"></div>
            <div className="skeleton-box event-description"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`schedule-loading-state ${className}`}>
      <div className="loading-header">
        <div className="loading-spinner-container">
          <div className="schedule-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
        <div className="loading-message">
          <h3 className="loading-title">{message}</h3>
          <p className="loading-subtitle">
            Please wait while we fetch your schedule data...
          </p>
        </div>
      </div>

      {showCalendar && (
        <div className="loading-content">
          <CalendarSkeleton />
        </div>
      )}

      {showEvents && (
        <div className="loading-content">
          <EventsSkeleton />
        </div>
      )}

      {(showCalendar || showEvents) && (
        <div className="loading-footer">
          <div className="skeleton-box loading-action-button"></div>
        </div>
      )}
    </div>
  );
};

export default ScheduleLoadingState;