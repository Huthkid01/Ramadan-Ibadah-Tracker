import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'

export function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle, error } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName.trim()) {
      setValidationError('Please enter your name.')
      return
    }
    if (!email || !password) {
      setValidationError('Email and password are required.')
      return
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    setValidationError('')
    setSubmitting(true)

    try {
      await signUpWithEmail({ email, password, fullName })
      navigate('/dashboard')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-browser-bar">
          <div className="auth-browser-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="auth-browser-title">Ramadan Ibadah Tracker</span>
        </div>

        <div className="auth-body">
          <div className="auth-panel auth-panel-form">
            <div className="auth-brand">
              <div className="auth-logo">☽</div>
              <div>
                <h1 className="auth-heading">Create account</h1>
                <p className="auth-subheading">
                  Join to track your Salah, Qur&apos;an and dhikr this Ramadan.
                </p>
              </div>
            </div>

            <Card className="auth-card">
              <CardHeader>
                <CardTitle className="auth-card-title">Sign up</CardTitle>
                <CardDescription className="auth-card-description">
                  Enter your details to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="auth-card-body">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubmitting(true)
                      signInWithGoogle().catch(() => {
                        setSubmitting(false)
                      })
                    }}
                    disabled={submitting}
                    className="auth-google-btn"
                  >
                    <span className="auth-google-icon">
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </span>
                    <span>Sign up with Google</span>
                  </Button>

                  <div className="auth-divider">
                    <span>or sign up with email</span>
                  </div>

                  <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                      <label className="auth-label">Full name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="auth-input"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Email address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        placeholder="name@example.com"
                      />
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Password</label>
                      <div className="auth-password-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          minLength={8}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="auth-input"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="auth-label">Confirm password</label>
                      <div className="auth-password-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          minLength={8}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="auth-input"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          aria-pressed={showConfirmPassword}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {validationError ? (
                      <div className="auth-error">
                        <span>{validationError}</span>
                      </div>
                    ) : null}
                    {error ? (
                      <div className="auth-error">
                        <span>
                          {error.message ?? 'Unable to register. Please try again.'}
                        </span>
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="auth-submit-btn"
                    >
                      {submitting ? 'Creating account...' : 'Create account'}
                    </Button>
                  </form>
                </div>
              </CardContent>
              <div className="auth-card-footer">
                <span>Already have an account?</span>
                <Link to="/auth/login" className="auth-link">
                  Sign in
                </Link>
              </div>
            </Card>
          </div>

          <div className="auth-panel auth-panel-preview">
            <div className="auth-phone">
              <div className="auth-phone-notch" />
              <div className="auth-phone-screen">
                <div className="auth-phone-header">
                  <span className="auth-phone-logo">☽</span>
                  <span className="auth-phone-brand">Ramadan Tracker</span>
                </div>
                <h2 className="auth-phone-title">Welcome to a calmer Ramadan</h2>
                <p className="auth-phone-text">
                  Keep your Salah, Qur&apos;an and dhikr organised in one focused space.
                </p>
                <div className="auth-phone-cta">See dashboard preview</div>
                <div className="auth-phone-stats">
                  <div>
                    <span className="auth-phone-stat-label">Today</span>
                    <span className="auth-phone-stat-value">72%</span>
                  </div>
                  <div>
                    <span className="auth-phone-stat-label">Streak</span>
                    <span className="auth-phone-stat-value">5 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
