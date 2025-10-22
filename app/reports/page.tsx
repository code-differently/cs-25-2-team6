'use client';

import DashboardLayout from '@/components/DashboardLayout';
import FilterPanel from '@/components/reports/FilterPanel';
import RAGQueryBox from '@/components/RAGQueryBox';

export default function Reports() {
  const handleQueryResults = (results: any) => {
    console.log('Query results:', results);
  };
  
  // Add error boundary handling
  const handleRagError = (error: Error) => {
    console.error("RAG query error:", error);
    // Could implement a UI notification here
  };

  return (
    <DashboardLayout>
      <div className="reports-container space-y-6">
        <div className="mb-6">
          <h1 className="page-title mb-2">📊 Attendance Reports</h1>
          <p className="page-description mb-4">
            Use natural language to query attendance data
          </p>
          
          <div className="max-w-4xl mx-auto">
            <RAGQueryBox 
              onResults={handleQueryResults} 
              className="w-full"
              placeholder="Type a query like 'show me students with absences this week' or 'list all attendance alerts'"
            />
            <p className="text-xs text-gray-500 mt-2 pl-2">
              Pro tip: Try asking specific questions about attendance patterns, alerts, or individual students
            </p>
          </div>
        </div>

        {/* Filter Panel without the RAG Query Box */}
        <FilterPanel />
      </div>
    </DashboardLayout>
  );
}
