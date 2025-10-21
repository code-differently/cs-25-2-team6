import DashboardLayout from '@/components/DashboardLayout'
import FilterPanel from '@/components/reports/FilterPanel'

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="reports-container">
        <h1 className="page-title">📊 Attendance Reports</h1>
        <p className="page-description">
          View and filter attendance reports by student, date, or status.
        </p>
        
        <FilterPanel />
        
        {/* Placeholder for Reports results */}
        <div className="reports-placeholder">
          <div className="placeholder-content">
            <h3>Report Results</h3>
            <p>Filtered attendance data will appear here after clicking "Generate Report".</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
