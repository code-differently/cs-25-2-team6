import React, { ReactElement } from 'react';
import { DayOffReason } from '../../src/domains/DayOffReason';
import { DayOff } from '../../src/persistence/FileScheduleRepo';

/**
 * Formats a date for display purposes with various format options
 * @param date - Date object to format
 * @param format - Format type ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export const formatDisplayDate = (date: Date, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  try {
    switch (format) {
      case 'short':
        // Format: 10/21/25
        return date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        });
      
      case 'medium':
        // Format: Oct 21, 2025
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'long':
        // Format: October 21, 2025
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'full':
        // Format: Monday, October 21, 2025
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Maps day-off reasons to appropriate display colors
 * @param reason - Day off reason string or DayOffReason enum
 * @returns CSS color string for the reason
 */
export const getReasonDisplayColor = (reason: string | DayOffReason): string => {
  // Normalize the reason to handle both string and enum values
  const normalizedReason = typeof reason === 'string' ? reason.toUpperCase() : reason;

  switch (normalizedReason) {
    case DayOffReason.HOLIDAY:
    case 'HOLIDAY':
      return '#dc3545'; // Red for holidays
    
    case DayOffReason.PROF_DEV:
    case 'PROF_DEV':
    case 'PROFESSIONAL_DEVELOPMENT':
      return '#007bff'; // Blue for professional development
    
    case DayOffReason.REPORT_CARD:
    case 'REPORT_CARD':
    case 'REPORT_CARD_CONFERENCES':
      return '#6f42c1'; // Purple for report card days
    
    case DayOffReason.OTHER:
    case 'OTHER':
      return '#6c757d'; // Gray for other reasons
    
    default:
      // Fallback color for unknown reasons
      return '#6c757d';
  }
};

/**
 * Determines if a given date falls on a weekend (Saturday or Sunday)
 * @param date - Date object to check
 * @returns Boolean indicating if the date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Checks if a specific date is a scheduled day off
 * @param date - Date object to check
 * @param scheduledDays - Array of scheduled day off objects
 * @returns Boolean indicating if the date is a scheduled day off
 */
export const isScheduledDay = (date: Date, scheduledDays: DayOff[]): boolean => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  if (!Array.isArray(scheduledDays)) {
    return false;
  }

  // Convert date to ISO string (YYYY-MM-DD format)
  const dateISO = date.toISOString().split('T')[0];

  // Check if any scheduled day matches this date
  return scheduledDays.some(scheduledDay => {
    if (!scheduledDay || typeof scheduledDay.dateISO !== 'string') {
      return false;
    }
    return scheduledDay.dateISO === dateISO;
  });
};

/**
 * Formats student count text for affected students display
 * @param count - Number of affected students
 * @returns Formatted text string describing the count
 */
export const calculateAffectedStudentsText = (count: number): string => {
  if (typeof count !== 'number' || count < 0) {
    return 'Invalid count';
  }

  if (count === 0) {
    return 'No students affected';
  }

  if (count === 1) {
    return '1 student affected';
  }

  // Format large numbers with commas
  const formattedCount = count.toLocaleString();
  
  if (count < 10) {
    return `${formattedCount} students affected`;
  }

  if (count < 100) {
    return `${formattedCount} students affected`;
  }

  if (count < 1000) {
    return `${formattedCount} students affected`;
  }

  // For very large numbers, provide additional context
  return `${formattedCount} students affected (${count} total)`;
};

/**
 * Renders the content for a calendar day including events and status indicators
 * @param date - Date object for the calendar day
 * @param events - Array of day off events for this date
 * @param options - Additional rendering options
 * @returns ReactElement containing the day's content
 */
export const renderCalendarDayContent = (
  date: Date,
  events: DayOff[] = [],
  options: {
    showAttendance?: boolean;
    showEventDetails?: boolean;
    attendanceData?: {
      present: number;
      late: number;
      absent: number;
      excused: number;
    };
    onClick?: (date: Date, events: DayOff[]) => void;
  } = {}
): ReactElement => {
  const {
    showAttendance = false,
    showEventDetails = true,
    attendanceData,
    onClick
  } = options;

  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="calendar-day-content invalid">
        <span className="day-number">?</span>
        <div className="error-message">Invalid Date</div>
      </div>
    );
  }

  const dayNumber = date.getDate();
  const isWeekendDay = isWeekend(date);
  const isScheduledDayOff = isScheduledDay(date, events);
  const scheduledEvent = events.find(event => {
    const eventDate = new Date(event.dateISO);
    return eventDate.toDateString() === date.toDateString();
  });

  const handleClick = () => {
    if (onClick) {
      onClick(date, events);
    }
  };

  const renderEventBadge = () => {
    if (!scheduledEvent || !showEventDetails) return null;

    const color = getReasonDisplayColor(scheduledEvent.reason);
    const reasonLabels = {
      [DayOffReason.HOLIDAY]: 'Holiday',
      [DayOffReason.PROF_DEV]: 'Prof Dev',
      [DayOffReason.REPORT_CARD]: 'Reports',
      [DayOffReason.OTHER]: 'Other'
    };

    return (
      <div 
        className="event-badge"
        style={{ backgroundColor: color }}
        title={`${reasonLabels[scheduledEvent.reason]} - ${formatDisplayDate(date, 'medium')}`}
      >
        {reasonLabels[scheduledEvent.reason]}
      </div>
    );
  };

  const renderAttendanceDots = () => {
    if (!showAttendance || !attendanceData) return null;

    const { present, late, absent, excused } = attendanceData;
    const total = present + late + absent + excused;

    if (total === 0) return null;

    return (
      <div className="attendance-summary">
        <div className="attendance-dots">
          {present > 0 && (
            <div 
              className="attendance-dot present"
              title={`${present} present`}
              style={{ backgroundColor: '#28a745' }}
            />
          )}
          {late > 0 && (
            <div 
              className="attendance-dot late"
              title={`${late} late`}
              style={{ backgroundColor: '#ffc107' }}
            />
          )}
          {absent > 0 && (
            <div 
              className="attendance-dot absent"
              title={`${absent} absent`}
              style={{ backgroundColor: '#dc3545' }}
            />
          )}
          {excused > 0 && (
            <div 
              className="attendance-dot excused"
              title={`${excused} excused`}
              style={{ backgroundColor: '#6c757d' }}
            />
          )}
        </div>
        <div className="attendance-total">{total}</div>
      </div>
    );
  };

  const renderWeekendIndicator = () => {
    if (!isWeekendDay || isScheduledDayOff) return null;

    return (
      <div className="weekend-indicator">
        Weekend
      </div>
    );
  };

  return (
    <div 
      className={`calendar-day-content ${isWeekendDay ? 'weekend' : ''} ${isScheduledDayOff ? 'scheduled-off' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${formatDisplayDate(date, 'full')}${isScheduledDayOff ? ` - ${scheduledEvent?.reason}` : ''}${isWeekendDay ? ' - Weekend' : ''}`}
    >
      <div className="day-header">
        <span className="day-number">{dayNumber}</span>
        {renderEventBadge()}
      </div>
      
      {renderAttendanceDots()}
      {renderWeekendIndicator()}
      
      {isScheduledDayOff && attendanceData && (
        <div className="scheduled-info">
          <div className="affected-students">
            {calculateAffectedStudentsText(
              attendanceData.present + attendanceData.late + attendanceData.absent + attendanceData.excused
            )}
          </div>
        </div>
      )}
    </div>
  );
};