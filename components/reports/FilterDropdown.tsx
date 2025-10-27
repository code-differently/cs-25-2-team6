'use client'
import { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

interface OptionType {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: OptionType[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
}

function FilterDropdown({ label, options, selectedValues, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAll = () => {
    onChange(options.map(opt => opt.value));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return `Select ${label}`;
    if (selectedValues.length === 1) {
      const found = options.find(opt => opt.value === selectedValues[0]);
      return found ? found.label : selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button 
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getDisplayText()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-actions">
            <button onClick={handleSelectAll} className="action-btn">
              Select All
            </button>
            <button onClick={handleDeselectAll} className="action-btn">
              Deselect All
            </button>
          </div>
          
          <div className="dropdown-options">
            {options.map((option) => (
              <label key={option.value} className="dropdown-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;