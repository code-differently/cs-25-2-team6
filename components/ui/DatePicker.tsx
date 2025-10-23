import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  showToday?: boolean;
  className?: string;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select a date',
  disabled = false,
  minDate,
  maxDate,
  showToday = true,
  className = '',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setInputValue(formatDisplayDate(date));
      setCurrentMonth(date);
    } else {
      setInputValue('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string): Date | null => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const isDateDisabled = (date: Date): boolean => {
    const dateStr = formatISODate(date);
    
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Try to parse the input value
    const date = parseDate(inputValue);
    if (date && !isDateDisabled(date)) {
      onChange(formatISODate(date));
    } else if (inputValue === '') {
      onChange('');
    } else {
      // Reset to previous value if invalid
      if (value) {
        setInputValue(formatDisplayDate(new Date(value)));
      } else {
        setInputValue('');
      }
    }
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      const isoDate = formatISODate(date);
      onChange(isoDate);
      setIsOpen(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    if (!isDateDisabled(today)) {
      onChange(formatISODate(today));
      setCurrentMonth(today);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and how many days to show from previous month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks) for consistent calendar grid
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`date-picker ${className}`} ref={containerRef}>
      {label && (
        <label className="date-picker__label">
          {label}
        </label>
      )}
      
      <div className={`date-picker__input-container ${error ? 'has-error' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="date-picker__input"
          autoComplete="off"
        />
        <button
          type="button"
          className="date-picker__toggle"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label="Open calendar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {error && (
        <div className="date-picker__error">
          {error}
        </div>
      )}

      {isOpen && (
        <div className="date-picker__dropdown">
          <div className="date-picker__header">
            <button
              type="button"
              className="date-picker__nav-button"
              onClick={() => navigateMonth('prev')}
              aria-label="Previous month"
            >
              &#8249;
            </button>
            <h4 className="date-picker__month-year">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              type="button"
              className="date-picker__nav-button"
              onClick={() => navigateMonth('next')}
              aria-label="Next month"
            >
              &#8250;
            </button>
          </div>

          <div className="date-picker__weekdays">
            {weekDays.map(day => (
              <div key={day} className="date-picker__weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="date-picker__days">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = formatISODate(day) === formatISODate(today);
              const isSelected = selectedDate && formatISODate(day) === formatISODate(selectedDate);
              const isDisabled = isDateDisabled(day);

              return (
                <button
                  key={index}
                  type="button"
                  className={`date-picker__day ${
                    !isCurrentMonth ? 'date-picker__day--other-month' : ''
                  } ${
                    isToday ? 'date-picker__day--today' : ''
                  } ${
                    isSelected ? 'date-picker__day--selected' : ''
                  } ${
                    isDisabled ? 'date-picker__day--disabled' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  aria-label={formatDisplayDate(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {showToday && (
            <div className="date-picker__footer">
              <button
                type="button"
                className="date-picker__today-button"
                onClick={handleTodayClick}
                disabled={isDateDisabled(today)}
              >
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;