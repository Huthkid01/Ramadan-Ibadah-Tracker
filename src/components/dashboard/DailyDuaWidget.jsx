import { useMemo } from 'react'
import { dailyDuas } from '../../data/dailyDuas'

function getDuaForToday() {
  const today = new Date()
  // Use day of year to rotate through duas
  const start = new Date(today.getFullYear(), 0, 0)
  const diff = today - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  
  // Modulo ensures we cycle through the list repeatedly
  const index = dayOfYear % dailyDuas.length
  return dailyDuas[index]
}

export function DailyDuaWidget() {
  const dua = useMemo(() => getDuaForToday(), [])

  return (
    <div className="flex flex-col gap-4 h-full justify-center">
      <div className="text-center space-y-3">
        {dua.arabic && (
          <p className="font-arabic text-xl leading-relaxed text-emerald-800 dark:text-emerald-400" dir="rtl">
            {dua.arabic}
          </p>
        )}
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">
          &ldquo;{dua.transliteration}&rdquo;
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {dua.translation}
        </p>
      </div>
    </div>
  )
}
