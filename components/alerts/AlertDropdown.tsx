"use client"

import React from 'react';
import './Alerts.css';
import { AttendanceAlert, getAlertSeverityColor } from '../utilities/alertUtils';

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

  // Use existing utility function for consistency

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
                  <div className="alert-student">{alert.title}</div>
                  <div className="alert-details">
                    {alert.message} • {formatDate(alert.date)}
                  </div>
                </div>
                <div 
                  className="alert-badge"
                  style={{ backgroundColor: getAlertSeverityColor(alert.severity) }}
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