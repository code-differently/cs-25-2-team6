import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  studentId?: string;
  status?: 'present' | 'late' | 'absent' | 'excused' | 'ALL';
  classId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  earlyDismissal?: boolean;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface SummaryStats {
  totalStudents: number;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  presentRate: number;
  attendanceRate: number;
  earlyDismissalCount: number;
}

export interface ReportData extends AttendanceRecord {}

export function useReportData(filters: ReportFilters) {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized summary statistics
  const summaryStats = useMemo((): SummaryStats => {
    const totalRecords = data.length;
    const uniqueStudents = new Set(data.map(record => record.studentId)).size;
    
    const statusCounts = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const presentCount = statusCounts['present'] || 0;
    const lateCount = statusCounts['late'] || 0;
    const absentCount = statusCounts['absent'] || 0;
    const excusedCount = statusCounts['excused'] || 0;
    
    const attendanceRate = totalRecords > 0 ? 
      ((presentCount + lateCount + excusedCount) / totalRecords) * 100 : 0;
    const presentRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;
    
    const earlyDismissalCount = data.filter(record => record.earlyDismissal === true).length;

    return {
      totalStudents: uniqueStudents,
      totalRecords,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      presentRate: Math.round(presentRate * 10) / 10,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      earlyDismissalCount,
    };
  }, [data]);

  // Fetch data function
  const fetchReportData = useCallback(async (currentFilters: ReportFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
        ...(currentFilters.status && currentFilters.status !== 'ALL' && { status: currentFilters.status }),
        ...(currentFilters.studentId && { studentId: currentFilters.studentId }),
        ...(currentFilters.classId && { classId: currentFilters.classId }),
      });

      const response = await fetch(`/api/reports/attendance?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report data: ${response.statusText}`);
      }

      const responseData = await response.json();
      setData(responseData.records || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data function
  const refreshData = useCallback(() => {
    fetchReportData(filters);
  }, [fetchReportData, filters]);

  // Export function
  const exportData = useCallback(async (format: ExportFormat, exportData: ReportData[]) => {
    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data: exportData,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `attendance-report-${timestamp}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Export failed');
    }
  }, [filters]);

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchReportData(filters);
  }, [fetchReportData, filters]);

  return {
    data,
    summaryStats,
    loading,
    error,
    refreshData,
    exportData,
  };
}