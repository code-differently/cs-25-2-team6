'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RAGQueryBox from '@/components/RAGQueryBox';
import QuerySuggestions from '@/components/QuerySuggestions';
import DashboardLayout from '@/components/DashboardLayout'
import FilterPanel from '@/components/reports/FilterPanel'

export default function Reports() {
  const [selectedQuery, setSelectedQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [showTraditionalFilters, setShowTraditionalFilters] = useState(false);

  const handleSelectQuery = (query: string) => {
    setSelectedQuery(query);
  };

  const handleQueryResults = (results: any) => {
    setQueryResults(results);
  };

  return (
    <DashboardLayout>
      <div className="reports-container">
        <h1 className="page-title">📊 Attendance Reports</h1>
        <p className="page-description">
          View and filter attendance reports by student, date, or status.
        </p>
        
        <FilterPanel />
        
        {/* Placeholder for Reports results */}
        <div className="reports-placeholder">
          <div className="placeholder-content">
            <h3>Report Results</h3>
            <p>Filtered attendance data will appear here after clicking "Generate Report".</p>
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
