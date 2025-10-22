import React from 'react';
import { AlertType, AlertSeverity, getAlertTypeIcon, getAlertSeverityColor } from '../utilities/alertUtils';

export interface AlertIconProps {
  /** Type of alert determining the icon */
  type: AlertType;
  /** Severity level for color styling */
  severity?: AlertSeverity;
  /** Size of the icon */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Custom color override */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show pulsing animation */
  pulse?: boolean;
  /** Accessibility label */
  'aria-label'?: string;
}

/**
 * AlertIcon - SVG icon component for different alert types
 * 
 * Displays contextual icons for various alert types with severity-based coloring
 * and accessibility features.
 */
const AlertIcon: React.FC<AlertIconProps> = ({
  type,
  severity,
  size = 'md',
  color,
  className = '',
  pulse = false,
  'aria-label': ariaLabel
}) => {
  const iconClasses = [
    'alert-icon',
    `alert-icon--${size}`,
    severity && `alert-icon--${severity}`,
    pulse && 'alert-icon--pulse'
  ].filter(Boolean).join(' ');

  const iconColor = color || (severity ? getAlertSeverityColor(severity) : '#6b7280');
  const iconId = getAlertTypeIcon(type);

  // Generate appropriate aria-label if not provided
  const defaultAriaLabel = `${type.charAt(0).toUpperCase() + type.slice(1)} alert${severity ? ` (${severity} severity)` : ''}`;
  const effectiveAriaLabel = ariaLabel || defaultAriaLabel;

  // Icon SVG components based on type
  const renderIcon = () => {
    switch (iconId) {
      case 'user-x':
        return (
          <svg
            className={`${iconClasses} ${className}`.trim()}
            style={{ color: iconColor }}
            role="img"
            aria-label={effectiveAriaLabel}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" y1="8" x2="22" y2="13" />
            <line x1="22" y1="8" x2="17" y2="13" />
          </svg>
        );

      case 'clock':
        return (
          <svg
            className={`${iconClasses} ${className}`.trim()}
            style={{ color: iconColor }}
            role="img"
            aria-label={effectiveAriaLabel}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );

      case 'trending-down':
        return (
          <svg
            className={`${iconClasses} ${className}`.trim()}
            style={{ color: iconColor }}
            role="img"
            aria-label={effectiveAriaLabel}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
            <polyline points="17,18 23,18 23,12" />
          </svg>
        );

      case 'alert-triangle':
        return (
          <svg
            className={`${iconClasses} ${className}`.trim()}
            style={{ color: iconColor }}
            role="img"
            aria-label={effectiveAriaLabel}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );

      case 'bell':
      default:
        return (
          <svg
            className={`${iconClasses} ${className}`.trim()}
            style={{ color: iconColor }}
            role="img"
            aria-label={effectiveAriaLabel}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
    }
  };

  return renderIcon();
};

// Preset icon components for common alert types
export const AttendanceAlertIcon: React.FC<Omit<AlertIconProps, 'type'>> = (props) => (
  <AlertIcon {...props} type="attendance" />
);

export const TardinessAlertIcon: React.FC<Omit<AlertIconProps, 'type'>> = (props) => (
  <AlertIcon {...props} type="tardiness" />
);

export const AbsencePatternAlertIcon: React.FC<Omit<AlertIconProps, 'type'>> = (props) => (
  <AlertIcon {...props} type="absence_pattern" />
);

export const PerformanceAlertIcon: React.FC<Omit<AlertIconProps, 'type'>> = (props) => (
  <AlertIcon {...props} type="performance" />
);

export const SystemAlertIcon: React.FC<Omit<AlertIconProps, 'type'>> = (props) => (
  <AlertIcon {...props} type="system" />
);

// Compound component for icon with badge
export interface AlertIconWithBadgeProps extends AlertIconProps {
  badgeCount?: number;
  showBadge?: boolean;
}

export const AlertIconWithBadge: React.FC<AlertIconWithBadgeProps> = ({
  badgeCount = 0,
  showBadge = true,
  ...iconProps
}) => {
  return (
    <div className="alert-icon-with-badge">
      <AlertIcon {...iconProps} />
      {showBadge && badgeCount > 0 && (
        <span 
          className="alert-icon-badge"
          aria-label={`${badgeCount} alert${badgeCount === 1 ? '' : 's'}`}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </div>
  );
};

// Status icon for alert states
export interface AlertStatusIconProps {
  status: 'active' | 'resolved' | 'dismissed' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AlertStatusIcon: React.FC<AlertStatusIconProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const iconClasses = `alert-icon alert-icon--${size} alert-status-icon--${status} ${className}`.trim();

  switch (status) {
    case 'resolved':
      return (
        <svg
          className={iconClasses}
          role="img"
          aria-label="Alert resolved"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      );

    case 'dismissed':
      return (
        <svg
          className={iconClasses}
          role="img"
          aria-label="Alert dismissed"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );

    case 'pending':
      return (
        <svg
          className={iconClasses}
          role="img"
          aria-label="Alert pending"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      );

    case 'active':
    default:
      return (
        <svg
          className={iconClasses}
          role="img"
          aria-label="Alert active"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};

export default AlertIcon;