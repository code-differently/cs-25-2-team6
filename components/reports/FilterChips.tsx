'use client'
import { ReportFilters } from '@/hooks/useReportFilters';
import './FilterChips.css';

interface FilterChipsProps {
  filters: ReportFilters;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  const activeFilters: Array<{ type: string; label: string; value?: string }> = [];

  // Add student name chips
  filters.studentNames.forEach(name => {
    activeFilters.push({
      type: 'studentNames',
      label: `Student: ${name}`,
      value: name
    });
  });

  // Add class chips
  filters.classes.forEach(className => {
    activeFilters.push({
      type: 'classes',
      label: `Class: ${className}`,
      value: className
    });
  });

  // Add attendance status chips
  filters.attendanceStatuses.forEach(status => {
    activeFilters.push({
      type: 'attendanceStatuses',
      label: `Status: ${status}`,
      value: status
    });
  });

  // Add date range chip
  if (filters.dateFrom || filters.dateTo) {
    const fromDate = filters.dateFrom?.toLocaleDateString() || 'Start';
    const toDate = filters.dateTo?.toLocaleDateString() || 'End';
    activeFilters.push({
      type: 'dateRange',
      label: `Date: ${fromDate} - ${toDate}`
    });
  }

  if (activeFilters.length === 0) return null;

  const handleRemoveFilter = (filter: typeof activeFilters[0]) => {
    if (filter.type === 'dateRange') {
      onRemoveFilter('dateRange');
    } else {
      onRemoveFilter(filter.type, filter.value);
    }
  };

  return (
    <div className="filter-chips">
      <div className="chips-header">
        <span className="chips-label">Active Filters:</span>
        {activeFilters.length > 1 && (
          <button onClick={onClearAll} className="clear-all-btn">
            Clear All
          </button>
        )}
      </div>
      
      <div className="chips-container">
        {activeFilters.map((filter, index) => (
          <div key={`${filter.type}-${filter.value || 'range'}-${index}`} className="filter-chip">
            <span className="chip-label">{filter.label}</span>
            <button 
              onClick={() => handleRemoveFilter(filter)}
              className="chip-remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilterChips;