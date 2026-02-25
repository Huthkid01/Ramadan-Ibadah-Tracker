import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Button } from '../../components/ui/Button'
import { DailyDuaWidget } from '../../components/dashboard/DailyDuaWidget'
import { StreakBadge } from '../../components/dashboard/StreakBadge'
import { fetchRamadanSummary } from '../../services/ramadanLogs'
import { DailyAyahHadith } from '../../components/dashboard/DailyAyahHadith'
import { PrayerTimesWidget } from '../../components/dashboard/PrayerTimesWidget'
import { QiblaDirectionWidget } from '../../components/dashboard/QiblaDirectionWidget'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card'
import { fetchCurrentRamadanStartDate } from '../../services/hijriCalendar'

function getRamadanStartFromEnv() {
  const fromEnv = import.meta.env.VITE_RAMADAN_START_DATE
  if (fromEnv) {
    const date = new Date(fromEnv)
    if (!Number.isNaN(date.getTime())) return date
  }
  return null
}

function getRamadanDay(start) {
  if (!start) return null
  const today = new Date()
  const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const day = diffDays + 1
  if (day < 1 || day > 30) return null
  return day
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [ramadanStart, setRamadanStart] = useState(() => getRamadanStartFromEnv())
  const [selectedRamadanDay, setSelectedRamadanDay] = useState(null)
  const ramadanDay = getRamadanDay(ramadanStart)

  useEffect(() => {
    if (ramadanStart) return undefined

    let isMounted = true

    fetchCurrentRamadanStartDate()
      .then((date) => {
        if (!isMounted) return
        setRamadanStart(date)
      })
      .catch(() => {
        if (!isMounted) return
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setRamadanStart(today)
      })

    return () => {
      isMounted = false
    }
  }, [ramadanStart])

  useEffect(() => {
    let isMounted = true
    let intervalId

    async function load() {
      if (!user || !ramadanStart) {
        return
      }
      try {
        const data = await fetchRamadanSummary(user.id, ramadanStart)
        if (!isMounted) return
        setSummary(data)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setError(err)
      }
    }

    load()

    if (user && ramadanStart) {
      intervalId = setInterval(load, 30000)
    }

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [user, ramadanStart])

  const currentSelection = selectedRamadanDay ?? ramadanDay
  const dayStats = summary?.dayStats ?? []
  const selectedIndex = currentSelection ? currentSelection - 1 : null
  const selectedStats = selectedIndex != null ? dayStats[selectedIndex] : null

  const completionPercent = selectedStats
    ? selectedStats.completion
    : summary?.todayCompletion ?? 0
  const totalSalahForDisplay = selectedStats
    ? selectedStats.salahCount
    : summary?.totalSalah ?? 0
  const dayLabel = currentSelection ? `Day ${currentSelection}` : 'Today'
  const quranProgressRaw = summary?.quranProgress ?? 0
  const quranProgressValue = Number.isFinite(quranProgressRaw)
    ? Math.max(0, Math.min(quranProgressRaw, 100))
    : 0
  const quranProgressLabel =
    quranProgressValue > 0 && quranProgressValue < 1
      ? quranProgressValue.toFixed(1)
      : quranProgressValue.toFixed(0)
  const streak = summary?.currentStreak ?? 0
  const fastingDays = summary?.fastingDays ?? 0

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">
            As-salamu alaykum, {user?.user_metadata?.full_name?.split(' ')[0] || 'friend'}
          </h1>
          <p className="dashboard-subtitle">
            Here&apos;s a quick overview of your Ramadan worship so far.
          </p>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-day-pill">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <StreakBadge streak={streak} />
        </div>
      </section>

      <section className="dashboard-grid-primary">
        <Card className="dashboard-hero-card">
          <CardHeader>
            <CardTitle>Ramadan summary</CardTitle>
            <CardDescription>
              {ramadanDay
                ? `Day ${ramadanDay} of 30 · Keep a steady, gentle rhythm.`
                : 'Set a Ramadan start date to see your full journey.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="dashboard-hero-day-selector">
              <span className="dashboard-hero-day-label">Ramadan</span>
              <select
                className="dashboard-hero-day-select"
                value={currentSelection ?? ''}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (Number.isNaN(value)) return
                  if (value < 1 || value > 30) return
                  setSelectedRamadanDay(value)
                }}
              >
                {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="dashboard-hero-layout">
              <div className="dashboard-hero-content">
                <div className="dashboard-hero-progress">
                  <div className="dashboard-hero-progress-header">
                    <span>{dayLabel} completion</span>
                    <span>{completionPercent.toFixed(0)}%</span>
                  </div>
                  <div className="dashboard-hero-progress-bar">
                    <div style={{ width: `${completionPercent}%` }} />
                  </div>
                  <Button
                    type="button"
                    onClick={() => navigate('/tracker')}
                    className="dashboard-hero-cta"
                  >
                    Log today&apos;s worship
                  </Button>
                </div>
                <div className="dashboard-hero-stats">
                  <div className="dashboard-hero-stat">
                    <span className="dashboard-hero-stat-label">Total Salah</span>
                    <span className="dashboard-hero-stat-value">{totalSalahForDisplay}</span>
                  </div>
                  <div className="dashboard-hero-stat">
                    <span className="dashboard-hero-stat-label">Qur&apos;an progress</span>
                    <span className="dashboard-hero-stat-value">{quranProgressLabel}%</span>
                  </div>
                  <div className="dashboard-hero-stat">
                    <span className="dashboard-hero-stat-label">Fasting days</span>
                    <span className="dashboard-hero-stat-value">{fastingDays}</span>
                  </div>
                </div>
              </div>
              <div className="dashboard-hero-phone">
                <div className="auth-phone">
                  <div className="auth-phone-notch" />
                  <div className="auth-phone-screen">
                    <div className="auth-phone-header">
                      <span className="auth-phone-logo">☽</span>
                      <span className="auth-phone-brand">Ramadan Tracker</span>
                    </div>
                    <h2 className="auth-phone-title">Today at a glance</h2>
                    <p className="auth-phone-text">
                      Salah, Qur&apos;an and dhikr for this day in a calm view.
                    </p>
                    <Button
                      type="button"
                      className="auth-phone-cta"
                      onClick={() => navigate('/tracker')}
                    >
                      Open daily tracker
                    </Button>
                    <div className="auth-phone-stats">
                      <div>
                        <span className="auth-phone-stat-label">{dayLabel}</span>
                        <span className="auth-phone-stat-value">
                          {completionPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="auth-phone-stat-label">Streak</span>
                        <span className="auth-phone-stat-value">{streak} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-prayer-card">
          <CardHeader>
            <CardTitle>Prayer times</CardTitle>
            <CardDescription>Stay aligned with today&apos;s Salah times.</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-prayer-content">
            <PrayerTimesWidget />
          </CardContent>
        </Card>
      </section>

      <section className="dashboard-grid-secondary">
        <Card className="dashboard-weekly-card">
          <CardHeader>
            <CardTitle>Daily Dua</CardTitle>
            <CardDescription>A prayer to reflect on for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyDuaWidget />
          </CardContent>
        </Card>

        <Card className="dashboard-quran-card">
          <CardHeader>
            <CardTitle>Qur&apos;an journey</CardTitle>
            <CardDescription>Progress towards your 30 Juz goal.</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-quran-content">
            <p className="dashboard-quran-number">{quranProgressLabel}%</p>
            <p className="dashboard-quran-caption">of 30 Juz completed</p>
          </CardContent>
        </Card>

        <Card className="dashboard-inspiration-card">
          <CardHeader className="dashboard-inspiration-header">
            <span className="dashboard-inspiration-icon">✨</span>
            <CardTitle>Daily inspiration</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyAyahHadith />
          </CardContent>
        </Card>

        <Card className="dashboard-qibla-card">
          <CardHeader>
            <CardTitle>Qibla direction</CardTitle>
            <CardDescription>
              Use your location to find the direction of the Qibla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QiblaDirectionWidget />
          </CardContent>
        </Card>
      </section>

      {error ? (
        <div className="dashboard-error">
          Unable to load summary. Your tracker data is still safe.
        </div>
      ) : null}
    </div>
  )
}
