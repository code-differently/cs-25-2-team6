import React from 'react';
import { formatStudentName } from '../utilities';

/**
 * Props for the ValidationMessage component
 */
export interface ValidationMessageProps {
  /** The validation message text */
  children: React.ReactNode;
  /** Type of validation message */
  type?: 'error' | 'success' | 'warning' | 'info';
  /** Whether to show the message */
  show?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Show icon with the message */
  showIcon?: boolean;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Animation variant */
  animation?: 'fade' | 'slide' | 'bounce' | 'none';
  /** Whether message can be dismissed */
  dismissible?: boolean;
  /** Callback when message is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss timeout in milliseconds */
  autoHideDelay?: number;
  /** ID for accessibility */
  id?: string;
  /** ARIA role */
  role?: string;
  /** Field name for context */
  fieldName?: string;
  /** Auto-format field name in messages */
  formatFieldName?: boolean;
}

/**
 * ValidationMessage Component
 * 
 * Displays form validation messages with various types, icons,
 * and animation options for enhanced user feedback.
 */
const ValidationMessage: React.FC<ValidationMessageProps> & {
  Error: React.FC<Omit<ValidationMessageProps, 'type'>>;
  Success: React.FC<Omit<ValidationMessageProps, 'type'>>;
  Warning: React.FC<Omit<ValidationMessageProps, 'type'>>;
  Info: React.FC<Omit<ValidationMessageProps, 'type'>>;
} = ({
  children,
  type = 'error',
  show = true,
  className = '',
  showIcon = true,
  icon,
  size = 'medium',
  animation = 'fade',
  dismissible = false,
  onDismiss,
  autoHideDelay,
  id,
  role,
  fieldName,
  formatFieldName = false
}) => {
  const [isVisible, setIsVisible] = React.useState(show);
  const [isAnimating, setIsAnimating] = React.useState(false);

  /**
   * Format field name for display
   */
  const getFormattedFieldName = (): string => {
    if (!fieldName) return '';
    if (!formatFieldName) return fieldName;
    
    // Convert camelCase/snake_case to readable format
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };

  // Handle auto-hide functionality
  React.useEffect(() => {
    if (autoHideDelay && show && type === 'success') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHideDelay, show, type]);

  // Update visibility when show prop changes
  React.useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      handleHide();
    }
  }, [show]);

  /**
   * Handle message dismissal
   */
  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
      onDismiss?.();
    }, 300);
  };

  /**
   * Handle hiding the message
   */
  const handleHide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  /**
   * Get type-specific styling
   */
  const getTypeClasses = (): string => {
    const typeMap = {
      error: 'text-red-800 bg-red-50 border-red-200',
      success: 'text-green-800 bg-green-50 border-green-200',
      warning: 'text-yellow-800 bg-yellow-50 border-yellow-200',
      info: 'text-blue-800 bg-blue-50 border-blue-200'
    };
    return typeMap[type];
  };

  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap = {
      small: 'text-xs p-2',
      medium: 'text-sm p-3',
      large: 'text-base p-4'
    };
    return sizeMap[size];
  };

  /**
   * Get animation classes
   */
  const getAnimationClasses = (): string => {
    if (animation === 'none') return '';
    
    const baseTransition = 'transition-all duration-300 ease-in-out';
    
    const animationMap = {
      fade: `${baseTransition} ${isAnimating ? 'opacity-0' : 'opacity-100'}`,
      slide: `${baseTransition} transform ${isAnimating ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`,
      bounce: `${baseTransition} transform ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`,
      none: ''
    };
    
    return animationMap[animation];
  };

  /**
   * Get default icon for message type
   */
  const getDefaultIcon = (): React.ReactNode => {
    const iconMap = {
      error: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      success: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    };
    return iconMap[type];
  };

  if (!isVisible) return null;

  const baseClasses = `
    flex items-start gap-2 border rounded-md
    ${getTypeClasses()}
    ${getSizeClasses()}
    ${getAnimationClasses()}
    ${className}
  `.trim();

  const messageRole = role || (type === 'error' ? 'alert' : 'status');
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={baseClasses}
      role={messageRole}
      aria-live={ariaLive}
      id={id}
      aria-describedby={fieldName ? `${fieldName}-validation` : undefined}
    >
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon || getDefaultIcon()}
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          type="button"
          className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          onClick={handleDismiss}
          aria-label="Dismiss message"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * ValidationMessage.Error - Shorthand for error messages
 */
ValidationMessage.Error = (props: Omit<ValidationMessageProps, 'type'>) => (
  <ValidationMessage {...props} type="error" />
);

/**
 * ValidationMessage.Success - Shorthand for success messages
 */
ValidationMessage.Success = (props: Omit<ValidationMessageProps, 'type'>) => (
  <ValidationMessage {...props} type="success" />
);

/**
 * ValidationMessage.Warning - Shorthand for warning messages
 */
ValidationMessage.Warning = (props: Omit<ValidationMessageProps, 'type'>) => (
  <ValidationMessage {...props} type="warning" />
);

/**
 * ValidationMessage.Info - Shorthand for info messages
 */
ValidationMessage.Info = (props: Omit<ValidationMessageProps, 'type'>) => (
  <ValidationMessage {...props} type="info" />
);

export default ValidationMessage;