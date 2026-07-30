import { clsx } from 'clsx'

export function PageHeader({ icon, title, subtitle }) {
  return (
    <div className="relative mb-8 px-8 pt-8">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-700/20 to-transparent rounded-3xl pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-100">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export function MetricCard({ label, value, sub, accent = false, delay = 0 }) {
  return (
    <div
      className={clsx(
        'card animate-fade-up flex flex-col gap-1',
        accent && 'border-gold-500/30 bg-gradient-to-br from-gold-500/5 to-transparent'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{label}</p>
      <p className={clsx('text-3xl font-display font-semibold mt-1', accent ? 'text-gold-400' : 'text-slate-100')}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

const INTEREST_STYLES = {
  'Highly Interested': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Interested':        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Neutral':           'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Low Interest':      'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Not Interested':    'bg-red-500/15 text-red-400 border-red-500/30',
}

export function InterestBadge({ level, size = 'md' }) {
  const style = INTEREST_STYLES[level] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  return (
    <span className={clsx(
      'inline-flex items-center border rounded-full font-medium',
      style,
      size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'
    )}>
      {level}
    </span>
  )
}

export function Chip({ label, variant = 'blue' }) {
  const variants = {
    blue:   'bg-blue-500/10 text-blue-300 border-blue-500/20',
    green:  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    red:    'bg-red-500/10 text-red-300 border-red-500/20',
    gold:   'bg-gold-500/10 text-gold-300 border-gold-500/20',
  }
  return (
    <span className={clsx('inline-flex items-center border rounded-full px-3 py-0.5 text-xs', variants[variant])}>
      {label}
    </span>
  )
}

export function SentimentBar({ score }) {
  const color = score >= 0.8 ? '#10b981' : score >= 0.6 ? '#3b82f6' : score >= 0.35 ? '#f59e0b' : '#ef4444'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Sentiment</span>
        <span style={{ color }} className="font-mono font-medium">{(score * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={clsx('shimmer rounded-xl', className)} />
}

export function EmptyState({ icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 text-3xl">
        {icon}
      </div>
      <div>
        <p className="text-slate-300 font-medium">{title}</p>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">{body}</p>
      </div>
    </div>
  )
}

export function AnalysisResultCard({ result }) {
  if (!result) return null
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Budget Range</p>
          <p className="text-2xl font-display text-gold-400">{result.budget_range}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{result.budget_reasoning}</p>
        </div>
        <div className="card space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Preferred Area</p>
          <p className="text-2xl font-display text-slate-100">{result.preferred_area}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{result.area_reasoning}</p>
        </div>
        <div className="card space-y-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Interest Level</p>
          <InterestBadge level={result.interest_level} size="lg" />
          <SentimentBar score={result.sentiment_score} />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sales Stage',    value: result.sales_stage },
          { label: 'Conversion',     value: result.conversion_likelihood },
          { label: 'Persona',        value: result.customer_persona },
          { label: 'Urgency',        value: result.urgency },
        ].map(({ label, value }) => (
          <div key={label} className="glass-sm p-4 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2">{label}</p>
            <p className="text-sm text-slate-200 font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Chips */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card space-y-3">
          <p className="text-xs text-slate-400 font-medium">🔍 Key Signals</p>
          <div className="flex flex-wrap gap-2">
            {result.key_signals?.length > 0
              ? result.key_signals.map(s => <Chip key={s} label={s} variant="blue" />)
              : <span className="text-xs text-slate-600">None detected</span>}
          </div>
        </div>
        <div className="card space-y-3">
          <p className="text-xs text-slate-400 font-medium">✅ Positive Signals</p>
          <div className="flex flex-wrap gap-2">
            {result.positive_signals?.length > 0
              ? result.positive_signals.map(s => <Chip key={s} label={s} variant="green" />)
              : <span className="text-xs text-slate-600">None detected</span>}
          </div>
        </div>
        <div className="card space-y-3">
          <p className="text-xs text-slate-400 font-medium">⚠️ Pain Points</p>
          <div className="flex flex-wrap gap-2">
            {result.pain_points?.length > 0
              ? result.pain_points.map(s => <Chip key={s} label={s} variant="red" />)
              : <span className="text-xs text-slate-600">None detected</span>}
          </div>
        </div>
      </div>

      {/* Action + Summary */}
      <div className="card border-l-4 border-gold-500 bg-gradient-to-r from-gold-500/5 to-transparent">
        <p className="text-xs text-gold-500 font-mono uppercase tracking-widest mb-2">🎯 Recommended Action</p>
        <p className="text-slate-200 text-sm leading-relaxed">{result.recommended_action}</p>
      </div>

      <div className="card bg-navy-700/40 italic">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">🧠 AI Summary</p>
        <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
      </div>
    </div>
  )
}
