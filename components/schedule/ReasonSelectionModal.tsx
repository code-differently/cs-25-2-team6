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

/**
 * ReasonSelectionModal Component
 * 
 * This modal allows teachers to select a predefined reason for scheduling a day off,
 * or choose "Custom Reason" to enter their own specific reason.
 * 
 * Features:
 * - Clickable reason cards for easy selection
 * - Custom reason option with textarea input
 * - Clean, accessible interface matching app design
 */
export default function ReasonSelectionModal({
  isOpen,
  reasonOptions,
  selectedReason,
  onReasonSelect,
  onCancel,
  onConfirm
}: ReasonSelectionModalProps) {
  
  // State to track if user has selected "Custom Reason" option
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // State to hold the custom reason text
  const [customReasonText, setCustomReasonText] = useState('');

  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  /**
   * Handles when a user clicks on a predefined reason card
   * @param reason - The reason text that was clicked
   */
  const handleReasonCardClick = (reason: string) => {
    if (reason === 'Other') {
      // If "Other" is clicked, show the custom input field
      setShowCustomInput(true);
      onReasonSelect(reason, false);
    } else {
      // For predefined reasons, hide custom input and select the reason
      setShowCustomInput(false);
      setCustomReasonText('');
      onReasonSelect(reason, false);
    }
  };

  /**
   * Handles the custom reason textarea input changes
   * @param text - The custom reason text entered by user
   */
  const handleCustomReasonChange = (text: string) => {
    setCustomReasonText(text);
    // Update the parent component with the custom reason
    onReasonSelect(text, true);
  };

  /**
   * Handles the confirm button click
   * Validates that a reason has been selected before proceeding
   */
  const handleConfirm = () => {
    // Check if we have a valid selection
    if (selectedReason && selectedReason.trim()) {
      onConfirm();
    } else {
      alert('Please select or enter a reason before continuing.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content reason-modal">
        
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Select Reason for Day Off</h2>
          <button 
            className="close-button" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="modal-description">
            Choose a reason for scheduling this day off. This will help with record keeping and reporting.
          </p>

          {/* Predefined Reason Cards */}
          <div className="reason-cards-grid">
            {reasonOptions.map((reason) => (
              <div
                key={reason}
                className={`reason-card ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => handleReasonCardClick(reason)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleReasonCardClick(reason);
                  }
                }}
              >
                <div className="reason-card-icon">
                  {/* Different icons for different reason types */}
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

          {/* Custom Reason Input (only shows when "Other" is selected) */}
          {showCustomInput && (
            <div className="custom-reason-section">
              <label htmlFor="customReasonInput" className="custom-reason-label">
                Enter Custom Reason *
              </label>
              <textarea
                id="customReasonInput"
                className="custom-reason-textarea"
                value={customReasonText}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
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
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
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