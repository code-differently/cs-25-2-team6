import React from 'react';
import { DayOffReason } from '../../src/domains/DayOffReason';

interface ReasonChipProps {
  reason: DayOffReason;
  size?: 'small' | 'medium' | 'large';
  variant?: 'filled' | 'outlined' | 'minimal';
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

const ReasonChip: React.FC<ReasonChipProps> = ({
  reason,
  size = 'medium',
  variant = 'filled',
  showIcon = true,
  className = '',
  onClick
}) => {
  const getReasonConfig = () => {
    switch (reason) {
      case DayOffReason.HOLIDAY:
        return {
          label: 'Holiday',
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          icon: '🎉'
        };
      case DayOffReason.PROF_DEV:
        return {
          label: 'Professional Development',
          color: '#007bff',
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          icon: '📚'
        };
      case DayOffReason.REPORT_CARD:
        return {
          label: 'Report Card Day',
          color: '#6f42c1',
          backgroundColor: '#e2d9f3',
          borderColor: '#d1b2ff',
          icon: '📋'
        };
      case DayOffReason.OTHER:
        return {
          label: 'Other',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          icon: '📅'
        };
      default:
        return {
          label: 'Unknown',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          icon: '❓'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'reason-chip--small';
      case 'large':
        return 'reason-chip--large';
      default:
        return 'reason-chip--medium';
    }
  };

  const getVariantStyles = (config: ReturnType<typeof getReasonConfig>) => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: config.color,
          color: 'white',
          border: `1px solid ${config.color}`
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          color: config.color,
          border: `1px solid ${config.color}`
        };
      case 'minimal':
        return {
          backgroundColor: config.backgroundColor,
          color: config.color,
          border: `1px solid ${config.borderColor}`
        };
      default:
        return {
          backgroundColor: config.color,
          color: 'white',
          border: `1px solid ${config.color}`
        };
    }
  };

  const config = getReasonConfig();
  const styles = getVariantStyles(config);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`reason-chip ${getSizeClasses()} ${className}`}
      style={styles}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${config.label} day off reason`}
    >
      {showIcon && (
        <span className="reason-chip__icon" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span className="reason-chip__label">
        {config.label}
      </span>
    </div>
  );
};

export default ReasonChip;