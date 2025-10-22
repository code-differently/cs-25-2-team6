'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import AttendanceForm from '@/components/AttendanceForm'
import { useScheduleModals } from '@/hooks/useScheduleModals'
import ScheduleDayOffModal from '@/components/schedule/ScheduleDayOffModal'
import ReasonSelectionModal from '@/components/schedule/ReasonSelectionModal'
import ScheduleConfirmationModal from '@/components/schedule/ScheduleConfirmationModal'

export default function Home() {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const scheduleModals = useScheduleModals()

  const handleDateClick = (day: number) => {
    if (day > 0) {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      setSelectedDate(dateString)
      setShowAttendanceModal(true)
    }
  }
  return (
    <DashboardLayout>
      <div className="calendar-container">
        <h1 className="page-title">Calendar Dashboard</h1>
        <p className="page-description">
          Welcome to the Attendance Management System. The calendar will be integrated here in Phase 2.
        </p>
        
        {/* Placeholder for FullCalendar - will be added in Phase 2 */}
        <div className="calendar-placeholder">
          <div className="placeholder-content">
            <h3>📅 Calendar View</h3>
            <p>FullCalendar integration coming in Phase 2</p>
            <div className="mock-calendar">
              <div className="calendar-grid">
                <div className="calendar-header">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
                <div className="calendar-body">
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNumber = i > 6 && i < 32 ? i - 6 : 0
                    return (
                      <div 
                        key={i} 
                        className={`calendar-day ${dayNumber > 0 ? 'clickable' : ''}`}
                        onClick={() => handleDateClick(dayNumber)}
                      >
                        {dayNumber > 0 ? dayNumber : ''}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Schedule Day Off Button - positioned underneath mock calendar */}
            <div className="calendar-actions">
              <button 
                onClick={() => scheduleModals.setScheduleModal(true)}
                className="primary-btn schedule-btn"
              >
                📅 Schedule Day Off
              </button>
            </div>
          </div>
        </div>
        
        <AttendanceForm 
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
        />

        {/* Schedule Day Off Modal System */}
        <ScheduleDayOffModal 
          isOpen={scheduleModals.scheduleModal}
          formData={scheduleModals.formData}
          reasonOptions={scheduleModals.reasonOptions}
          onFormChange={scheduleModals.setFormData}
          onSubmit={() => scheduleModals.handleScheduleSubmit(scheduleModals.formData)}
          onCancel={() => scheduleModals.setScheduleModal(false)}
          onReasonSelect={() => scheduleModals.setReasonModal(true)}
        />
        <ReasonSelectionModal 
          isOpen={scheduleModals.reasonModal}
          reasonOptions={scheduleModals.reasonOptions}
          selectedReason={scheduleModals.formData.reason}
          onReasonSelect={scheduleModals.handleReasonSelection}
          onCancel={() => scheduleModals.setReasonModal(false)}
          onConfirm={() => scheduleModals.setReasonModal(false)}
        />
        <ScheduleConfirmationModal 
          isOpen={scheduleModals.confirmationModal}
          onClose={() => {
            scheduleModals.setConfirmationModal(false);
            // Reset form data after confirmation
            scheduleModals.setFormData({
              date: '',
              reason: '',
              customReason: '',
              affectedStudentCount: 0
            });
          }}
        />
      </div>
    </DashboardLayout>
  )
}
