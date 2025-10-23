import React from 'react';
import { AlertSeverity, getAlertSeverityColor } from '../utilities/alertUtils';

export interface AlertBadgeProps {
  /** Alert severity level determining color and urgency */
  severity: AlertSeverity;
  /** Display text for the badge */
  label?: string;
  /** Visual style variant */
  variant?: 'solid' | 'outline' | 'subtle';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon to display alongside text */
  icon?: React.ReactNode;
  /** Whether the badge is clickable */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show pulsing animation for urgent alerts */
  pulse?: boolean;
}

/**
 * AlertBadge - A visual indicator for alert severity levels
 * 
 * Displays alert severity with appropriate colors, variants, and accessibility features.
 * Supports multiple visual styles and interactive states.
 */
const AlertBadge: React.FC<AlertBadgeProps> = ({
  severity,
  label,
  variant = 'solid',
  size = 'md',
  icon,
  onClick,
  className = '',
  pulse = false
}) => {
  const baseClasses = [
    'alert-badge',
    `alert-badge--${variant}`,
    `alert-badge--${size}`,
    `alert-badge--${severity}`
  ];

  if (onClick) {
    baseClasses.push('alert-badge--clickable');
  }

  if (pulse) {
    baseClasses.push('alert-badge--pulse');
  }

  const badgeClasses = `${baseClasses.join(' ')} ${className}`.trim();

  // Generate display label if not provided
  const displayLabel = label || severity.charAt(0).toUpperCase() + severity.slice(1);

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  // Component element (button if clickable, span otherwise)
  const Element = onClick ? 'button' : 'span';

  return (
    <Element
      className={badgeClasses}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${severity} severity alert${onClick ? ', clickable' : ''}`}
      style={{
        '--alert-color': getAlertSeverityColor(severity)
      } as React.CSSProperties}
    >
      {icon && (
        <span className="alert-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="alert-badge__label">
        {displayLabel}
      </span>
    </Element>
  );
};

// Preset badge components for common use cases
export const LowAlertBadge: React.FC<Omit<AlertBadgeProps, 'severity'>> = (props) => (
  <AlertBadge {...props} severity="low" />
);

export const MediumAlertBadge: React.FC<Omit<AlertBadgeProps, 'severity'>> = (props) => (
  <AlertBadge {...props} severity="medium" />
);

export const HighAlertBadge: React.FC<Omit<AlertBadgeProps, 'severity'>> = (props) => (
  <AlertBadge {...props} severity="high" />
);

export const CriticalAlertBadge: React.FC<Omit<AlertBadgeProps, 'severity'>> = (props) => (
  <AlertBadge {...props} severity="critical" pulse />
);

// Compound component for alert count badge
export interface AlertCountBadgeProps extends Omit<AlertBadgeProps, 'label'> {
  count: number;
  maxCount?: number;
}

export const AlertCountBadge: React.FC<AlertCountBadgeProps> = ({
  count,
  maxCount = 99,
  ...props
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  return (
    <AlertBadge
      {...props}
      label={displayCount}
      size="sm"
      variant="solid"
    />
  );
};

export default AlertBadge;