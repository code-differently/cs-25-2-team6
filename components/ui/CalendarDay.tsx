import React from 'react';
import { DayOffReason } from '../../src/domains/DayOffReason';

interface CalendarDayProps {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  isPlannedDayOff: boolean;
  dayOffReason?: DayOffReason;
  attendanceCount?: {
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  onClick: (date: string) => void;
  className?: string;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  dayNumber,
  isCurrentMonth,
  isToday,
  isWeekend,
  isSelected,
  isPlannedDayOff,
  dayOffReason,
  attendanceCount,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (isCurrentMonth) {
      onClick(date);
    }
  };

  const getDayClasses = () => {
    const baseClasses = ['calendar-day'];
    
    if (!isCurrentMonth) baseClasses.push('calendar-day--other-month');
    if (isToday) baseClasses.push('calendar-day--today');
    if (isWeekend) baseClasses.push('calendar-day--weekend');
    if (isSelected) baseClasses.push('calendar-day--selected');
    if (isPlannedDayOff) baseClasses.push('calendar-day--planned-off');
    if (!isCurrentMonth) baseClasses.push('calendar-day--disabled');
    
    return baseClasses.join(' ');
  };

  const getReasonBadge = () => {
    if (!isPlannedDayOff || !dayOffReason) return null;
    
    const reasonMap = {
      [DayOffReason.HOLIDAY]: { label: 'Holiday', color: '#dc3545' },
      [DayOffReason.PROF_DEV]: { label: 'Prof Dev', color: '#007bff' },
      [DayOffReason.REPORT_CARD]: { label: 'Reports', color: '#6f42c1' },
      [DayOffReason.OTHER]: { label: 'Other', color: '#6c757d' }
    };

    const reason = reasonMap[dayOffReason];
    if (!reason) return null;

    return (
      <div 
        className="calendar-day__reason-badge"
        style={{ backgroundColor: reason.color }}
      >
        {reason.label}
      </div>
    );
  };

  const getAttendanceSummary = () => {
    if (!attendanceCount || !isCurrentMonth) return null;

    const total = attendanceCount.present + attendanceCount.late + attendanceCount.absent + attendanceCount.excused;
    if (total === 0) return null;

    return (
      <div className="calendar-day__attendance">
        <div className="attendance-dots">
          {attendanceCount.present > 0 && (
            <div 
              className="attendance-dot attendance-dot--present"
              title={`${attendanceCount.present} present`}
            />
          )}
          {attendanceCount.late > 0 && (
            <div 
              className="attendance-dot attendance-dot--late"
              title={`${attendanceCount.late} late`}
            />
          )}
          {attendanceCount.absent > 0 && (
            <div 
              className="attendance-dot attendance-dot--absent"
              title={`${attendanceCount.absent} absent`}
            />
          )}
          {attendanceCount.excused > 0 && (
            <div 
              className="attendance-dot attendance-dot--excused"
              title={`${attendanceCount.excused} excused`}
            />
          )}
        </div>
        <div className="attendance-total">{total}</div>
      </div>
    );
  };

  return (
    <div 
      className={`${getDayClasses()} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={isCurrentMonth ? 0 : -1}
      aria-label={`${date}${isToday ? ' (today)' : ''}${isPlannedDayOff ? ` (${dayOffReason})` : ''}`}
    >
      <div className="calendar-day__header">
        <span className="calendar-day__number">{dayNumber}</span>
        {getReasonBadge()}
      </div>
      
      {getAttendanceSummary()}
      
      {isWeekend && !isPlannedDayOff && (
        <div className="calendar-day__weekend-indicator">
          Weekend
        </div>
      )}
    </div>
  );
  // End of CalendarDay component
};

export default CalendarDay;