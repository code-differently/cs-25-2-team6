'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RAGQueryBox from '@/components/RAGQueryBox';
import QuerySuggestions from '@/components/QuerySuggestions';

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
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Filters</h3>
            <div className="reports-placeholder">
              <div className="placeholder-content">
                <h4 className="text-md font-medium mb-2">Filter Options Coming Soon</h4>
                <p className="text-gray-600 mb-4">This will include:</p>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>• Filter by student name</li>
                  <li>• Filter by date range</li>
                  <li>• Filter by attendance status</li>
                  <li>• Multiple filter combinations</li>
                  <li>• Export functionality</li>
                  <li>• Visual charts and graphs</li>
                </ul>
              </div>
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
