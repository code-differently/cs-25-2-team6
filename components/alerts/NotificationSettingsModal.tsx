"use client"

import React, { useState } from 'react';
import './Alerts.css';
import { AttendanceAlert, getAlertSeverityColor } from '../utilities/alertUtils';

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  timing: 'immediate' | 'daily' | 'weekly';
  includeDetails: boolean;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  alert: AttendanceAlert | null;
  onConfirm: (alert: AttendanceAlert, settings: NotificationSettings) => void;
  onCancel: () => void;
}

// Notification Settings Modal - configure parent notification preferences
export default function NotificationSettingsModal({
  isOpen,
  alert,
  onConfirm,
  onCancel
}: NotificationSettingsModalProps) {

  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    timing: 'immediate',
    includeDetails: true
  });

  if (!isOpen || !alert) return null;

  // Update setting
  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle confirmation
  const handleConfirm = () => {
    onConfirm(alert, settings);
  };

  // Get severity color
  // Use existing utility function

  return (
    <div className="modal-overlay">
      <div className="modal-content notification-modal">
        
        <div className="modal-header">
          <h2>Parent Notification Settings</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          
          <div className="alert-context">
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

          <div className="notification-form">
            
            <div className="form-section">
              <h3>Notification Methods</h3>
              
              <div className="toggle-group">
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                  />
                  <span className="toggle-label">Email notification</span>
                </label>
                
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    checked={settings.smsEnabled}
                    onChange={(e) => updateSetting('smsEnabled', e.target.checked)}
                  />
                  <span className="toggle-label">SMS notification</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3>Timing</h3>
              <select
                value={settings.timing}
                onChange={(e) => updateSetting('timing', e.target.value)}
                className="timing-select"
              >
                <option value="immediate">Send immediately</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly summary</option>
              </select>
            </div>

            <div className="form-section">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={settings.includeDetails}
                  onChange={(e) => updateSetting('includeDetails', e.target.checked)}
                />
                <span className="toggle-label">Include detailed attendance information</span>
              </label>
            </div>

          </div>

          <div className="info-box">
            <div className="info-icon">📧</div>
            <div className="info-content">
              Notifications will be sent to the parent/guardian contacts on file for this student.
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="button" 
            className="send-btn"
            onClick={handleConfirm}
            disabled={!settings.emailEnabled && !settings.smsEnabled}
          >
            Send Notification
          </button>
        </div>

      </div>
    </div>
  );
}