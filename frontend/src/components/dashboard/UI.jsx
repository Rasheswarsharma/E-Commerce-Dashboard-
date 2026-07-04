import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { fmt, cx } from '../../utils/helpers'
import { Sparkline } from '../charts/Charts'

// Helper component for animated number counter
function AnimatedNumber({ value, format }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplay(value)
      return
    }
    const start = 0
    const end = value
    if (start === end) {
      setDisplay(end)
      return
    }

    const duration = 800 // ms
    const startTime = performance.now()
    let animationFrameId

    const updateNumber = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = progress * (2 - progress) // easeOutQuad
      const current = Math.floor(start + (end - start) * easeProgress)
      setDisplay(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber)
      } else {
        setDisplay(end)
      }
    }

    animationFrameId = requestAnimationFrame(updateNumber)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value])

  if (typeof value !== 'number') return value
  if (format === 'currency')  return fmt.currency(display, true)
  if (format === 'number')    return fmt.number(display, true)
  if (format === 'percent')   return fmt.percent(display)
  return display
}

// ── KPI Card ──────────────────────────────────────────────────
export function KPICard({ title, value, format = 'currency', growth, icon: Icon, color = 'blue', loading, sparkData }) {
  const colors = {
    blue:   { bg: 'bg-teal-50 dark:bg-teal-950/20',   icon: 'text-teal-700 dark:text-teal-400' },
    green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400' },
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',     icon: 'text-red-600 dark:text-red-400' },
    cyan:   { bg: 'bg-cyan-50 dark:bg-cyan-900/20',   icon: 'text-cyan-600 dark:text-cyan-400' },
  }
  const c = colors[color] || colors.blue

  const displayValue = () => {
    if (loading) return null
    if (typeof value === 'number') {
      return <AnimatedNumber value={value} format={format} />
    }
    if (format === 'currency')  return fmt.currency(value, true)
    if (format === 'number')    return fmt.number(value, true)
    if (format === 'percent')   return fmt.percent(value)
    return value
  }

  const g = growth != null ? fmt.growth(growth) : null

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
        {Icon && (
          <div className={cx('p-2 rounded-lg', c.bg)}>
            <Icon className={cx('w-4 h-4', c.icon)} />
          </div>
        )}
      </div>

      {loading
        ? <div className="skeleton h-8 w-32 mt-1" />
        : (
          <div className="flex items-center gap-3 mt-1">
            <div className="kpi-value">{displayValue()}</div>
            {sparkData && (
              <Sparkline
                data={sparkData}
                color={
                  {
                    blue: '#0d9488', green: '#10b981', amber: '#f59e0b', purple: '#8b5cf6', red: '#ef4444', cyan: '#06b6d4'
                  }[color] || '#0d9488'
                }
              />
            )}
          </div>
        )
      }

      {g && !loading && (
        <div className={cx('flex items-center gap-1 text-xs font-medium', g.positive ? 'text-emerald-600' : 'text-red-500')}>
          {g.positive
            ? <TrendingUp  className="w-3 h-3" />
            : <TrendingDown className="w-3 h-3" />}
          <span>{g.label} vs last period</span>
        </div>
      )}
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────
export function CardSkeleton({ rows = 1 }) {
  return (
    <div className="card p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-5 w-full" style={{ width: `${60 + (i % 3) * 15}%` }} />
      ))}
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <div className="card p-8 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-xs px-3 py-1.5">
          Retry
        </button>
      )}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ title = 'No data', subtitle, icon: Icon }) {
  return (
    <div className="card p-10 flex flex-col items-center gap-3 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

// ── Chart container ───────────────────────────────────────────
export function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <div className={cx('card p-5', className)}>
      <SectionHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </div>
  )
}

// ── Filter bar ────────────────────────────────────────────────
export function FilterBar({ filters, update, filterOptions, showPeriod = false }) {
  const periods = [
    { value: 'daily',   label: 'Daily' },
    { value: 'weekly',  label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly',  label: 'Yearly' },
  ]

  return (
    <div className="card p-4 mb-5">
      <div className="flex flex-wrap gap-3">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={e => update('start_date', e.target.value)}
            className="input w-auto text-xs"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={e => update('end_date', e.target.value)}
            className="input w-auto text-xs"
          />
        </div>

        {/* Category */}
        {filterOptions?.categories?.length > 0 && (
          <select
            value={filters.category || ''}
            onChange={e => update('category', e.target.value)}
            className="input w-auto text-xs"
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Region */}
        {filterOptions?.regions?.length > 0 && (
          <select
            value={filters.region || ''}
            onChange={e => update('region', e.target.value)}
            className="input w-auto text-xs"
          >
            <option value="">All Regions</option>
            {filterOptions.regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        {/* Period */}
        {showPeriod && (
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
            {periods.map(p => (
              <button
                key={p.value}
                onClick={() => update('period', p.value)}
                className={cx(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  filters.period === p.value
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Data table ────────────────────────────────────────────────
export function DataTable({ columns, rows, loading, emptyMessage = 'No data' }) {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState(null)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </div>
    )
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 1. Search filter
  const filtered = (rows || []).filter(row => {
    if (!search) return true
    return Object.keys(row).some(k => {
      const val = row[k]
      if (val === null || val === undefined) return false
      return String(val).toLowerCase().includes(search.toLowerCase())
    })
  })

  // 2. Sorting
  const sorted = [...filtered]
  if (sortConfig !== null) {
    sorted.sort((a, b) => {
      let valA = a[sortConfig.key]
      let valB = b[sortConfig.key]

      if (typeof valA === 'string' && valA.startsWith('₹')) {
        valA = Number(valA.replace(/[₹,]/g, ''))
      }
      if (typeof valB === 'string' && valB.startsWith('₹')) {
        valB = Number(valB.replace(/[₹,]/g, ''))
      }

      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        valA = Number(valA)
        valB = Number(valB)
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      {rows && rows.length > 0 && (
        <div className="flex justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search table..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-700 dark:text-slate-200 placeholder-slate-400 transition"
            />
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                {columns.map(col => {
                  const isSorted = sortConfig && sortConfig.key === col.key
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={cx(
                        'pb-2.5 pt-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none',
                        col.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      <div className={cx('flex items-center gap-1.5', col.align === 'right' ? 'justify-end' : 'justify-start')}>
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-teal-600" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-20 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cx(
                        'py-3 px-3 text-slate-700 dark:text-slate-300 font-medium',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────
export function SegmentBadge({ segment }) {
  const map = {
    VIP:       'badge-blue',
    Returning: 'badge-green',
    New:       'badge-amber',
    'At-Risk': 'badge-red',
  }
  return <span className={map[segment] || 'badge-amber'}>{segment}</span>
}
