'use client';
import { useState, useEffect } from 'react';
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

  // State for options
  const [studentOptions, setStudentOptions] = useState<{ value: string; label: string }[]>([]);
  const [classOptions, setClassOptions] = useState<{ value: string; label: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch options from API on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/data/students').then(res => res.json()),
      fetch('/api/data/classes').then(res => res.json()),
      fetch('/api/data/attendance-statuses').then(res => res.json())
    ])
      .then(([students, classes, statuses]) => {
        if (Array.isArray(students) && students.length && students[0].firstName && students[0].lastName) {
          setStudentOptions(students.map((s: any) => ({
            value: s.studentId || `${s.firstName}_${s.lastName}`,
            label: `${s.firstName} ${s.lastName}`
          })));
        } else if (Array.isArray(students)) {
          setStudentOptions(students.map((s: any) => ({ value: s, label: s })));
        }
        if (Array.isArray(classes)) {
          setClassOptions(classes.map((c: string) => ({ value: c, label: c })));
        }
        if (Array.isArray(statuses)) {
          setStatusOptions(statuses.map((s: string) => ({ value: s, label: s })));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load filter options.');
        setLoading(false);
      });
  }, []);

  // Fetch students for selected classes
  useEffect(() => {
    if (!filters.filters.classes || filters.filters.classes.length === 0) {
      fetch('/api/data/students')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length && data[0].firstName && data[0].lastName) {
            setStudentOptions(data.map((s: any) => ({
              value: s.studentId || `${s.firstName}_${s.lastName}`,
              label: `${s.firstName} ${s.lastName}`
            })));
          } else if (Array.isArray(data)) {
            setStudentOptions(data.map((s: any) => ({ value: s, label: s })));
          } else {
            setStudentOptions([]);
          }
        })
        .catch(() => setStudentOptions([]));
      return;
    }
    Promise.all(
      filters.filters.classes.map((className: string) =>
        fetch(`/api/data/students?class=${encodeURIComponent(className)}`).then(res => res.json())
      )
    ).then((results) => {
      const allStudents = results.flat();
      const seen = new Set();
      const unique = allStudents.filter((s: any) => {
        const key = s.studentId || `${s.firstName}_${s.lastName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setStudentOptions(unique.map((s: any) => ({
        value: s.studentId || `${s.firstName}_${s.lastName}`,
        label: `${s.firstName} ${s.lastName}`
      })));
    }).catch(() => setStudentOptions([]));
  }, [filters.filters.classes]);

  // Update handlers and dropdowns to use id/label
  const handleStudentChange = (selectedIds: string[]) => {
    // Find labels for selected ids
    const selectedLabels = studentOptions.filter(opt => selectedIds.includes(opt.value)).map(opt => opt.label);
    filters.handleStudentMultiSelect(selectedLabels);
  };

  const handleClassChange = (selectedValues: string[]) => {
    // Remove unselected items
    filters.filters.classes.forEach(value => {
      if (!selectedValues.includes(value)) {
        filters.handleFilterToggle('classes', value, false);
      }
    });
    // Add newly selected items
    selectedValues.forEach(value => {
      if (!filters.filters.classes.includes(value)) {
        filters.handleFilterToggle('classes', value, true);
      }
    });
  };

  const handleStatusChange = (selectedValues: string[]) => {
    // Remove unselected items
    filters.filters.attendanceStatuses.forEach(value => {
      if (!selectedValues.includes(value)) {
        filters.handleFilterToggle('attendanceStatuses', value, false);
      }
    });
    // Add newly selected items
    selectedValues.forEach(value => {
      if (!filters.filters.attendanceStatuses.includes(value)) {
        filters.handleFilterToggle('attendanceStatuses', value, true);
      }
    });
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
      {loading && <div className="loading-spinner">Loading filter options...</div>}
      {error && <div className="error-message">{error}</div>}

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
          selectedValues={(filters.filters.studentNames || []).map(name => {
            const found = studentOptions.find(opt => opt.label === name);
            return found ? found.value : '';
          }).filter(Boolean)}
          onChange={(selectedIds) => {
            const selectedLabels = studentOptions.filter(opt => selectedIds.includes(opt.value)).map(opt => opt.label);
            filters.handleStudentMultiSelect(selectedLabels);
          }}
        />
        {studentOptions.length === 0 && !loading && !error && (
          <div className="no-students-message">No students found.</div>
        )}
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