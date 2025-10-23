"use client"

import React, { useState } from 'react';
import './Alerts.css';
import { AttendanceAlert, getAlertSeverityColor } from '../utilities/alertUtils';
import DismissButton from '../ui/DismissButton';

interface DismissAlertModalProps {
  isOpen: boolean;
  alert: AttendanceAlert | null;
  onConfirm: (alertId: string, reason?: string) => void;
  onCancel: () => void;
}

// Dismiss Alert Modal - confirmation dialog for dismissing alerts
export default function DismissAlertModal({
  isOpen,
  alert,
  onConfirm,
  onCancel
}: DismissAlertModalProps) {

  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !alert) return null;

  // Predefined dismissal reasons
  const dismissalReasons = [
    'Issue resolved',
    'Parent contacted',
    'Student excused',
    'Administrative override',
    'Other'
  ];

  // Handle confirmation
  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    onConfirm(alert.id, reason || undefined);
    setSelectedReason('');
    setCustomReason('');
  };

  // Use existing utility function

  return (
    <div className="modal-overlay">
      <div className="modal-content dismiss-modal">
        
        <div className="modal-header">
          <h2>Dismiss Alert</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          
          <div className="alert-summary">
            <div className="alert-info">
              <div className="alert-student">{alert.title}</div>
              <div className="alert-details">
                {alert.message}
              </div>
            </div>
            <div 
              className="alert-severity-badge"
              style={{ backgroundColor: getAlertSeverityColor(alert.severity) }}
            >
              {alert.severity}
            </div>
          </div>

          <div className="dismissal-form">
            <label className="form-label">Reason for dismissal (optional):</label>
            
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="reason-select"
            >
              <option value="">No reason specified</option>
              {dismissalReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>

            {selectedReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify the reason..."
                className="custom-reason-input"
                rows={3}
              />
            )}
          </div>

          <div className="warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-text">
              This alert will be permanently dismissed and removed from your active alerts list.
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <DismissButton
            label="Dismiss Alert"
            variant="danger"
            onDismiss={handleConfirm}
            requireConfirmation={false}
          />
        </div>

      </div>
    </div>
  );
}