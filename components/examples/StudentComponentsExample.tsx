// Integration Test Example - Student Management Components with Utility Functions
import React from 'react';
import {
  StudentAvatar,
  RequiredFieldLabel,
  ValidationMessage,
  StudentBadge,
  ConfirmButton
} from '../ui';

/**
 * Example showcasing the integrated utility functions
 */
export const StudentComponentsExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* StudentAvatar with utility integration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">StudentAvatar with Utility Functions</h3>
        
        {/* Auto-generated initials and colors */}
        <StudentAvatar
          firstName="John"
          lastName="Doe"
          studentId="STU001"
          size="large"
          showStatus
          status="online"
        />
        
        {/* Name formatting in accessibility */}
        <StudentAvatar
          firstName="Mary Jane"
          lastName="Watson-Smith"
          studentId="STU002"
          size="medium"
        />
      </div>

      {/* RequiredFieldLabel with auto-detection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">RequiredFieldLabel with Auto-Detection</h3>
        
        {/* Auto-detect required fields */}
        <RequiredFieldLabel
          fieldName="firstName"
          autoDetectRequired
          htmlFor="firstName"
        >
          First Name
        </RequiredFieldLabel>
        
        <RequiredFieldLabel
          fieldName="email"
          autoDetectRequired
          htmlFor="email"
          showRequiredText
        >
          Email Address
        </RequiredFieldLabel>
      </div>

      {/* ValidationMessage with field formatting */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ValidationMessage with Field Formatting</h3>
        
        <ValidationMessage
          type="error"
          fieldName="firstName"
          formatFieldName
        >
          First Name is required
        </ValidationMessage>
        
        <ValidationMessage
          type="warning"
          fieldName="phoneNumber"
          formatFieldName
        >
          Phone Number format is invalid
        </ValidationMessage>
      </div>

      {/* StudentBadge with auto-formatting */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">StudentBadge with Auto-Formatting</h3>
        
        {/* Auto-format grade */}
        <StudentBadge
          grade={9}
          autoFormatGrade
          variant="primary"
        >
          {/* This will be replaced with formatted grade */}
        </StudentBadge>
        
        {/* Auto-format student ID */}
        <StudentBadge
          studentId="123"
          autoFormatStudentId
          variant="secondary"
        >
          {/* This will be replaced with formatted ID */}
        </StudentBadge>
        
        {/* Kindergarten formatting */}
        <StudentBadge
          grade="K"
          autoFormatGrade
          variant="success"
        >
          {/* This will show "Kindergarten" */}
        </StudentBadge>
      </div>

      {/* ConfirmButton with student name formatting */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">ConfirmButton with Student Name Formatting</h3>
        
        <ConfirmButton
          variant="danger"
          requireConfirmation
          confirmationMessage="Are you sure you want to remove {studentName} from the class?"
          studentFirstName="John"
          studentLastName="Doe"
          autoFormatStudentName
          onClick={() => console.log('Student removed')}
        >
          Remove Student
        </ConfirmButton>
      </div>

      {/* Combined example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Complete Student Card Example</h3>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <StudentAvatar
              firstName="Sarah"
              lastName="Johnson"
              studentId="STU003"
              size="large"
              showStatus
              status="online"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">Sarah Johnson</h4>
                <StudentBadge
                  grade={11}
                  autoFormatGrade
                  size="small"
                  variant="primary"
                >
                  {/* Auto-formatted to "11th Grade" */}
                </StudentBadge>
                <StudentBadge
                  studentId="STU003"
                  autoFormatStudentId
                  size="small"
                  variant="secondary"
                >
                  {/* Auto-formatted to "STU0003" */}
                </StudentBadge>
              </div>
              
              <div className="flex gap-2">
                <ConfirmButton
                  size="small"
                  variant="secondary"
                  onClick={() => console.log('Edit student')}
                >
                  Edit
                </ConfirmButton>
                
                <ConfirmButton
                  size="small"
                  variant="danger"
                  requireConfirmation
                  confirmationMessage="Are you sure you want to remove {studentName}?"
                  studentFirstName="Sarah"
                  studentLastName="Johnson"
                  autoFormatStudentName
                  onClick={() => console.log('Remove student')}
                >
                  Remove
                </ConfirmButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentComponentsExample;