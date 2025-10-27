'use client';

import React, { useState } from 'react';
import AlertCard from './AlertCard';
import { AttendanceAlert, SortCriteria, AlertAction } from '../../src/services/hooks/useAlerts';

interface AlertsListProps {
  alerts: AttendanceAlert[];
  loading: boolean;
  onSort: (criteria: SortCriteria) => void;
  onFilter: (filterType: string, value: any) => void;
  onBulkAction: (alertIds: string[], action: AlertAction) => void;
  onStudentSelect: (studentId: string) => void;
}

export default function AlertsList({
  alerts,
  loading,
  onSort,
  onFilter,
  onBulkAction,
  onStudentSelect
}: AlertsListProps) {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortCriteria['field']>('severity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortCriteria['field']) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort({ field, direction: newDirection });
  };

  const handleSelectAlert = (alertId: string, selected: boolean) => {
    const newSelected = new Set(selectedAlerts);
    if (selected) {
      newSelected.add(alertId);
    } else {
      newSelected.delete(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAlerts(new Set(alerts.map(alert => alert.id)));
    } else {
      setSelectedAlerts(new Set());
    }
  };

  const handleBulkAction = (actionType: AlertAction['type']) => {
    if (selectedAlerts.size > 0) {
      onBulkAction(Array.from(selectedAlerts), { type: actionType });
      setSelectedAlerts(new Set());
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: '80px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '8px'
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            🚨 Active Alerts ({alerts.length})
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <span style={{ marginRight: '4px' }}>🔽</span>
              Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.size > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            border: '1px solid #3b82f620'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827'
              }}>
                ✓ {selectedAlerts.size} alert(s) selected
              </span>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleBulkAction('acknowledge')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => handleBulkAction('resolve')}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {['severity', 'date', 'student', 'type'].map((field) => (
            <button
              key={field}
              onClick={() => handleSort(field as SortCriteria['field'])}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: sortField === field ? '#3b82f6' : '#f8fafc',
                color: sortField === field ? 'white' : '#111827',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                border: `1px solid ${sortField === field ? '#3b82f6' : '#e2e8f0'}`,
                cursor: 'pointer'
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{field}</span>
              <span style={{ fontSize: '12px' }}>↕️</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div>
        {alerts.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827', 
              marginBottom: '8px' 
            }}>
              No alerts found
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              All clear! No alerts are currently active.
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="checkbox"
                  checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
                <span style={{
                  marginLeft: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  Select all alerts
                </span>
              </label>
            </div>

            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                selected={selectedAlerts.has(alert.id)}
                onSelect={(selected) => handleSelectAlert(alert.id, selected)}
                onStudentSelect={() => onStudentSelect(alert.studentId)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}