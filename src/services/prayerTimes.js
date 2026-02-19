const ALADHAN_BASE =
  import.meta.env.VITE_ALADHAN_API_URL ||
  'https://api.aladhan.com/v1'

export async function fetchPrayerTimesByCoords({ latitude, longitude, date = new Date() }) {
  const day = date.toISOString().slice(0, 10)
  const url = new URL(`${ALADHAN_BASE}/timings/${day}`)
  url.searchParams.set('latitude', latitude)
  url.searchParams.set('longitude', longitude)
  url.searchParams.set('method', '2')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error('Failed to load prayer times')
  }
  const json = await res.json()
  if (!json || !json.data) {
    throw new Error('Unexpected prayer times response')
  }

  const { timings } = json.data

  return {
    fajr: timings.Fajr,
    dhuhr: timings.Dhuhr,
    asr: timings.Asr,
    maghrib: timings.Maghrib,
    isha: timings.Isha,
  }
}

export function getNextPrayer(timings) {
  if (!timings) return null
  const now = new Date()
  const entries = [
    ['Fajr', timings.fajr],
    ['Dhuhr', timings.dhuhr],
    ['Asr', timings.asr],
    ['Maghrib', timings.maghrib],
    ['Isha', timings.isha],
  ]

  let next = null

  entries.forEach(([name, time]) => {
    const [hours, minutes] = time.split(':').map((n) => parseInt(n, 10))
    const dt = new Date(now)
    dt.setHours(hours, minutes, 0, 0)
    if (dt <= now) return
    if (!next || dt < next.at) {
      next = { name, at: dt }
    }
  })

  return next
}

