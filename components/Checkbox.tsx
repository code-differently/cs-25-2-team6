import React from 'react';

interface CheckboxProps {
  id: string;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
  required?: boolean;
  className?: string;
  labelPosition?: 'left' | 'right';
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  variant = 'default',
  indeterminate = false,
  required = false,
  className = '',
  labelPosition = 'right'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const sizeStyles = {
    small: { size: '16px', fontSize: '14px' },
    medium: { size: '20px', fontSize: '16px' },
    large: { size: '24px', fontSize: '18px' }
  };

  const variantColors = {
    default: '#007bff',
    primary: '#0056b3',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
  };

  return (
    <div className={`checkbox-container ${className}`}>
      <style jsx>{`
        .checkbox-container {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.6' : '1'};
          flex-direction: ${labelPosition === 'left' ? 'row-reverse' : 'row'};
        }
        
        .checkbox-wrapper {
          position: relative;
          display: inline-block;
        }
        
        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: ${sizeStyles[size].size};
          height: ${sizeStyles[size].size};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }
        
        .checkbox-custom {
          width: ${sizeStyles[size].size};
          height: ${sizeStyles[size].size};
          border: 2px solid ${checked || indeterminate ? variantColors[variant] : '#dee2e6'};
          border-radius: 4px;
          background-color: ${checked || indeterminate ? variantColors[variant] : 'white'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .checkbox-input:focus + .checkbox-custom {
          box-shadow: 0 0 0 2px ${variantColors[variant]}33;
          outline: none;
        }
        
        .checkbox-input:hover:not(:disabled) + .checkbox-custom {
          border-color: ${variantColors[variant]};
        }
        
        .checkbox-checkmark {
          color: white;
          font-size: ${parseInt(sizeStyles[size].size) * 0.75}px;
          font-weight: bold;
          opacity: ${checked ? '1' : '0'};
          transition: opacity 0.15s ease;
        }
        
        .checkbox-indeterminate {
          width: ${parseInt(sizeStyles[size].size) * 0.5}px;
          height: 2px;
          background-color: white;
          opacity: ${indeterminate ? '1' : '0'};
          transition: opacity 0.15s ease;
        }
        
        .checkbox-label {
          font-size: ${sizeStyles[size].fontSize};
          color: ${disabled ? '#6c757d' : '#212529'};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          user-select: none;
          line-height: 1.5;
        }
        
        .checkbox-required {
          color: #dc3545;
          margin-left: 4px;
        }
        
        /* Animation for checkmark */
        @keyframes checkmark-appear {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .checkbox-checkmark.animate {
          animation: checkmark-appear 0.2s ease;
        }
      `}</style>
      
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={id}
          name={name || id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className="checkbox-input"
          ref={(input) => {
            if (input) {
              input.indeterminate = indeterminate;
            }
          }}
        />
        <div className="checkbox-custom">
          {!indeterminate && (
            <span className={`checkbox-checkmark ${checked ? 'animate' : ''}`}>
              ✓
            </span>
          )}
          {indeterminate && <div className="checkbox-indeterminate" />}
        </div>
      </div>
      
      {label && (
        <label htmlFor={id} className="checkbox-label">
          {label}
          {required && <span className="checkbox-required">*</span>}
        </label>
      )}
    </div>
  );
};

export default Checkbox;