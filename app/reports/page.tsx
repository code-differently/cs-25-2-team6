'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ReportsDashboard from '../../components/reports/ReportDashboard';
import DashboardLayout from '@/components/DashboardLayout'
import FilterPanel from '@/components/reports/FilterPanel'

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="reports-container">
        <h1 className="page-title">📊 Attendance Reports</h1>
        <p className="page-description">
          Comprehensive attendance analytics and insights
        </p>
        
        {/* Main Reports Dashboard */}
        <ReportsDashboard />
        <FilterPanel />
        
        {/* Placeholder for Reports results */}
        <div className="reports-placeholder">
          <div className="placeholder-content">
            <h3>Report Results</h3>
            <p>Filtered attendance data will appear here after clicking "Generate Report".</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}