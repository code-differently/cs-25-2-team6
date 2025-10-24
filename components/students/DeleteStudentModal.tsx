import React, { useState } from 'react';
import { useStudentModals, Student } from '../../hooks/useStudentModals';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onStudentDeleted?: (studentId: string) => void;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentDeleted,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    modalState,
    dependencyResult,
    handleDeleteConfirmation,
    showDependencyWarning,
    handleModalClose,
  } = useStudentModals({
    onStudentsDeleted: (ids) => {
      if (ids.length > 0 && onStudentDeleted) {
        onStudentDeleted(ids[0]);
      }
    },
    checkDependencies: async (student: Student) => {
      // Simulate dependency check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hasAttendance = Math.random() > 0.7;
      const hasReports = Math.random() > 0.8;
      const hasAlerts = Math.random() > 0.9;
      
      return {
        hasAttendanceRecords: hasAttendance,
        hasReports: hasReports,
        hasAlerts: hasAlerts,
        attendanceCount: hasAttendance ? Math.floor(Math.random() * 100) + 1 : 0,
        reportCount: hasReports ? Math.floor(Math.random() * 10) + 1 : 0,
        alertCount: hasAlerts ? Math.floor(Math.random() * 5) + 1 : 0,
        canDelete: true, // Allow deletion but show warnings
        warnings: [
          ...(hasAttendance ? ['This student has attendance records that will be permanently deleted.'] : []),
          ...(hasReports ? ['This student appears in reports that may be affected.'] : []),
          ...(hasAlerts ? ['This student has active alerts that will be removed.'] : []),
        ],
      };
    },
  });

  const handleDelete = async () => {
    if (!student) return;
    
    // Check if user typed the correct confirmation text
    const expectedText = `DELETE ${student.firstName} ${student.lastName}`;
    if (confirmText !== expectedText) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Simulate deletion API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onStudentDeleted?.(student.id);
      setConfirmText('');
      onClose();
    } catch (error) {
      console.error('Failed to delete student:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    const canClose = handleModalClose(false); // No form data to worry about
    if (canClose) {
      setConfirmText('');
      onClose();
    }
  };

  const checkDependencies = async () => {
    if (student) {
      await handleDeleteConfirmation(student);
    }
  };

  if (!isOpen || !student) return null;

  const expectedConfirmText = `DELETE ${student.firstName} ${student.lastName}`;
  const isConfirmTextCorrect = confirmText === expectedConfirmText;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-red-600">Delete Student</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Student Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-lg">
                    {student.firstName[0]}{student.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                  <p className="text-sm text-gray-500">Grade: {student.grade}</p>
                  <p className="text-sm text-gray-500">Email: {student.email}</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-red-800 font-medium">Warning: This action cannot be undone!</h4>
                  <p className="text-red-700 text-sm mt-1">
                    Deleting this student will permanently remove all associated data including attendance records, grades, and reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Check Dependencies Button */}
            <div className="mb-6">
              <button
                onClick={checkDependencies}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={modalState.isLoading}
              >
                {modalState.isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Dependencies...
                  </div>
                ) : (
                  'Check Data Dependencies'
                )}
              </button>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono text-red-600">{expectedConfirmText}</span> to confirm deletion:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  confirmText && !isConfirmTextCorrect ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={expectedConfirmText}
                disabled={isDeleting}
              />
              {confirmText && !isConfirmTextCorrect && (
                <p className="mt-1 text-sm text-red-600">
                  Please type the exact text: {expectedConfirmText}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConfirmTextCorrect || isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  'Delete Student'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dependency Warning Modal */}
      {modalState.showDependencyWarning && dependencyResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-orange-600">Data Dependencies Found</h3>
              <button
                onClick={() => showDependencyWarning(dependencyResult)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-4">
                  This student has associated data that will be affected by deletion:
                </p>
                
                <div className="space-y-3">
                  {dependencyResult.hasAttendanceRecords && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-orange-800">
                        {dependencyResult.attendanceCount} attendance records will be deleted
                      </span>
                    </div>
                  )}

                  {dependencyResult.hasReports && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-orange-800">
                        Appears in {dependencyResult.reportCount} reports
                      </span>
                    </div>
                  )}

                  {dependencyResult.hasAlerts && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-orange-800">
                        {dependencyResult.alertCount} active alerts will be removed
                      </span>
                    </div>
                  )}
                </div>

                {dependencyResult.warnings.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-red-800 font-medium mb-2">Additional Warnings:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      {dependencyResult.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => showDependencyWarning(dependencyResult)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showDependencyWarning(dependencyResult)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                >
                  Continue with Deletion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteStudentModal;