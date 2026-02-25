import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { DailyTrackerPage } from './pages/tracker/DailyTrackerPage'
import { RamadanCalendarPage } from './pages/calendar/RamadanCalendarPage'
import { QuranPage } from './pages/quran/QuranPage'
import { TasbeehPage } from './pages/tasbeeh/TasbeehPage'
import { ErrorBoundary } from './components/layout/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth">
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="update-password" element={<UpdatePasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tracker">
                  <Route index element={<DailyTrackerPage />} />
                  <Route path=":date" element={<DailyTrackerPage />} />
                </Route>
                <Route path="/calendar" element={<RamadanCalendarPage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/tasbeeh" element={<TasbeehPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
