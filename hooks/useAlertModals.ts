"use client"

import { useState } from 'react';

// Alert modal interfaces - simple and beginner-friendly
export interface ThresholdFormData {
  absenceThreshold: number;
  latenessThreshold: number;
  timeframe: '30-day' | 'cumulative';
}

export interface AlertThreshold {
  id: string;
  studentId?: string;
  absenceLimit: number;
  latenessLimit: number;
  timeframe: '30-day' | 'cumulative';
  createdAt: Date;
}

export interface AttendanceAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'absence' | 'lateness';
  count: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
  dismissed: boolean;
}

// Alert modal management hook - handles all modal workflows
export function useAlertModals() {
  
  // Modal visibility states
  const [thresholdModal, setThresholdModal] = useState(false);
  const [alertDropdown, setAlertDropdown] = useState(false);
  const [dismissModal, setDismissModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
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

  // Validate threshold form - simple validation
  const validateThresholdForm = (data: ThresholdFormData) => {
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

  // Show parent notification confirmation
  const showNotificationConfirmation = (alert: AttendanceAlert) => {
    setSelectedAlert(alert);
    setNotificationModal(true);
  };

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setAlertDropdown(!alertDropdown);
  };

  // Close all modals - cleanup function
  const closeAllModals = () => {
    setThresholdModal(false);
    setAlertDropdown(false);
    setDismissModal(false);
    setNotificationModal(false);
    setDetailsModal(false);
    setSelectedAlert(null);
    setErrors({});
  };

  return {
    // Modal states
    thresholdModal,
    alertDropdown,
    dismissModal,
    notificationModal,
    detailsModal,
    
    // Modal controls
    setThresholdModal,
    setAlertDropdown,
    setDismissModal,
    setNotificationModal,
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
    showNotificationConfirmation,
    handleDropdownToggle,
    validateThresholdForm,
    closeAllModals
  };
}