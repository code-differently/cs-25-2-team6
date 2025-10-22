import React, { useEffect, useState } from 'react';

interface SuccessMessageProps {
  message: string;
  duration?: number; // in milliseconds
  autoHide?: boolean;
  onClose?: () => void;
  showIcon?: boolean;
  variant?: 'success' | 'info' | 'confirmation';
  className?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  duration = 5000,
  autoHide = true,
  onClose,
  showIcon = true,
  variant = 'success',
  className = '',
  actionButton
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoHide) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return Math.max(0, newProgress);
      });
    }, 100);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, autoHide]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case 'success':
        return {
          className: 'success-message--success',
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          textColor: '#155724',
          progressColor: '#28a745',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#28a745"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )
        };
      case 'info':
        return {
          className: 'success-message--info',
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          textColor: '#0c5460',
          progressColor: '#17a2b8',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#17a2b8"/>
              <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2"/>
            </svg>
          )
        };
      case 'confirmation':
        return {
          className: 'success-message--confirmation',
          backgroundColor: '#e2d9f3',
          borderColor: '#d1b2ff',
          textColor: '#4a154b',
          progressColor: '#6f42c1',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#6f42c1"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )
        };
      default:
        return {
          className: 'success-message--success',
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          textColor: '#155724',
          progressColor: '#28a745',
          icon: null
        };
    }
  };

  const config = getVariantConfig();

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`success-message ${config.className} ${className}`}
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        color: config.textColor
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="success-message__content">
        {showIcon && config.icon && (
          <div className="success-message__icon">
            {config.icon}
          </div>
        )}
        
        <div className="success-message__text">
          {message}
        </div>

        <div className="success-message__actions">
          {actionButton && (
            <button
              className="success-message__action-button"
              onClick={actionButton.onClick}
              style={{ color: config.textColor }}
            >
              {actionButton.label}
            </button>
          )}
          
          <button
            className="success-message__close-button"
            onClick={handleClose}
            aria-label="Close message"
            style={{ color: config.textColor }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {autoHide && (
        <div 
          className="success-message__progress"
          style={{
            backgroundColor: config.progressColor,
            width: `${progress}%`
          }}
        />
      )}
    </div>
  );
};

export default SuccessMessage;