export function QuranProgressBar({ progress }) {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(progress, 100)) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">Overall progress</span>
        <span className="font-medium text-primary">{safe.toFixed(0)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
          style={{ width: `${safe}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Based on the Qur&apos;an pages you have logged this Ramadan.
      </p>
    </div>
  )
}

