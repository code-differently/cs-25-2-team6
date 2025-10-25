'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import AttendanceForm from '@/components/AttendanceForm'
import ScheduleDashboard from '@/components/schedule/ScheduleDashboard'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import ScheduledEventsList from '@/components/schedule/ScheduledEventsList'
import AlertsDashboard from '@/components/alerts/AlertsDashboard'
import Image from 'next/image'

export default function Home() {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

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
        {/* Header with Alerts Button */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#111827',
              marginBottom: '8px' 
            }}>
              👋 Welcome, User!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Manage schedules, events, and attendance from one central location.
            </p>
          </div>
          
          {/* Alerts Button */}
          <button
            onClick={() => setShowAlertsModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px'
            }}
            title="Open Alerts Dashboard"
          >
            <Image
              src="/free-bell-icon-860-thumb.png"
              alt="Alerts"
              width={30}
              height={30}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </button>
        </div>

        {/* Schedule Content */}
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
          </div>
        </div>
        
        {/* Attendance Form Modal */}
        <AttendanceForm 
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
        />

        {/* Alerts Modal */}
        {showAlertsModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowAlertsModal(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '0',
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: '1200px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  🚨 Alerts Dashboard
                </h2>
                <button
                  onClick={() => setShowAlertsModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px'
                  }}
                >
                  ❌
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={{
                padding: '24px',
                maxHeight: 'calc(95vh - 100px)',
                overflowY: 'auto'
              }}>
                <AlertsDashboard />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}