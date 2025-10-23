# Calendar Utilities Documentation

This module provides utility functions for calendar and schedule-related functionality in the attendance tracking system.

## Functions

### `formatDisplayDate(date: Date, format?: string): string`

Formats a date for display purposes with various format options.

**Parameters:**
- `date` (Date): Date object to format
- `format` (string, optional): Format type - 'short', 'medium', 'long', or 'full'. Default: 'medium'

**Returns:** Formatted date string

**Examples:**
```typescript
const date = new Date('2025-10-21');

formatDisplayDate(date, 'short');   // "10/21/25"
formatDisplayDate(date, 'medium');  // "Oct 21, 2025"
formatDisplayDate(date, 'long');    // "October 21, 2025"
formatDisplayDate(date, 'full');    // "Tuesday, October 21, 2025"
```

**Error Handling:** Returns 'Invalid Date' for invalid inputs.

---

### `getReasonDisplayColor(reason: string | DayOffReason): string`

Maps day-off reasons to appropriate display colors.

**Parameters:**
- `reason` (string | DayOffReason): Day off reason (enum or string)

**Returns:** CSS color string

**Color Mappings:**
- `HOLIDAY`: #dc3545 (Red)
- `PROF_DEV`: #007bff (Blue)
- `REPORT_CARD`: #6f42c1 (Purple)
- `OTHER`: #6c757d (Gray)
- Unknown: #6c757d (Gray fallback)

**Examples:**
```typescript
getReasonDisplayColor(DayOffReason.HOLIDAY);           // "#dc3545"
getReasonDisplayColor('PROFESSIONAL_DEVELOPMENT');     // "#007bff"
getReasonDisplayColor('unknown');                      // "#6c757d"
```

---

### `isWeekend(date: Date): boolean`

Determines if a given date falls on a weekend (Saturday or Sunday).

**Parameters:**
- `date` (Date): Date object to check

**Returns:** Boolean indicating if the date is a weekend

**Examples:**
```typescript
isWeekend(new Date('2025-10-18'));  // true (Saturday)
isWeekend(new Date('2025-10-19'));  // true (Sunday)
isWeekend(new Date('2025-10-20'));  // false (Monday)
```

**Error Handling:** Returns false for invalid dates.

---

### `isScheduledDay(date: Date, scheduledDays: DayOff[]): boolean`

Checks if a specific date is a scheduled day off.

**Parameters:**
- `date` (Date): Date object to check
- `scheduledDays` (DayOff[]): Array of scheduled day off objects

**Returns:** Boolean indicating if the date is a scheduled day off

**Examples:**
```typescript
const scheduledDays = [
  { dateISO: '2025-10-21', reason: DayOffReason.HOLIDAY, scope: 'ALL_STUDENTS' }
];

isScheduledDay(new Date('2025-10-21'), scheduledDays);  // true
isScheduledDay(new Date('2025-10-22'), scheduledDays);  // false
```

**Error Handling:** Returns false for invalid dates or malformed scheduled days.

---

### `calculateAffectedStudentsText(count: number): string`

Formats student count text for affected students display.

**Parameters:**
- `count` (number): Number of affected students

**Returns:** Formatted text string describing the count

**Examples:**
```typescript
calculateAffectedStudentsText(0);     // "No students affected"
calculateAffectedStudentsText(1);     // "1 student affected"
calculateAffectedStudentsText(25);    // "25 students affected"
calculateAffectedStudentsText(1500);  // "1,500 students affected (1500 total)"
```

**Features:**
- Handles singular/plural forms correctly
- Formats large numbers with commas
- Provides additional context for very large numbers
- Returns 'Invalid count' for negative or invalid inputs

---

### `renderCalendarDayContent(date: Date, events: DayOff[], options?: object): ReactElement`

Renders the content for a calendar day including events and status indicators.

**Parameters:**
- `date` (Date): Date object for the calendar day
- `events` (DayOff[], optional): Array of day off events for this date. Default: []
- `options` (object, optional): Additional rendering options

**Options Object:**
```typescript
{
  showAttendance?: boolean;          // Show attendance data
  showEventDetails?: boolean;        // Show event details
  attendanceData?: {                 // Attendance statistics
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
  onClick?: (date: Date, events: DayOff[]) => void;  // Click handler
}
```

**Returns:** ReactElement containing the day's content

**Examples:**
```typescript
// Basic day rendering
const dayContent = renderCalendarDayContent(
  new Date('2025-10-21'),
  []
);

// Day with events and attendance
const dayWithData = renderCalendarDayContent(
  new Date('2025-10-21'),
  [{ dateISO: '2025-10-21', reason: DayOffReason.HOLIDAY, scope: 'ALL_STUDENTS' }],
  {
    showAttendance: true,
    attendanceData: { present: 20, late: 2, absent: 1, excused: 0 },
    onClick: (date, events) => console.log('Day clicked:', date)
  }
);
```

**Features:**
- Weekend detection and styling
- Event badge rendering with color coding
- Attendance visualization with dots
- Click handling with accessibility support
- Responsive design
- Error handling for invalid dates

**CSS Classes Applied:**
- `.calendar-day-content` - Base container
- `.weekend` - Weekend days
- `.scheduled-off` - Scheduled day off
- `.invalid` - Invalid dates
- Various child classes for events, attendance, etc.

## CSS Integration

The utilities work with the accompanying `calendarUtils.css` file which provides:

- Responsive design for mobile devices
- Hover and focus states for accessibility
- Animation effects for smooth interactions
- Loading states for dynamic content
- Color schemes matching the design system

## Type Dependencies

This module depends on the following domain types:
- `DayOffReason` - Enum for day off reasons
- `DayOff` - Interface for scheduled day off objects
- `AttendanceStatus` - Enum for attendance statuses

## Error Handling

All functions include comprehensive error handling:
- Invalid date objects return safe fallback values
- Null/undefined inputs are handled gracefully
- Malformed data structures are validated
- Console errors are logged for debugging

## Performance Considerations

- Functions are optimized for frequent calendar rendering
- Date operations use efficient built-in methods
- Memoization can be applied for repeated calls with same inputs
- CSS animations are GPU-accelerated where possible

## Accessibility Features

The `renderCalendarDayContent` function includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- High contrast color schemes
- Semantic HTML structure

## Browser Compatibility

Compatible with all modern browsers that support:
- ES6+ features
- CSS Grid and Flexbox
- Date API
- React 16.8+