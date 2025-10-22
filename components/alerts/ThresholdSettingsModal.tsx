"use client"

import React from 'react';
import './ThresholdSettingsModal.css';
import { ThresholdFormData } from '@/hooks/useAlertModals';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  formData: ThresholdFormData;
  errors: any;
  onFormChange: (data: ThresholdFormData) => void;
  onSubmit: (data: ThresholdFormData) => void;
  onClose: () => void;
}

export default function ThresholdSettingsModal({ isOpen, formData, errors, onFormChange, onSubmit, onClose }: ThresholdSettingsModalProps) {
  if (!isOpen) return null;

  const updateField = (field: keyof ThresholdFormData, value: any) => onFormChange({ ...formData, [field]: value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };

  return (
    <div className="modal-overlay">
      <div className="modal-content threshold-modal">
        <div className="modal-header">
          <h2>Alert Thresholds</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Absence Threshold *</label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.absenceThreshold}
              onChange={(e) => updateField('absenceThreshold', parseInt(e.target.value) || 1)}
              className={errors.absenceThreshold ? 'error' : ''}
            />
            {errors.absenceThreshold && <span className="error-message">{errors.absenceThreshold}</span>}
          </div>

          <div className="form-group">
            <label>Lateness Threshold *</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.latenessThreshold}
              onChange={(e) => updateField('latenessThreshold', parseInt(e.target.value) || 1)}
              className={errors.latenessThreshold ? 'error' : ''}
            />
            {errors.latenessThreshold && <span className="error-message">{errors.latenessThreshold}</span>}
          </div>

          <div className="form-group">
            <label>Time Period *</label>
            <select
              value={formData.timeframe}
              onChange={(e) => updateField('timeframe', e.target.value)}
            >
              <option value="30-day">Last 30 Days</option>
              <option value="cumulative">All Time</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
}