# React Components

This directory contains reusable React components for the attendance application.

## Components

### LoadingSpinner
A customizable loading spinner component with different sizes and themes.

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Size of the spinner (default: 'medium')
- `theme?: 'blue' | 'gray' | 'light'` - Color theme (default: 'blue')
- `message?: string` - Optional loading message to display

**Usage:**
```tsx
import { LoadingSpinner } from '../components';

// Basic usage
<LoadingSpinner />

// With custom size and message
<LoadingSpinner size="large" message="Loading attendance data..." />
```

### ErrorMessage
A flexible error/warning message component with dismiss functionality.

**Props:**
- `message: string` - Error message to display (required)
- `heading?: string` - Optional heading text
- `onClose?: () => void` - Callback for close button
- `type?: 'error' | 'warning'` - Message type (default: 'error')
- `containerClass?: string` - Additional CSS classes
- `displayIcon?: boolean` - Show/hide warning icon (default: true)

**Usage:**
```tsx
import { ErrorMessage } from '../components';

// Basic error message
<ErrorMessage message="Failed to save attendance data" />

// Warning with heading and close handler
<ErrorMessage 
  type="warning"
  heading="Data Validation Warning"
  message="Some students have conflicting schedule entries"
  onClose={() => setShowWarning(false)}
/>
```

### SuccessMessage
A success message component with auto-hide functionality and progress indicator.

**Props:**
- `message: string` - Success message to display (required)
- `heading?: string` - Optional heading text
- `onClose?: () => void` - Callback for close/auto-hide
- `showIcon?: boolean` - Show/hide check icon (default: true)
- `autoHide?: boolean` - Enable auto-hide (default: false)
- `autoHideDelay?: number` - Auto-hide delay in ms (default: 5000)
- `containerClass?: string` - Additional CSS classes

**Usage:**
```tsx
import { SuccessMessage } from '../components';

// Basic success message
<SuccessMessage message="Attendance saved successfully!" />

// Auto-hiding success with custom delay
<SuccessMessage 
  heading="Success!"
  message="All student records have been updated"
  autoHide={true}
  autoHideDelay={3000}
  onClose={() => setShowSuccess(false)}
/>
```

### Checkbox
A customizable checkbox component with multiple variants and states.

**Props:**
- `id: string` - Unique identifier (required)
- `name?: string` - Form field name
- `checked?: boolean` - Checkbox state (default: false)
- `onChange?: (checked: boolean) => void` - Change handler
- `label?: string` - Checkbox label text
- `disabled?: boolean` - Disabled state (default: false)
- `size?: 'small' | 'medium' | 'large'` - Size variant (default: 'medium')
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'` - Color variant (default: 'default')
- `indeterminate?: boolean` - Indeterminate state (default: false)
- `required?: boolean` - Required field indicator (default: false)
- `labelPosition?: 'left' | 'right'` - Label position (default: 'right')

**Usage:**
```tsx
import { Checkbox } from '../components';

// Basic checkbox
<Checkbox id="agree" label="I agree to the terms" />

// Attendance status with variants
<Checkbox 
  id="present" 
  label="Present" 
  variant="success"
  checked={isPresent}
  onChange={setIsPresent}
/>
```

### Button
A versatile button component with multiple variants, sizes, and states.

**Props:**
- `children: React.ReactNode` - Button content (required)
- `type?: 'button' | 'submit' | 'reset'` - Button type (default: 'button')
- `variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline-primary' | 'outline-secondary' | 'link'` - Style variant (default: 'primary')
- `size?: 'small' | 'medium' | 'large'` - Size variant (default: 'medium')
- `disabled?: boolean` - Disabled state (default: false)
- `loading?: boolean` - Loading state with spinner (default: false)
- `fullWidth?: boolean` - Full width button (default: false)
- `onClick?: (e: MouseEvent) => void` - Click handler
- `icon?: React.ReactNode` - Optional icon
- `iconPosition?: 'left' | 'right'` - Icon position (default: 'left')

**Usage:**
```tsx
import { Button } from '../components';

// Basic button
<Button onClick={() => console.log('clicked')}>Save</Button>

// Loading button with icon
<Button 
  variant="success" 
  loading={isSaving}
  icon="💾"
>
  Save Attendance
</Button>
```

### FormGroup
A form field wrapper that provides consistent styling, labels, validation, and help text.

**Props:**
- `children: React.ReactNode` - Form field content (required)
- `label?: string` - Field label
- `htmlFor?: string` - Label's htmlFor attribute
- `required?: boolean` - Required field indicator (default: false)
- `error?: string` - Error message to display
- `helpText?: string` - Help text below the field
- `labelPosition?: 'top' | 'left' | 'inline'` - Label position (default: 'top')
- `size?: 'small' | 'medium' | 'large'` - Size variant (default: 'medium')
- `disabled?: boolean` - Disabled state (default: false)

**Usage:**
```tsx
import { FormGroup } from '../components';

// Basic form field
<FormGroup
  label="Student Name"
  htmlFor="studentName"
  required
  error={errors.studentName}
  helpText="Enter the student's full name"
>
  <input 
    id="studentName"
    type="text"
    value={studentName}
    onChange={(e) => setStudentName(e.target.value)}
  />
</FormGroup>
```

## Styling

All components use styled-jsx for scoped CSS and are designed to work seamlessly with the existing attendance form styling. The components follow a consistent design system with:

- Proper color schemes for different message types
- Responsive design
- Accessibility features (ARIA labels, keyboard navigation)
- Smooth animations and transitions

## Integration

These components are designed to integrate with the Next.js app structure and can be imported individually or as a group:

```tsx
// Individual imports
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import FormGroup from '../components/FormGroup';

// Group import
import { 
  LoadingSpinner, 
  ErrorMessage, 
  SuccessMessage,
  Checkbox,
  Button,
  FormGroup 
} from '../components';
```

## Complete Form Example

Here's a complete example showing how to use multiple components together:

```tsx
import { FormGroup, Checkbox, Button, ErrorMessage, SuccessMessage } from '../components';

function AttendanceForm() {
  const [formData, setFormData] = useState({ 
    studentName: '', 
    isPresent: false,
    isAbsent: false,
    isTardy: false 
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    const newErrors = {};
    if (!formData.studentName) {
      newErrors.studentName = 'Student name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup
        label="Student Name"
        htmlFor="studentName"
        required
        error={errors.studentName}
        helpText="Select or enter the student's name"
      >
        <input
          id="studentName"
          type="text"
          value={formData.studentName}
          onChange={(e) => setFormData(prev => ({...prev, studentName: e.target.value}))}
          placeholder="Enter student name"
        />
      </FormGroup>

      <FormGroup label="Attendance Status" required>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Checkbox
            id="present"
            label="Present"
            variant="success"
            checked={formData.isPresent}
            onChange={(checked) => setFormData(prev => ({
              ...prev, 
              isPresent: checked,
              isAbsent: checked ? false : prev.isAbsent,
              isTardy: checked ? false : prev.isTardy
            }))}
          />
          <Checkbox
            id="absent"
            label="Absent"
            variant="danger"
            checked={formData.isAbsent}
            onChange={(checked) => setFormData(prev => ({
              ...prev, 
              isAbsent: checked,
              isPresent: checked ? false : prev.isPresent,
              isTardy: checked ? false : prev.isTardy
            }))}
          />
          <Checkbox
            id="tardy"
            label="Tardy"
            variant="warning"
            checked={formData.isTardy}
            onChange={(checked) => setFormData(prev => ({
              ...prev, 
              isTardy: checked,
              isPresent: checked ? false : prev.isPresent,
              isAbsent: checked ? false : prev.isAbsent
            }))}
          />
        </div>
      </FormGroup>

      {errors.general && (
        <ErrorMessage 
          message={errors.general} 
          onClose={() => setErrors(prev => ({...prev, general: ''}))}
        />
      )}

      {showSuccess && (
        <SuccessMessage 
          heading="Success!"
          message="Attendance has been saved successfully"
          autoHide={true}
          autoHideDelay={5000}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <Button 
          type="submit" 
          variant="primary" 
          loading={isSubmitting}
          icon="💾"
        >
          Save Attendance
        </Button>
        <Button 
          type="button"
          variant="outline-secondary"
          onClick={() => {
            setFormData({ studentName: '', isPresent: false, isAbsent: false, isTardy: false });
            setErrors({});
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
```