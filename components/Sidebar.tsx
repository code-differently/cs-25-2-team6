import Link from 'next/link'
import { useRouter } from 'next/router'
import './Sidebar.css'

export default function Sidebar() {
  const router = useRouter()
  
  // Function to check if link is active
  const isActive = (path: string) => {
    return router.pathname === path
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">
          {router.pathname === '/' && 'Calendar'}
          {router.pathname === '/attendance' && 'Attendance'}
          {router.pathname === '/reports' && 'Reports'}
          {router.pathname === '/settings' && 'Settings'}
        </span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              📅 Calendar
            </Link>
          </li>
          <li>
            <Link href="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>
              📊 Reports
            </Link>
          </li>
          <li>
            <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
