'use client'

import React from 'react'

interface ClassBadgeProps {
  /** The class name/title to display */
  className: string
  /** Visual variant of the badge */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /** Size variant of the badge */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the badge is clickable */
  clickable?: boolean
  /** Click handler function */
  onClick?: () => void
  /** Additional CSS classes */
  additionalClasses?: string
  /** Optional icon to display */
  icon?: React.ReactNode
  /** Whether to show a dot indicator */
  showDot?: boolean
  /** Color of the dot indicator */
  dotColor?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
}

export default function ClassBadge({
  className,
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
  additionalClasses = '',
  icon,
  showDot = false,
  dotColor = 'gray'
}: ClassBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-full transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    primary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    secondary: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const dotColorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-500'
  }
  
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-md transform hover:scale-105' : ''
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${clickableClasses}
    ${additionalClasses}
  `.trim().replace(/\s+/g, ' ')

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <span
      className={combinedClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Class badge for ${className}, clickable` : `Class badge for ${className}`}
    >
      {/* Status dot indicator */}
      {showDot && (
        <span className={`w-2 h-2 rounded-full ${dotColorClasses[dotColor]}`} />
      )}
      
      {/* Optional icon */}
      {icon && (
        <span className="flex items-center justify-center">
          {icon}
        </span>
      )}
      
      {/* Class name */}
      <span className="truncate">
        {className}
      </span>
    </span>
  )
}

// Export types for external use
export type { ClassBadgeProps }