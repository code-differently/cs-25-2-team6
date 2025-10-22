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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Type
                </label>
                <select
                  value={newIntervention.type}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    type: e.target.value as Intervention['type']
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Notes
                </label>
                <textarea
                  value={newIntervention.notes}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter intervention details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newIntervention.assignedTo}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    assignedTo: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Staff member name"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={newIntervention.followUpRequired}
                  onChange={(e) => setNewIntervention({
                    ...newIntervention,
                    followUpRequired: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="followUp" className="ml-2 text-sm" style={{ color: '#111827' }}>
                  Follow-up required
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddIntervention}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Intervention
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  style={{ color: '#111827' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interventions List */}
        <div>
          <h5 className="font-medium mb-4" style={{ color: '#111827' }}>
            Intervention History ({interventions.length})
          </h5>
          
          {interventions.length === 0 ? (
            <p className="text-sm" style={{ color: '#111827' }}>No interventions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getInterventionIcon(intervention.type)}</span>
                      <span className="font-medium capitalize">{intervention.type}</span>
                      {intervention.followUpRequired && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Follow-up Required
                        </span>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: '#111827' }}>
                      {intervention.date.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {intervention.notes && (
                    <p className="mt-2 text-sm" style={{ color: '#111827' }}>{intervention.notes}</p>
                  )}
                  
                  {intervention.assignedTo && (
                    <p className="mt-1 text-xs" style={{ color: '#111827' }}>
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