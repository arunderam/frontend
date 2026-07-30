import { useEffect, useState } from 'react'
import { Users, BarChart2, Zap } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { getSalespeople } from '../api/client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'

export default function Salespeople() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [showMonthly, setShowMonthly] = useState(true)
  const [showYearly, setShowYearly] = useState(true)

  useEffect(() => {
    setLoading(true); setError('')
    getSalespeople().then((res) => {
      setData(res.salespeople || [])
    }).catch((e) => setError(e.message || 'Failed to load')).finally(() => setLoading(false))
  }, [])

  // helper to build recharts-friendly data from monthly/yearly arrays
  const buildMonthlyData = (monthly = []) => (
    monthly.map(m => ({ name: `${m.year}-${String(m.month).padStart(2,'0')}`, value: +(m.estimated_conversion_rate||0) }))
  )
  const buildYearlyData = (yearly = []) => (
    yearly.map(y => ({ name: String(y.year), value: +(y.estimated_conversion_rate||0) }))
  )

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<Users size={22} />}
        title="Salespeople"
        subtitle="Performance metrics and suggestions for each salesperson"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setShowMonthly(s => !s)}
          className="ghost-btn text-sm"
        >{showMonthly ? 'Hide Monthly' : 'Analyze Monthly'}</button>
        <button
          onClick={() => setShowYearly(s => !s)}
          className="ghost-btn text-sm"
        >{showYearly ? 'Hide Yearly' : 'Analyze Yearly'}</button>
      </div>

      {loading ? (
        <div className="card py-12 text-center">Loading salesperson metrics…</div>
      ) : error ? (
        <div className="card bg-red-500/10 border border-red-500/20 text-red-400 p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {data.length === 0 && (
            <div className="card col-span-3 text-center py-12">No analysed data available. Run Batch Analysis first.</div>
          )}
          {data.map((s) => (
            <div key={s.salesman} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.salesman}</p>
                  <p className="text-xs text-slate-500">{s.analysed_conversations}/{s.total_conversations} analysed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">Conv: <strong>{Math.round((s.estimated_conversion_rate||0)*100)}%</strong></p>
                  <p className="text-xs text-slate-500">Interest: {(s.avg_interest_score||0).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-slate-400">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Avg Sentiment</p>
                  <p className="text-lg font-display">{s.avg_sentiment_score}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Top Pain Points</p>
                  <ul className="text-xs list-disc pl-4">
                    {s.top_pain_points.slice(0,3).map((p,i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-mono">Suggestions</p>
                {Array.isArray(s.suggested_improvements) && s.suggested_improvements.length ? (
                  <div className="space-y-2 text-xs">
                    {s.suggested_improvements.map((item, i) => (
                      <div key={i} className="border border-white/6 rounded-md p-2 bg-navy-900">
                        <div className="font-medium">{item.suggestion}</div>
                        {item.evidence && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            {Object.entries(item.evidence).map(([k,v]) => (
                              <div key={k}><strong className="font-mono">{k}:</strong> {Array.isArray(v) ? v.slice(0,5).join(', ') : String(v)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">None</div>
                )}
              </div>

              {/* Trends: monthly sparkline + yearly bars */}
              <div className="space-y-2">
                {showMonthly && s.monthly && s.monthly.length > 0 && (
                  <div style={{ width: '100%', height: 80 }}>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Monthly Conversion Trend</p>
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={buildMonthlyData(s.monthly)}>
                        <XAxis dataKey="name" hide />
                        <YAxis domain={[0, 1]} hide />
                        <Tooltip formatter={(v) => `${(v*100).toFixed(1)}%`} />
                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {showYearly && s.yearly && s.yearly.length > 0 && (
                  <div style={{ width: '100%', height: 100 }}>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Yearly Conversion</p>
                    <ResponsiveContainer width="100%" height={80}>
                      <BarChart data={buildYearlyData(s.yearly)}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v*100)}%`} />
                        <Tooltip formatter={(v) => `${(v*100).toFixed(1)}%`} />
                        <Bar dataKey="value" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BarChart2 size={14} />
                <Zap size={14} />
                <span>Data driven suggestions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
