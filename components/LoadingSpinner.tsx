import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  theme?: 'blue' | 'gray' | 'light';
  message?: string;
  containerClass?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  theme = 'blue', 
  message,
  containerClass = '' 
}) => {
  const dimensions = {
    small: { width: '16px', height: '16px', border: '2px' },
    medium: { width: '24px', height: '24px', border: '3px' },
    large: { width: '32px', height: '32px', border: '4px' }
  };

  const themes = {
    blue: { border: '#3b82f6', top: 'transparent' },
    gray: { border: '#6b7280', top: 'transparent' },
    light: { border: '#ffffff', top: 'transparent' }
  };

  const spinnerStyle = {
    width: dimensions[size].width,
    height: dimensions[size].height,
    border: `${dimensions[size].border} solid ${themes[theme].border}`,
    borderTop: `${dimensions[size].border} solid ${themes[theme].top}`,
    borderRadius: '50%',
    animation: 'rotateSpinner 0.8s linear infinite'
  };

  return (
    <div className={`spinner-container ${containerClass}`}>
      <style jsx>{`
        @keyframes rotateSpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .spinner-text {
          margin-top: 8px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
      `}</style>
      <div 
        style={spinnerStyle}
        role="progressbar"
        aria-label={message || 'Content is loading'}
      />
      {message && <div className="spinner-text">{message}</div>}
    </div>
  );
};

export default LoadingSpinner;