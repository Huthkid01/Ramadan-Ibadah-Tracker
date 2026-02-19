import { useEffect, useState } from 'react'
import { fetchDailyAyah, fetchDailyHadith } from '../../services/ayahHadith'

export function DailyAyahHadith() {
  const [ayah, setAyah] = useState(null)
  const [hadith, setHadith] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const [a, h] = await Promise.allSettled([fetchDailyAyah(), fetchDailyHadith()])
        if (!isMounted) return
        if (a.status === 'fulfilled') setAyah(a.value)
        if (h.status === 'fulfilled') setHadith(h.value)
        if (a.status === 'rejected' && h.status === 'rejected') {
          setError(new Error('Unable to load daily ayah and hadith'))
        }
      } catch (err) {
        if (!isMounted) return
        setError(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-slate-500">Unable to load today&apos;s reminders.</p>
  }

  return (
    <div className="space-y-4 text-sm">
      {ayah ? (
        <div className="rounded-xl bg-primary/5 p-3">
          <p className="text-slate-900 dark:text-slate-100">{ayah.text}</p>
          {ayah.translation ? (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">
              {ayah.translation}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{ayah.reference}</p>
        </div>
      ) : null}
      {hadith ? (
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40">
          <p className="text-slate-900 dark:text-slate-100">{hadith.text}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hadith.reference}</p>
        </div>
      ) : null}
    </div>
  )
}
