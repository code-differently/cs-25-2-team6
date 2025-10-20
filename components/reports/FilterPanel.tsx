'use client';
import { useState } from 'react';
import { useReportFilters } from '@/hooks/useReportFilters';
import FilterDropdown from './FilterDropdown';
import FilterChips from './FilterChips';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SavedFiltersModal from './SavedFiltersModal';
import './FilterPanel.css';

function FilterPanel() {
  const hook = useReportFilters();
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Sample data
  const studentOptions = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Martinez', 'Ethan Williams'];
  const classOptions = ['Math 101', 'English 202', 'Science 303'];
  const statusOptions = ['Present', 'Late', 'Excused Absence', 'Unexcused Absence'];

  const handleStudentChange = (selectedValues: string[]) => {
    hook.handleStudentMultiSelect(selectedValues);
  };

  const handleClassChange = (selectedValues: string[]) => {
    hook.filters.classes.forEach(value => {
      if (!selectedValues.includes(value)) {
        hook.handleFilterToggle('classes', value, false);
      }
    });
    selectedValues.forEach(value => {
      if (!hook.filters.classes.includes(value)) {
        hook.handleFilterToggle('classes', value, true);
      }
    });
  };

  const handleStatusChange = (selectedValues: string[]) => {
    hook.filters.attendanceStatuses.forEach(value => {
      if (!selectedValues.includes(value)) {
        hook.handleFilterToggle('attendanceStatuses', value, false);
      }
    });
    selectedValues.forEach(value => {
      if (!hook.filters.attendanceStatuses.includes(value)) {
        hook.handleFilterToggle('attendanceStatuses', value, true);
      }
    });
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    if (filterType === 'dateRange') {
      hook.handleDateRangeChange(null as any, null as any);
    } else if (value) {
      hook.handleFilterToggle(filterType, value, false);
    }
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>📊 Filter Reports</h3>
        <div className="header-actions">
          <button onClick={() => setShowSavedModal(true)} className="secondary-btn">
            Saved Filters
          </button>
          <button onClick={() => setShowAdvancedModal(true)} className="secondary-btn">
            Advanced
          </button>
        </div>
      </div>

      <div className="filter-controls">
        <FilterDropdown
          label="Student Names"
          options={studentOptions}
          selectedValues={hook.filters.studentNames}
          onChange={handleStudentChange}
        />
        
        <FilterDropdown
          label="Classes"
          options={classOptions}
          selectedValues={hook.filters.classes}
          onChange={handleClassChange}
        />
        
        <FilterDropdown
          label="Attendance Status"
          options={statusOptions}
          selectedValues={hook.filters.attendanceStatuses}
          onChange={handleStatusChange}
        />
      </div>

      <FilterChips
        filters={hook.filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={hook.clearAllFilters}
      />

      <div className="filter-actions">
        <button className="primary-btn">Generate Report</button>
        <button onClick={hook.clearAllFilters} className="secondary-btn">Clear All</button>
      </div>

      <AdvancedFiltersModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        filters={hook.filters}
        onDateRangeChange={hook.handleDateRangeChange}
      />

      <SavedFiltersModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onSavePreset={hook.saveFilterPreset}
        currentFilters={hook.filters}
      />
    </div>
  );
}

export default FilterPanel;
