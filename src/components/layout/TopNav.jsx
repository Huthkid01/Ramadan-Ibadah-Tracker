import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export function TopNav() {
  const { user, signOut } = useAuth()

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
          </div>

          <div className="top-nav-controls">
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
