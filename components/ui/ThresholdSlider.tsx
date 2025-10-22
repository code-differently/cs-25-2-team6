import React, { useState, useCallback } from 'react';
import { AlertSeverity, getAlertSeverityColor } from '../utilities/alertUtils';

export interface ThresholdSliderProps {
  /** Current threshold value (0-100) */
  value: number;
  /** Callback when threshold value changes */
  onChange: (value: number) => void;
  /** Minimum threshold value */
  min?: number;
  /** Maximum threshold value */
  max?: number;
  /** Step size for threshold increments */
  step?: number;
  /** Label for the slider */
  label?: string;
  /** Help text explaining the threshold */
  helpText?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Show sensitivity indicators */
  showSensitivity?: boolean;
  /** Show threshold marks */
  showMarks?: boolean;
  /** Custom marks for specific values */
  marks?: Array<{ value: number; label: string }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ThresholdSlider - Interactive slider for setting alert thresholds
 * 
 * Provides visual feedback with color-coded sensitivity levels and threshold marks.
 * Includes accessibility features and customizable appearance.
 */
const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label = 'Alert Threshold',
  helpText,
  disabled = false,
  showSensitivity = true,
  showMarks = true,
  marks,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Calculate threshold severity based on value
  const getThresholdSeverity = useCallback((thresholdValue: number): AlertSeverity => {
    if (thresholdValue <= 25) return 'low';
    if (thresholdValue <= 50) return 'medium';
    if (thresholdValue <= 75) return 'high';
    return 'critical';
  }, []);

  // Calculate sensitivity level
  const getSensitivityLevel = useCallback((thresholdValue: number): string => {
    if (thresholdValue <= 25) return 'Low Sensitivity';
    if (thresholdValue <= 50) return 'Moderate Sensitivity';
    if (thresholdValue <= 75) return 'High Sensitivity';
    return 'Maximum Sensitivity';
  }, []);

  // Default marks if not provided
  const defaultMarks = [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' }
  ];

  const thresholdMarks = marks || defaultMarks;
  const currentSeverity = getThresholdSeverity(value);
  const sensitivityLevel = getSensitivityLevel(value);

  // Handle slider input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    onChange(newValue);
  };

  // Handle mouse events for visual feedback
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // Calculate gradient background for slider track
  const getSliderBackground = () => {
    const colors = [
      getAlertSeverityColor('low'),
      getAlertSeverityColor('medium'),
      getAlertSeverityColor('high'),
      getAlertSeverityColor('critical')
    ];
    return `linear-gradient(to right, ${colors.join(', ')})`;
  };

  const sliderClasses = [
    'threshold-slider',
    isDragging && 'threshold-slider--dragging',
    disabled && 'threshold-slider--disabled'
  ].filter(Boolean).join(' ');

  return (
    <div className={`${sliderClasses} ${className}`.trim()}>
      {/* Header Section */}
      <div className="threshold-slider__header">
        <label 
          htmlFor="threshold-slider-input" 
          className="threshold-slider__label"
        >
          {label}
          <span className="threshold-slider__value">
            {value}%
          </span>
        </label>
        
        {showSensitivity && (
          <div 
            className={`threshold-slider__sensitivity threshold-slider__sensitivity--${currentSeverity}`}
            role="status"
            aria-label={`Current sensitivity: ${sensitivityLevel}`}
          >
            {sensitivityLevel}
          </div>
        )}
      </div>

      {/* Slider Container */}
      <div className="threshold-slider__container">
        <input
          id="threshold-slider-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled}
          className="threshold-slider__input"
          style={{
            background: getSliderBackground()
          }}
          aria-label={`${label}: ${value}% (${sensitivityLevel})`}
          aria-describedby={helpText ? 'threshold-slider-help' : undefined}
        />
        
        {/* Current Value Indicator */}
        <div 
          className="threshold-slider__indicator"
          style={{
            left: `${(value - min) / (max - min) * 100}%`,
            backgroundColor: getAlertSeverityColor(currentSeverity)
          }}
          aria-hidden="true"
        />
      </div>

      {/* Marks */}
      {showMarks && (
        <div className="threshold-slider__marks" role="presentation">
          {thresholdMarks.map((mark) => (
            <div
              key={mark.value}
              className={`threshold-slider__mark ${
                mark.value === value ? 'threshold-slider__mark--active' : ''
              }`}
              style={{
                left: `${(mark.value - min) / (max - min) * 100}%`
              }}
            >
              <div className="threshold-slider__mark-line" />
              <div className="threshold-slider__mark-label">
                {mark.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <div 
          id="threshold-slider-help"
          className="threshold-slider__help"
          role="note"
        >
          {helpText}
        </div>
      )}

      {/* Live Region for Screen Readers */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
      >
        {isDragging && `Threshold set to ${value}%, ${sensitivityLevel}`}
      </div>
    </div>
  );
};

// Preset threshold sliders for common use cases
export const AttendanceThresholdSlider: React.FC<Omit<ThresholdSliderProps, 'label' | 'helpText'>> = (props) => (
  <ThresholdSlider
    {...props}
    label="Attendance Alert Threshold"
    helpText="Set the attendance percentage that triggers alerts for students"
  />
);

export const TardinessThresholdSlider: React.FC<Omit<ThresholdSliderProps, 'label' | 'helpText'>> = (props) => (
  <ThresholdSlider
    {...props}
    label="Tardiness Alert Threshold"
    helpText="Set the number of late arrivals that triggers tardiness alerts"
    max={20}
    marks={[
      { value: 0, label: '0' },
      { value: 5, label: '5' },
      { value: 10, label: '10' },
      { value: 15, label: '15' },
      { value: 20, label: '20+' }
    ]}
  />
);

export const AbsenceThresholdSlider: React.FC<Omit<ThresholdSliderProps, 'label' | 'helpText'>> = (props) => (
  <ThresholdSlider
    {...props}
    label="Absence Alert Threshold"
    helpText="Set the number of consecutive absences that triggers alerts"
    max={10}
    marks={[
      { value: 0, label: '0' },
      { value: 2, label: '2' },
      { value: 4, label: '4' },
      { value: 6, label: '6' },
      { value: 8, label: '8' },
      { value: 10, label: '10+' }
    ]}
  />
);

export default ThresholdSlider;