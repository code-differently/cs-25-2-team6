'use client';

import React, { useState, useEffect } from 'react';

interface DatePickerProps {
  label?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  className?: string;
  id?: string;
  name?: string;
  showCalendarIcon?: boolean;
}

export default function DataPicker({
  label,
  value = '',
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className,
  id,
  name,
  showCalendarIcon = true,
}: DatePickerProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [validationError, setValidationError] = useState<string>('');

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Validation function
  const validateDate = (dateString: string): string => {
    if (required && !dateString) {
      return 'Date is required';
    }

    if (dateString) {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }

      // Check min date constraint
      if (minDate && dateString < minDate) {
        const minDateObj = new Date(minDate);
        return `Date must be after ${formatDisplayDate(minDateObj)}`;
      }

      // Check max date constraint
      if (maxDate && dateString > maxDate) {
        const maxDateObj = new Date(maxDate);
        return `Date must be before ${formatDisplayDate(maxDateObj)}`;
      }
    }

    return '';
  };

  // Handle date input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Validate the new value
    const validationError = validateDate(newValue);
    setValidationError(validationError);
    
    // Call parent onChange
    onChange(newValue);
  };

  // Format date for display (e.g., "Jan 15, 2024")
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get the current error (prop error takes precedence)
  const currentError = error || validationError;

  return (
    <div className={`flex flex-col space-y-1 ${className || ''}`}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="date"
          id={id}
          name={name}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={minDate}
          max={maxDate}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${currentError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${!showCalendarIcon ? 'date-input-no-icon' : ''}
          `.trim()}
        />
        
        {/* Optional: Custom calendar icon overlay */}
        {showCalendarIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
      </div>
      
      {currentError && (
        <p className="text-sm text-red-600">{currentError}</p>
      )}
      
      {/* Helper text showing selected date in readable format */}
      {internalValue && !currentError && (
        <p className="text-xs text-gray-500">
          Selected: {formatDisplayDate(new Date(internalValue))}
        </p>
      )}
    </div>
  );
}

// Export helper functions for common date operations
export const dateHelpers = {
  // Get today's date in YYYY-MM-DD format
  today: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  // Format Date object to YYYY-MM-DD string
  formatISO: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Parse YYYY-MM-DD string to Date object
  parseISO: (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  },

  // Add days to a date
  addDays: (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return dateHelpers.formatISO(date);
  },

  // Check if date is weekend
  isWeekend: (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  },

  // Check if date is today
  isToday: (dateString: string): boolean => {
    return dateString === dateHelpers.today();
  },

  // Check if date is in the future
  isFuture: (dateString: string): boolean => {
    return dateString > dateHelpers.today();
  },

  // Check if date is in the past
  isPast: (dateString: string): boolean => {
    return dateString < dateHelpers.today();
  },

  // Get formatted display date
  formatDisplay: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Validation helpers
export const dateValidators = {
  required: (value: string): string => {
    return value ? '' : 'Date is required';
  },

  notFuture: (value: string): string => {
    return dateHelpers.isFuture(value) ? 'Date cannot be in the future' : '';
  },

  notPast: (value: string): string => {
    return dateHelpers.isPast(value) ? 'Date cannot be in the past' : '';
  }
};