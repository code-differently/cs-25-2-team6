'use client'

import React from 'react'
import { formatClassSummary, generateClassDisplayText, isClassEmpty, type ClassProfile, type ClassStudent } from '../utilities/classUtils'

interface ClassStatusIconProps {
  /** Status of the class */
  status: 'active' | 'inactive' | 'pending' | 'full' | 'cancelled' | 'archived' | 'draft' | 'empty' | 'warning' | 'error'
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Whether to show status text alongside icon */
  showText?: boolean
  /** Whether the icon is clickable */
  clickable?: boolean
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
  /** Custom tooltip text */
  tooltip?: string
  /** Whether to use pulse animation for certain statuses */
  animated?: boolean
  /** Auto-detect status from class data */
  autoDetectStatus?: boolean
  /** Class data for auto-detection */
  classData?: ClassProfile
  /** Class relationships for empty check */
  classRelationships?: ClassStudent[]
  /** Custom status text */
  customText?: string
}

export default function ClassStatusIcon({
  status: propStatus,
  size = 'md',
  showText = false,
  clickable = false,
  onClick,
  className = '',
  tooltip,
  animated = true,
  autoDetectStatus = false,
  classData,
  classRelationships,
  customText
}: ClassStatusIconProps) {
  
  // Auto-detect status from class data
  const getAutoDetectedStatus = (): ClassStatusIconProps['status'] => {
    if (!classData) return propStatus
    
    try {
      // Check if class is empty
      if (classData.id && classRelationships) {
        if (isClassEmpty(classData.id, classRelationships)) {
          return 'empty'
        }
      }
      
      // Check if class has capacity limits
      if (classData.capacity && classRelationships) {
        const enrolledCount = classRelationships.filter(rel => 
          rel.classId === classData.id && rel.status === 'enrolled'
        ).length
        
        if (enrolledCount >= classData.capacity) {
          return 'full'
        }
        if (enrolledCount / classData.capacity > 0.9) {
          return 'warning'
        }
      }
      
      // Check class status
      if (classData.status) {
        switch (classData.status.toLowerCase()) {
          case 'active':
          case 'ongoing':
            return 'active'
          case 'inactive':
          case 'suspended':
            return 'inactive'
          case 'pending':
          case 'scheduled':
            return 'pending'
          case 'archived':
          case 'completed':
            return 'archived'
          case 'cancelled':
            return 'cancelled'
          case 'draft':
            return 'draft'
          default:
            return 'active'
        }
      }
      
      return 'active'
    } catch (error) {
      console.warn('Error auto-detecting class status:', error)
      return propStatus
    }
  }
  
  const status = autoDetectStatus ? getAutoDetectedStatus() : propStatus
  
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Active',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'inactive':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          text: 'Inactive',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Pending',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shouldPulse: true
        }
      case 'full':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          text: 'Full',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'cancelled':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: 'Cancelled',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'archived':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          text: 'Archived',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4m0 2l-4 4-4-4m0 2l4 4 4-4" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'draft':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: 'Draft',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'empty':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          text: customText || 'Empty',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ),
          shouldPulse: false
        }
      case 'warning':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: customText || 'Near Full',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          shouldPulse: true
        }
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: customText || 'Error',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shouldPulse: true
        }
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          text: 'Unknown',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          shouldPulse: false
        }
    }
  }

  const config = getStatusConfig()
  const shouldAnimate = animated && config.shouldPulse

  const iconClasses = `
    ${sizeClasses[size]}
    ${config.color}
    ${shouldAnimate ? 'animate-pulse' : ''}
  `.trim().replace(/\s+/g, ' ')

  const containerClasses = `
    inline-flex items-center gap-1.5
    ${clickable ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}
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

  const getDisplayText = (): string => {
    if (customText) return customText
    
    if (autoDetectStatus && classData) {
      try {
        return generateClassDisplayText(classData)
      } catch (error) {
        console.warn('Error generating class display text:', error)
      }
    }
    
    return config.text
  }

  const getTooltipText = (): string => {
    if (tooltip) return tooltip
    
    if (autoDetectStatus && classData) {
      try {
        const studentCount = classRelationships ? 
          classRelationships.filter(rel => rel.classId === classData.id && rel.status === 'enrolled').length : 
          0
        return formatClassSummary(classData, studentCount)
      } catch (error) {
        console.warn('Error formatting class summary:', error)
      }
    }
    
    return `Status: ${config.text}`
  }

  const displayText = getDisplayText()
  const ariaLabel = `Class status: ${displayText}${clickable ? ', clickable' : ''}`
  const titleText = getTooltipText()

  return (
    <div
      className={containerClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      title={titleText}
    >
      {/* Status Icon */}
      <span className={iconClasses}>
        {config.icon}
      </span>

      {/* Status Text */}
      {showText && (
        <span className={`font-medium ${config.color} ${textSizeClasses[size]}`}>
          {displayText}
        </span>
      )}
    </div>
  )
}

// Utility function to get status color for external use
export const getStatusColor = (status: ClassStatusIconProps['status']) => {
  const colorMap = {
    active: 'green',
    inactive: 'gray', 
    pending: 'yellow',
    full: 'orange',
    cancelled: 'red',
    archived: 'gray',
    draft: 'blue',
    empty: 'gray',
    warning: 'yellow',
    error: 'red'
  }
  return colorMap[status] || 'gray'
}

// Utility function to check if status should be animated
export const shouldStatusAnimate = (status: ClassStatusIconProps['status']) => {
  return status === 'pending'
}

// Export types for external use
export type { ClassStatusIconProps }