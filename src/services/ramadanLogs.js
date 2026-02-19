import { supabase } from '../lib/supabase'

function toDateString(date) {
  if (typeof date === 'string') return date
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getQuranTotalPages() {
  const fromEnv = Number(import.meta.env.VITE_QURAN_TOTAL_PAGES)
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv
  return 604
}

function completionFromLog(log) {
  if (!log) return 0
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  let completed = prayers.reduce((acc, key) => acc + (log[key] ? 1 : 0), 0)
  if (log.taraweeh) completed += 1
  if (log.sadaqah) completed += 1

  const quranTarget = getQuranTotalPages() / 30
  const quranScore = Math.min((log.quran_pages || 0) / quranTarget, 1)

  const slots = 7 + 1
  const score = (completed + quranScore) / slots
  return Math.round(score * 100)
}

export async function fetchLogForDate(userId, date) {
  const day = toDateString(date)

  const { data, error } = await supabase
    .from('ramadan_logs')
    .select('id,user_id,date,fajr,dhuhr,asr,maghrib,isha,taraweeh,quran_pages,dhikr_count,sadaqah,sadaqah_amount,reflection,fasted')
    .eq('user_id', userId)
    .eq('date', day)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('fetchLogForDate error:', error)
  }

  const base = {
    user_id: userId,
    date: day,
    fajr: data?.fajr ?? false,
    dhuhr: data?.dhuhr ?? false,
    asr: data?.asr ?? false,
    maghrib: data?.maghrib ?? false,
    isha: data?.isha ?? false,
    taraweeh: data?.taraweeh ?? false,
    quran_pages: data?.quran_pages ?? 0,
    dhikr_count: data?.dhikr_count ?? 0,
    sadaqah: data?.sadaqah ?? false,
    sadaqah_amount: data?.sadaqah_amount ?? null,
    reflection: data?.reflection ?? '',
    fasted: data?.fasted ?? false,
  }

  // Only include id if it exists in the database
  if (data?.id) {
    base.id = data.id
  }

  return {
    ...base,
    completion: completionFromLog(base),
  }
}

export async function upsertLog(userId, payload) {
  const safePayload = payload || {}
  const { completion: _COMPLETION, created_at: _CREATED_AT, updated_at: _UPDATED_AT, ...rest } = safePayload
  const record = {
    ...rest,
    user_id: userId,
    date: toDateString(safePayload.date),
  }

  // Remove id if it's null to let the database handle it
  if (record.id === null) {
    delete record.id
  }

  console.log('Attempting to upsert record:', record)

  // Only select columns that exist in the database (exclude completion)
  const { data, error } = await supabase
    .from('ramadan_logs')
    .upsert(record, {
      onConflict: 'user_id,date',
    })
    .select('id,user_id,date,fajr,dhuhr,asr,maghrib,isha,taraweeh,quran_pages,dhikr_count,sadaqah,sadaqah_amount,reflection,fasted')
    .single()

  if (error) {
    console.error('Upsert error details:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    throw error
  }

  console.log('Upsert successful, returned data:', data)

  return {
    ...data,
    completion: completionFromLog(data),
  }
}

export async function fetchRamadanSummary(userId, ramadanStartDate) {
  const start = new Date(ramadanStartDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 29)

  const from = toDateString(start)
  const to = toDateString(end)

  const { data, error } = await supabase
    .from('ramadan_logs')
    .select('id,user_id,date,fajr,dhuhr,asr,maghrib,isha,taraweeh,quran_pages,dhikr_count,sadaqah,sadaqah_amount,reflection,fasted')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)

  if (error) {
    console.error('fetchRamadanSummary error:', error)
  }

  const rows = data || []

  const todayStr = toDateString(new Date())
  const todayLog = rows.find((row) => row.date === todayStr)
  const todayCompletion = completionFromLog(todayLog)

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  let totalSalah = 0
  let totalQuranPages = 0
  let fastingDays = 0

  rows.forEach((row) => {
    prayers.forEach((key) => {
      if (row[key]) totalSalah += 1
    })
    totalQuranPages += row.quran_pages || 0
    if (row.fasted) fastingDays += 1
  })

  const quranTotal = getQuranTotalPages()
  const quranProgress = Math.min((totalQuranPages / quranTotal) * 100, 100)

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))

  let currentStreak = 0
  let bestStreak = 0
  let lastDate = null

  sorted.forEach((row) => {
    const completed =
      prayers.every((key) => row[key]) && (row.quran_pages || 0) > 0 && row.taraweeh

    if (!completed) {
      currentStreak = 0
      lastDate = null
      return
    }

    if (!lastDate) {
      currentStreak = 1
      lastDate = row.date
      bestStreak = Math.max(bestStreak, currentStreak)
      return
    }

    const prev = new Date(lastDate)
    const curr = new Date(row.date)
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      currentStreak += 1
    } else {
      currentStreak = 1
    }
    lastDate = row.date
    bestStreak = Math.max(bestStreak, currentStreak)
  })

  const last7 = new Date()
  last7.setDate(new Date().getDate() - 6)

  const days = []
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = toDateString(d)
    const row = rows.find((r) => r.date === dateStr)
    let salahCount = 0
    prayers.forEach((key) => {
      if (row && row[key]) salahCount += 1
    })
    days.push({
      index: i + 1,
      date: dateStr,
      completion: completionFromLog(row),
      salahCount,
      fasted: !!row?.fasted,
    })
  }

  const weekly = []

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(last7)
    d.setDate(last7.getDate() + i)
    const dateStr = toDateString(d)
    const row = rows.find((r) => r.date === dateStr)
    weekly.push({
      date: dateStr,
      completion: completionFromLog(row),
    })
  }

  return {
    todayCompletion,
    totalSalah,
    quranProgress,
    currentStreak,
    bestStreak,
    fastingDays,
    dayStats: days,
    weekly,
  }
}

export async function fetchCalendar(userId, ramadanStartDate) {
  const start = new Date(ramadanStartDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 29)

  const from = toDateString(start)
  const to = toDateString(end)

  const { data, error } = await supabase
    .from('ramadan_logs')
    .select('id,user_id,date,fajr,dhuhr,asr,maghrib,isha,taraweeh,quran_pages,dhikr_count,sadaqah,sadaqah_amount,reflection,fasted')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)

  if (error) {
    console.error('fetchCalendar error:', error)
  }

  const byDate = new Map()
  data?.forEach((row) => {
    byDate.set(row.date, {
      completion: completionFromLog(row),
      fasted: !!row.fasted,
    })
  })

  const days = []
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = toDateString(d)
    const entry = byDate.get(dateStr)
    const completion = entry?.completion ?? 0
    const fasted = entry?.fasted ?? false
    days.push({
      index: i + 1,
      date: dateStr,
      completion,
      fasted,
    })
  }

  return days
}

export async function setFastedForDate(userId, date, fasted) {
  const existing = await fetchLogForDate(userId, date)
  const { completion: _COMPLETION, ...rest } = existing
  const payload = {
    ...rest,
    fasted,
  }
  return upsertLog(userId, payload)
}
