"use client"

import { useState } from 'react';
import { AttendanceAlert } from '../components/utilities/alertUtils';

// TODO: Replace with L's interfaces when available
// These temporary interfaces will be replaced by:
// - L's types/thresholds.ts for ThresholdFormData 
// - L's types/alerts.ts for AlertThreshold
// - L's utils/thresholdValidation.ts for validation logic

// Temporary interface - will use L's types/thresholds.ts
export interface ThresholdFormData {
  absenceThreshold: number;
  latenessThreshold: number;
  timeframe: '30-day' | 'cumulative';
}

// Temporary interface - will use L's types/alerts.ts  
export interface AlertThreshold {
  id: string;
  teacherId: string;
  absenceLimit: number;
  latenessLimit: number;
  timeframe: '30-day' | 'cumulative';
  createdAt: Date;
}

// Re-export the existing AttendanceAlert interface for compatibility
export type { AttendanceAlert };

// Alert modal management hook - handles all modal workflows
export function useAlertModals() {
  
  // Modal visibility states
  const [thresholdModal, setThresholdModal] = useState(false);
  const [alertDropdown, setAlertDropdown] = useState(false);
  const [dismissModal, setDismissModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);

  // Form data states
  const [thresholdForm, setThresholdForm] = useState<ThresholdFormData>({
    absenceThreshold: 5,
    latenessThreshold: 10,
    timeframe: '30-day'
  });

  // Selected alert for details/dismissal
  const [selectedAlert, setSelectedAlert] = useState<AttendanceAlert | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState<any>({});

  // TODO: Replace with L's validation utilities
  // This validation logic will be replaced by L's utils/thresholdValidation.ts
  // Will use: validateAlertThreshold(), validateTimeframe(), sanitizeThresholdInput()
  const validateThresholdForm = (data: ThresholdFormData) => {
    // Temporary basic validation - will use L's utils/thresholdValidation.ts
    const newErrors: any = {};
    
    if (data.absenceThreshold < 1) {
      newErrors.absenceThreshold = 'Must be at least 1';
    }
    if (data.latenessThreshold < 1) {
      newErrors.latenessThreshold = 'Must be at least 1';
    }
    if (data.absenceThreshold > 50) {
      newErrors.absenceThreshold = 'Must be 50 or less';
    }
    if (data.latenessThreshold > 100) {
      newErrors.latenessThreshold = 'Must be 100 or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle threshold update workflow
  const handleThresholdUpdate = async (thresholds: ThresholdFormData) => {
    // TODO: Replace validation with L's utilities
    // Will use: sanitizeThresholdInput(thresholds) before validation
    if (!validateThresholdForm(thresholds)) return;

    try {
      // TODO: Integration with J's API endpoint
      // await fetch('/api/alerts/thresholds', { method: 'POST', body: JSON.stringify(thresholds) });
      
      console.log('Updating thresholds:', thresholds);
      setThresholdModal(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating thresholds:', error);
    }
  };

  // Handle alert dismissal workflow
  const handleAlertDismiss = async (alertId: string, reason?: string) => {
    try {
      // TODO: Integration with J's API endpoint
      // await fetch(`/api/alerts/${alertId}/dismiss`, { method: 'POST', body: JSON.stringify({ reason }) });
      
      console.log('Dismissing alert:', alertId, reason);
      setDismissModal(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setAlertDropdown(!alertDropdown);
  };

  // Show alert details modal
  const showAlertDetails = (alert: AttendanceAlert) => {
    setSelectedAlert(alert);
    setDetailsModal(true);
  };

  // Close all modals - cleanup function
  const closeAllModals = () => {
    setThresholdModal(false);
    setAlertDropdown(false);
    setDismissModal(false);
    setDetailsModal(false);
    setSelectedAlert(null);
    setErrors({});
  };

  return {
    // Modal states
    thresholdModal,
    alertDropdown,
    dismissModal,
    detailsModal,
    
    // Modal controls
    setThresholdModal,
    setAlertDropdown,
    setDismissModal,
    setDetailsModal,
    
    // Form data
    thresholdForm,
    setThresholdForm,
    selectedAlert,
    setSelectedAlert,
    errors,
    
    // Workflow functions
    handleThresholdUpdate,
    handleAlertDismiss,
    showAlertDetails,
    handleDropdownToggle,
    validateThresholdForm,
    closeAllModals
  };
}