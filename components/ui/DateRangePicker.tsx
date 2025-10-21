import React, { useState } from 'react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (dateRange: DateRange) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  className = '',
  disabled = false,
  minDate,
  maxDate
}) => {
  const [startDate, setStartDate] = useState(value?.startDate || '');
  const [endDate, setEndDate] = useState(value?.endDate || '');

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    const newRange = { startDate: date, endDate };
    onChange(newRange);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    const newRange = { startDate, endDate: date };
    onChange(newRange);
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`date-range-picker ${className}`}>
      {label && (
        <label className="date-range-label">
          {label}
        </label>
      )}
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date" className="date-input-label">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={formatDateForInput(startDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
            min={minDate}
            max={endDate || maxDate}
            className="date-input"
          />
        </div>
        <div className="date-input-separator">to</div>
        <div className="date-input-group">
          <label htmlFor="end-date" className="date-input-label">
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={formatDateForInput(endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            disabled={disabled}
            min={startDate || minDate}
            max={maxDate}
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;