import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { fetchLogForDate, upsertLog } from '../../services/ramadanLogs'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function DailyTrackerPage() {
  const { date: dateParam } = useParams()
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [log, setLog] = useState(null)
  const [dirty, setDirty] = useState(false)

  const selectedDate = useMemo(() => {
    const fromQuery = params.get('date')
    const base = dateParam || fromQuery || todayString()
    return base
  }, [dateParam, params])

  useEffect(() => {
    let isMounted = true
    if (!user) return undefined
    Promise.resolve().then(() => {
      if (!isMounted) return
      setLoading(true)
      setError(null)
    })
    fetchLogForDate(user.id, selectedDate)
      .then((result) => {
        if (!isMounted) return
        setLog(result)
        setDirty(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [user, selectedDate])

  useEffect(() => {
    if (!log || !dirty || !user) return undefined
    const timeout = setTimeout(() => {
      setSaving(true)
      upsertLog(user.id, log)
        .then((updated) => {
          setLog(updated)
          setDirty(false)
        })
        .catch((err) => {
          setError(err)
        })
        .finally(() => {
          setSaving(false)
        })
    }, 800)

    return () => clearTimeout(timeout)
  }, [log, dirty, user])

  function updateField(field, value) {
    setLog((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
    setDirty(true)
  }

  function handleDayChange(delta) {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + delta)
    const next = current.toISOString().slice(0, 10)
    setParams({ date: next })
  }

  if (loading || !log) {
    return (
      <div className="tracker-loading">
        <div className="tracker-spinner" />
      </div>
    )
  }

  const completion = log.completion ?? 0

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <div>
          <h1 className="tracker-title">Daily tracker</h1>
          <p className="tracker-subtitle">
            Log today&apos;s salah, Qur&apos;an, dhikr, sadaqah, and reflections.
          </p>
        </div>
        <div className="tracker-date-nav">
          <Button variant="ghost" onClick={() => handleDayChange(-1)}>
            Previous
          </Button>
          <span className="tracker-date-pill">{selectedDate}</span>
          <Button variant="ghost" onClick={() => handleDayChange(1)}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Obligatory prayers</CardTitle>
            <CardDescription>Mark the prayers you completed on this day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'taraweeh'].map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <span className="capitalize">{key}</span>
                  <input
                    type="checkbox"
                    checked={!!log[key]}
                    onChange={(e) => updateField(key, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s completion</CardTitle>
            <CardDescription>Approximate completion based on your worship log.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{completion.toFixed(0)}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(completion, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Saved automatically {saving ? '(saving...)' : dirty ? '(pending save)' : '(up to date)'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Qur&apos;an and dhikr</CardTitle>
            <CardDescription>Gently track your recitation and remembrance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Qur&apos;an pages
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={log.quran_pages ?? 0}
                  onChange={(e) => updateField('quran_pages', Number(e.target.value) || 0)}
                  className="tracker-input"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Dhikr count
                </label>
                <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={log.dhikr_count ?? 0}
                  onChange={(e) => updateField('dhikr_count', Number(e.target.value) || 0)}
                  className="tracker-input"
                />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => updateField('dhikr_count', (log.dhikr_count || 0) + 33)}
                  >
                    +33
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sadaqah</CardTitle>
            <CardDescription>Optional record of charity given this day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <span>Sadaqah given</span>
                <input
                  type="checkbox"
                  checked={!!log.sadaqah}
                  onChange={(e) => updateField('sadaqah', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
              </label>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Amount (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={log.sadaqah_amount ?? ''}
                  onChange={(e) =>
                    updateField(
                      'sadaqah_amount',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 5.00"
                  className="tracker-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
          <CardDescription>
            Capture a short note, du&apos;a, or reflection from this day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            rows={4}
            value={log.reflection ?? ''}
            onChange={(e) => updateField('reflection', e.target.value)}
            className="tracker-textarea"
            placeholder="Today I felt..."
          />
          {error ? (
            <p className="mt-2 text-xs text-red-600">
              Unable to save automatically right now. Your changes will retry shortly.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
