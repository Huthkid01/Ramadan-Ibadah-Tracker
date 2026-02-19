import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useThemeStore } from '../../store/useThemeStore'

const ticks = [0, 25, 50, 75, 100]

function formatLabel(dateStr) {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function WeeklySalahChart({ data, loading }) {
  const { mode } = useThemeStore()
  const isDark = mode === 'dark'
  
  // Use Deep Emerald (#14532D) for light mode, and lighter Emerald (#34D399) for dark mode
  const strokeColor = isDark ? '#34D399' : '#14532D'
  const stopColor = isDark ? '#34D399' : '#14532D'

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500">No data yet. Log today&apos;s worship to begin.</p>
  }

  return (
    <div className="h-64 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stopColor} stopOpacity={0.85} />
              <stop offset="95%" stopColor={stopColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            style={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
          />
          <YAxis
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            style={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
            width={32}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Completion']}
            labelFormatter={(label) => `Day ${formatLabel(label)}`}
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: 12,
              border: isDark ? '1px solid #334155' : '1px solid rgba(148,163,184,0.4)',
              boxShadow: '0 18px 45px rgba(15,23,42,0.25)',
              color: isDark ? '#e2e8f0' : '#0f172a',
            }}
            itemStyle={{ color: strokeColor }}
          />
          <Area
            type="monotone"
            dataKey="completion"
            stroke={strokeColor}
            fill="url(#weeklyFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
