# Class Management Modal System

## Overview
This system provides a comprehensive set of modals for managing classes and student enrollment with centralized state management through the `useClassModals` hook.

## Key Methods/Functions Implemented

### 1. `useClassModals()` - Modal state and workflow management
- **Location**: `hooks/useClassModals.ts`
- **Purpose**: Central hook for managing all modal states and operations
- **Returns**: Complete modal management interface with all required methods

### 2. `handleClassFormSubmit(data: ClassFormData, mode: 'create' | 'edit')` - Form submission workflow
- **Location**: `hooks/useClassModals.ts` (lines 181-205)
- **Purpose**: Handles both class creation and editing with proper validation
- **Features**:
  - Mode-specific API calls (create vs edit)
  - Loading state management
  - Error handling and user feedback
  - Modal closure on success

### 3. `handleStudentSelection(studentIds: string[], action: 'add' | 'remove')` - Student selection logic
- **Location**: `hooks/useClassModals.ts` (lines 244-273)
- **Purpose**: Manages adding or removing students from classes
- **Features**:
  - Capacity validation before adding students
  - Batch operations for multiple students
  - Optimistic UI updates
  - Error handling with rollback

### 4. `handleDeleteConfirmation(classData: ClassProfile)` - Deletion confirmation flow
- **Location**: `hooks/useClassModals.ts` (lines 207-232)
- **Purpose**: Safely handles class deletion with impact warnings
- **Features**:
  - Student impact assessment
  - Warning message display
  - User confirmation before deletion
  - API integration for deletion

### 5. `showStudentImpactWarning(affectedStudents: Student[])` - Impact warning display
- **Location**: `hooks/useClassModals.ts` (lines 275-286)
- **Purpose**: Generates user-friendly warning messages about deletion impact
- **Features**:
  - Student count and names display
  - Active vs inactive student filtering
  - Truncated list with "and X more" formatting
  - Clear warning about irreversible action

### 6. `handleFormValidation(data: ClassFormData)` - Real-time form validation
- **Location**: `hooks/useClassModals.ts` (lines 124-147)
- **Purpose**: Comprehensive form validation with detailed error messages
- **Features**:
  - Field-by-field validation
  - Length and format requirements
  - Date range validation
  - Capacity limits enforcement

## Component Integration

### CreateClassModal
- Uses `handleClassFormSubmit(data, 'create')`
- Implements `handleFormValidation()` for real-time feedback
- Manages unsaved changes with `handleModalClose()`

### EditClassModal
- Uses `handleClassFormSubmit(data, 'edit')`
- Pre-populates form with existing class data
- Tracks changes and warns about unsaved modifications

### DeleteClassModal
- Uses `handleDeleteConfirmation()` with ClassProfile conversion
- Integrates `showStudentImpactWarning()` for affected students
- Requires confirmation text input for safety

### StudentSelectionModal
- Uses `handleStudentSelection(studentIds, 'add')`
- Implements capacity checking and validation
- Provides search and filtering capabilities

### ManageStudentsModal
- Uses `handleStudentSelection([studentId], 'remove')` for individual removal
- Provides sorting and search functionality
- Confirmation dialogs for student removal

## Type Definitions

### Core Interfaces
- `ClassData`: Base class information
- `ClassProfile`: Extended class data with affected students
- `StudentData`: Student information
- `Student`: Extended student data with status
- `ClassFormData`: Form input structure
- `ClassFormErrors`: Validation error mapping

### Modal State Management
- `ClassModalState`: Boolean flags for each modal
- `UseClassModalsReturn`: Complete hook interface

## Usage Example

```typescript
import { useClassModals } from '../../hooks/useClassModals'
import { CreateClassModal, EditClassModal, ... } from './components/classes'

function MyComponent() {
  const {
    modals,
    selectedClass,
    openCreateClassModal,
    handleClassFormSubmit,
    handleStudentSelection,
    handleDeleteConfirmation,
    showStudentImpactWarning,
    handleFormValidation
  } = useClassModals()

  // All modals integrate automatically with the hook
  return (
    <div>
      <button onClick={openCreateClassModal}>Create Class</button>
      
      <CreateClassModal
        isOpen={modals.createClass}
        onClose={closeAllModals}
        onSubmit={() => {}} // Hook handles internally
      />
      
      {/* Other modals... */}
    </div>
  )
}
```

## Features

### State Management
- Centralized modal state control
- Automatic state cleanup on modal close
- Loading and submission state tracking

### Form Handling
- Real-time validation with user feedback
- Unsaved changes detection
- Form reset on successful submission

### Student Management
- Capacity-aware enrollment
- Batch student operations
- Search and filtering capabilities

### Safety Features
- Confirmation dialogs for destructive actions
- Impact warnings for class deletion
- Validation before operations

### API Integration
- Prepared API endpoints (TODO items for implementation)
- Error handling and user feedback
- Loading states during operations

## Development Notes

All components are fully TypeScript typed and use TailwindCSS for styling. The system is designed to be modular and easily extensible. API integration points are marked with TODO comments and ready for backend implementation.