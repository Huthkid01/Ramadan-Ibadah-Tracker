import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export function UpdatePasswordPage() {
  const { updatePassword, error } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setValidationError('Please enter and confirm your new password.')
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
      await updatePassword(password)
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
                <h1 className="auth-heading">Reset password</h1>
                <p className="auth-subheading">
                  Choose a new password for your account.
                </p>
              </div>
            </div>

            <Card className="auth-card">
              <CardHeader>
                <CardTitle className="auth-card-title">Update password</CardTitle>
                <CardDescription className="auth-card-description">
                  Enter a strong password that you do not use elsewhere.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="auth-card-body">
                  <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                      <label className="auth-label">New password</label>
                      <input
                        type="password"
                        minLength={8}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Confirm new password</label>
                      <input
                        type="password"
                        minLength={8}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-input"
                        placeholder="••••••••"
                      />
                    </div>

                    {validationError ? (
                      <div className="auth-error">
                        <span>{validationError}</span>
                      </div>
                    ) : null}
                    {error ? (
                      <div className="auth-error">
                        <span>
                          {error.message ?? 'Unable to update password. Please try again.'}
                        </span>
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="auth-submit-btn"
                    >
                      {submitting ? 'Updating...' : 'Update password'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
