import { useEffect, useState } from 'react'
import { fetchPrayerTimesByCoords, getNextPrayer } from '../../services/prayerTimes'

export function PrayerTimesWidget() {
  const [timings, setTimings] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    let isMounted = true

    function handleGeolocation(position) {
      const { latitude, longitude } = position.coords
      fetchPrayerTimesByCoords({ latitude, longitude })
        .then((result) => {
          if (!isMounted) return
          setTimings(result)
        })
        .catch((err) => {
          if (!isMounted) return
          setLocationError(err)
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
    }

    function handleGeolocationError() {
      if (!isMounted) return
      setLocationError(new Error('Location access denied'))
      setLoading(false)
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(handleGeolocation, handleGeolocationError)
    } else {
      Promise.resolve().then(() => {
        if (!isMounted) return
        setLocationError(new Error('Geolocation is not available'))
        setLoading(false)
      })
    }

    const interval = setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!timings) {
    return (
      <p className="text-sm text-slate-500">
        {locationError
          ? 'Unable to access location for prayer times.'
          : 'Prayer times are not available right now.'}
      </p>
    )
  }

  const next = getNextPrayer(timings)

  function renderCountdown() {
    if (!next) {
      return <p className="text-xs text-slate-500">All prayers for today have passed.</p>
    }
    const diffMs = next.at - now
    const totalMinutes = Math.max(0, Math.round(diffMs / 60000))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return (
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Next: <span className="font-semibold">{next.name}</span> in{' '}
        <span className="font-medium">
          {hours > 0 ? `${hours}h ` : ''}
          {minutes}m
        </span>
      </p>
    )
  }

  const items = [
    ['Fajr', timings.fajr],
    ['Dhuhr', timings.dhuhr],
    ['Asr', timings.asr],
    ['Maghrib', timings.maghrib],
    ['Isha', timings.isha],
  ]

  return (
    <div className="space-y-3 text-sm">
      {renderCountdown()}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, time]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-100"
          >
            <span>{label}</span>
            <span className="font-medium">{time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
