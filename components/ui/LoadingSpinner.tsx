import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  color?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
  color = '#007bff',
  overlay = false
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      default:
        return 'spinner-medium';
    }
  };

  const spinnerContent = (
    <div className={`loading-spinner ${getSizeClass()} ${className}`}>
      <div 
        className="spinner"
        style={{ borderTopColor: color }}
      >
        <div className="spinner-inner"></div>
      </div>
      {message && (
        <div className="spinner-message">
          {message}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="spinner-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;