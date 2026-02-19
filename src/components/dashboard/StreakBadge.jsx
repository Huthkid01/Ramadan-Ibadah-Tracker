export function StreakBadge({ streak }) {
  if (!streak || streak <= 0) {
    return (
      <div className="inline-flex items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        Start your streak today
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-100/50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200/50 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-700/30">
      <span className="text-sm text-amber-500">🔥</span>
      <span>
        <span className="font-bold">{streak} day</span> streak
      </span>
    </div>
  )
}

