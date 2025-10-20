import React from 'react';

interface SuccessMessageProps {
  message: string;
  heading?: string;
  onClose?: () => void;
  showIcon?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  containerClass?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  heading,
  onClose,
  showIcon = true,
  autoHide = false,
  autoHideDelay = 5000,
  containerClass = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const CheckIcon = () => (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`success-message-container ${containerClass}`}>
      <style jsx>{`
        .success-message-container {
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 16px;
          margin: 8px 0;
          position: relative;
          transition: opacity 0.3s ease-in-out;
        }
        .success-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .success-icon {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .success-text {
          flex: 1;
        }
        .success-heading {
          font-weight: 600;
          color: #166534;
          margin-bottom: 4px;
          font-size: 16px;
        }
        .success-description {
          color: #0369a1;
          line-height: 1.5;
          font-size: 14px;
        }
        .success-close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: #0369a1;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .success-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        .auto-hide-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background-color: #16a34a;
          border-radius: 0 0 6px 6px;
          animation: shrink ${autoHideDelay}ms linear;
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      
      <div className="success-content">
        {showIcon && (
          <div className="success-icon">
            <CheckIcon />
          </div>
        )}
        <div className="success-text">
          {heading && <div className="success-heading">{heading}</div>}
          <div className="success-description">{message}</div>
        </div>
      </div>
      
      {onClose && (
        <button 
          className="success-close-btn"
          onClick={handleClose}
          aria-label="Dismiss success message"
        >
          ×
        </button>
      )}
      
      {autoHide && isVisible && (
        <div className="auto-hide-progress" />
      )}
    </div>
  );
};

export default SuccessMessage;