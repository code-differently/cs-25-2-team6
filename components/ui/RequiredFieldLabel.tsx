import React from 'react';
import { isRequiredField } from '../utilities';

/**
 * Props for the RequiredFieldLabel component
 */
export interface RequiredFieldLabelProps {
  /** The label text */
  children: React.ReactNode;
  /** Whether the field is required */
  required?: boolean;
  /** Auto-detect if field is required based on field name */
  autoDetectRequired?: boolean;
  /** Field name for auto-detection */
  fieldName?: string;
  /** Custom className for styling */
  className?: string;
  /** HTML for attribute for label association */
  htmlFor?: string;
  /** Custom required indicator */
  requiredIndicator?: React.ReactNode;
  /** Position of the required indicator */
  indicatorPosition?: 'before' | 'after';
  /** Show required text in addition to asterisk */
  showRequiredText?: boolean;
  /** Custom required text */
  requiredText?: string;
  /** Tooltip for required field */
  tooltip?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Optional hint text */
  hint?: string;
  /** ID for accessibility */
  id?: string;
}

/**
 * RequiredFieldLabel Component
 * 
 * A label component that clearly indicates required fields with
 * customizable indicators and styling options.
 */
const RequiredFieldLabel: React.FC<RequiredFieldLabelProps> & {
  Asterisk: React.FC<{ className?: string; tooltip?: string }>;
  Text: React.FC<{ children?: React.ReactNode; className?: string }>;
  Optional: React.FC<{ children?: React.ReactNode; className?: string }>;
} = ({
  children,
  required = false,
  autoDetectRequired = false,
  fieldName,
  className = '',
  htmlFor,
  requiredIndicator,
  indicatorPosition = 'after',
  showRequiredText = false,
  requiredText = 'Required',
  tooltip,
  size = 'medium',
  variant = 'default',
  disabled = false,
  hint,
  id
}) => {
  /**
   * Determine if field is required
   */
  const isFieldRequired = (): boolean => {
    if (required !== undefined) return required;
    if (autoDetectRequired && fieldName) {
      return isRequiredField(fieldName);
    }
    return false;
  };

  const fieldIsRequired = isFieldRequired();
  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    return sizeMap[size];
  };

  /**
   * Get variant classes
   */
  const getVariantClasses = (): string => {
    const variantMap = {
      default: 'text-gray-700',
      primary: 'text-blue-700',
      secondary: 'text-gray-600',
      danger: 'text-red-700'
    };
    return variantMap[variant];
  };

  /**
   * Get required indicator classes
   */
  const getRequiredIndicatorClasses = (): string => {
    const baseClasses = 'text-red-500 font-medium';
    const sizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    return `${baseClasses} ${sizeClasses[size]}`;
  };

  /**
   * Default required indicator
   */
  const defaultRequiredIndicator = (
    <span 
      className={getRequiredIndicatorClasses()}
      aria-label="Required field"
      title={tooltip || 'This field is required'}
    >
      *
    </span>
  );

  /**
   * Required text component
   */
  const requiredTextComponent = showRequiredText && fieldIsRequired && (
    <span className="text-red-500 text-xs ml-1 font-medium">
      ({requiredText})
    </span>
  );

  /**
   * Get the required indicator to display
   */
  const getRequiredIndicator = () => {
    if (!fieldIsRequired) return null;
    return requiredIndicator || defaultRequiredIndicator;
  };

  const baseClasses = `
    block font-medium select-none
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className={baseClasses}
        id={id}
      >
        <span className="flex items-center gap-1">
          {/* Required indicator before */}
          {indicatorPosition === 'before' && getRequiredIndicator()}
          
          {/* Label text */}
          <span>{children}</span>
          
          {/* Required indicator after */}
          {indicatorPosition === 'after' && getRequiredIndicator()}
          
          {/* Required text */}
          {requiredTextComponent}
        </span>
      </label>

      {/* Hint text */}
      {hint && (
        <p className={`text-xs text-gray-500 mt-1 ${disabled ? 'opacity-50' : ''}`}>
          {hint}
        </p>
      )}
    </div>
  );
};

/**
 * RequiredFieldLabel.Asterisk - Standalone asterisk component
 */
RequiredFieldLabel.Asterisk = ({ 
  className = '',
  tooltip = 'Required field'
}: { 
  className?: string;
  tooltip?: string;
}) => (
  <span 
    className={`text-red-500 font-medium ${className}`}
    aria-label="Required field"
    title={tooltip}
  >
    *
  </span>
);
RequiredFieldLabel.Asterisk.displayName = 'RequiredFieldLabel.Asterisk';

/**
 * RequiredFieldLabel.Text - Standalone required text component
 */
RequiredFieldLabel.Text = ({ 
  children = 'Required',
  className = ''
}: { 
  children?: React.ReactNode;
  className?: string;
}) => (
  <span className={`text-red-500 text-xs font-medium ${className}`}>
    ({children})
  </span>
);
RequiredFieldLabel.Text.displayName = 'RequiredFieldLabel.Text';

/**
 * RequiredFieldLabel.Optional - Optional field indicator
 */
RequiredFieldLabel.Optional = ({ 
  children = 'Optional',
  className = ''
}: { 
  children?: React.ReactNode;
  className?: string;
}) => (
  <span className={`text-gray-400 text-xs font-normal ${className}`}>
    ({children})
  </span>
);
RequiredFieldLabel.Optional.displayName = 'RequiredFieldLabel.Optional';

export default RequiredFieldLabel;