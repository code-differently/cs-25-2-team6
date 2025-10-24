'use client'

import React from 'react'
import { useClassModals, ClassData, StudentData } from '../../hooks/useClassModals'
import {
  CreateClassModal,
  EditClassModal,
  DeleteClassModal,
  StudentSelectionModal,
  ManageStudentsModal
} from './index'

// Example usage component showing how to integrate all modals
interface ClassManagementExampleProps {
  classes: ClassData[]
  availableStudents: StudentData[]
}

export default function ClassManagementExample({
  classes,
  availableStudents
}: ClassManagementExampleProps) {
  const {
    modals,
    selectedClass,
    openCreateClassModal,
    openEditClassModal,
    openDeleteClassModal,
    openStudentSelectionModal,
    openManageStudentsModal,
    closeAllModals
  } = useClassModals()

  return (
    <div>
      {/* Example trigger buttons */}
      <div className="space-x-4 mb-8">
        <button
          onClick={openCreateClassModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Class
        </button>
        
        {classes.length > 0 && (
          <>
            <button
              onClick={() => openEditClassModal(classes[0])}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Edit First Class
            </button>
            
            <button
              onClick={() => openDeleteClassModal(classes[0])}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete First Class
            </button>
            
            <button
              onClick={() => openStudentSelectionModal(classes[0])}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add Students to First Class
            </button>
            
            <button
              onClick={() => openManageStudentsModal(classes[0])}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Manage Students in First Class
            </button>
          </>
        )}
      </div>

      {/* All modals */}
      <CreateClassModal
        isOpen={modals.createClass}
        onClose={closeAllModals}
        onSubmit={() => {}} // Hook handles submission internally
      />

      <EditClassModal
        isOpen={modals.editClass}
        onClose={closeAllModals}
        classData={selectedClass}
        onSubmit={() => {}} // Hook handles submission internally
      />

      <DeleteClassModal
        isOpen={modals.deleteClass}
        onClose={closeAllModals}
        classData={selectedClass}
        onConfirm={() => {}} // Hook handles deletion internally
      />

      <StudentSelectionModal
        isOpen={modals.studentSelection}
        onClose={closeAllModals}
        classData={selectedClass}
        availableStudents={availableStudents}
        onSubmit={() => {}} // Hook handles submission internally
      />

      <ManageStudentsModal
        isOpen={modals.manageStudents}
        onClose={closeAllModals}
        classData={selectedClass}
        onRemoveStudent={() => {}} // Hook handles removal internally
        onAddStudents={() => {
          closeAllModals()
          if (selectedClass) {
            openStudentSelectionModal(selectedClass)
          }
        }}
      />
    </div>
  )
}