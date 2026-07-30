import { useEffect, useState } from 'react'
import { Microscope } from 'lucide-react'
import { getStats } from '../api/client'
import { PageHeader, Skeleton, EmptyState } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { clsx } from 'clsx'

const TABS = ['Pain Points', 'Positive Signals', 'Recommended Actions', 'Persona × Budget']
const INTEREST_COLORS = {
  'Highly Interested': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  'Interested':        { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400' },
  'Neutral':           { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400' },
  'Low Interest':      { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400' },
  'Not Interested':    { bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-slate-300 mb-1 text-xs max-w-[200px]">{label}</p>
      <p className="text-gold-400 font-mono">{payload[0]?.value}</p>
    </div>
  )
}

export default function DeepInsights() {
  const [tab, setTab] = useState(0)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(d => setResults(d.results || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-20 w-80" />
      <div className="flex gap-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-36" />)}</div>
      <Skeleton className="h-96" />
    </div>
  )

  if (!results.length) return (
    <div className="p-8">
      <PageHeader icon={<Microscope size={22} />} title="Deep Insights" subtitle="AI-extracted patterns from all conversations" />
      <EmptyState icon="🔬" title="No analysed conversations yet" body="Run Batch Analysis first to populate insights." />
    </div>
  )

  // Aggregate data
  const allPains   = results.flatMap(r => r.pain_points || [])
  const allPos     = results.flatMap(r => r.positive_signals || [])

  const countOf = (arr) => {
    const m = {}
    arr.forEach(v => { m[v] = (m[v] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 14)
      .map(([name, value]) => ({ name, value }))
  }
  const painData = countOf(allPains)
  const posData  = countOf(allPos)

  // Persona × Budget heatmap
  const personas = [...new Set(results.map(r => r.customer_persona))].filter(Boolean)
  const budgets  = ['Below 50L', '50L - 1Cr', '1Cr - 2Cr', 'Above 2Cr']
  const heatmap  = {}
  results.forEach(r => {
    const key = `${r.customer_persona}||${r.budget_range}`
    heatmap[key] = (heatmap[key] || 0) + 1
  })
  const maxHeat = Math.max(...Object.values(heatmap), 1)

  // Actions by interest
  const INTEREST_ORDER = ['Highly Interested', 'Interested', 'Neutral', 'Low Interest', 'Not Interested']
  const actionsByLevel = {}
  results.forEach(r => {
    if (!actionsByLevel[r.interest_level]) actionsByLevel[r.interest_level] = []
    actionsByLevel[r.interest_level].push(r.recommended_action)
  })

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<Microscope size={22} />}
        title="Deep Insights"
        subtitle="AI-extracted patterns — pain points, positive signals, actions, personas"
      />

      {/* Tab bar */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={clsx(
              'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              tab === i ? 'bg-gold-500/20 text-gold-400 border border-gold-500/20' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Pain Points */}
      {tab === 0 && (
        <div className="card space-y-4 animate-fade-up">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Most Common Customer Pain Points — AI Extracted</p>
          {painData.length ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={painData} layout="vertical" margin={{ left: 12, right: 24 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#ef4444" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm py-8 text-center">No pain points extracted yet.</p>}
        </div>
      )}

      {/* Positive Signals */}
      {tab === 1 && (
        <div className="card space-y-4 animate-fade-up">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Most Common Positive Signals — AI Extracted</p>
          {posData.length ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={posData} layout="vertical" margin={{ left: 12, right: 24 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#10b981" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm py-8 text-center">No signals extracted yet.</p>}
        </div>
      )}

      {/* Recommended Actions */}
      {tab === 2 && (
        <div className="space-y-3 animate-fade-up">
          {INTEREST_ORDER.map(level => {
            const actions = actionsByLevel[level]
            if (!actions?.length) return null
            const c = INTEREST_COLORS[level] || { bg: 'bg-white/5', border: 'border-white/10', text: 'text-slate-400' }
            return (
              <div key={level} className={clsx('card border-l-4', c.bg, c.border)}>
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx('text-sm font-medium', c.text)}>{level}</span>
                  <span className="text-xs text-slate-500 font-mono">{actions.length} customers</span>
                </div>
                <p className="text-slate-400 text-sm italic">{actions[0]}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Persona × Budget heatmap */}
      {tab === 3 && (
        <div className="card space-y-4 animate-fade-up overflow-x-auto">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Persona × Budget Distribution</p>
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-slate-500 font-mono">Persona \ Budget</th>
                {budgets.map(b => (
                  <th key={b} className="px-3 py-2 text-slate-400 font-mono whitespace-nowrap">{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personas.map(persona => (
                <tr key={persona} className="border-t border-white/5">
                  <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap font-medium">{persona}</td>
                  {budgets.map(budget => {
                    const count = heatmap[`${persona}||${budget}`] || 0
                    const intensity = count / maxHeat
                    return (
                      <td key={budget} className="px-3 py-2.5 text-center">
                        <div
                          className="mx-auto w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-medium transition-all"
                          style={{
                            backgroundColor: count > 0 ? `rgba(245,158,11,${intensity * 0.8 + 0.05})` : 'rgba(255,255,255,0.03)',
                            color: count > 0 ? (intensity > 0.5 ? '#fff' : '#f59e0b') : '#374151',
                          }}
                        >
                          {count || '—'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
