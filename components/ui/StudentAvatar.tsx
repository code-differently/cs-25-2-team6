import React from 'react';
import { 
  formatStudentName, 
  generateStudentInitials, 
  getStudentAvatarColor 
} from '../utilities';

/**
 * Props for the StudentAvatar component
 */
export interface StudentAvatarProps {
  /** Student's first name */
  firstName?: string;
  /** Student's last name */
  lastName?: string;
  /** Full name (alternative to firstName/lastName) */
  fullName?: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** Size variant of the avatar */
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  /** Custom className for styling */
  className?: string;
  /** Shape of the avatar */
  shape?: 'circle' | 'square' | 'rounded';
  /** Background color for initials */
  backgroundColor?: string;
  /** Text color for initials */
  textColor?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether avatar is clickable */
  clickable?: boolean;
  /** Online status indicator */
  showStatus?: boolean;
  /** Status variant */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Accessibility label */
  ariaLabel?: string;
  /** Loading state */
  loading?: boolean;
  /** Student ID for fallback identification */
  studentId?: string;
}

/**
 * StudentAvatar Component
 * 
 * Displays a student's avatar with fallback to initials.
 * Supports various sizes, shapes, and status indicators.
 */
const StudentAvatar: React.FC<StudentAvatarProps> = ({
  firstName,
  lastName,
  fullName,
  avatarUrl,
  size = 'medium',
  className = '',
  shape = 'circle',
  backgroundColor,
  textColor,
  onClick,
  clickable = false,
  showStatus = false,
  status = 'offline',
  ariaLabel,
  loading = false,
  studentId
}) => {
  /**
   * Generate initials from name using utility function
   */
  const getInitials = (): string => {
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        return generateStudentInitials(nameParts[0], nameParts[nameParts.length - 1]);
      }
      return generateStudentInitials(nameParts[0] || '', '');
    }
    
    return generateStudentInitials(firstName || '', lastName || '');
  };

  /**
   * Generate background color using utility function
   */
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    
    // Use studentId if available, otherwise fallback to name-based ID
    const idForColor = studentId || `${firstName || ''}-${lastName || ''}` || 'default';
    return getStudentAvatarColor(idForColor);
  };

  /**
   * Generate text color based on background
   */
  const getTextColor = (): string => {
    if (textColor) return textColor;
    return '#FFFFFF';
  };

  /**
   * Get size classes
   */
  const getSizeClasses = (): string => {
    const sizeMap = {
      small: 'w-8 h-8 text-xs',
      medium: 'w-12 h-12 text-sm',
      large: 'w-16 h-16 text-lg',
      'extra-large': 'w-24 h-24 text-2xl'
    };
    return sizeMap[size];
  };

  /**
   * Get shape classes
   */
  const getShapeClasses = (): string => {
    const shapeMap = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg'
    };
    return shapeMap[shape];
  };

  /**
   * Get status indicator classes
   */
  const getStatusClasses = (): string => {
    const statusMap = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };
    return statusMap[status];
  };

  /**
   * Handle avatar image error
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = 'none';
  };

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium select-none overflow-hidden
    ${getSizeClasses()}
    ${getShapeClasses()}
    ${clickable || onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  const initialsStyle = {
    backgroundColor: getBackgroundColor(),
    color: getTextColor()
  };

  const accessibilityLabel = ariaLabel || 
    `Avatar for ${fullName || formatStudentName(firstName || '', lastName || '') || `Student ${studentId}` || 'Student'}`;

  if (loading) {
    return (
      <div className={`${baseClasses} bg-gray-200 animate-pulse`}>
        <div className="w-full h-full bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      aria-label={accessibilityLabel}
      onKeyDown={(e) => {
        if ((clickable || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Avatar Image */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={accessibilityLabel}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      )}
      
      {/* Initials Fallback */}
      <div
        className="absolute inset-0 flex items-center justify-center font-semibold"
        style={initialsStyle}
      >
        {getInitials()}
      </div>

      {/* Status Indicator */}
      {showStatus && (
        <div
          className={`
            absolute -bottom-1 -right-1
            w-3 h-3 rounded-full border-2 border-white
            ${getStatusClasses()}
          `}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default StudentAvatar;