import React from 'react';
import { formatStudentName } from '../utilities';

/**
 * Props for the ConfirmButton component
 */
export interface ConfirmButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Button is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Confirmation required */
  requireConfirmation?: boolean;
  /** Confirmation message */
  confirmationMessage?: string;
  /** Confirmation title */
  confirmationTitle?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Auto-confirm after delay (in ms) */
  autoConfirmDelay?: number;
  /** Show confirmation inline vs modal */
  confirmationStyle?: 'inline' | 'modal' | 'tooltip';
  /** Click handler */
  onClick?: () => void | Promise<void>;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Icon to display */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Form ID for submit buttons */
  form?: string;
  /** Custom loading spinner */
  loadingSpinner?: React.ReactNode;
  /** Student context for dynamic messages */
  studentFirstName?: string;
  /** Student last name for dynamic messages */
  studentLastName?: string;
  /** Auto-format student names in confirmation */
  autoFormatStudentName?: boolean;
}

/**
 * ConfirmButton Component
 * 
 * A button component that optionally requires confirmation before
 * executing actions, with various confirmation styles and loading states.
 */
const ConfirmButton: React.FC<ConfirmButtonProps> & {
  Danger: React.FC<Omit<ConfirmButtonProps, 'variant' | 'requireConfirmation'>>;
  Delete: React.FC<Omit<ConfirmButtonProps, 'variant' | 'requireConfirmation' | 'children'>>;
} = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  requireConfirmation = false,
  confirmationMessage = 'Are you sure you want to continue?',
  confirmationTitle = 'Confirm Action',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  autoConfirmDelay,
  confirmationStyle = 'inline',
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ariaLabel,
  form,
  loadingSpinner,
  studentFirstName,
  studentLastName,
  autoFormatStudentName = false
}) => {
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Get formatted confirmation message
   */
  const getFormattedConfirmationMessage = (): string => {
    if (!autoFormatStudentName || (!studentFirstName && !studentLastName)) {
      return confirmationMessage;
    }
    
    const studentName = formatStudentName(studentFirstName || '', studentLastName || '');
    return confirmationMessage.replace(/\{studentName\}/g, studentName);
  };

  /**
   * Handle button click
   */
  const handleClick = async () => {
    if (disabled || loading || isProcessing) return;

    if (requireConfirmation && !showConfirmation) {
      setShowConfirmation(true);
      
      // Auto-confirm if delay is set
      if (autoConfirmDelay) {
        setCountdown(Math.ceil(autoConfirmDelay / 1000));
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              handleConfirm();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return;
    }

    await executeAction();
  };

  /**
   * Handle confirmation
   */
  const handleConfirm = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
    setShowConfirmation(false);
    await executeAction();
  };

  /**
   * Handle cancellation
   */
  const handleCancel = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
    setShowConfirmation(false);
  };

  /**
   * Execute the action
   */
  const executeAction = async () => {
    if (!onClick) return;

    try {
      setIsProcessing(true);
      await onClick();
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Cleanup on unmount
   */
  React.useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  /**
   * Get variant classes
   */
  const getVariantClasses = (): string => {
    const variantMap = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-blue-600',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border-gray-600',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-red-600',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-green-600',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 border-yellow-600',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-gray-300'
    };
    return variantMap[variant];
  };

  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    };
    return sizeMap[size];
  };

  /**
   * Get icon size classes
   */
  const getIconSize = (): string => {
    const iconSizeMap = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6'
    };
    return iconSizeMap[size];
  };

  /**
   * Default loading spinner
   */
  const defaultLoadingSpinner = (
    <svg className={`animate-spin ${getIconSize()}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const isButtonDisabled = disabled || loading || isProcessing;
  const isButtonLoading = loading || isProcessing;

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium border rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const buttonContent = (
    <>
      {/* Left Icon */}
      {icon && iconPosition === 'left' && !isButtonLoading && (
        <span className={getIconSize()}>{icon}</span>
      )}

      {/* Loading Spinner */}
      {isButtonLoading && (
        <span className={getIconSize()}>
          {loadingSpinner || defaultLoadingSpinner}
        </span>
      )}

      {/* Button Text */}
      <span>{children}</span>

      {/* Right Icon */}
      {icon && iconPosition === 'right' && !isButtonLoading && (
        <span className={getIconSize()}>{icon}</span>
      )}
    </>
  );

  // Render confirmation inline
  if (showConfirmation && confirmationStyle === 'inline') {
    return (
      <div className="inline-flex flex-col gap-2">
        <div className="text-sm text-gray-600 font-medium">
          {getFormattedConfirmationMessage()}
          {countdown && (
            <span className="ml-2 text-blue-600">({countdown}s)</span>
          )}
        </div>
        <div className="inline-flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-md transition-colors"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
        </div>
      </div>
    );
  }

  // TODO: Implement modal and tooltip confirmation styles
  // For now, render the main button
  return (
    <button
      type={type}
      className={baseClasses}
      onClick={handleClick}
      disabled={isButtonDisabled}
      aria-label={ariaLabel}
      form={form}
    >
      {buttonContent}
    </button>
  );
};

/**
 * ConfirmButton.Danger - Danger variant with confirmation
 */
ConfirmButton.Danger = (props: Omit<ConfirmButtonProps, 'variant' | 'requireConfirmation'>) => (
  <ConfirmButton 
    {...props} 
    variant="danger" 
    requireConfirmation={true}
    confirmationMessage={props.confirmationMessage || 'This action cannot be undone. Are you sure?'}
  />
);
ConfirmButton.Danger.displayName = 'ConfirmButton.Danger';

/**
 * ConfirmButton.Delete - Delete-specific button
 */
ConfirmButton.Delete = (props: Omit<ConfirmButtonProps, 'variant' | 'requireConfirmation' | 'children'>) => (
  <ConfirmButton 
    {...props} 
    variant="danger" 
    requireConfirmation={true}
    confirmationMessage={props.confirmationMessage || 'Are you sure you want to delete this item? This action cannot be undone.'}
  >
    Delete
  </ConfirmButton>
);
ConfirmButton.Delete.displayName = 'ConfirmButton.Delete';

export default ConfirmButton;