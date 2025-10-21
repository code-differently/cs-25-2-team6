'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ReportsDashboard from '../../components/reports/ReportDashboard';

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
      </div>
    </DashboardLayout>
  );
}