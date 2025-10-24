'use client'

import React from 'react'

interface ClassGradeIndicatorProps {
  /** Grade level (e.g., 'K', '1', '2', '12', 'Pre-K') */
  grade: string | number
  /** Visual style variant */
  variant?: 'badge' | 'pill' | 'outlined' | 'minimal'
  /** Size of the indicator */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Color scheme */
  colorScheme?: 'default' | 'primary' | 'secondary' | 'rainbow'
  /** Whether to show 'Grade' prefix */
  showPrefix?: boolean
  /** Custom prefix text */
  customPrefix?: string
  /** Whether the indicator is clickable */
  clickable?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
  /** Tooltip text */
  tooltip?: string
}

export default function ClassGradeIndicator({
  grade,
  variant = 'badge',
  size = 'md',
  colorScheme = 'default',
  showPrefix = false,
  customPrefix,
  clickable = false,
  onClick,
  className = '',
  tooltip
}: ClassGradeIndicatorProps) {
  const gradeString = String(grade)
  const numericGrade = typeof grade === 'number' ? grade : parseInt(gradeString)
  
  // Determine color based on grade level for rainbow scheme
  const getRainbowColor = () => {
    if (gradeString.toLowerCase().includes('pre') || gradeString.toLowerCase() === 'pk') {
      return 'purple'
    }
    if (gradeString.toLowerCase() === 'k' || gradeString === '0') {
      return 'pink'
    }
    if (!isNaN(numericGrade)) {
      const colors = ['blue', 'green', 'yellow', 'orange', 'red', 'indigo']
      return colors[numericGrade % colors.length]
    }
    return 'gray'
  }

  const rainbowColor = getRainbowColor()

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200'
  
  const sizeClasses = {
    xs: 'text-xs min-w-[1.5rem] h-6',
    sm: 'text-sm min-w-[2rem] h-7',
    md: 'text-sm min-w-[2.5rem] h-8',
    lg: 'text-base min-w-[3rem] h-10'
  }

  const variantClasses = {
    badge: 'rounded-lg px-2',
    pill: 'rounded-full px-3',
    outlined: 'rounded-lg px-2 border-2',
    minimal: 'rounded px-1'
  }

  const getColorClasses = () => {
    const scheme = colorScheme === 'rainbow' ? rainbowColor : colorScheme

    const colorMap = {
      default: {
        badge: 'bg-gray-100 text-gray-800',
        pill: 'bg-gray-100 text-gray-800',
        outlined: 'border-gray-300 text-gray-700 bg-transparent',
        minimal: 'text-gray-700'
      },
      primary: {
        badge: 'bg-blue-100 text-blue-800',
        pill: 'bg-blue-100 text-blue-800',
        outlined: 'border-blue-300 text-blue-700 bg-transparent',
        minimal: 'text-blue-700'
      },
      secondary: {
        badge: 'bg-purple-100 text-purple-800',
        pill: 'bg-purple-100 text-purple-800',
        outlined: 'border-purple-300 text-purple-700 bg-transparent',
        minimal: 'text-purple-700'
      },
      // Rainbow colors
      purple: {
        badge: 'bg-purple-100 text-purple-800',
        pill: 'bg-purple-100 text-purple-800',
        outlined: 'border-purple-300 text-purple-700 bg-transparent',
        minimal: 'text-purple-700'
      },
      pink: {
        badge: 'bg-pink-100 text-pink-800',
        pill: 'bg-pink-100 text-pink-800',
        outlined: 'border-pink-300 text-pink-700 bg-transparent',
        minimal: 'text-pink-700'
      },
      blue: {
        badge: 'bg-blue-100 text-blue-800',
        pill: 'bg-blue-100 text-blue-800',
        outlined: 'border-blue-300 text-blue-700 bg-transparent',
        minimal: 'text-blue-700'
      },
      green: {
        badge: 'bg-green-100 text-green-800',
        pill: 'bg-green-100 text-green-800',
        outlined: 'border-green-300 text-green-700 bg-transparent',
        minimal: 'text-green-700'
      },
      yellow: {
        badge: 'bg-yellow-100 text-yellow-800',
        pill: 'bg-yellow-100 text-yellow-800',
        outlined: 'border-yellow-300 text-yellow-700 bg-transparent',
        minimal: 'text-yellow-700'
      },
      orange: {
        badge: 'bg-orange-100 text-orange-800',
        pill: 'bg-orange-100 text-orange-800',
        outlined: 'border-orange-300 text-orange-700 bg-transparent',
        minimal: 'text-orange-700'
      },
      red: {
        badge: 'bg-red-100 text-red-800',
        pill: 'bg-red-100 text-red-800',
        outlined: 'border-red-300 text-red-700 bg-transparent',
        minimal: 'text-red-700'
      },
      indigo: {
        badge: 'bg-indigo-100 text-indigo-800',
        pill: 'bg-indigo-100 text-indigo-800',
        outlined: 'border-indigo-300 text-indigo-700 bg-transparent',
        minimal: 'text-indigo-700'
      },
      gray: {
        badge: 'bg-gray-100 text-gray-800',
        pill: 'bg-gray-100 text-gray-800',
        outlined: 'border-gray-300 text-gray-700 bg-transparent',
        minimal: 'text-gray-700'
      }
    }

    return colorMap[scheme as keyof typeof colorMap]?.[variant] || colorMap.default[variant]
  }

  const clickableClasses = clickable 
    ? 'cursor-pointer hover:scale-105 hover:shadow-md' 
    : ''

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${getColorClasses()}
    ${clickableClasses}
    ${className}
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

  const getDisplayText = () => {
    const prefix = customPrefix || (showPrefix ? 'Grade ' : '')
    
    // Format special grades
    if (gradeString.toLowerCase() === 'k' || gradeString === '0') {
      return `${prefix}K`
    }
    if (gradeString.toLowerCase().includes('pre')) {
      return `${prefix}Pre-K`
    }
    if (gradeString.toLowerCase() === 'pk') {
      return `${prefix}PK`
    }
    
    return `${prefix}${gradeString}`
  }

  const ariaLabel = `Grade ${gradeString}${clickable ? ', clickable' : ''}`

  return (
    <span
      className={combinedClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
    >
      {getDisplayText()}
    </span>
  )
}

// Utility function to format grade levels consistently
export const formatGrade = (grade: string | number): string => {
  const gradeString = String(grade).toLowerCase()
  
  if (gradeString === 'k' || gradeString === '0') return 'K'
  if (gradeString.includes('pre')) return 'Pre-K'
  if (gradeString === 'pk') return 'PK'
  
  return String(grade)
}

// Export types for external use
export type { ClassGradeIndicatorProps }