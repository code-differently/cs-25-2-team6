'use client';

import React, { useState } from 'react';
import { LoadingSpinner, ErrorMessage, SuccessMessage, Checkbox, Button, FormGroup } from '../../components';

export default function ComponentDemo() {
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState({
    present: false,
    absent: false,
    tardy: false,
    excused: false
  });
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const simulateAction = () => {
    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);
    
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      // Randomly show success or error
      if (Math.random() > 0.5) {
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>React Components Demo</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>LoadingSpinner Examples</h2>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <h3>Small</h3>
            <LoadingSpinner size="small" />
          </div>
          <div>
            <h3>Medium (Default)</h3>
            <LoadingSpinner />
          </div>
          <div>
            <h3>Large</h3>
            <LoadingSpinner size="large" />
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3>With Message</h3>
          <LoadingSpinner message="Loading attendance data..." />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3>Different Themes</h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <LoadingSpinner theme="blue" message="Blue theme" />
            <LoadingSpinner theme="gray" message="Gray theme" />
            <LoadingSpinner theme="light" message="Light theme" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>ErrorMessage Examples</h2>
        
        <ErrorMessage 
          message="This is a standard error message" 
          onClose={() => console.log('Error dismissed')}
        />
        
        <ErrorMessage 
          type="warning"
          heading="Warning"
          message="This is a warning message with custom heading"
          onClose={() => console.log('Warning dismissed')}
        />
        
        <ErrorMessage 
          message="Error without close button"
          displayIcon={false}
        />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>SuccessMessage Examples</h2>
        
        <SuccessMessage 
          message="Operation completed successfully!" 
          onClose={() => console.log('Success dismissed')}
        />
        
        <SuccessMessage 
          heading="Great!"
          message="This success message will auto-hide in 3 seconds"
          autoHide={true}
          autoHideDelay={3000}
        />
        
        <SuccessMessage 
          message="Success without icon"
          showIcon={false}
        />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Interactive Demo</h2>
        <button 
          onClick={simulateAction}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={isLoading}
        >
          Simulate Action
        </button>
        
        {isLoading && (
          <div style={{ margin: '1rem 0' }}>
            <LoadingSpinner message="Processing..." />
          </div>
        )}
        
        {showError && (
          <ErrorMessage 
            heading="Action Failed"
            message="Something went wrong while processing your request"
            onClose={() => setShowError(false)}
          />
        )}
        
        {showSuccess && (
          <SuccessMessage 
            heading="Success!"
            message="Your action was completed successfully"
            autoHide={true}
            autoHideDelay={5000}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Checkbox Examples</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Attendance Status (Different Variants)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox
              id="present"
              label="Present"
              variant="success"
              checked={checkboxStates.present}
              onChange={(checked) => setCheckboxStates(prev => ({...prev, present: checked}))}
            />
            <Checkbox
              id="absent"
              label="Absent"
              variant="danger"
              checked={checkboxStates.absent}
              onChange={(checked) => setCheckboxStates(prev => ({...prev, absent: checked}))}
            />
            <Checkbox
              id="tardy"
              label="Tardy"
              variant="warning"
              checked={checkboxStates.tardy}
              onChange={(checked) => setCheckboxStates(prev => ({...prev, tardy: checked}))}
            />
            <Checkbox
              id="excused"
              label="Excused Absence"
              variant="primary"
              checked={checkboxStates.excused}
              onChange={(checked) => setCheckboxStates(prev => ({...prev, excused: checked}))}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Different Sizes</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Checkbox id="small-cb" label="Small" size="small" />
            <Checkbox id="medium-cb" label="Medium" size="medium" />
            <Checkbox id="large-cb" label="Large" size="large" />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Special States</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Checkbox id="required-cb" label="Required Field" required />
            <Checkbox id="disabled-cb" label="Disabled Checkbox" disabled />
            <Checkbox id="indeterminate-cb" label="Indeterminate State" indeterminate />
            <Checkbox id="left-label" label="Label on Left" labelPosition="left" />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Button Examples</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Button Variants</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Outline Buttons</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="outline-primary">Outline Primary</Button>
            <Button variant="outline-secondary">Outline Secondary</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Button Sizes</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Button States</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button loading>Loading Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Buttons with Icons</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button icon="📊" variant="primary">View Report</Button>
            <Button icon="💾" variant="success" iconPosition="right">Save Data</Button>
            <Button icon="✏️" variant="outline-primary">Edit</Button>
            <Button icon="🗑️" variant="danger" size="small">Delete</Button>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>FormGroup Examples</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Basic Form</h3>
          <div style={{ maxWidth: '400px' }}>
            <FormGroup
              label="Student Name"
              htmlFor="student-name"
              required
              error={formErrors.studentName}
              helpText="Enter the full name of the student"
            >
              <input
                id="student-name"
                type="text"
                value={formData.studentName}
                onChange={(e) => {
                  setFormData(prev => ({...prev, studentName: e.target.value}));
                  if (formErrors.studentName) {
                    setFormErrors(prev => ({...prev, studentName: ''}));
                  }
                }}
                placeholder="Enter student name"
              />
            </FormGroup>

            <FormGroup
              label="Email Address"
              htmlFor="email"
              error={formErrors.email}
            >
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({...prev, email: e.target.value}));
                  if (formErrors.email) {
                    setFormErrors(prev => ({...prev, email: ''}));
                  }
                }}
                placeholder="Enter email address"
              />
            </FormGroup>

            <FormGroup
              label="Absence Reason"
              htmlFor="reason"
              helpText="Optional: Provide reason for absence"
            >
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                placeholder="Enter reason for absence"
                rows={3}
              />
            </FormGroup>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button 
                variant="primary" 
                onClick={() => {
                  const errors: {[key: string]: string} = {};
                  if (!formData.studentName) errors.studentName = 'Student name is required';
                  if (!formData.email) errors.email = 'Email address is required';
                  
                  if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                  } else {
                    setFormErrors({});
                    setShowSuccess(true);
                  }
                }}
              >
                Submit Form
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => {
                  setFormData({ studentName: '', email: '', reason: '' });
                  setFormErrors({});
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Different Label Positions</h3>
          <div style={{ maxWidth: '600px' }}>
            <FormGroup
              label="Default (Top)"
              htmlFor="top-label"
              labelPosition="top"
            >
              <input id="top-label" type="text" placeholder="Label on top" />
            </FormGroup>

            <FormGroup
              label="Left Label"
              htmlFor="left-label"
              labelPosition="left"
            >
              <input id="left-label" type="text" placeholder="Label on left" />
            </FormGroup>

            <FormGroup
              label="Inline Label"
              htmlFor="inline-label"
              labelPosition="inline"
            >
              <Checkbox id="inline-label" />
            </FormGroup>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Different Sizes</h3>
          <div style={{ maxWidth: '400px' }}>
            <FormGroup label="Small Size" htmlFor="small-input" size="small">
              <input id="small-input" type="text" placeholder="Small form group" />
            </FormGroup>
            <FormGroup label="Medium Size" htmlFor="medium-input" size="medium">
              <input id="medium-input" type="text" placeholder="Medium form group" />
            </FormGroup>
            <FormGroup label="Large Size" htmlFor="large-input" size="large">
              <input id="large-input" type="text" placeholder="Large form group" />
            </FormGroup>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Complete Attendance Form Example</h2>
        <div style={{ maxWidth: '500px', padding: '24px', border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ marginTop: 0 }}>Daily Attendance Entry</h3>
          
          <FormGroup label="Student" htmlFor="attendance-student" required>
            <select id="attendance-student">
              <option value="">Select a student</option>
              <option value="john-doe">John Doe</option>
              <option value="jane-smith">Jane Smith</option>
              <option value="mike-johnson">Mike Johnson</option>
            </select>
          </FormGroup>

          <FormGroup label="Date" htmlFor="attendance-date" required>
            <input id="attendance-date" type="date" />
          </FormGroup>

          <FormGroup label="Attendance Status" required>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Checkbox id="att-present" name="attendance" label="Present" variant="success" />
              <Checkbox id="att-absent" name="attendance" label="Absent" variant="danger" />
              <Checkbox id="att-tardy" name="attendance" label="Tardy" variant="warning" />
              <Checkbox id="att-excused" name="attendance" label="Excused" variant="primary" />
            </div>
          </FormGroup>

          <FormGroup label="Notes" htmlFor="attendance-notes" helpText="Optional additional information">
            <textarea id="attendance-notes" rows={3} placeholder="Add any relevant notes..."></textarea>
          </FormGroup>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Button variant="success" icon="💾">Save Attendance</Button>
            <Button variant="outline-secondary">Cancel</Button>
          </div>
        </div>
      </section>
    </div>
  );
}