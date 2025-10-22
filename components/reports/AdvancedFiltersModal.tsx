'use client'
import { useState } from 'react';
import { ReportFilters } from '@/hooks/useReportFilters';
import './AdvancedFiltersModal.css';

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ReportFilters;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

function AdvancedFiltersModal({ isOpen, onClose, filters, onDateRangeChange }: AdvancedFiltersModalProps) {
  const [startDate, setStartDate] = useState(
    filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''
  );

  if (!isOpen) return null;

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(new Date(startDate), new Date(endDate));
    }
    onClose();
  };

  const handleCancel = () => {
    setStartDate(filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : '');
    setEndDate(filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : '');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Advanced Filters</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          <div className="filter-section">
            <label className="filter-label">Date Range</label>
            <div className="date-inputs">
              <div className="date-field">
                <label>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-field">
                <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCancel} className="secondary-btn">
            Cancel
          </button>
          <button onClick={handleApply} className="primary-btn">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedFiltersModal;