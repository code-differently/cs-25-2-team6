'use client';

import React, { useState } from 'react';
import AlertsList from './AlertsList';
import AlertSummaryStats from './AlertSummaryStats';
import StudentInterventionPanel from './StudentInterventionPanel';
import { useAlerts, AlertFilters } from '../../src/services/hooks/useAlerts';

export default function AlertsDashboard() {
  const [filters, setFilters] = useState<AlertFilters>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showInterventionPanel, setShowInterventionPanel] = useState(false);

  const {
    alerts,
    loading,
    error,
    handleAlertSort,
    handleAlertFilter,
    handleBulkAlertActions,
    refreshAlertData
  } = useAlerts(filters);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowInterventionPanel(true);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p style={{ color: '#111827' }}>Error loading alerts: {error}</p>
        <button 
          onClick={refreshAlertData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', minHeight: '60vh' }}>
      {/* Summary Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <AlertSummaryStats alerts={alerts} loading={loading} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '24px'
      }}>
        {/* Main Alerts List */}
        <div>
          <AlertsList
            alerts={alerts}
            loading={loading}
            onSort={handleAlertSort}
            onFilter={handleAlertFilter}
            onBulkAction={handleBulkAlertActions}
            onStudentSelect={handleStudentSelect}
          />
        </div>

        {/* Student Intervention Panel */}
        <div>
          {showInterventionPanel && selectedStudentId ? (
            <StudentInterventionPanel
              studentId={selectedStudentId}
              onClose={() => setShowInterventionPanel(false)}
              onInterventionAdded={refreshAlertData}
            />
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '32px 24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Student Interventions
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Select a student from the alerts list to view and manage their interventions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}