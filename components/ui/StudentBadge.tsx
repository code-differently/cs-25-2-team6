import React from 'react';

/**
 * Props for the StudentBadge component
 */
export interface StudentBadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge variant/type */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Badge shape */
  shape?: 'rounded' | 'pill' | 'square';
  /** Custom className for styling */
  className?: string;
  /** Show dot indicator */
  showDot?: boolean;
  /** Dot color */
  dotColor?: string;
  /** Badge is clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Badge is removable */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Badge is outlined */
  outlined?: boolean;
  /** Badge is disabled */
  disabled?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Student status for semantic badges */
  status?: 'enrolled' | 'pending' | 'dropped' | 'graduated' | 'transferred' | 'inactive';
  /** Grade level for grade badges */
  grade?: string;
  /** Attendance status for attendance badges */
  attendance?: 'present' | 'absent' | 'late' | 'excused';
  /** Custom tooltip */
  tooltip?: string;
}

/**
 * StudentBadge Component
 * 
 * A versatile badge component for displaying student information,
 * status indicators, grades, and other categorical data.
 */
const StudentBadge: React.FC<StudentBadgeProps> & {
  Status: React.FC<Omit<StudentBadgeProps, 'status'> & { status: NonNullable<StudentBadgeProps['status']> }>;
  Grade: React.FC<Omit<StudentBadgeProps, 'grade'> & { grade: NonNullable<StudentBadgeProps['grade']> }>;
  Attendance: React.FC<Omit<StudentBadgeProps, 'attendance'> & { attendance: NonNullable<StudentBadgeProps['attendance']> }>;
} = ({
  children,
  variant = 'default',
  size = 'medium',
  shape = 'rounded',
  className = '',
  showDot = false,
  dotColor,
  clickable = false,
  onClick,
  removable = false,
  onRemove,
  icon,
  iconPosition = 'left',
  outlined = false,
  disabled = false,
  ariaLabel,
  status,
  grade,
  attendance,
  tooltip
}) => {
  /**
   * Get variant from semantic props
   */
  const getSemanticVariant = (): string => {
    if (status) {
      const statusVariantMap = {
        enrolled: 'success',
        pending: 'warning',
        dropped: 'error',
        graduated: 'primary',
        transferred: 'info',
        inactive: 'secondary'
      };
      return statusVariantMap[status];
    }

    if (attendance) {
      const attendanceVariantMap = {
        present: 'success',
        absent: 'error',
        late: 'warning',
        excused: 'info'
      };
      return attendanceVariantMap[attendance];
    }

    if (grade) {
      return 'primary';
    }

    return variant;
  };

  const effectiveVariant = getSemanticVariant();

  /**
   * Get variant classes
   */
  const getVariantClasses = (): string => {
    const baseClasses = outlined ? 'border-2 bg-transparent' : 'border';
    
    const variantMap = {
      default: outlined 
        ? `${baseClasses} text-gray-700 border-gray-300 hover:bg-gray-50`
        : `${baseClasses} text-gray-800 bg-gray-100 border-gray-200`,
      primary: outlined
        ? `${baseClasses} text-blue-700 border-blue-300 hover:bg-blue-50`
        : `${baseClasses} text-blue-800 bg-blue-100 border-blue-200`,
      secondary: outlined
        ? `${baseClasses} text-gray-600 border-gray-400 hover:bg-gray-50`
        : `${baseClasses} text-gray-700 bg-gray-200 border-gray-300`,
      success: outlined
        ? `${baseClasses} text-green-700 border-green-300 hover:bg-green-50`
        : `${baseClasses} text-green-800 bg-green-100 border-green-200`,
      warning: outlined
        ? `${baseClasses} text-yellow-700 border-yellow-300 hover:bg-yellow-50`
        : `${baseClasses} text-yellow-800 bg-yellow-100 border-yellow-200`,
      error: outlined
        ? `${baseClasses} text-red-700 border-red-300 hover:bg-red-50`
        : `${baseClasses} text-red-800 bg-red-100 border-red-200`,
      info: outlined
        ? `${baseClasses} text-blue-600 border-blue-400 hover:bg-blue-50`
        : `${baseClasses} text-blue-700 bg-blue-100 border-blue-200`
    };

    return variantMap[effectiveVariant as keyof typeof variantMap];
  };

  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap = {
      small: 'text-xs px-2 py-0.5 gap-1',
      medium: 'text-sm px-2.5 py-1 gap-1.5',
      large: 'text-base px-3 py-1.5 gap-2'
    };
    return sizeMap[size];
  };

  /**
   * Get shape classes
   */
  const getShapeClasses = (): string => {
    const shapeMap = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none'
    };
    return shapeMap[shape];
  };

  /**
   * Get dot color for status
   */
  const getDotColor = (): string => {
    if (dotColor) return dotColor;

    const dotColorMap = {
      default: '#6B7280',
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4'
    };

    return dotColorMap[effectiveVariant as keyof typeof dotColorMap];
  };

  /**
   * Get icon size based on badge size
   */
  const getIconSize = (): string => {
    const iconSizeMap = {
      small: 'w-3 h-3',
      medium: 'w-4 h-4',
      large: 'w-5 h-5'
    };
    return iconSizeMap[size];
  };

  const baseClasses = `
    inline-flex items-center font-medium select-none
    ${getSizeClasses()}
    ${getShapeClasses()}
    ${getVariantClasses()}
    ${clickable || onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const accessibilityLabel = ariaLabel || 
    (status && `Status: ${status}`) ||
    (attendance && `Attendance: ${attendance}`) ||
    (grade && `Grade: ${grade}`) ||
    'Badge';

  return (
    <span
      className={baseClasses}
      onClick={disabled ? undefined : onClick}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      aria-label={accessibilityLabel}
      title={tooltip || accessibilityLabel}
      onKeyDown={(e) => {
        if ((clickable || onClick) && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Status Dot */}
      {showDot && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: getDotColor() }}
        />
      )}

      {/* Left Icon */}
      {icon && iconPosition === 'left' && (
        <span className={`flex-shrink-0 ${getIconSize()}`}>
          {icon}
        </span>
      )}

      {/* Badge Content */}
      <span className="truncate">
        {children}
      </span>

      {/* Right Icon */}
      {icon && iconPosition === 'right' && (
        <span className={`flex-shrink-0 ${getIconSize()}`}>
          {icon}
        </span>
      )}

      {/* Remove Button */}
      {removable && onRemove && !disabled && (
        <button
          type="button"
          className={`flex-shrink-0 ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors ${getIconSize()}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove badge"
        >
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * StudentBadge.Status - Status-specific badge
 */
StudentBadge.Status = (props: Omit<StudentBadgeProps, 'status'> & { status: NonNullable<StudentBadgeProps['status']> }) => (
  <StudentBadge {...props} showDot />
);

/**
 * StudentBadge.Grade - Grade-specific badge
 */
StudentBadge.Grade = (props: Omit<StudentBadgeProps, 'grade'> & { grade: NonNullable<StudentBadgeProps['grade']> }) => (
  <StudentBadge {...props} variant="primary" />
);

/**
 * StudentBadge.Attendance - Attendance-specific badge
 */
StudentBadge.Attendance = (props: Omit<StudentBadgeProps, 'attendance'> & { attendance: NonNullable<StudentBadgeProps['attendance']> }) => (
  <StudentBadge {...props} showDot size="small" />
);

export default StudentBadge;