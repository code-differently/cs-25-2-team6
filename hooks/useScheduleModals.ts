import { useState, useEffect } from 'react';

/**
 * Interface for the form data when scheduling a day off
 * This defines what information we collect from the user
 */
export interface ScheduleFormData {
  date: string;                    // Selected date (YYYY-MM-DD format)
  reason: string;                  // Predefined reason or "Other"
  customReason?: string;           // Custom reason text (only when reason is "Other")
  affectedStudentCount: number;    // Estimated number of affected students
}

/**
 * Interface for a scheduled day off record
 * This is what gets saved and displayed in the system
 */
export interface ScheduledDayOff {
  id: string;                      // Unique identifier for the record
  date: string;                    // The scheduled date
  reason: string;                  // The reason for the day off
  customReason?: string;           // Custom reason if applicable
  studentCount: number;            // Number of students affected
  createdAt: string;               // When this record was created
  createdBy: string;               // Who created this record
}

/**
 * Main hook for managing all schedule-related modals and their state
 * This is the central place for all schedule modal logic
 */
export function useScheduleModals() {
  // Modal visibility states - controls which modals are open/closed
  const [scheduleModal, setScheduleModal] = useState(false);           // Main schedule modal
  const [reasonModal, setReasonModal] = useState(false);               // Reason selection modal
  const [bulkExcuseModal, setBulkExcuseModal] = useState(false);       // Bulk excuse confirmation
  const [editModal, setEditModal] = useState(false);                   // Edit existing schedule
  const [deleteModal, setDeleteModal] = useState(false);               // Delete confirmation
  const [confirmationModal, setConfirmationModal] = useState(false);   // Success confirmation modal

  // Form data state - holds the current form information
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: '',
    reason: '',
    customReason: '',
    affectedStudentCount: 0
  });

  // Additional state for managing selected items and data
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledDayOff | null>(null);
  const [scheduledDays, setScheduledDays] = useState<ScheduledDayOff[]>([]);

  // List of predefined reasons for scheduling days off
  const reasonOptions = [
    'School Holiday',
    'Professional Development Day',
    'Parent-Teacher Conferences',
    'Weather Closure',
    'Other'
  ];

  /**
   * Load saved scheduled days from localStorage when the hook initializes
   * This ensures data persists between browser sessions
   */
  useEffect(() => {
    const saved = localStorage.getItem('scheduledDaysOff');
    if (saved) {
      setScheduledDays(JSON.parse(saved));
    }
  }, []);

  /**
   * Handles submitting a new scheduled day off
   * Validates the form, creates a new record, and saves it
   */
  const handleScheduleSubmit = (formData: ScheduleFormData) => {
    // Create a new scheduled day off record
    const newSchedule: ScheduledDayOff = {
      id: Date.now().toString(),                    // Simple ID generation
      date: formData.date,
      reason: formData.reason,
      customReason: formData.customReason,
      studentCount: formData.affectedStudentCount,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'                     // TODO: Replace with actual user
    };

    // Add to the list of scheduled days
    const updatedScheduledDays = [...scheduledDays, newSchedule];
    setScheduledDays(updatedScheduledDays);

    // Save to localStorage for persistence
    localStorage.setItem('scheduledDaysOff', JSON.stringify(updatedScheduledDays));

    // Close the main modal and show confirmation
    setScheduleModal(false);
    setConfirmationModal(true);

    console.log('Day off scheduled successfully:', newSchedule);
  };

  /**
   * Shows the bulk excuse confirmation modal
   * Used when user needs to confirm affecting multiple students
   */
  const showBulkExcuseConfirmation = (date: Date, studentCount: number) => {
    // Update form data with the provided information
    setFormData(prev => ({
      ...prev,
      affectedStudentCount: studentCount
    }));
    
    // Show the confirmation modal
    setBulkExcuseModal(true);
  };

  /**
   * Handles when a user selects a reason from the dropdown or modal
   * Updates the form data accordingly
   */
  const handleReasonSelection = (reason: string, isCustom: boolean = false) => {
    setFormData(prev => ({
      ...prev,
      reason: reason,
      customReason: isCustom ? prev.customReason : ''  // Clear custom reason if not custom
    }));

    // Close reason modal if it was open
    setReasonModal(false);
  };

  /**
   * Validates the schedule form data
   * Returns an object with any validation errors
   */
  const validateScheduleForm = (data: ScheduleFormData) => {
    const errors: any = {};
    
    // Check required fields
    if (!data.date) errors.date = 'Date is required';
    if (!data.reason) errors.reason = 'Reason is required';
    
    // If "Other" is selected, custom reason is required
    if (data.reason === 'Other' && !data.customReason) {
      errors.customReason = 'Please specify the custom reason';
    }

    return errors;
  };

  /**
   * Handles closing modals with unsaved changes
   * Prompts user if they have unsaved work
   */
  const handleModalClose = (hasUnsavedChanges: boolean) => {
    // If there are unsaved changes, confirm with user
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }

    // Close all modals and reset state
    setScheduleModal(false);
    setReasonModal(false);
    setBulkExcuseModal(false);
    setEditModal(false);
    setDeleteModal(false);
    
    // Reset form data
    setFormData({
      date: '',
      reason: '',
      customReason: '',
      affectedStudentCount: 0
    });
  };

  // Return all the states and functions that components need
  return {
    // Modal visibility states
    scheduleModal,
    reasonModal,
    bulkExcuseModal,
    editModal,
    deleteModal,
    confirmationModal,
    
    // State setters for opening/closing modals
    setScheduleModal,
    setReasonModal,
    setBulkExcuseModal,
    setEditModal,
    setDeleteModal,
    setConfirmationModal,
    
    // Form data and related state
    formData,
    setFormData,
    selectedSchedule,
    setSelectedSchedule,
    scheduledDays,
    reasonOptions,
    
    // Action functions
    handleScheduleSubmit,
    showBulkExcuseConfirmation,
    handleReasonSelection,
    validateScheduleForm,
    handleModalClose
  };
}