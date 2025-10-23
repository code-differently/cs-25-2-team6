"use client"

import React, { useState } from 'react';
import './DismissAlertModal.css';
import { AttendanceAlert } from '@/hooks/useAlertModals';

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

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

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
              <div className="alert-student">{alert.studentName}</div>
              <div className="alert-details">
                {alert.count} {alert.type}s • Threshold: {alert.threshold}
              </div>
            </div>
            <div 
              className="alert-severity-badge"
              style={{ backgroundColor: getSeverityColor(alert.severity) }}
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
          <button 
            type="button" 
            className="dismiss-btn"
            onClick={handleConfirm}
          >
            Dismiss Alert
          </button>
        </div>

      </div>
    </div>
  );
}