import React from 'react';
import { AlertSeverity, getAlertSeverityColor } from '../utilities/alertUtils';

export interface NotificationIndicatorProps {
  /** Type of notification indicator */
  type?: 'dot' | 'badge' | 'pill';
  /** Number to display (for badge/pill types) */
  count?: number;
  /** Maximum count to display before showing "+" */
  maxCount?: number;
  /** Severity level for color coding */
  severity?: AlertSeverity;
  /** Position relative to parent element */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show pulsing animation */
  pulse?: boolean;
  /** Whether the indicator is visible */
  visible?: boolean;
  /** Custom color override */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Optional label for accessibility */
  'aria-label'?: string;
}

/**
 * NotificationIndicator - Flexible notification indicator component
 * 
 * Displays notification counts, dots, or pills with positioning and animation options.
 * Supports severity-based coloring and accessibility features.
 */
const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  type = 'badge',
  count = 0,
  maxCount = 99,
  severity = 'medium',
  position = 'top-right',
  size = 'md',
  pulse = false,
  visible = true,
  color,
  className = '',
  'aria-label': ariaLabel
}) => {
  if (!visible) return null;

  const baseClasses = [
    'notification-indicator',
    `notification-indicator--${position}`
  ].filter(Boolean).join(' ');

  const indicatorColor = color || getAlertSeverityColor(severity);
  
  // Generate appropriate aria-label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    
    if (type === 'dot') {
      return `New notification (${severity} priority)`;
    }
    
    if (count === 0) return 'No notifications';
    if (count === 1) return '1 notification';
    if (count > maxCount) return `More than ${maxCount} notifications`;
    return `${count} notifications`;
  };

  // Render dot indicator
  if (type === 'dot') {
    return (
      <div className={baseClasses}>
        <span
          className={`notification-dot notification-dot--${severity} notification-dot--${size} ${pulse ? 'notification-dot--pulse' : ''} ${className}`.trim()}
          style={{ backgroundColor: indicatorColor }}
          role="status"
          aria-label={getAriaLabel()}
        />
      </div>
    );
  }

  // Don't render badge/pill if count is 0
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Render badge indicator
  if (type === 'badge') {
    return (
      <div className={baseClasses}>
        <span
          className={`notification-badge notification-badge--${size} ${className}`.trim()}
          style={{ backgroundColor: indicatorColor }}
          role="status"
          aria-label={getAriaLabel()}
        >
          {displayCount}
        </span>
      </div>
    );
  }

  // Render pill indicator
  return (
    <div className={baseClasses}>
      <span
        className={`notification-pill notification-pill--${size} ${className}`.trim()}
        style={{ backgroundColor: indicatorColor }}
        role="status"
        aria-label={getAriaLabel()}
      >
        {displayCount}
      </span>
    </div>
  );
};

// Preset notification components
export const NotificationDot: React.FC<Omit<NotificationIndicatorProps, 'type'>> = (props) => (
  <NotificationIndicator {...props} type="dot" />
);

export const NotificationBadge: React.FC<Omit<NotificationIndicatorProps, 'type'>> = (props) => (
  <NotificationIndicator {...props} type="badge" />
);

export const NotificationPill: React.FC<Omit<NotificationIndicatorProps, 'type'>> = (props) => (
  <NotificationIndicator {...props} type="pill" />
);

// Urgent notification with automatic pulsing
export const UrgentNotificationIndicator: React.FC<Omit<NotificationIndicatorProps, 'severity' | 'pulse'>> = (props) => (
  <NotificationIndicator {...props} severity="critical" pulse={true} />
);

// Status indicator for different states
export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const statusConfig = {
    online: { color: '#10b981', label: 'Online' },
    offline: { color: '#6b7280', label: 'Offline' },
    busy: { color: '#ef4444', label: 'Busy' },
    away: { color: '#f59e0b', label: 'Away' }
  };

  const config = statusConfig[status];

  return (
    <div className={`status-indicator status-indicator--${status} ${className}`.trim()}>
      <span
        className={`notification-dot notification-dot--${size}`}
        style={{ backgroundColor: config.color }}
        role="status"
        aria-label={`Status: ${config.label}`}
      />
      {showLabel && (
        <span className="status-indicator__label">
          {config.label}
        </span>
      )}
    </div>
  );
};

// Wrapper component for adding notifications to any element
export interface WithNotificationProps {
  children: React.ReactNode;
  notification?: NotificationIndicatorProps;
  className?: string;
}

export const WithNotification: React.FC<WithNotificationProps> = ({
  children,
  notification,
  className = ''
}) => {
  return (
    <div className={`notification-wrapper ${className}`.trim()}>
      {children}
      {notification && <NotificationIndicator {...notification} />}
    </div>
  );
};

// Alert-specific notification indicators
export interface AlertNotificationProps extends Omit<NotificationIndicatorProps, 'severity'> {
  alertSeverity: AlertSeverity;
  alertCount: number;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  alertSeverity,
  alertCount,
  ...props
}) => {
  return (
    <NotificationIndicator
      {...props}
      severity={alertSeverity}
      count={alertCount}
      pulse={alertSeverity === 'critical'}
    />
  );
};

// Notification list item with indicator
export interface NotificationListItemProps {
  title: string;
  message?: string;
  timestamp?: Date;
  severity?: AlertSeverity;
  isRead?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  title,
  message,
  timestamp,
  severity = 'medium',
  isRead = false,
  onClick,
  className = ''
}) => {
  const itemClasses = [
    'notification-list-item',
    !isRead && 'notification-list-item--unread',
    onClick && 'notification-list-item--clickable',
    `notification-list-item--${severity}`
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${itemClasses} ${className}`.trim()}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${title}${!isRead ? ' (unread)' : ''}`}
    >
      {!isRead && (
        <NotificationDot
          severity={severity}
          size="sm"
          position="top-left"
        />
      )}
      
      <div className="notification-list-item__content">
        <div className="notification-list-item__title">{title}</div>
        {message && (
          <div className="notification-list-item__message">{message}</div>
        )}
        {timestamp && (
          <div className="notification-list-item__timestamp">
            {timestamp.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationIndicator;