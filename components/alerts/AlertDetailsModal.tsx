/* AlertDetailsModal.tsx */
import React, { useState } from 'react';
import { AttendanceAlert, getAlertSeverityColor } from '../utilities/alertUtils';
import './Alerts.css';

interface AlertDetailsModalProps {
  alert: AttendanceAlert;
  isOpen: boolean;
  onClose: () => void;
  onDismiss: () => void;
}

export default function AlertDetailsModal({ 
  alert, 
  isOpen, 
  onClose, 
  onDismiss 
}: AlertDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  
  if (!isOpen) return null;
  
  // Use existing utility function
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="modal-overlay">
      <div className="alert-details-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>Alert Details</h2>
            <div 
              className="severity-badge"
              style={{ backgroundColor: getAlertSeverityColor(alert.severity) }}
            >
              {alert.severity} Priority
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="student-info">
            <h3>{alert.title}</h3>
            <p>Student ID: {alert.studentId}</p>
          </div>

          <div className="tab-navigation">
            <button 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Alert Details
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Attendance History
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' ? (
              <div className="details-content">
                <div className="info-row">
                  <span className="label">Alert Type:</span>
                  <span className="value">{alert.type}</span>
                </div>
                <div className="info-row">
                  <span className="label">Triggered:</span>
                  <span className="value">{formatDate(alert.date)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Message:</span>
                  <span className="value">{alert.message}</span>
                </div>
                <div className="info-row">
                  <span className="label">Attendance Count:</span>
                  <span className="value">{alert.metadata?.attendanceCount || 'N/A'} occurrences</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`value status ${alert.isDismissed ? 'dismissed' : 'active'}`}>
                    {alert.isDismissed ? 'Dismissed' : 'Active'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="history-content">
                <div className="history-summary">
                  <div className="summary-item">
                    <div className="count">12</div>
                    <div className="description">Total Absences This Month</div>
                  </div>
                  <div className="summary-item">
                    <div className="count">8</div>
                    <div className="description">Late Arrivals This Month</div>
                  </div>
                  <div className="summary-item">
                    <div className="count">85%</div>
                    <div className="description">Attendance Rate</div>
                  </div>
                </div>
                <div className="recent-events">
                  <h4>Recent Events</h4>
                  <div className="event">Jan 15, 2025 - Absent (Unexcused)</div>
                  <div className="event">Jan 14, 2025 - Late Arrival (15 minutes)</div>
                  <div className="event">Jan 13, 2025 - Present</div>
                  <div className="event">Jan 12, 2025 - Absent (Excused - Sick)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Close
          </button>
          {!alert.isDismissed && (
            <button className="dismiss-btn" onClick={onDismiss}>
              Dismiss Alert
            </button>
          )}
        </div>
      </div>
    </div>
  );
}