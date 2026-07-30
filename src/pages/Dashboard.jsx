import { useEffect, useState } from 'react'
import { getStats } from '../api/client'
import { PageHeader, MetricCard, InterestBadge, SentimentBar, Skeleton } from '../components/ui'
import { LayoutDashboard, TrendingUp, Users, MapPin } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

const INTEREST_COLORS = {
  'Highly Interested': '#10b981',
  'Interested':        '#3b82f6',
  'Neutral':           '#f59e0b',
  'Low Interest':      '#f97316',
  'Not Interested':    '#ef4444',
}
const URGENCY_COLORS = {
  'Immediate':        '#ef4444',
  'Within 3 Months':  '#f97316',
  'Within 6 Months':  '#f59e0b',
  'No Urgency':       '#6b7280',
  'Unknown':          '#374151',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-slate-300 font-medium mb-1">{label || payload[0]?.name}</p>
      <p className="text-gold-400 font-mono">{payload[0]?.value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-20 w-80" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}
      </div>
    </div>
  )

  const results = stats?.results || []

  const interestCounts = {}
  const budgetCounts   = {}
  const personaCounts  = {}
  const urgencyCounts  = {}
  let totalSentiment = 0
  let hotLeads = 0

  results.forEach(r => {
    interestCounts[r.interest_level] = (interestCounts[r.interest_level] || 0) + 1
    budgetCounts[r.budget_range]     = (budgetCounts[r.budget_range] || 0) + 1
    personaCounts[r.customer_persona] = (personaCounts[r.customer_persona] || 0) + 1
    urgencyCounts[r.urgency]         = (urgencyCounts[r.urgency] || 0) + 1
    totalSentiment += r.sentiment_score || 0
    if (r.interest_level === 'Highly Interested') hotLeads++
  })

  const interestData = Object.entries(interestCounts).map(([name, value]) => ({ name, value }))
  const budgetData   = Object.entries(budgetCounts).map(([name, value]) => ({ name, value }))
  const personaData  = Object.entries(personaCounts).sort((a,b) => b[1]-a[1]).slice(0,7)
    .map(([name, value]) => ({ name, value }))
  const urgencyData  = Object.entries(urgencyCounts).map(([name, value]) => ({ name, value }))

  const avgSentiment = results.length ? (totalSentiment / results.length).toFixed(2) : '—'
  const topBudget    = budgetData.sort((a,b) => b.value - a.value)[0]?.name || '—'

  if (!results.length) return (
    <div className="p-8">
      <PageHeader icon={<LayoutDashboard size={22} />} title="Dashboard" subtitle="Conversation intelligence at a glance" />
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-4xl"></div>
        <p className="text-slate-300 text-lg font-display">No analysed conversations yet</p>
        <p className="text-slate-500 text-sm max-w-xs">Head to Batch Analysis to analyse conversations, or try a single one in the Analyse Conversation page.</p>
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        icon={<LayoutDashboard size={22} />}
        title="Dashboard"
        subtitle="Conversation intelligence powered by Gemini AI"
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Analysed Conversations" value={results.length} delay={0} />
        <MetricCard label=" Hot Leads" value={hotLeads} accent delay={100} />
        <MetricCard label="Avg Sentiment Score" value={avgSentiment} delay={200} />
        <MetricCard label="Top Budget Range" value={topBudget} delay={300} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Interest */}
        <div className="card space-y-4 animate-fade-up animate-delay-100">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Interest Level Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={interestData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {interestData.map((entry) => (
                  <Cell key={entry.name} fill={INTEREST_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget */}
        <div className="card space-y-4 animate-fade-up animate-delay-200">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Budget Range Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
              >
                {budgetData.map((_, i) => (
                  <Cell key={i} fill={['#f59e0b','#2563eb','#60a5fa','#1a1a2e'][i % 4]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Persona */}
        <div className="card space-y-4 animate-fade-up animate-delay-300">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Customer Persona Mix</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={personaData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Urgency */}
        <div className="card space-y-4 animate-fade-up animate-delay-400">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Urgency Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={urgencyData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
              >
                {urgencyData.map((entry) => (
                  <Cell key={entry.name} fill={URGENCY_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent hot leads */}
      <div className="card space-y-4 animate-fade-up">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono"> Hot Leads — Highly Interested</p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {results
            .filter(r => r.interest_level === 'Highly Interested')
            .slice(0, 10)
            .map((r, i) => (
              <div key={i} className="flex items-center justify-between glass-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold">
                    {(r.customer || 'U')[0]}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{r.customer || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{r.budget_range} · {r.preferred_area}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <SentimentBar score={r.sentiment_score} />
                  <p className="text-xs text-slate-500">{r.urgency}</p>
                </div>
              </div>
            ))}
          {results.filter(r => r.interest_level === 'Highly Interested').length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">No hot leads yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
