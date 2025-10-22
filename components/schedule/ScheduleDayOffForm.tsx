'use client';

import React, { useState } from 'react';

interface ScheduleDayOffFormProps {
  onSubmit: (date: string, reason: string, description: string) => Promise<void>;
  initialDate?: Date;
  onCancel: () => void;
}

const ScheduleDayOffForm: React.FC<ScheduleDayOffFormProps> = ({
  onSubmit,
  initialDate = new Date(),
  onCancel
}) => {
  const [formData, setFormData] = useState({
    date: initialDate.toISOString().split('T')[0],
    reason: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      setError('Please select a reason');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await onSubmit(formData.date, formData.reason, formData.description);
      
      // Reset form after successful submission
      setFormData({
        date: initialDate.toISOString().split('T')[0],
        reason: '',
        description: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create scheduled day off');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label 
          htmlFor="date"
          style={{ 
            display: 'block', 
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px'
          }}
          required
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label 
          htmlFor="reason"
          style={{ 
            display: 'block', 
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Reason
        </label>
        <select
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
          required
        >
          <option value="">Select a reason</option>
          <option value="HOLIDAY">Holiday</option>
          <option value="WEATHER">Weather</option>
          <option value="PROF_DEV">Professional Development</option>
          <option value="ADMIN">Administrative</option>
          <option value="REPORT_CARD">Report Card Day</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <label 
          htmlFor="description"
          style={{ 
            display: 'block', 
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Scheduled Day Off'}
        </button>
      </div>
    </form>
  );
};

export default ScheduleDayOffForm;
