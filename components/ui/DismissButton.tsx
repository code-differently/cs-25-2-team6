import React, { useState } from 'react';

export interface DismissButtonProps {
  /** Button label text */
  label?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Whether to show confirmation dialog */
  requireConfirmation?: boolean;
  /** Confirmation dialog title */
  confirmationTitle?: string;
  /** Confirmation dialog message */
  confirmationMessage?: string;
  /** Called when dismiss is confirmed */
  onDismiss: () => void | Promise<void>;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
}

/**
 * DismissButton - Button component for dismissing alerts with optional confirmation
 * 
 * Provides confirmation dialogs, loading states, and accessibility features
 * for safely dismissing important alerts.
 */
const DismissButton: React.FC<DismissButtonProps> = ({
  label = 'Dismiss',
  size = 'md',
  variant = 'secondary',
  requireConfirmation = false,
  confirmationTitle = 'Dismiss Alert',
  confirmationMessage = 'Are you sure you want to dismiss this alert? This action cannot be undone.',
  onDismiss,
  disabled = false,
  className = '',
  icon,
  loading = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const buttonClasses = [
    'dismiss-button',
    `dismiss-button--${size}`,
    `dismiss-button--${variant}`,
    (loading || isProcessing) && 'dismiss-button--loading'
  ].filter(Boolean).join(' ');

  // Handle button click
  const handleClick = async () => {
    if (disabled || loading || isProcessing) return;

    if (requireConfirmation) {
      setShowConfirmation(true);
    } else {
      await handleDismiss();
    }
  };

  // Handle actual dismiss action
  const handleDismiss = async () => {
    try {
      setIsProcessing(true);
      await onDismiss();
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirmation cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const isButtonDisabled = disabled || loading || isProcessing;
  const showLoadingSpinner = loading || isProcessing;

  return (
    <>
      <button
        type="button"
        className={`${buttonClasses} ${className}`.trim()}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isButtonDisabled}
        aria-label={`${label} alert`}
        aria-pressed="false"
      >
        {showLoadingSpinner ? (
          <span className="dismiss-button__spinner" aria-hidden="true" />
        ) : (
          icon && <span className="dismiss-button__icon" aria-hidden="true">{icon}</span>
        )}
        
        <span className="dismiss-button__label">
          {showLoadingSpinner ? 'Processing...' : label}
        </span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div 
          className="dismiss-button__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dismiss-modal-title"
          aria-describedby="dismiss-modal-description"
        >
          <div className="dismiss-button__modal-content">
            <div className="dismiss-button__modal-header">
              <h3 
                id="dismiss-modal-title"
                className="dismiss-button__modal-title"
              >
                {confirmationTitle}
              </h3>
              <p 
                id="dismiss-modal-description"
                className="dismiss-button__modal-description"
              >
                {confirmationMessage}
              </p>
            </div>
            
            <div className="dismiss-button__modal-actions">
              <button
                type="button"
                className="dismiss-button dismiss-button--secondary dismiss-button--md"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancel
              </button>
              
              <button
                type="button"
                className="dismiss-button dismiss-button--danger dismiss-button--md"
                onClick={handleDismiss}
                disabled={isProcessing}
                autoFocus
              >
                {isProcessing ? (
                  <>
                    <span className="dismiss-button__spinner" aria-hidden="true" />
                    <span>Dismissing...</span>
                  </>
                ) : (
                  'Confirm Dismiss'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Preset dismiss button variants
export const QuickDismissButton: React.FC<Omit<DismissButtonProps, 'requireConfirmation' | 'variant' | 'size'>> = (props) => (
  <DismissButton
    {...props}
    requireConfirmation={false}
    variant="ghost"
    size="sm"
    label="×"
    icon={
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    }
  />
);

export const SafeDismissButton: React.FC<Omit<DismissButtonProps, 'requireConfirmation' | 'variant'>> = (props) => (
  <DismissButton
    {...props}
    requireConfirmation={true}
    variant="danger"
  />
);

export const CompactDismissButton: React.FC<Omit<DismissButtonProps, 'size' | 'variant'>> = (props) => (
  <DismissButton
    {...props}
    size="sm"
    variant="ghost"
  />
);

// Batch dismiss button for multiple alerts
export interface BatchDismissButtonProps {
  alertCount: number;
  onDismissAll: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const BatchDismissButton: React.FC<BatchDismissButtonProps> = ({
  alertCount,
  onDismissAll,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const label = `Dismiss All (${alertCount})`;
  const confirmationMessage = `Are you sure you want to dismiss all ${alertCount} alert${alertCount === 1 ? '' : 's'}? This action cannot be undone.`;

  return (
    <DismissButton
      label={label}
      variant="danger"
      size="md"
      requireConfirmation={true}
      confirmationTitle="Dismiss All Alerts"
      confirmationMessage={confirmationMessage}
      onDismiss={onDismissAll}
      disabled={disabled || alertCount === 0}
      loading={loading}
      className={className}
    />
  );
};

// Alert-specific dismiss buttons
export interface AlertDismissButtonProps extends Omit<DismissButtonProps, 'onDismiss'> {
  alertId: string;
  onDismiss: (alertId: string) => void | Promise<void>;
}

export const AlertDismissButton: React.FC<AlertDismissButtonProps> = ({
  alertId,
  onDismiss,
  ...props
}) => {
  const handleDismiss = () => onDismiss(alertId);

  return (
    <DismissButton
      {...props}
      onDismiss={handleDismiss}
    />
  );
};

export default DismissButton;