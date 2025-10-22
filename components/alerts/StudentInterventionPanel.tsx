'use client';

import React, { useState } from 'react';
import { Intervention } from '../../src/services/hooks/useAlerts';

interface StudentInterventionPanelProps {
  studentId: string;
  onClose: () => void;
  onInterventionAdded: () => void;
}

export default function StudentInterventionPanel({ 
  studentId, 
  onClose, 
  onInterventionAdded 
}: StudentInterventionPanelProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntervention, setNewIntervention] = useState({
    type: 'email' as Intervention['type'],
    notes: '',
    followUpRequired: false,
    assignedTo: ''
  });

  const getInterventionIcon = (type: Intervention['type']) => {
    switch (type) {
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'meeting': return '👥';
      case 'letter': return '📄';
    }
  };

  const handleAddIntervention = () => {
    const intervention: Intervention = {
      id: Date.now().toString(),
      ...newIntervention,
      date: new Date()
    };
    
    setInterventions([intervention, ...interventions]);
    setNewIntervention({
      type: 'email',
      notes: '',
      followUpRequired: false,
      assignedTo: ''
    });
    setShowAddForm(false);
    onInterventionAdded();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🛠️</span>
          Student Interventions
        </h3>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#111827',
            fontSize: '16px'
          }}
        >
          ❌
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        {/* Student Info */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '12px',
          border: '1px solid #3b82f620'
        }}>
          <h4 style={{
            fontWeight: '600',
            color: '#111827',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>👤</span>
            Student ID: {studentId}
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#111827',
            margin: 0
          }}>
            Click to view full student profile and attendance history
          </p>
        </div>

        {/* Add Intervention Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
          >
            <span>➕</span>
            Add New Intervention
          </button>
        </div>

        {/* Add Intervention Form */}
        {showAddForm && (
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: '#fafbfc'
          }}>
            <h5 style={{
              fontWeight: '600',
              marginBottom: '16px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📝</span>
              New Intervention
            </h5>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  Type
                </label>
                <select
                  value={newIntervention.type}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    type: e.target.value as Intervention['type']
                  })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📞 Phone Call</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="letter">📄 Letter</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  Notes
                </label>
                <textarea
                  value={newIntervention.notes}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    notes: e.target.value
                  })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    color: '#111827',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  placeholder="Enter intervention details..."
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: '#111827'
                }}>
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newIntervention.assignedTo}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    assignedTo: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  placeholder="Staff member name"
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <input
                  type="checkbox"
                  id="followUp"
                  checked={newIntervention.followUpRequired}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    followUpRequired: e.target.checked
                  })}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6'
                  }}
                />
                <label htmlFor="followUp" style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  Follow-up required
                </label>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  onClick={handleAddIntervention}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  ✅ Add Intervention
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#111827',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interventions List */}
        <div>
          <h5 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📋</span>
            Intervention History ({interventions.length})
          </h5>
          
          {interventions.length === 0 ? (
            <div style={{
              padding: '32px 24px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                No interventions recorded yet. Add your first intervention above.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interventions.map((intervention) => (
                <div key={intervention.id} style={{
                  padding: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '18px' }}>{getInterventionIcon(intervention.type)}</span>
                      <span style={{
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        color: '#111827',
                        fontSize: '14px'
                      }}>
                        {intervention.type}
                      </span>
                      {intervention.followUpRequired && (
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          fontSize: '12px',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          ⚡ Follow-up Required
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {intervention.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {intervention.notes && (
                    <p style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: '1.5',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {intervention.notes}
                    </p>
                  )}
                  
                  {intervention.assignedTo && (
                    <p style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>👤</span>
                      Assigned to: {intervention.assignedTo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}