'use client'

import React, { useState } from 'react'
import { isClassEmpty, type ClassStudent } from '../utilities/classUtils'

interface AssignmentButtonProps {
  /** Type of assignment action */
  action: 'assign' | 'unassign' | 'reassign' | 'bulk-assign'
  /** Button text (optional, will use default based on action) */
  text?: string
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Whether the button is disabled */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Click handler */
  onClick?: () => void | Promise<void>
  /** Additional CSS classes */
  className?: string
  /** Icon to display (optional) */
  icon?: React.ReactNode
  /** Whether to show icon only */
  iconOnly?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Number of items being assigned (for bulk operations) */
  count?: number
  /** Whether to show confirmation dialog */
  requireConfirmation?: boolean
  /** Confirmation message */
  confirmationMessage?: string
  /** Auto-disable if class is empty */
  autoDisableEmpty?: boolean
  /** Class data for empty check */
  classData?: {
    students?: any[]
    id?: string
    name?: string
  }
  /** Class-student relationships for empty check */
  classRelationships?: ClassStudent[]
}

export default function AssignmentButton({
  action,
  text,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  iconOnly = false,
  tooltip,
  count,
  requireConfirmation = false,
  confirmationMessage,
  autoDisableEmpty = false,
  classData,
  classRelationships
}: AssignmentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if button should be disabled due to empty class
  const shouldDisableForEmptyClass = (): boolean => {
    if (!autoDisableEmpty || !classData) return false
    
    try {
      // Use utility function if we have both classId and relationships
      if (classData.id && classRelationships) {
        return isClassEmpty(classData.id, classRelationships)
      }
      
      // If classData has students array, check it directly
      if (classData.students) {
        return classData.students.length === 0
      }
      
      // If classData has id but no students array or relationships, 
      // we can't determine emptiness, so don't disable
      return false
    } catch (error) {
      console.warn('Error checking if class is empty:', error)
      return false
    }
  }

  // Default texts based on action
  const getDefaultText = () => {
    switch (action) {
      case 'assign':
        return count && count > 1 ? `Assign ${count} Students` : 'Assign Student'
      case 'unassign':
        return count && count > 1 ? `Remove ${count} Students` : 'Remove Student'
      case 'reassign':
        return count && count > 1 ? `Reassign ${count} Students` : 'Reassign Student'
      case 'bulk-assign':
        return `Bulk Assign (${count || 0})`
      default:
        return 'Assign'
    }
  }

  // Default icons based on action
  const getDefaultIcon = () => {
    if (icon) return icon

    switch (action) {
      case 'assign':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      case 'unassign':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        )
      case 'reassign':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        )
      case 'bulk-assign':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      default:
        return null
    }
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded gap-1',
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2 text-sm rounded-md gap-2',
    lg: 'px-6 py-3 text-base rounded-lg gap-2'
  }

  const variantClasses = {
    primary: {
      assign: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      unassign: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      reassign: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      'bulk-assign': 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    },
    secondary: {
      assign: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      unassign: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      reassign: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      'bulk-assign': 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
    },
    outline: {
      assign: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      unassign: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
      reassign: 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      'bulk-assign': 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
    },
    ghost: {
      assign: 'text-blue-600 hover:bg-blue-100 focus:ring-blue-500',
      unassign: 'text-red-600 hover:bg-red-100 focus:ring-red-500',
      reassign: 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500',
      'bulk-assign': 'text-green-600 hover:bg-green-100 focus:ring-green-500'
    },
    danger: {
      assign: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      unassign: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      reassign: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      'bulk-assign': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }
  }

  const isEmptyClass = shouldDisableForEmptyClass()
  const isButtonDisabled = disabled || isEmptyClass
  const disabledClasses = 'opacity-50 cursor-not-allowed'
  const loadingClasses = 'cursor-wait'

  const buttonVariantClasses = variantClasses[variant][action] || variantClasses.primary[action]
  
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${buttonVariantClasses}
    ${isButtonDisabled ? disabledClasses : ''}
    ${loading || isProcessing ? loadingClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  const handleClick = async () => {
    if (isButtonDisabled || loading || isProcessing || !onClick) return

    // Show confirmation dialog if required
    if (requireConfirmation) {
      const message = confirmationMessage || 
        `Are you sure you want to ${action.replace('-', ' ')} ${count && count > 1 ? `${count} students` : 'this student'}?`
      
      if (!window.confirm(message)) {
        return
      }
    }

    setIsProcessing(true)
    try {
      await onClick()
    } catch (error) {
      console.error(`Error during ${action}:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isLoading = loading || isProcessing
  const displayText = text || getDefaultText()
  const displayIcon = getDefaultIcon()

  return (
    <button
      type="button"
      className={combinedClasses}
      onClick={handleClick}
      disabled={isButtonDisabled || isLoading}
      title={tooltip || displayText}
      aria-label={`${displayText}${isButtonDisabled ? ' (disabled)' : ''}${isEmptyClass ? ' - no students in class' : ''}${isLoading ? ' (loading)' : ''}`}
    >
      {/* Loading spinner or icon */}
      {isLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : displayIcon ? (
        displayIcon
      ) : null}

      {/* Button text (hidden if iconOnly) */}
      {!iconOnly && (
        <span className={isLoading ? 'opacity-75' : ''}>
          {isLoading ? 'Processing...' : displayText}
        </span>
      )}
    </button>
  )
}

// Export types for external use
export type { AssignmentButtonProps }