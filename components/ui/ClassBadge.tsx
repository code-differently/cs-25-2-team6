'use client'

import React from 'react'
import { formatClassName, getClassGradeDisplay } from '../utilities/classUtils'

interface ClassBadgeProps {
  /** The class name/title to display */
  className?: string
  /** Grade level */
  grade?: string | number
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
  /** Class status for semantic badges */
  status?: 'active' | 'inactive' | 'archived' | 'draft' | 'full'
  /** Auto-format class name with grade */
  autoFormatClassName?: boolean
  /** Auto-format grade display */
  autoFormatGrade?: boolean
  /** Custom content override */
  children?: React.ReactNode
}

export default function ClassBadge({
  className,
  grade,
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
  additionalClasses = '',
  icon,
  showDot = false,
  dotColor = 'gray',
  status,
  autoFormatClassName = false,
  autoFormatGrade = false,
  children
}: ClassBadgeProps) {
  /**
   * Get formatted content using utility functions
   */
  const getFormattedContent = (): React.ReactNode => {
    if (children) return children
    
    if (autoFormatClassName && className && grade) {
      return formatClassName(className, String(grade))
    }
    if (autoFormatClassName && className) {
      return className
    }
    if (autoFormatGrade && grade !== undefined) {
      return getClassGradeDisplay(grade)
    }
    return className || 'Class'
  }

  /**
   * Get variant from semantic props
   */
  const getSemanticVariant = (): string => {
    if (status) {
      const statusVariantMap = {
        active: 'success',
        inactive: 'secondary',
        archived: 'warning',
        draft: 'default',
        full: 'danger'
      }
      return statusVariantMap[status]
    }

    if (grade) {
      return 'primary'
    }

    return variant
  }
  
  const currentVariant = getSemanticVariant()
  
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
    ${variantClasses[currentVariant as keyof typeof variantClasses]}
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

  const formattedContent = getFormattedContent()

  return (
    <span
      className={combinedClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Class badge for ${formattedContent}, clickable` : `Class badge for ${formattedContent}`}
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
      
      {/* Class name with formatted content */}
      <span className="truncate">
        {formattedContent}
      </span>
    </span>
  )
}

// Export types for external use
export type { ClassBadgeProps }