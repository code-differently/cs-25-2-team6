"use client"

import React from 'react';
import './AlertDropdown.css';
import { AttendanceAlert } from '@/hooks/useAlertModals';

interface AlertDropdownProps {
  isOpen: boolean;
  alerts: AttendanceAlert[];
  onToggle: () => void;
  onAlertClick: (alert: AttendanceAlert) => void;
  onViewAll: () => void;
  onClose: () => void;
}

// Alert Dropdown - shows recent alerts in header notification
export default function AlertDropdown({
  isOpen,
  alerts,
  onToggle,
  onAlertClick,
  onViewAll,
  onClose
}: AlertDropdownProps) {

  if (!isOpen) return null;

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Format alert date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose} />
      <div className="alert-dropdown">
        
        <div className="dropdown-header">
          <h3>Recent Alerts</h3>
          <span className="alert-count">{alerts.length}</span>
        </div>

        <div className="dropdown-body">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <span>No alerts at this time</span>
            </div>
          ) : (
            alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="alert-item"
                onClick={() => onAlertClick(alert)}
              >
                <div className="alert-content">
                  <div className="alert-student">{alert.studentName}</div>
                  <div className="alert-details">
                    {alert.count} {alert.type}s • {formatDate(alert.createdAt)}
                  </div>
                </div>
                <div 
                  className="alert-badge"
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {alert.severity}
                </div>
              </div>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="dropdown-footer">
            <button 
              className="view-all-btn" 
              onClick={onViewAll}
            >
              View All Alerts ({alerts.length})
            </button>
          </div>
        )}

      </div>
    </>
  );
}