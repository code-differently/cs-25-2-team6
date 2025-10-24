'use client'

import React from 'react'

interface ClassStatusIconProps {
  /** Status of the class */
  status: 'active' | 'inactive' | 'pending' | 'full' | 'cancelled' | 'archived' | 'draft'
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
}

export default function ClassStatusIcon({
  status,
  size = 'md',
  showText = false,
  clickable = false,
  onClick,
  className = '',
  tooltip,
  animated = true
}: ClassStatusIconProps) {
  
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

  const ariaLabel = `Class status: ${config.text}${clickable ? ', clickable' : ''}`
  const titleText = tooltip || `Status: ${config.text}`

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
          {config.text}
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
    draft: 'blue'
  }
  return colorMap[status] || 'gray'
}

// Utility function to check if status should be animated
export const shouldStatusAnimate = (status: ClassStatusIconProps['status']) => {
  return status === 'pending'
}

// Export types for external use
export type { ClassStatusIconProps }