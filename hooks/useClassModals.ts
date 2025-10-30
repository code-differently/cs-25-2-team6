'use client'

import { useState, useCallback } from 'react'

// Types for class management
export interface ClassData {
  id: string
  name: string
  description: string
  capacity: number
  currentEnrollment: number
  startDate: string
  endDate: string
  schedule: string
  instructor: string
  students: StudentData[]
}

export interface StudentData {
  id: string
  firstName: string
  lastName: string
  email: string
  enrolledDate?: string
}

export interface ClassFormData {
  name: string
  description: string
  capacity: number
  startDate: string
  endDate: string
  schedule: string
  instructor: string
}

export interface ClassProfile extends ClassData {
  affectedStudents?: StudentData[]
  enrollmentHistory?: any[]
}

export interface Student extends StudentData {
  status?: 'active' | 'inactive' | 'pending'
  enrollmentDate?: string
}

export interface ClassFormErrors {
  name?: string
  description?: string
  capacity?: string
  startDate?: string
  endDate?: string
  instructor?: string
}

// Modal state management
export interface ClassModalState {
  createClass: boolean
  editClass: boolean
  deleteClass: boolean
  studentSelection: boolean
  manageStudents: boolean
}

export interface UseClassModalsReturn {
  // Modal state
  modals: ClassModalState
  selectedClass: ClassData | null
  selectedStudents: string[]
  
  // Core modal management
  useClassModals: () => UseClassModalsReturn
  
  // Modal actions
  openCreateClassModal: () => void
  openEditClassModal: (classData: ClassData) => void
  openDeleteClassModal: (classData: ClassData) => void
  openStudentSelectionModal: (classData: ClassData) => void
  openManageStudentsModal: (classData: ClassData) => void
  closeAllModals: () => void
  
  // Key Methods/Functions as requested
  handleClassFormSubmit: (data: ClassFormData, mode: 'create' | 'edit') => Promise<void>
  handleStudentSelection: (studentIds: string[], action: 'add' | 'remove') => Promise<void>
  handleDeleteConfirmation: (classData: ClassProfile) => Promise<void>
  showStudentImpactWarning: (affectedStudents: Student[]) => string
  handleFormValidation: (data: ClassFormData) => ClassFormErrors
  
  // Additional form handling
  handleModalClose: (hasUnsavedChanges: boolean) => boolean
  
  // Student management
  addStudentsToClass: (classId: string, studentIds: string[]) => Promise<void>
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>
  
  // Loading states
  isLoading: boolean
  isSubmitting: boolean
}

export function useClassModals(): UseClassModalsReturn {
  const [modals, setModals] = useState<ClassModalState>({
    createClass: false,
    editClass: false,
    deleteClass: false,
    studentSelection: false,
    manageStudents: false
  })
  
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal control functions
  const openCreateClassModal = useCallback(() => {
    setModals(prev => ({ ...prev, createClass: true }))
    setSelectedClass(null)
  }, [])

  const openEditClassModal = useCallback((classData: ClassData) => {
    setSelectedClass(classData)
    setModals(prev => ({ ...prev, editClass: true }))
  }, [])

  const openDeleteClassModal = useCallback((classData: ClassData) => {
    setSelectedClass(classData)
    setModals(prev => ({ ...prev, deleteClass: true }))
  }, [])

  const openStudentSelectionModal = useCallback((classData: ClassData) => {
    setSelectedClass(classData)
    setSelectedStudents([])
    setModals(prev => ({ ...prev, studentSelection: true }))
  }, [])

  const openManageStudentsModal = useCallback((classData: ClassData) => {
    setSelectedClass(classData)
    setModals(prev => ({ ...prev, manageStudents: true }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals({
      createClass: false,
      editClass: false,
      deleteClass: false,
      studentSelection: false,
      manageStudents: false
    })
    setSelectedClass(null)
    setSelectedStudents([])
  }, [])

  // Form validation
  const handleFormValidation = useCallback((data: ClassFormData): ClassFormErrors => {
    const errors: ClassFormErrors = {}
    
    if (!data.name.trim()) {
      errors.name = 'Class name is required'
    } else if (data.name.length < 2) {
      errors.name = 'Class name must be at least 2 characters'
    }
    
    if (!data.description.trim()) {
      errors.description = 'Description is required'
    } else if (data.description.length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }
    
    if (data.capacity < 1 || data.capacity > 100) {
      errors.capacity = 'Capacity must be between 1 and 100'
    }
    
    if (!data.startDate) {
      errors.startDate = 'Start date is required'
    }
    
    if (!data.endDate) {
      errors.endDate = 'End date is required'
    }
    
    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      errors.endDate = 'End date must be after start date'
    }
    
    if (!data.instructor.trim()) {
      errors.instructor = 'Instructor is required'
    }

    return errors
  }, [])

  // Form submission (renamed to match requested method name)
  const handleClassFormSubmit = useCallback(async (data: ClassFormData, mode: 'create' | 'edit') => {
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        // TODO: Implement API call to create class
        console.log('Creating class:', data)
        // const response = await fetch('/api/classes', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // })
        // if (!response.ok) throw new Error('Failed to create class')
      } else {
        // TODO: Implement API call to update class
        console.log('Updating class:', selectedClass?.id, data)
        // const response = await fetch(`/api/classes/${selectedClass?.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // })
        // if (!response.ok) throw new Error('Failed to update class')
      }
      
      closeAllModals()
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} class:`, error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedClass?.id, closeAllModals])

  // Delete confirmation (updated to use ClassProfile)
  const handleDeleteConfirmation = useCallback(async (classData: ClassProfile) => {
    setIsSubmitting(true)
    try {
      // Show impact warning if there are affected students
      if (classData.students && classData.students.length > 0) {
        const affectedStudents = classData.students.map(s => ({ ...s, status: 'active' as const }))
        const warningMessage = showStudentImpactWarning(affectedStudents)
        const confirmed = window.confirm(warningMessage)
        if (!confirmed) {
          setIsSubmitting(false)
          return
        }
      }
      
      // TODO: Implement API call to delete class
      console.log('Deleting class:', classData.id)
      // const response = await fetch(`/api/classes/${classData.id}`, {
      //   method: 'DELETE'
      // })
      // if (!response.ok) throw new Error('Failed to delete class')
      
      closeAllModals()
    } catch (error) {
      console.error('Error deleting class:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [closeAllModals])

  // Student management
  const addStudentsToClass = useCallback(async (classId: string, studentIds: string[]) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to add students to class
      console.log('Adding students to class:', classId, studentIds)
      // const response = await fetch(`/api/classes/${classId}/students`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ studentIds })
      // })
      // if (!response.ok) throw new Error('Failed to add students to class')
      
      closeAllModals()
    } catch (error) {
      console.error('Error adding students to class:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [closeAllModals])

  const removeStudentFromClass = useCallback(async (classId: string, studentId: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to remove student from class
      console.log('Removing student from class:', classId, studentId)
      // const response = await fetch(`/api/classes/${classId}/students/${studentId}`, {
      //   method: 'DELETE'
      // })
      // if (!response.ok) throw new Error('Failed to remove student from class')
      
    } catch (error) {
      console.error('Error removing student from class:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Student selection logic (updated to handle add/remove actions)
  const handleStudentSelection = useCallback(async (studentIds: string[], action: 'add' | 'remove') => {
    setIsLoading(true)
    try {
      if (!selectedClass) {
        throw new Error('No class selected')
      }

      if (action === 'add') {
        // Check capacity before adding
        const availableCapacity = selectedClass.capacity - selectedClass.currentEnrollment
        if (studentIds.length > availableCapacity) {
          throw new Error(`Cannot add ${studentIds.length} students. Only ${availableCapacity} spots available.`)
        }
        
        await addStudentsToClass(selectedClass.id, studentIds)
        setSelectedStudents(prev => [...prev, ...studentIds])
      } else {
        // Remove students
        for (const studentId of studentIds) {
          await removeStudentFromClass(selectedClass.id, studentId)
        }
        setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)))
      }
      
      console.log(`${action === 'add' ? 'Added' : 'Removed'} students:`, studentIds)
    } catch (error) {
      console.error(`Error ${action === 'add' ? 'adding' : 'removing'} students:`, error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [selectedClass, addStudentsToClass, removeStudentFromClass])

  // Impact warning display
  const showStudentImpactWarning = useCallback((affectedStudents: Student[]): string => {
    if (affectedStudents.length === 0) {
      return 'Are you sure you want to delete this class?'
    }
    
    const activeStudents = affectedStudents.filter(s => s.status !== 'inactive')
    const studentNames = activeStudents.slice(0, 3).map(s => `${s.firstName} ${s.lastName}`).join(', ')
    const additionalCount = activeStudents.length > 3 ? ` and ${activeStudents.length - 3} more` : ''
    
    return `Warning: Deleting this class will affect ${activeStudents.length} student(s): ${studentNames}${additionalCount}. This action cannot be undone. Are you sure you want to proceed?`
  }, [])

  // Modal close handling
  const handleModalClose = useCallback((hasUnsavedChanges: boolean) => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close this modal?'
      )
      if (shouldClose) {
        closeAllModals()
        return true
      }
      return false
    }
    closeAllModals()
    return true
  }, [closeAllModals])

  return {
    // Modal state
    modals,
    selectedClass,
    selectedStudents,
    
    // Core modal management (self-reference for the requested useClassModals method)
    useClassModals: () => useClassModals(),
    
    // Modal actions
    openCreateClassModal,
    openEditClassModal,
    openDeleteClassModal,
    openStudentSelectionModal,
    openManageStudentsModal,
    closeAllModals,
    
    // Key Methods/Functions as requested
    handleClassFormSubmit,
    handleStudentSelection,
    handleDeleteConfirmation,
    showStudentImpactWarning,
    handleFormValidation,
    
    // Additional form handling
    handleModalClose,
    
    // Student management
    addStudentsToClass,
    removeStudentFromClass,
    
    // Loading states
    isLoading,
    isSubmitting
  }
}