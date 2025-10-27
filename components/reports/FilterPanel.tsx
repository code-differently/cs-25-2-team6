'use client';
import { useState, useEffect } from 'react';
import { useReportFilters } from '@/hooks/useReportFilters';
import FilterDropdown from './FilterDropdown';
import FilterChips from './FilterChips';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SavedFiltersModal from './SavedFiltersModal';
import LoadingSpinner from '../ui/LoadingSpinner';
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

  // State for generated report data
  const [reportRows, setReportRows] = useState<ReportRowType[]>([]);

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

  // Handler for Generate Report button
  const handleGenerateReport = async () => {
    const selectedStudents = filters.filters.studentNames;
    let studentsToFetch = selectedStudents;
    if (!studentsToFetch || studentsToFetch.length === 0) {
      studentsToFetch = studentOptions.map(opt => opt.label);
    }
    setLoading(true);
    try {
      const attendanceResults = await Promise.all(
        studentsToFetch.map(async (studentName) => {
          const student = studentOptions.find(opt => opt.label === studentName);
          if (!student) return null;
          const res = await fetch(`/api/data/attendance?studentId=${encodeURIComponent(student.value)}`);
          if (!res.ok) return null;
          const attendance = await res.json();
          return { student, attendance };
        })
      );
      const validResults = attendanceResults.filter(Boolean);
      // Use dateFrom and dateTo from filters
      const { dateFrom, dateTo } = filters.filters;
      const report: ReportRowType[] = validResults.map(({ student, attendance }: any) => {
        const name = student.label;
        const studentId = student.value;
        // Filter attendance by date range if present
        let filteredAttendance = attendance;
        if (dateFrom && dateTo) {
          const startDate = new Date(dateFrom);
          const endDate = new Date(dateTo);
          filteredAttendance = attendance.filter((a: any) => {
            const date = new Date(a.dateISO);
            return date >= startDate && date <= endDate;
          });
        }
        const totalRecords = filteredAttendance.length;
        const presentCount = filteredAttendance.filter((a: any) => a.status === 'PRESENT').length;
        const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
        // Status: most recent record's status, or 'N/A' if none
        let status = 'N/A';
        if (filteredAttendance.length > 0) {
          // Sort by dateISO descending
          const sorted = [...filteredAttendance].sort((a: any, b: any) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
          status = sorted[0].status;
        }
        return { name, studentId, attendanceRate, status };
      });
      setReportRows(report);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance data.');
      setLoading(false);
    }
  };

  // Handler to clear all filters and report
  const handleClearAll = () => {
    filters.clearAllFilters();
    setReportRows([]);
  };

  return (
    <div className="filter-panel">
      {(loading && !reportRows.length) && (
        <LoadingSpinner message="Loading filter options..." overlay />
      )}
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
        <button className="primary-btn" onClick={handleGenerateReport}>Generate Report</button>
        <button onClick={handleClearAll} className="secondary-btn">Clear All</button>
      </div>

      {/* Report Table */}
      <div className="report-table-container" style={{ marginTop: 32 }}>
        {reportRows.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '18px', fontWeight: 500 }}>No report generated yet</div>
            <div style={{ fontSize: '14px', marginTop: 8 }}>Click "Generate Report" to see attendance data.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontSize: 15 }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Student ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Attendance Rate</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row, idx) => (
                  <tr key={row.studentId} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 500 }}>{row.name}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>{row.studentId}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', color: row.attendanceRate >= 90 ? '#059669' : row.attendanceRate >= 75 ? '#f59e0b' : '#dc2626', fontWeight: 600 }}>{row.attendanceRate}%</td>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', textTransform: 'capitalize', color: row.status === 'PRESENT' ? '#059669' : row.status === 'ABSENT' ? '#dc2626' : '#f59e0b', fontWeight: 500 }}>{row.status.replace('_', ' ').toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

// Report row type for attendance report
interface ReportRowType {
  name: string;
  studentId: string;
  attendanceRate: number;
  status: string;
}

export default FilterPanel;