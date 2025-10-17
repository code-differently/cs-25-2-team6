"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Sidebar.css'

export default function Sidebar() {
  const pathname = usePathname()
  
  // Function to check if link is active
  const isActive = (path: string) => {
    return pathname === path
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
          {pathname === '/' && 'Calendar'}
          {pathname === '/attendance' && 'Attendance'}
          {pathname === '/reports' && 'Reports'}
          {pathname === '/settings' && 'Settings'}
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
            <Link href="/attendance" className={`nav-link ${isActive('/attendance') ? 'active' : ''}`}>
              ✅ Attendance
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
