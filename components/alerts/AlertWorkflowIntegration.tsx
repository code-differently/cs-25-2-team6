/* AlertWorkflowIntegration.tsx - Complete integration example */
'use client';

import React from 'react';
import { useAlertModals } from '../../hooks/useAlertModals';
import { AttendanceAlert } from '../utilities/alertUtils';
import ThresholdSettingsModal from './ThresholdSettingsModal';
import AlertDropdown from './AlertDropdown';
import DismissAlertModal from './DismissAlertModal';
import AlertDetailsModal from './AlertDetailsModal';

// TODO: Integration with L's utilities when available:
// import { validateAlertThreshold, validateTimeframe } from '../utils/thresholdValidation';
// import { AlertThreshold, ThresholdFormData } from '../types/thresholds';
// import { getDefaultThresholds } from '../constants/alertConstants';

// Sample alert data for testing using existing AttendanceAlert interface
const sampleAlerts = [
  {
    id: '1',
    studentId: 'STU001',
    type: 'attendance' as const,
    severity: 'high' as const,
    title: 'John Smith - Excessive Absences',
    message: '8 absences this month',
    date: new Date(),
    isRead: false,
    isDismissed: false,
    metadata: {
      attendanceCount: 8,
      absenceStreak: 3,
      attendanceRate: 75
    }
  },
  {
    id: '2',
    studentId: 'STU002',
    type: 'tardiness' as const,
    severity: 'medium' as const,
    title: 'Jane Doe - Late Arrivals',
    message: '12 late arrivals this month',
    date: new Date(Date.now() - 86400000),
    isRead: false,
    isDismissed: false,
    metadata: {
      tardinessCount: 12,
      attendanceRate: 85
    }
  }
];

export default function AlertWorkflowIntegration() {
  const {
    // Modal states
    thresholdModal,
    alertDropdown,
    dismissModal,
    detailsModal,
    
    // Modal controls
    setThresholdModal,
    
    // Form data
    thresholdForm,
    selectedAlert,
    
    // Workflow functions
    handleThresholdUpdate,
    handleAlertDismiss,
    showAlertDetails,
    handleDropdownToggle,
    closeAllModals
  } = useAlertModals();

  const handleDismissFromDetails = () => {
    closeAllModals();
    if (selectedAlert) {
      showAlertDetails(selectedAlert);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Alert Management System Integration</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Demo Controls</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setThresholdModal(true)}
            style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Open Threshold Settings
          </button>
          
          <button 
            onClick={handleDropdownToggle}
            style={{ padding: '8px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Toggle Alert Dropdown
          </button>
          
          <button 
            onClick={() => showAlertDetails(sampleAlerts[0])}
            style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            View John's Alert Details
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Current Settings</h2>
        <p><strong>Absence Threshold:</strong> {thresholdForm.absenceThreshold}</p>
        <p><strong>Lateness Threshold:</strong> {thresholdForm.latenessThreshold}</p>
        <p><strong>Timeframe:</strong> {thresholdForm.timeframe}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Sample Alerts</h2>
        {sampleAlerts.map(alert => (
          <div 
            key={alert.id} 
            style={{ 
              padding: '12px', 
              margin: '8px 0', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              backgroundColor: alert.severity === 'high' ? '#fef2f2' : alert.severity === 'medium' ? '#fffbeb' : '#f0f9ff'
            }}
          >
            <strong>{alert.title}</strong> - {alert.type} ({alert.severity} priority)
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={() => showAlertDetails(alert)}
                style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Components */}
      <ThresholdSettingsModal
        isOpen={thresholdModal}
        formData={thresholdForm}
        errors={{}}
        onFormChange={(data) => console.log('Form changed:', data)}
        onSubmit={handleThresholdUpdate}
        onClose={() => setThresholdModal(false)}
      />

      <AlertDropdown
        isOpen={alertDropdown}
        alerts={sampleAlerts}
        onToggle={handleDropdownToggle}
        onAlertClick={showAlertDetails}
        onViewAll={() => console.log('View all alerts')}
        onClose={() => handleDropdownToggle()}
      />

      {selectedAlert && (
        <>
          <DismissAlertModal
            alert={selectedAlert}
            isOpen={dismissModal}
            onConfirm={handleAlertDismiss}
            onCancel={closeAllModals}
          />

          <AlertDetailsModal
            alert={selectedAlert}
            isOpen={detailsModal}
            onClose={closeAllModals}
            onDismiss={handleDismissFromDetails}
          />
        </>
      )}
    </div>
  );
}