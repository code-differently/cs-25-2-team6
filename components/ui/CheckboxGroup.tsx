import React from 'react';

interface CheckboxOption {
  id: string;
  label: string;
  value: string;
  checked?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  onChange: (selectedValues: string[]) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  onChange,
  label,
  className = '',
  disabled = false
}) => {
  const handleCheckboxChange = (value: string) => {
    const updatedOptions = options.map(option =>
      option.value === value ? { ...option, checked: !option.checked } : option
    );
    
    const selectedValues = updatedOptions
      .filter(option => option.checked)
      .map(option => option.value);
    
    onChange(selectedValues);
  };

  return (
    <div className={`checkbox-group ${className}`}>
      {label && (
        <label className="checkbox-group-label">
          {label}
        </label>
      )}
      <div className="checkbox-options">
        {options.map((option) => (
          <div key={option.id} className="checkbox-option">
            <input
              type="checkbox"
              id={option.id}
              value={option.value}
              checked={option.checked || false}
              onChange={() => handleCheckboxChange(option.value)}
              disabled={disabled}
              className="checkbox-input"
            />
            <label htmlFor={option.id} className="checkbox-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;