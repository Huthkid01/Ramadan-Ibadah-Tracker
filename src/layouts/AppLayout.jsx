import { NavLink, Outlet } from 'react-router-dom'
import { TopNav } from '../components/layout/TopNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-light text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <TopNav />
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item-active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z" />
              </svg>
            </span>
            <span className="mobile-nav-label">Home</span>
          </NavLink>
          <NavLink
            to="/tracker"
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item-active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 3a2.5 2.5 0 1 1-2.45 2H8a4 4 0 0 0-4 4v1.25a3.75 3.75 0 0 0 2.18 3.41l3.07 1.38A2.5 2.5 0 0 1 11 17.34V19h2v-1.66a2.5 2.5 0 0 1 1.75-2.3l3.07-1.38A3.75 3.75 0 0 0 20 10.25V9a4 4 0 0 0-4-4h-1.55A2.5 2.5 0 0 1 12 3z" />
              </svg>
            </span>
            <span className="mobile-nav-label">Tracker</span>
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item-active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 9h18" />
              </svg>
            </span>
            <span className="mobile-nav-label">Calendar</span>
          </NavLink>
          <NavLink
            to="/quran"
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item-active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2H18a1 1 0 0 1 1 1v15.5a1 1 0 0 1-1.45.89L13 17.5l-4.55 1.89A1 1 0 0 1 7 18.5V6.5a2 2 0 0 1-1-1.73z" />
                <path d="M13 8.25 11.75 9.5 13 10.75 14.25 9.5 13 8.25zm0 0L11.5 7 13 5.75 14.5 7 13 8.25z" />
              </svg>
            </span>
            <span className="mobile-nav-label">Quran</span>
          </NavLink>
          <NavLink
            to="/tasbeeh"
            className={({ isActive }) =>
              `mobile-nav-item${isActive ? ' mobile-nav-item-active' : ''}`
            }
          >
            <span className="mobile-nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
              </svg>
            </span>
            <span className="mobile-nav-label">Tasbeeh</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
