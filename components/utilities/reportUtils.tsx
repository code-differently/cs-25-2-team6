import React, { ReactElement } from 'react';
import { AttendanceStatus } from '../../src/domains/AttendanceStatus';
import { ReportFilters } from '../../src/domains/ReportFilters';

/**
 * Formats a student's first and last name with proper capitalization and spacing
 * @param firstName - Student's first name
 * @param lastName - Student's last name
 * @returns Formatted full name string
 */
export const formatStudentName = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) {
    return 'Unknown Student';
  }
  
  const formatName = (name: string): string => {
    if (!name || typeof name !== 'string') return '';
    return name.trim()
      .split('-')
      .map(part => 
        part.trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      )
      .join('-');
  };

  const formattedFirst = formatName(firstName);
  const formattedLast = formatName(lastName);

  if (!formattedFirst && !formattedLast) {
    return 'Unknown Student';
  }
  
  if (!formattedFirst) {
    return formattedLast;
  }
  
  if (!formattedLast) {
    return formattedFirst;
  }

  return `${formattedFirst} ${formattedLast}`;
};

/**
 * Maps attendance status to appropriate color for status badges
 * @param status - AttendanceStatus enum value
 * @returns CSS color string for the status
 */
export const getStatusBadgeColor = (status: AttendanceStatus): string => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return '#28a745'; // Green
    case AttendanceStatus.LATE:
      return '#ffc107'; // Yellow/Amber
    case AttendanceStatus.ABSENT:
      return '#dc3545'; // Red
    case AttendanceStatus.EXCUSED:
      return '#6c757d'; // Gray
    default:
      return '#6c757d'; // Default gray
  }
};

/**
 * Formats attendance percentage with proper decimal places and percentage symbol
 * @param present - Number of present records
 * @param total - Total number of records
 * @returns Formatted percentage string (e.g., "87.5%")
 */
export const formatAttendancePercentage = (present: number, total: number): string => {
  if (total === 0) {
    return '0%';
  }
  
  if (present < 0 || total < 0) {
    return '0%';
  }
  
  if (present > total) {
    return '100%';
  }

  const percentage = (present / total) * 100;
  
  // Round to 1 decimal place, but don't show .0
  const rounded = Math.round(percentage * 10) / 10;
  
  if (rounded === Math.floor(rounded)) {
    return `${Math.floor(rounded)}%`;
  }
  
  return `${rounded}%`;
};

/**
 * Determines if any filters are currently active
 * @param filters - ReportFilters object to check
 * @returns Boolean indicating if any filters are applied
 */
export const isFilterActive = (filters: ReportFilters): boolean => {
  if (!filters || typeof filters !== 'object') {
    return false;
  }

  return Boolean(
    (filters.lastName && filters.lastName.trim() !== '') ||
    filters.status !== undefined ||
    (filters.dateISO && filters.dateISO.trim() !== '')
  );
};

/**
 * Renders appropriate icon for attendance status
 * @param status - AttendanceStatus enum value
 * @returns ReactElement containing the status icon
 */
export const renderStatusIcon = (status: AttendanceStatus): ReactElement => {
  const iconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    display: 'inline-block'
  };

  switch (status) {
    case AttendanceStatus.PRESENT:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#28a745"/>
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    
    case AttendanceStatus.LATE:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#ffc107"/>
          <polyline points="12,6 12,12 16,14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    
    case AttendanceStatus.ABSENT:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#dc3545"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    
    case AttendanceStatus.EXCUSED:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#6c757d"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    
    default:
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#6c757d"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
  }
};

/**
 * Calculates dynamic table height based on number of rows with reasonable min/max constraints
 * @param rowCount - Number of rows in the table
 * @returns CSS height string (e.g., "400px")
 */
export const calculateTableHeight = (rowCount: number): string => {
  const ROW_HEIGHT = 45; // pixels per row
  const HEADER_HEIGHT = 50; // pixels for table header
  const MIN_HEIGHT = 200; // minimum table height
  const MAX_HEIGHT = 600; // maximum table height
  const PADDING = 20; // additional padding

  if (rowCount < 0) {
    return `${MIN_HEIGHT}px`;
  }

  const calculatedHeight = (rowCount * ROW_HEIGHT) + HEADER_HEIGHT + PADDING;
  
  // Apply min and max constraints
  const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, calculatedHeight));
  
  return `${constrainedHeight}px`;
};