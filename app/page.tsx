import DashboardLayout from '@/components/DashboardLayout'

export default function Home() {
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
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="calendar-day">
                      {i > 6 && i < 32 ? i - 6 : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
