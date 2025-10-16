import Link from 'next/link'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/" className="nav-link">
              📅 Calendar
            </Link>
          </li>
          <li>
            <Link href="/reports" className="nav-link">
              📊 Reports
            </Link>
          </li>
          <li>
            <Link href="/settings" className="nav-link">
              ⚙️ Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
