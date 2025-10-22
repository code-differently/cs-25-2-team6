import React from 'react';

interface EmptyReportStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyReportState: React.FC<EmptyReportStateProps> = ({
  title = "No Report Data",
  message = "There's no data available for the selected criteria. Try adjusting your filters or date range.",
  icon,
  actionButton,
  className = ''
}) => {
  const defaultIcon = (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="empty-state-icon"
    >
      <path 
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <polyline 
        points="14,2 14,8 20,8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <line 
        x1="16" 
        y1="13" 
        x2="8" 
        y2="13" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <line 
        x1="16" 
        y1="17" 
        x2="8" 
        y2="17" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <polyline 
        points="10,9 9,9 8,9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className={`empty-report-state ${className}`}>
      <div className="empty-state-content">
        <div className="empty-state-icon-container">
          {icon || defaultIcon}
        </div>
        <h3 className="empty-state-title">
          {title}
        </h3>
        <p className="empty-state-message">
          {message}
        </p>
        {actionButton && (
          <button 
            className="empty-state-button"
            onClick={actionButton.onClick}
          >
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyReportState;