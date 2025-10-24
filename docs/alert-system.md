# Alert Validation System Documentation

This documentation covers the alert validation and calculation utilities implemented for User Story 4 - attendance threshold monitoring.

## Overview

The alert system provides simple numerical threshold monitoring for student attendance, supporting both 30-day rolling windows and cumulative totals for absences and lateness.

## Core Components

### Types (`src/types/`)

#### `alerts.ts`
- **SimpleAlertData**: Basic alert information for UI forms
- **SimpleAlertCalculationResult**: Calculation results with triggered alerts
- **ValidationResult<T>**: Consistent validation response pattern

#### `thresholds.ts`
- **SimpleThresholdFormData**: Threshold configuration from UI forms
- **SimpleThresholdValidationResult**: Validation results for thresholds

### Constants (`src/constants/alertConstants.ts`)

```typescript
// Default threshold values
export const DEFAULT_THRESHOLDS = {
  absences30Day: 5,
  absencesCumulative: 15,
  lateness30Day: 8,
  latenessCumulative: 20
};

// Validation limits
export const VALIDATION_LIMITS = {
  MIN_THRESHOLD: 1,
  MAX_THRESHOLD: 365,
  MAX_STUDENT_ID_LENGTH: 50,
  MAX_TIMEFRAME_DAYS: 365
};
```

### Validation Utilities (`src/utils/`)

#### `alertValidation.ts`
Validates alert data and form inputs:

```typescript
// Validate complete alert data structure
validateAlertData(data: SimpleAlertData): ValidationResult<SimpleAlertData>

// Validate alert form inputs
validateAlertForm(formData: any): ValidationResult<SimpleAlertData>

// Validate timeframe parameters
validateTimeframe(days: number): ValidationResult<number>

// Validate student ID format
validateStudentId(studentId: string): ValidationResult<string>
```

#### `thresholdValidation.ts`
Validates threshold configuration:

```typescript
// Validate threshold form data
validateThresholdForm(formData: any): ValidationResult<SimpleThresholdFormData>

// Sanitize threshold input values
sanitizeThresholdInput(input: any): SimpleThresholdFormData
```

### Calculation Engine (`src/utils/alertCalculations.ts`)

Core business logic for attendance monitoring:

```typescript
// Calculate alerts for a specific student
calculateStudentAlerts(
  studentId: string, 
  records: AttendanceRecord[], 
  thresholds: SimpleThresholdFormData
): SimpleAlertCalculationResult

// Count absences in time period
countAbsencesInPeriod(records: AttendanceRecord[], days: number): number

// Count total absences
countAbsencesCumulative(records: AttendanceRecord[]): number

// Count lateness in time period  
countLatenessInPeriod(records: AttendanceRecord[], days: number): number

// Count total lateness
countLatenessCumulative(records: AttendanceRecord[]): number
```

## Usage Examples

### Basic Alert Calculation

```typescript
import { calculateStudentAlerts } from '../utils/alertCalculations';
import { validateThresholdForm } from '../utils/thresholdValidation';

// Validate threshold configuration
const thresholdValidation = validateThresholdForm({
  absences30Day: 5,
  absencesCumulative: 15,
  lateness30Day: 8,
  latenessCumulative: 20
});

if (!thresholdValidation.isValid) {
  console.error('Invalid thresholds:', thresholdValidation.errors);
  return;
}

// Calculate alerts for student
const result = calculateStudentAlerts(
  'student123',
  attendanceRecords,
  thresholdValidation.data
);

// Check for triggered alerts
if (result.triggeredAlerts.length > 0) {
  result.triggeredAlerts.forEach(alert => {
    console.log(`Alert: ${alert.type} - ${alert.currentCount}/${alert.thresholdCount}`);
  });
}
```

### Form Validation

```typescript
import { validateAlertForm } from '../utils/alertValidation';

// Validate user form input
const formValidation = validateAlertForm({
  studentId: 'student123',
  timeframeDays: 30,
  alertType: 'absence'
});

if (!formValidation.isValid) {
  // Display validation errors to user
  setFormErrors(formValidation.errors);
  return;
}

// Process valid form data
processAlertRequest(formValidation.data);
```

### Batch Processing

```typescript
import { calculateBatchAlerts } from '../utils/alertCalculations';

// Calculate alerts for multiple students
const studentIds = ['student1', 'student2', 'student3'];
const results = calculateBatchAlerts(studentIds, allRecords, thresholds);

// Process results
results.forEach(result => {
  if (result.triggeredAlerts.length > 0) {
    notifyStaff(result);
  }
});
```

## Alert Types and Periods

### Alert Types
- **ABSENCE**: Student absence from class
- **LATENESS**: Student arriving late to class

### Alert Periods  
- **THIRTY_DAYS**: Rolling 30-day window
- **CUMULATIVE**: All-time total

## Validation Rules

### Student ID Validation
- Required field
- Maximum 50 characters
- Must contain only alphanumeric characters and hyphens

### Threshold Validation
- Must be positive integers
- Range: 1-365 days
- 30-day thresholds cannot exceed cumulative thresholds
- Required fields: all threshold values

### Timeframe Validation
- Must be positive integer
- Maximum 365 days
- Cannot be in the future

## Error Handling

All validation functions return a consistent `ValidationResult<T>` structure:

```typescript
interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}
```

Common error scenarios:
- **Invalid student ID**: Empty, too long, or invalid characters
- **Invalid thresholds**: Non-positive numbers or illogical values
- **Invalid timeframe**: Negative numbers or excessive ranges
- **Missing data**: Required fields not provided

## Testing

Comprehensive test suite covers:
- **Validation Logic**: All validation functions with edge cases
- **Calculation Accuracy**: Counting algorithms and threshold detection
- **Error Conditions**: Invalid inputs and boundary conditions
- **Integration**: End-to-end alert generation workflows

Run tests:
```bash
npm test tests/unit/alertValidation.test.ts
npm test tests/unit/thresholdValidation.test.ts  
npm test tests/unit/alertCalculations.test.ts
```

## Integration Notes

### Database Integration
- Works with existing `AttendanceRecord` domain objects
- Supports `AlertThreshold` and `AttendanceAlert` entities
- No schema changes required

### Frontend Integration
- Type-safe interfaces for React forms
- Consistent validation error handling
- Real-time threshold monitoring support

### Performance Considerations
- Efficient date filtering for large datasets
- Batch processing capabilities for multiple students
- Minimal database queries through smart caching

## Future Enhancements

Potential extensions (not in current scope):
- Parent notification system
- Alert severity levels  
- Custom alert rules engine
- Historical trend analysis
- Automated intervention triggers

---

*This documentation covers the core alert validation system implemented for the capstone project's attendance monitoring requirements.*
