'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import AttendanceForm from '@/components/AttendanceForm'
import { useScheduleModals } from '@/hooks/useScheduleModals'
import ScheduleDayOffModal from '@/components/schedule/ScheduleDayOffModal'
import ReasonSelectionModal from '@/components/schedule/ReasonSelectionModal'
import ScheduleConfirmationModal from '@/components/schedule/ScheduleConfirmationModal'
import ScheduleDashboard from '@/components/schedule/ScheduleDashboard'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import ScheduledEventsList from '@/components/schedule/ScheduledEventsList'

export default function Home() {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const scheduleModals = useScheduleModals()
  // Removed activeTab since we only have Schedule Management now

  const handleDateClick = (day: number) => {
    if (day > 0) {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const newDate = new Date(currentYear, currentMonth, day)
      setSelectedDate(newDate)
      setShowAttendanceModal(true)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px' 
          }}>
            👋 Welcome, User!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Manage schedules, events, and attendance from one central location. Click any date to record attendance.
          </p>
        </div>

        {/* Schedule Management Content */}
        <div>
          {/* Schedule Dashboard Overview */}
          <div style={{ marginBottom: '32px' }}>
            <ScheduleDashboard selectedDate={selectedDate} />
          </div>

          {/* View Toggle for Schedule */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setView('calendar')}
              style={{
                backgroundColor: view === 'calendar' ? '#10b981' : '#f3f4f6',
                color: view === 'calendar' ? 'white' : '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setView('list')}
              style={{
                backgroundColor: view === 'list' ? '#10b981' : '#f3f4f6',
                color: view === 'list' ? 'white' : '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📋 List View
            </button>
            {/* Space for future button */}
          </div>

          {/* Schedule Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: view === 'calendar' ? '2fr 1fr' : '1fr',
            gap: '24px' 
          }}>
            {view === 'calendar' && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <ScheduleCalendar 
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onDateClick={(date) => {
                    setSelectedDate(date);
                    setShowAttendanceModal(true);
                  }}
                />
              </div>
            )}
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <ScheduledEventsList 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
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
        
        {/* Attendance Form Modal */}
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
