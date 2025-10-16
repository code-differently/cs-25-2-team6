import React from 'react';

interface ErrorMessageProps {
  message: string;
  heading?: string;
  onClose?: () => void;
  type?: 'error' | 'warning';
  containerClass?: string;
  displayIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  heading,
  onClose,
  type = 'error',
  containerClass = '',
  displayIcon = true
}) => {
  const typeStyles = {
    error: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      headingColor: '#7f1d1d',
      iconColor: '#dc2626'
    },
    warning: {
      background: '#fffbeb',
      border: '#fed7aa',
      text: '#92400e',
      headingColor: '#78350f',
      iconColor: '#d97706'
    }
  };

  const AlertIcon = () => {
    if (type === 'error') {
      return (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
    );
  };

  return (
    <div className={`error-message-container ${containerClass}`}>
      <style jsx>{`
        .error-message-container {
          background-color: ${typeStyles[type].background};
          border: 1px solid ${typeStyles[type].border};
          border-radius: 6px;
          padding: 16px;
          margin: 8px 0;
          position: relative;
        }
        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .error-icon {
          color: ${typeStyles[type].iconColor};
          flex-shrink: 0;
          margin-top: 2px;
        }
        .error-text {
          flex: 1;
        }
        .error-heading {
          font-weight: 600;
          color: ${typeStyles[type].headingColor};
          margin-bottom: 4px;
          font-size: 16px;
        }
        .error-description {
          color: ${typeStyles[type].text};
          line-height: 1.5;
          font-size: 14px;
        }
        .error-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: ${typeStyles[type].text};
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .error-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="error-content">
        {displayIcon && (
          <div className="error-icon">
            <AlertIcon />
          </div>
        )}
        <div className="error-text">
          {heading && <div className="error-heading">{heading}</div>}
          <div className="error-description">{message}</div>
        </div>
      </div>
      
      {onClose && (
        <button 
          className="error-close-btn"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;