'use client';

import React, { useState, useCallback } from 'react';
import { useReportData } from 'src/services/hooks/useReportData';
import ReportSummaryCards from './ReportSummaryCards';
import AttendanceDataTable from './AttendanceDataTable';
import AttendanceChart from './AttendanceChart';
/* import DataPicker from '../DataPicker'; */

export interface ReportFilters {
  startDate: string;
  endDate: string;
  studentId?: string;
  status?: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED' | 'ALL';
  classId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  earlyDismissal: boolean;
  className?: string;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'area';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export default function ReportDashboard() {
  // Filter state
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // Today
    status: 'ALL',
  });

  // Chart configuration state
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showChart, setShowChart] = useState(true);

  // Use the report data hook
  const {
    data: reportData,
    summaryStats,
    loading,
    error,
    refreshData,
    exportData
  } = useReportData(filters);

  // Filter update handlers
  const handleFilterChange = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleDateRangeChange = useCallback((startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  }, []);

  const handleStatusFilter = useCallback((status: ReportFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  // Export handler
  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      await exportData(format, reportData);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  }, [exportData, reportData]);

  // Chart type change
  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowChart(!showChart)}
            style={{ 
                backgroundColor: loading ? '#9CA3AF' : '#3B82F6', 
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showChart ? 'Hide Charts' : 'Show Charts'}
          </button>
          
          <button
            onClick={refreshData}
            disabled={loading}
            style={{ 
                backgroundColor: loading ? '#9CA3AF' : '#3B82F6', 
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1F2937' }}>Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          {/*
          <DataPicker
            label="Start Date"
            value={filters.startDate}
            onChange={(date) => handleFilterChange({ startDate: date })}
            className="w-full"
          />
          
          <DataPicker
            label="End Date"
            value={filters.endDate}
            onChange={(date) => handleFilterChange({ endDate: date })}
            className="w-full"
          />
        */}
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value as ReportFilters['status'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>
              Export
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <ReportSummaryCards 
        summaryStats={summaryStats}
        loading={loading}
        dateRange={{
          startDate: filters.startDate,
          endDate: filters.endDate
        }}
      />

      {/* Charts Section */}
      {showChart && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold " style={{ color: '#1F2937' }}>
              Attendance Trends
            </h2>
            
            <div className="flex space-x-2">
              {(['bar', 'line', 'pie', 'area'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleChartTypeChange(type)}
                  className={`px-3 py-1 text-sm rounded capitalize ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <AttendanceChart
            data={reportData}
            chartType={chartType}
            loading={loading}
            filters={filters}
          />
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b" style={{ color: '#1F2937' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
            Detailed Attendance Records
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {reportData.length} records found
          </p>
        </div>
        
        <AttendanceDataTable
          data={reportData}
          loading={loading}
          onExport={handleExport}
          filters={filters}
        />
      </div>
    </div>
  );
}