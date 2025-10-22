'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RAGQueryBox from '@/components/RAGQueryBox';
import QuerySuggestions from '@/components/QuerySuggestions';
import FilterPanel from '@/components/reports/FilterPanel';
import AttendanceDataTable, { type AttendanceRecord, type ExportFormat } from '@/components/reports/AttendanceDataTable';
import AttendanceChart, { type ChartType } from '@/components/reports/AttendanceChart';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';

export default function Reports() {
  const [selectedQuery, setSelectedQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [showTraditionalFilters, setShowTraditionalFilters] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };
  
  // Mock data for development - replace with actual data later
  const mockData = {
    totalStudents: 150,
    presentCount: 120,
    absentCount: 20,
    lateCount: 10,
    attendanceRate: 85.5,
    records: Array(25).fill(null).map((_, i) => ({
      id: i.toString(),
      studentId: `s${i + 1}`,
      studentName: `Student ${i + 1}`,
      className: `Class ${Math.floor(i / 5) + 1}`,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      status: ['present', 'absent', 'late', 'excused'][Math.floor(Math.random() * 4)] as 'present' | 'absent' | 'late' | 'excused',
      timeIn: '09:00',
      timeOut: '15:00',
      notes: `Note for student ${i + 1}`,
      earlyDismissal: false
    }))
  };

  const handleSelectQuery = (query: string) => {
    setSelectedQuery(query);
  };

  const handleQueryResults = (results: any) => {
    setQueryResults(results);
  };

  return (
    <DashboardLayout>
      <div className="reports-container space-y-6">
        <div>
          <h1 className="page-title">📊 Attendance Reports</h1>
          <p className="page-description">
            Ask questions about attendance data or use traditional filters to analyze patterns.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setShowTraditionalFilters(false)}
            className={`px-4 py-2 rounded-md font-medium ${
              !showTraditionalFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💬 Ask Questions
          </button>
          <button
            onClick={() => setShowTraditionalFilters(true)}
            className={`px-4 py-2 rounded-md font-medium ${
              showTraditionalFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔍 Traditional Filters
          </button>
        </div>

        {/* Natural Language Query Interface */}
        {!showTraditionalFilters && (
          <div className="space-y-6">
            <RAGQueryBox
              onResults={handleQueryResults}
              className="w-full"
            />
            
            {!queryResults && (
              <QuerySuggestions
                onSelectQuery={handleSelectQuery}
                className="w-full"
              />
            )}
          </div>
        )}

        {/* Traditional Filters Interface */}
        {showTraditionalFilters && (
          <div className="space-y-6">
            <FilterPanel />
            
            <ReportSummaryCards
              totalStudents={mockData.totalStudents}
              presentCount={mockData.presentCount}
              absentCount={mockData.absentCount}
              lateCount={mockData.lateCount}
              attendanceRate={mockData.attendanceRate}
              isLoading={false}
            />

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
                <div className="flex space-x-2">
                  {(['bar', 'line', 'area'] as ChartType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
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
                data={mockData.records}
                chartType={chartType}
                onChartTypeChange={handleChartTypeChange}
              />
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                <p className="text-sm text-gray-600 mt-1">Detailed view of all attendance records</p>
              </div>
              <AttendanceDataTable
                data={mockData.records}
                isLoading={false}
                onSort={(column, direction) => {
                  console.log('Sort:', column, direction);
                }}
                onPageChange={(page, pageSize) => {
                  console.log('Page change:', page, pageSize);
                }}
                onExport={(format) => {
                  console.log('Export:', format);
                }}
                totalRecords={mockData.records.length}
                currentPage={1}
                pageSize={25}
              />
            </div>
          </div>
        )}

        {/* Query Results Display */}
        {queryResults && !showTraditionalFilters && (
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Data Summary</h4>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600">
                    Additional detailed data visualization and tables will be displayed here based on your query results.
                  </p>
                  {/* Future: Add charts, tables, and detailed breakdowns */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🚀 New AI-Powered Queries</h4>
          <p className="text-sm text-blue-800">
            Try asking questions in plain English! Our AI can understand queries like "Show me students with low attendance" 
            or "Which students were absent yesterday?" and automatically generate the right reports for you.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
