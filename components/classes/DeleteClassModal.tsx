'use client'

import React, { useState } from 'react'
import { useClassModals, ClassData } from '../../hooks/useClassModals'

interface DeleteClassModalProps {
  isOpen: boolean
  onClose: () => void
  classData: ClassData | null
  onConfirm: (classData: ClassData) => void
}

export default function DeleteClassModal({ isOpen, onClose, classData, onConfirm }: DeleteClassModalProps) {
  const { handleDeleteConfirmation, showStudentImpactWarning } = useClassModals()
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (!classData) return
    
    // Convert ClassData to ClassProfile for the handleDeleteConfirmation method
    const classProfile = {
      ...classData,
      affectedStudents: classData.students || []
    }
    
    setIsDeleting(true)
    try {
      await handleDeleteConfirmation(classProfile)
      setConfirmText('')
      onClose()
    } catch (error) {
      console.error('Error deleting class:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  const isConfirmValid = confirmText === classData?.name

  if (!isOpen || !classData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Class</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
            disabled={isDeleting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to delete this class?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. All data associated with this class will be permanently deleted.
            </p>
          </div>

          {/* Class Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{classData.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Instructor:</span> {classData.instructor}</p>
              <p><span className="font-medium">Students Enrolled:</span> {classData.currentEnrollment}</p>
              <p><span className="font-medium">Duration:</span> {classData.startDate} to {classData.endDate}</p>
              {classData.schedule && (
                <p><span className="font-medium">Schedule:</span> {classData.schedule}</p>
              )}
            </div>
          </div>

          {/* Impact Warning */}
          {classData.currentEnrollment > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Warning: Students Currently Enrolled
                  </h4>
                  <p className="mt-1 text-sm text-red-700">
                    This class has {classData.currentEnrollment} student{classData.currentEnrollment !== 1 ? 's' : ''} enrolled. 
                    Deleting this class will remove all enrollment records and may affect student progress tracking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-6">
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-semibold text-red-600">"{classData.name}"</span> to confirm deletion:
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={`Type "${classData.name}" here`}
              disabled={isDeleting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Delete Class'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}