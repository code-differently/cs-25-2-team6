'use client';
import { useState } from 'react';
import { useReportFilters } from '@/hooks/useReportFilters';
import FilterDropdown from './FilterDropdown';
import FilterChips from './FilterChips';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SavedFiltersModal from './SavedFiltersModal';
import './FilterPanel.css';

function FilterPanel() {
  const filters = useReportFilters();
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Sample data
  const studentOptions = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Martinez', 'Ethan Williams'];
  const classOptions = ['Math 101', 'English 202', 'Science 303'];
  const statusOptions = ['Present', 'Late', 'Excused Absence', 'Unexcused Absence'];

  // Simple handlers - more beginner friendly
  const handleStudentChange = (selectedValues: string[]) => {
    filters.handleStudentMultiSelect(selectedValues);
  };

  const handleClassChange = (selectedValues: string[]) => {
    filters.handleMultiSelect('classes', selectedValues);
  };

  const handleStatusChange = (selectedValues: string[]) => {
    filters.handleMultiSelect('attendanceStatuses', selectedValues);
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    if (filterType === 'dateRange') {
      filters.handleDateRangeChange(null as any, null as any);
    } else if (value) {
      filters.handleFilterToggle(filterType, value, false);
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
          selectedValues={filters.filters.studentNames}
          onChange={handleStudentChange}
        />
        
        <FilterDropdown
          label="Classes"
          options={classOptions}
          selectedValues={filters.filters.classes}
          onChange={handleClassChange}
        />
        
        <FilterDropdown
          label="Attendance Status"
          options={statusOptions}
          selectedValues={filters.filters.attendanceStatuses}
          onChange={handleStatusChange}
        />
      </div>

      <FilterChips
        filters={filters.filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={filters.clearAllFilters}
      />

      <div className="filter-actions">
        <button className="primary-btn">Generate Report</button>
        <button onClick={filters.clearAllFilters} className="secondary-btn">Clear All</button>
      </div>

      <AdvancedFiltersModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        filters={filters.filters}
        onDateRangeChange={filters.handleDateRangeChange}
      />

      <SavedFiltersModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onSavePreset={filters.saveFilterPreset}
        currentFilters={filters.filters}
      />
    </div>
  );
}

export default FilterPanel;
