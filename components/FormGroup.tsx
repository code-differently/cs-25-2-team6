import React from 'react';

interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  labelPosition?: 'top' | 'left' | 'inline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  className = '',
  labelPosition = 'top',
  size = 'medium',
  disabled = false
}) => {
  const sizeStyles = {
    small: {
      gap: '4px',
      labelFont: '14px',
      helpFont: '12px'
    },
    medium: {
      gap: '6px',
      labelFont: '16px',
      helpFont: '14px'
    },
    large: {
      gap: '8px',
      labelFont: '18px',
      helpFont: '16px'
    }
  };

  const isInline = labelPosition === 'inline';
  const isLeft = labelPosition === 'left';

  return (
    <div className={`form-group ${className}`}>
      <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: ${isLeft ? 'row' : 'column'};
          gap: ${sizeStyles[size].gap};
          margin-bottom: ${isInline ? '0' : '1rem'};
          opacity: ${disabled ? '0.6' : '1'};
          align-items: ${isLeft ? 'flex-start' : 'stretch'};
        }
        
        .form-group.inline {
          flex-direction: row;
          align-items: center;
          gap: 12px;
        }
        
        .label-container {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: ${isLeft ? '140px' : 'auto'};
          flex-shrink: 0;
        }
        
        .form-label {
          font-size: ${sizeStyles[size].labelFont};
          font-weight: 500;
          color: ${disabled ? '#6c757d' : '#212529'};
          cursor: ${disabled ? 'default' : 'pointer'};
          margin: 0;
          line-height: 1.5;
        }
        
        .required-asterisk {
          color: #dc3545;
          font-weight: 600;
          margin-left: 2px;
        }
        
        .form-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .field-wrapper {
          position: relative;
        }
        
        .help-text {
          font-size: ${sizeStyles[size].helpFont};
          color: #6c757d;
          margin: 0;
          line-height: 1.4;
        }
        
        .error-text {
          font-size: ${sizeStyles[size].helpFont};
          color: #dc3545;
          margin: 0;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .error-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .field-with-error {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1) !important;
        }
        
        /* Style child form elements when there's an error */
        .form-group.has-error :global(input),
        .form-group.has-error :global(select),
        .form-group.has-error :global(textarea) {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
        }
        
        .form-group.has-error :global(input):focus,
        .form-group.has-error :global(select):focus,
        .form-group.has-error :global(textarea):focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
        }
        
        /* Enhance child form elements styling */
        .form-group :global(input),
        .form-group :global(select),
        .form-group :global(textarea) {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: ${sizeStyles[size].labelFont};
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          background-color: ${disabled ? '#f8f9fa' : 'white'};
        }
        
        .form-group :global(input):focus,
        .form-group :global(select):focus,
        .form-group :global(textarea):focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }
        
        .form-group :global(input):disabled,
        .form-group :global(select):disabled,
        .form-group :global(textarea):disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }
      `}</style>
      
      {label && (
        <div className="label-container">
          <label 
            htmlFor={htmlFor} 
            className="form-label"
          >
            {label}
            {required && <span className="required-asterisk">*</span>}
          </label>
        </div>
      )}
      
      <div className="form-field">
        <div className={`field-wrapper ${error ? 'has-error' : ''}`}>
          {children}
        </div>
        
        {error && (
          <p className="error-text" role="alert">
            <span className="error-icon">⚠</span>
            {error}
          </p>
        )}
        
        {!error && helpText && (
          <p className="help-text">
            {helpText}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormGroup;