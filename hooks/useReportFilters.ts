import { useState, useEffect } from 'react';

export interface ReportFilters {
  studentNames: string[];
  classes: string[];
  attendanceStatuses: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: ReportFilters;
  createdAt: Date;
}

const defaultFilters: ReportFilters = {
  studentNames: [],
  classes: [],
  attendanceStatuses: [],
  dateFrom: null,
  dateTo: null
};

export function useReportFilters() {
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reportFilters');
    if (saved) {
      const parsedFilters = JSON.parse(saved);
      setFilters({
        ...parsedFilters,
        dateFrom: parsedFilters.dateFrom ? new Date(parsedFilters.dateFrom) : null,
        dateTo: parsedFilters.dateTo ? new Date(parsedFilters.dateTo) : null
      });
    }
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('reportFilters', JSON.stringify(filters));
  }, [filters]);

  const handleFilterToggle = (filterType: string, value: any, checked: boolean) => {
    setFilters(prev => {
      if (filterType === 'studentNames' || filterType === 'classes' || filterType === 'attendanceStatuses') {
        const currentArray = prev[filterType as keyof ReportFilters] as string[];
        if (checked) {
          return { ...prev, [filterType]: [...currentArray, value] };
        } else {
          return { ...prev, [filterType]: currentArray.filter(item => item !== value) };
        }
      }
      return prev;
    });
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setFilters(prev => ({
      ...prev,
      dateFrom: startDate,
      dateTo: endDate
    }));
  };

  const handleStudentMultiSelect = (studentIds: string[]) => {
    setFilters(prev => ({
      ...prev,
      studentNames: studentIds
    }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const saveFilterPreset = (name: string, filtersToSave: ReportFilters) => {
    const presets = JSON.parse(localStorage.getItem('filterPresets') || '{}');
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: filtersToSave,
      createdAt: new Date()
    };
    presets[newPreset.id] = newPreset;
    localStorage.setItem('filterPresets', JSON.stringify(presets));
  };

  return {
    filters,
    handleFilterToggle,
    handleDateRangeChange,
    handleStudentMultiSelect,
    clearAllFilters,
    saveFilterPreset
  };
}