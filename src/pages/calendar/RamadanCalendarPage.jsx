import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { fetchCalendar, setFastedForDate } from '../../services/ramadanLogs'
import { fetchCurrentRamadanStartDate } from '../../services/hijriCalendar'

function getRamadanStart() {
  const fromEnv = import.meta.env.VITE_RAMADAN_START_DATE
  if (!fromEnv) return null
  const date = new Date(fromEnv)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

export function RamadanCalendarPage() {
  const { user } = useAuth()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [start, setStart] = useState(() => getRamadanStart())
  const dayMap = useMemo(() => {
    const map = new Map()
    days.forEach((day) => {
      const key = day.date.slice(0, 10)
      map.set(key, day)
    })
    return map
  }, [days])

  const calendarWeeks = useMemo(() => {
    if (!start) return []
    const ramadanDays = []
    for (let i = 0; i < 30; i += 1) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      ramadanDays.push(d)
    }

    const weeks = []
    let currentWeek = new Array(7).fill(null)
    const firstWeekday = ramadanDays[0].getDay()
    for (let i = 0; i < firstWeekday; i += 1) {
      currentWeek[i] = null
    }

    ramadanDays.forEach((date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const iso = `${year}-${month}-${day}`
      const weekday = date.getDay()
      const entry = dayMap.get(iso) || { completion: 0, index: null, date: iso }
      const cell = { date, entry }

      if (weekday === 0 && date !== ramadanDays[0]) {
        weeks.push(currentWeek)
        currentWeek = new Array(7).fill(null)
      }

      currentWeek[weekday] = cell
    })

    weeks.push(currentWeek)
    return weeks
  }, [start, dayMap])

  async function handleToggleFasted(isoDate) {
    if (!user) return
    const existing = dayMap.get(isoDate)
    const currentFasted = existing?.fasted ?? false
    const nextFasted = !currentFasted
    try {
      await setFastedForDate(user.id, isoDate, nextFasted)
      setDays((prev) =>
        prev.map((day) =>
          day.date.slice(0, 10) === isoDate ? { ...day, fasted: nextFasted } : day,
        ),
      )
    } catch (err) {
      setError(err)
    }
  }

  useEffect(() => {
    if (start) return undefined

    let isMounted = true

    fetchCurrentRamadanStartDate()
      .then((date) => {
        if (!isMounted) return
        setStart(date)
      })
      .catch(() => {
        if (!isMounted) return
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setStart(today)
      })

    return () => {
      isMounted = false
    }
  }, [start])

  useEffect(() => {
    let isMounted = true
    if (!user || !start) {
      Promise.resolve().then(() => {
        if (!isMounted) return
        setLoading(false)
      })
      return () => {
        isMounted = false
      }
    }
    fetchCalendar(user.id, start)
      .then((result) => {
        if (!isMounted) return
        setDays(result)
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
  }, [user, start])

  function getIntensity(completion) {
    if (completion >= 90) return 'calendar-cell-full'
    if (completion >= 40) return 'calendar-cell-partial'
    if (completion > 0) return 'calendar-cell-light'
    return 'calendar-cell-empty'
  }

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1 className="calendar-title">Ramadan calendar</h1>
        <p className="calendar-subtitle">
          View each day of Ramadan in a familiar month-style calendar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>30-day overview</CardTitle>
          <CardDescription>
            Cell intensity reflects completion. Darker cells represent fuller days of worship.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!start || loading ? (
            <div className="calendar-loading">
              <div className="calendar-spinner" />
            </div>
          ) : (
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                  <div key={label} className="calendar-weekday">
                    {label}
                  </div>
                ))}
              </div>
              <div className="calendar-weeks">
                {calendarWeeks.map((week, index) => (
                  <div key={String(index)} className="calendar-week">
                    {week.map((cell, dayIndex) => {
                      if (!cell) {
                        return (
                          <div
                            key={`empty-${index}-${dayIndex}`}
                            className="calendar-cell calendar-cell-outside"
                          />
                        )
                      }
                      const { date, entry } = cell
                      const completion = entry.completion ?? 0
                      const className = `calendar-cell ${getIntensity(completion)}${
                        entry.fasted ? ' calendar-cell-fasted' : ''
                      }`
                      const gregorian = date.getDate()
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
                      const ramadanIndex = entry.index ?? null
                      return (
                        <div
                          key={entry.date}
                          className={className}
                          onClick={() => handleToggleFasted(entry.date)}
                        >
                          <div className="flex items-center justify-between w-full">
                      <span className="calendar-cell-date">{monthName} {gregorian}</span>
                    </div>
                          {ramadanIndex ? (
                            <span className="calendar-cell-ramadan">Day {ramadanIndex}</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {error ? (
            <p className="calendar-error">
              Unable to load calendar. Tracker data remains safe in Supabase.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
