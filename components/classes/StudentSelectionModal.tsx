'use client'

import React, { useState, useEffect } from 'react'
import { useClassModals, ClassData, StudentData } from '../../hooks/useClassModals'

interface StudentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassData | null
  availableStudents: StudentData[]
  onSubmit: (studentIds: string[]) => void
}

export default function StudentSelectionModal({ 
  isOpen, 
  onClose, 
  classData, 
  availableStudents,
  onSubmit 
}: StudentSelectionModalProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { handleStudentSelection } = useClassModals()

  // Filter available students (exclude already enrolled)
  const eligibleStudents = availableStudents.filter(student => 
    !classData?.students.some(enrolled => enrolled.id === student.id)
  )

  // Filter students based on search term
  const filteredStudents = eligibleStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStudents([])
      setSearchTerm('')
    }
  }, [isOpen])

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSelection = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
      
      return newSelection
    })
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map(student => student.id)
    const newSelection = selectedStudents.length === filteredStudents.length 
      ? [] 
      : allFilteredIds
    
    setSelectedStudents(newSelection)
  }

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) return
    
    setIsSubmitting(true)
    try {
      await handleStudentSelection(selectedStudents, 'add')
      onClose()
    } catch (error) {
      console.error('Error adding students to class:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedStudents([])
    setSearchTerm('')
    onClose()
  }

  if (!isOpen || !classData) return null

  const remainingCapacity = classData.capacity - classData.currentEnrollment
  const canAddMore = selectedStudents.length <= remainingCapacity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Students to Class</h2>
            <p className="text-sm text-gray-600 mt-1">
              {classData.name} - {remainingCapacity} spots available
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Capacity Warning */}
          {remainingCapacity <= 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    This class is at full capacity. You cannot add more students unless you increase the class capacity first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
              {!canAddMore && selectedStudents.length > remainingCapacity && (
                <span className="text-sm text-red-600 font-medium">
                  (Exceeds capacity by {selectedStudents.length - remainingCapacity})
                </span>
              )}
            </div>
            {filteredStudents.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={remainingCapacity <= 0}
              >
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {eligibleStudents.length === 0 ? (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p>No students available to add to this class.</p>
                    <p className="text-sm mt-1">All eligible students are already enrolled.</p>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No students found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudents.includes(student.id)
                  const canSelect = remainingCapacity > 0 || isSelected
                  
                  return (
                    <div
                      key={student.id}
                      className={`p-4 flex items-center space-x-3 ${
                        canSelect ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canSelect && handleStudentToggle(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by onClick
                        disabled={!canSelect}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedStudents.length === 0 || !canAddMore || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : (
              `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}