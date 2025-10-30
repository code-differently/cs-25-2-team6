# Class Management Components

This directory contains a comprehensive set of React components and utility functions for managing class-related functionality in the student management system.

## Overview

The class management system provides:
- **Utility Functions**: Core logic for class data manipulation and formatting
- **UI Components**: Reusable React components for class management interfaces
- **CSS Framework**: Comprehensive styling system for class-related components

## Utility Functions

Located in `components/utilities/classUtils.ts`

### Core Functions

#### `formatClassName(name: string, grade?: string): string`
Formats class names with consistent capitalization and grade integration.

```typescript
formatClassName("math basics", "5") // "Math Basics - Grade 5"
formatClassName("Advanced Science") // "Advanced Science"
```

#### `countStudentsInClass(classId: string, relationships: ClassStudent[]): number`
Counts enrolled students in a specific class.

```typescript
const count = countStudentsInClass("class-123", studentRelationships)
```

#### `getClassGradeDisplay(grade?: string | number): string`
Formats grade levels for consistent display.

```typescript
getClassGradeDisplay("k") // "Kindergarten"
getClassGradeDisplay(5) // "Grade 5"
getClassGradeDisplay("pre-k") // "Pre-K"
```

#### `formatClassSummary(classData: ClassProfile, studentCount: number): string`
Creates descriptive class summaries.

```typescript
formatClassSummary(classData, 25) // "Math Basics (Grade 5) - 25 students"
```

#### `isClassEmpty(classId: string, relationships: ClassStudent[]): boolean`
Checks if a class has no enrolled students.

#### `generateClassDisplayText(classData: ClassProfile): string`
Generates formatted display text for class information.

## UI Components

### ClassBadge
Displays class information in a compact badge format.

```typescript
import { ClassBadge } from '@/components/ui'

<ClassBadge
  className="Science Fundamentals"
  grade="7"
  variant="filled"
  size="medium"
  autoFormatClassName={true}
  autoFormatGrade={true}
/>
```

**Props:**
- `className`: Class name to display
- `grade`: Grade level
- `variant`: Visual style ('filled' | 'outlined' | 'minimal')
- `size`: Component size ('small' | 'medium' | 'large')
- `autoFormatClassName`: Use utility function for name formatting
- `autoFormatGrade`: Use utility function for grade formatting

### StudentCounter
Shows student count with automatic calculation capabilities.

```typescript
import { StudentCounter } from '@/components/ui'

<StudentCounter
  count={25}
  label="Students"
  autoCount={true}
  classId="class-123"
  relationships={studentRelationships}
  showIcon={true}
  animated={true}
/>
```

**Props:**
- `count`: Manual student count (optional if using autoCount)
- `autoCount`: Enable automatic counting
- `classId`: Class ID for automatic counting
- `relationships`: Student-class relationships data
- `label`: Text label to display
- `showIcon`: Show student icon
- `animated`: Enable animations

### ClassGradeIndicator
Displays grade level information with formatting options.

```typescript
import { ClassGradeIndicator } from '@/components/ui'

<ClassGradeIndicator
  grade={5}
  variant="badge"
  size="md"
  colorScheme="primary"
  showPrefix={true}
  autoFormat={true}
/>
```

**Props:**
- `grade`: Grade level to display
- `variant`: Visual style ('badge' | 'pill' | 'outlined' | 'minimal')
- `size`: Component size ('xs' | 'sm' | 'md' | 'lg')
- `colorScheme`: Color scheme ('default' | 'primary' | 'secondary' | 'rainbow')
- `autoFormat`: Use utility function for grade formatting

### AssignmentButton
Button component for student assignment actions with class validation.

```typescript
import { AssignmentButton } from '@/components/ui'

<AssignmentButton
  action="assign"
  variant="primary"
  autoDisableEmpty={true}
  classData={classData}
  classRelationships={relationships}
  requireConfirmation={true}
  onClick={handleAssignment}
>
  Assign Students
</AssignmentButton>
```

**Props:**
- `action`: Assignment action type ('assign' | 'unassign' | 'reassign' | 'bulk-assign')
- `variant`: Button style ('primary' | 'secondary' | 'outline' | 'ghost' | 'danger')
- `autoDisableEmpty`: Automatically disable if class is empty
- `classData`: Class information for validation
- `requireConfirmation`: Show confirmation dialog

### ClassStatusIcon
Displays class status with automatic detection capabilities.

```typescript
import { ClassStatusIcon } from '@/components/ui'

<ClassStatusIcon
  status="active"
  size="md"
  showText={true}
  autoDetectStatus={true}
  classData={classData}
  classRelationships={relationships}
  animated={true}
/>
```

**Props:**
- `status`: Class status ('active' | 'inactive' | 'pending' | 'full' | 'empty' | 'warning' | 'error')
- `autoDetectStatus`: Automatically detect status from class data
- `classData`: Class information for auto-detection
- `showText`: Display status text alongside icon
- `animated`: Enable status-based animations

## CSS Framework

Located in `components/styles/Classes.css`

### Features
- **CSS Custom Properties**: Consistent color and sizing variables
- **Component Base Styles**: Default styling for all class components
- **Utility Classes**: Helper classes for common styling patterns
- **Responsive Design**: Mobile-first responsive breakpoints
- **Accessibility**: High contrast and reduced motion support
- **Dark Mode**: Automatic dark theme support

### Usage

Import the CSS framework in your main stylesheet:

```css
@import './components/styles/Classes.css';
```

### Utility Classes

```css
/* Status Colors */
.class-status-active { /* Active class styling */ }
.class-status-inactive { /* Inactive class styling */ }
.class-status-warning { /* Warning class styling */ }

/* Grade Level Colors */
.class-grade-elementary { /* Elementary grade styling */ }
.class-grade-middle { /* Middle school styling */ }
.class-grade-high { /* High school styling */ }

/* Animation Classes */
.animate-fade-in { /* Fade in animation */ }
.animate-pulse { /* Pulse animation */ }
.animate-bounce { /* Bounce animation */ }
```

## Integration Examples

### Complete Class Management Card

```typescript
import { 
  ClassBadge, 
  StudentCounter, 
  ClassGradeIndicator, 
  AssignmentButton, 
  ClassStatusIcon 
} from '@/components/ui'

function ClassManagementCard({ classData, relationships }) {
  return (
    <div className="class-card">
      <div className="class-card__header">
        <ClassBadge
          className={classData.name}
          grade={classData.grade}
          autoFormatClassName={true}
          autoFormatGrade={true}
        />
        <ClassStatusIcon
          status="active"
          autoDetectStatus={true}
          classData={classData}
          classRelationships={relationships}
          showText={true}
        />
      </div>
      
      <div className="class-card__meta">
        <ClassGradeIndicator
          grade={classData.grade}
          autoFormat={true}
        />
        <StudentCounter
          autoCount={true}
          classId={classData.id}
          relationships={relationships}
          animated={true}
        />
      </div>
      
      <div className="class-card__actions">
        <AssignmentButton
          action="assign"
          autoDisableEmpty={true}
          classData={classData}
          classRelationships={relationships}
        >
          Add Students
        </AssignmentButton>
        <AssignmentButton
          action="unassign"
          variant="outline"
          autoDisableEmpty={true}
          classData={classData}
          classRelationships={relationships}
        >
          Remove Students
        </AssignmentButton>
      </div>
    </div>
  )
}
```

### Automatic Class Status Detection

```typescript
function ClassDashboard({ classes, relationships }) {
  return (
    <div className="class-list">
      {classes.map(classData => (
        <div key={classData.id} className="class-summary">
          <ClassStatusIcon
            status="active" // Fallback status
            autoDetectStatus={true}
            classData={classData}
            classRelationships={relationships}
            size="lg"
          />
          <div className="class-summary__info">
            <h3>{classData.name}</h3>
            <div className="class-summary__stats">
              <ClassGradeIndicator
                grade={classData.grade}
                variant="minimal"
                autoFormat={true}
              />
              <StudentCounter
                autoCount={true}
                classId={classData.id}
                relationships={relationships}
                size="small"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## TypeScript Support

All components include comprehensive TypeScript support with:
- Full prop type definitions
- Interface exports for external use
- Generic type support for custom data structures
- Strict null checking compatibility

```typescript
import type { 
  ClassProfile, 
  ClassStudent, 
  ClassBadgeProps,
  StudentCounterProps 
} from '@/components/ui'
```

## Accessibility Features

- **Screen Reader Support**: ARIA labels and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Visible focus indicators

## Performance Considerations

- **Memoization**: Components use React.memo where appropriate
- **Lazy Loading**: CSS animations only when needed
- **Efficient Calculations**: Optimized utility functions
- **Bundle Size**: Tree-shakeable exports