"use client"

import React, { useState } from 'react';
import './ReasonSelectionModal.css';

interface ReasonSelectionModalProps {
  isOpen: boolean;
  reasonOptions: string[];
  selectedReason: string;
  onReasonSelect: (reason: string, isCustom: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

// Reason Selection Modal - lets teachers pick from predefined reasons or enter custom ones
export default function ReasonSelectionModal({
  isOpen,
  reasonOptions,
  selectedReason,
  onReasonSelect,
  onCancel,
  onConfirm
}: ReasonSelectionModalProps) {
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customReasonText, setCustomReasonText] = useState('');

  if (!isOpen) return null;

  // Handle reason card click
  const handleReasonClick = (reason: string) => {
    if (reason === 'Other') {
      setShowCustomInput(true);
      onReasonSelect(reason, false);
    } else {
      setShowCustomInput(false);
      setCustomReasonText('');
      onReasonSelect(reason, false);
    }
  };

  // Handle custom reason text input
  const handleCustomChange = (text: string) => {
    setCustomReasonText(text);
    onReasonSelect(text, true);
  };

  // Handle confirm button - validate selection first
  const handleConfirm = () => {
    if (selectedReason?.trim()) {
      onConfirm();
    } else {
      alert('Please select or enter a reason before continuing.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content reason-modal">
        
        <div className="modal-header">
          <h2>Select Reason for Day Off</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Choose a reason for scheduling this day off.
          </p>

          <div className="reason-cards-grid">
            {reasonOptions.map((reason) => (
              <div
                key={reason}
                className={`reason-card ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => handleReasonClick(reason)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleReasonClick(reason);
                  }
                }}
              >
                <div className="reason-card-icon">
                  {reason === 'School Holiday' && '🏫'}
                  {reason === 'Professional Development Day' && '📚'}
                  {reason === 'Parent-Teacher Conferences' && '👥'}
                  {reason === 'Weather Closure' && '🌨️'}
                  {reason === 'Other' && '✏️'}
                </div>
                <div className="reason-card-text">
                  {reason}
                </div>
              </div>
            ))}
          </div>

          {showCustomInput && (
            <div className="custom-reason-section">
              <label htmlFor="customReasonInput" className="custom-reason-label">
                Enter Custom Reason *
              </label>
              <textarea
                id="customReasonInput"
                className="custom-reason-textarea"
                value={customReasonText}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Please describe the specific reason for this day off..."
                rows={4}
                required
              />
              <small className="input-help-text">
                Be specific to help with future reference and reporting.
              </small>
            </div>
          )}
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="button" 
            className="primary-btn confirm-btn"
            onClick={handleConfirm}
            disabled={!selectedReason || (showCustomInput && !customReasonText.trim())}
          >
            Confirm Selection
          </button>
        </div>

      </div>
    </div>
  );
}