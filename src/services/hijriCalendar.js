const ALADHAN_BASE =
  import.meta.env.VITE_ALADHAN_API_URL || 'https://api.aladhan.com/v1'

async function fetchHijriYearForToday() {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()

  const url = `${ALADHAN_BASE}/gToH/${dd}-${mm}-${yyyy}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to load Hijri date for today')
  }

  const json = await res.json()
  if (!json || !json.data || !json.data.hijri) {
    throw new Error('Unexpected Hijri response')
  }

  const year = parseInt(json.data.hijri.year, 10)
  if (!Number.isFinite(year)) {
    throw new Error('Invalid Hijri year')
  }

  return year
}

export async function fetchCurrentRamadanStartDate() {
  const hijriYear = await fetchHijriYearForToday()

  const url = `${ALADHAN_BASE}/hToG/01-09-${hijriYear}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to load Ramadan start date')
  }

  const json = await res.json()
  if (!json || !json.data || !json.data.gregorian) {
    throw new Error('Unexpected Ramadan start response')
  }

  const g = json.data.gregorian
  const day = parseInt(g.day, 10)
  const month = parseInt(g.month.number, 10)
  const year = parseInt(g.year, 10)

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    throw new Error('Invalid Gregorian Ramadan start date')
  }

  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

