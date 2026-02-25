import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useThemeStore } from '../../store/useThemeStore'

export function TopNav() {
  const { user, signOut } = useAuth()
  const { mode, toggle } = useThemeStore()

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link to="/dashboard" className="top-nav-brand">
          <div className="top-nav-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M18.5 4.5A8 8 0 0 1 10 19a8 8 0 1 1 8.5-14.5z" />
            </svg>
          </div>
          <div className="top-nav-text">
            <span className="top-nav-title">Ramadan Ibadah Tracker</span>
            <span className="top-nav-subtitle">
              Intentional worship, one day at a time
            </span>
          </div>
        </Link>

        <nav className="top-nav-right">
          <div className="top-nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `top-nav-link${isActive ? ' top-nav-link-active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/tracker"
              className={({ isActive }) =>
                `top-nav-link${isActive ? ' top-nav-link-active' : ''}`
              }
            >
              Tracker
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `top-nav-link${isActive ? ' top-nav-link-active' : ''}`
              }
            >
              Calendar
            </NavLink>

            <NavLink
              to="/quran"
              className={({ isActive }) =>
                `top-nav-link${isActive ? ' top-nav-link-active' : ''}`
              }
            >
              Quran
            </NavLink>
            <NavLink
              to="/tasbeeh"
              className={({ isActive }) =>
                `top-nav-link${isActive ? ' top-nav-link-active' : ''}`
              }
            >
              Tasbeeh
            </NavLink>
          </div>

          <div className="top-nav-controls">
            <button
              onClick={toggle}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-400"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="top-nav-logout"
              >
                Logout
              </button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  )
}
