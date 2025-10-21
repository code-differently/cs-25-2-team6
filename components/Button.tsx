import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline-primary' | 'outline-secondary' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  id?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  id,
  ariaLabel,
  icon,
  iconPosition = 'left'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: '14px',
      borderRadius: '4px',
      minHeight: '32px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '16px',
      borderRadius: '6px',
      minHeight: '40px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '18px',
      borderRadius: '8px',
      minHeight: '48px'
    }
  };

  const variantStyles = {
    primary: {
      background: '#007bff',
      color: 'white',
      border: '1px solid #007bff',
      hoverBg: '#0056b3',
      hoverBorder: '#0056b3'
    },
    secondary: {
      background: '#6c757d',
      color: 'white',
      border: '1px solid #6c757d',
      hoverBg: '#545b62',
      hoverBorder: '#545b62'
    },
    success: {
      background: '#28a745',
      color: 'white',
      border: '1px solid #28a745',
      hoverBg: '#1e7e34',
      hoverBorder: '#1e7e34'
    },
    warning: {
      background: '#ffc107',
      color: '#212529',
      border: '1px solid #ffc107',
      hoverBg: '#e0a800',
      hoverBorder: '#e0a800'
    },
    danger: {
      background: '#dc3545',
      color: 'white',
      border: '1px solid #dc3545',
      hoverBg: '#bd2130',
      hoverBorder: '#bd2130'
    },
    'outline-primary': {
      background: 'transparent',
      color: '#007bff',
      border: '1px solid #007bff',
      hoverBg: '#007bff',
      hoverBorder: '#007bff'
    },
    'outline-secondary': {
      background: 'transparent',
      color: '#6c757d',
      border: '1px solid #6c757d',
      hoverBg: '#6c757d',
      hoverBorder: '#6c757d'
    },
    link: {
      background: 'transparent',
      color: '#007bff',
      border: '1px solid transparent',
      hoverBg: 'transparent',
      hoverBorder: 'transparent'
    }
  };

  const LoadingSpinner = () => (
    <div className="button-spinner">
      <style jsx>{`
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: ${iconPosition === 'left' ? '8px' : '0'};
          margin-left: ${iconPosition === 'right' ? '8px' : '0'};
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <button
      type={type}
      id={id}
      className={`custom-button ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
    >
      <style jsx>{`
        .custom-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          font-weight: 500;
          text-align: center;
          text-decoration: none;
          vertical-align: middle;
          cursor: ${disabled || loading ? 'not-allowed' : 'pointer'};
          border: ${variantStyles[variant].border};
          background-color: ${variantStyles[variant].background};
          color: ${variantStyles[variant].color};
          padding: ${sizeStyles[size].padding};
          font-size: ${sizeStyles[size].fontSize};
          border-radius: ${sizeStyles[size].borderRadius};
          min-height: ${sizeStyles[size].minHeight};
          width: ${fullWidth ? '100%' : 'auto'};
          opacity: ${disabled || loading ? '0.65' : '1'};
          transition: all 0.15s ease-in-out;
          position: relative;
          overflow: hidden;
        }
        
        .custom-button:hover:not(:disabled) {
          background-color: ${variantStyles[variant].hoverBg};
          border-color: ${variantStyles[variant].hoverBorder};
          color: ${variant.startsWith('outline-') ? 'white' : variantStyles[variant].color};
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .custom-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .custom-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px ${variantStyles[variant].background}33;
        }
        
        .custom-button.link-variant:hover {
          text-decoration: underline;
          transform: none;
          box-shadow: none;
        }
        
        .button-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-direction: ${iconPosition === 'right' ? 'row-reverse' : 'row'};
        }
        
        .button-icon {
          display: flex;
          align-items: center;
          font-size: ${parseInt(sizeStyles[size].fontSize) * 0.875}px;
        }
      `}</style>
      
      <div className="button-content">
        {loading && <LoadingSpinner />}
        {!loading && icon && <span className="button-icon">{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  );
};

export default Button;