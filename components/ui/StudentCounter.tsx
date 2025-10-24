'use client'

import React from 'react'
import { countStudentsInClass, ClassStudent } from '../utilities/classUtils'

interface StudentCounterProps {
  /** Current number of enrolled students */
  currentCount?: number
  /** Array of class-student relationships for auto-counting */
  relationships?: ClassStudent[]
  /** Class ID to count students for */
  classId?: string
  /** Maximum capacity of the class */
  maxCapacity: number
  /** Visual variant for different display styles */
  variant?: 'default' | 'compact' | 'detailed'
  /** Size of the counter display */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show a progress bar */
  showProgress?: boolean
  /** Whether to show percentage */
  showPercentage?: boolean
  /** Custom color scheme */
  colorScheme?: 'default' | 'success' | 'warning' | 'danger'
  /** Click handler for the counter */
  onClick?: () => void
  /** Whether the counter is clickable */
  clickable?: boolean
  /** Additional CSS classes */
  className?: string
  /** Auto-count students using utility function */
  autoCount?: boolean
}

export default function StudentCounter({
  currentCount,
  relationships = [],
  classId,
  maxCapacity,
  variant = 'default',
  size = 'md',
  showProgress = false,
  showPercentage = false,
  colorScheme = 'default',
  onClick,
  clickable = false,
  className = '',
  autoCount = false
}: StudentCounterProps) {
  /**
   * Get student count using utility function when auto-count is enabled
   */
  const getStudentCount = (): number => {
    if (autoCount && classId && relationships.length > 0) {
      return countStudentsInClass(classId, relationships)
    }
    return currentCount || 0
  }

  const studentCount = getStudentCount()
  const percentage = maxCapacity > 0 ? (studentCount / maxCapacity) * 100 : 0
  const isOverCapacity = studentCount > maxCapacity
  const isNearCapacity = percentage >= 90 && !isOverCapacity
  const isFull = studentCount === maxCapacity

  // Determine color scheme based on capacity
  const getColorScheme = () => {
    if (colorScheme !== 'default') return colorScheme
    if (isOverCapacity) return 'danger'
    if (isFull || isNearCapacity) return 'warning'
    return 'success'
  }

  const actualColorScheme = getColorScheme()

  const baseClasses = 'inline-flex items-center transition-all duration-200'
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const colorClasses = {
    default: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700'
  }

  const progressColorClasses = {
    default: 'bg-gray-200',
    success: 'bg-green-200',
    warning: 'bg-yellow-200',
    danger: 'bg-red-200'
  }

  const progressFillColorClasses = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  const clickableClasses = clickable ? 'cursor-pointer hover:opacity-80' : ''

  const containerClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${colorClasses[actualColorScheme]}
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

  // Render compact variant
  if (variant === 'compact') {
    return (
      <span
        className={containerClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={`${studentCount} of ${maxCapacity} students enrolled`}
      >
        <span className="font-semibold">
          {studentCount}/{maxCapacity}
        </span>
      </span>
    )
  }

  // Render detailed variant
  if (variant === 'detailed') {
    return (
      <div
        className={`${containerClasses} flex-col space-y-1`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={`${studentCount} of ${maxCapacity} students enrolled, ${percentage.toFixed(1)}% capacity`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">Students</span>
          <span className="font-semibold">
            {studentCount}/{maxCapacity}
          </span>
        </div>
        
        {showProgress && (
          <div className="w-full">
            <div className={`w-full h-2 rounded-full ${progressColorClasses[actualColorScheme]}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${progressFillColorClasses[actualColorScheme]}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
        
        {showPercentage && (
          <div className="text-xs opacity-75">
            {percentage.toFixed(1)}% capacity
          </div>
        )}
        
        {isOverCapacity && (
          <div className="text-xs text-red-600 font-medium">
            Over capacity by {studentCount - maxCapacity}
          </div>
        )}
      </div>
    )
  }

  // Render default variant
  return (
    <div
      className={`${containerClasses} space-x-2`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${studentCount} of ${maxCapacity} students enrolled`}
    >
      <span className="flex items-center space-x-1">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <span className="font-semibold">
          {studentCount}
        </span>
      </span>
      
      <span className="text-gray-400">/</span>
      
      <span className="font-medium">
        {maxCapacity}
      </span>
      
      {showProgress && (
        <div className="flex items-center ml-2">
          <div className={`w-16 h-2 rounded-full ${progressColorClasses[actualColorScheme]}`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${progressFillColorClasses[actualColorScheme]}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {showPercentage && (
        <span className="text-xs opacity-75 ml-1">
          ({percentage.toFixed(0)}%)
        </span>
      )}
    </div>
  )
}

// Export types for external use
export type { StudentCounterProps }