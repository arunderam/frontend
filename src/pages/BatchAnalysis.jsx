import { useState, useEffect, useRef } from 'react'
import { ClipboardList, Play, Download } from 'lucide-react'
import { getStats, createBatchStream } from '../api/client'
import { PageHeader, InterestBadge, Skeleton } from '../components/ui'

const INTEREST_COLORS = {
  'Highly Interested': 'text-emerald-400',
  'Interested':        'text-blue-400',
  'Neutral':           'text-amber-400',
  'Low Interest':      'text-orange-400',
  'Not Interested':    'text-red-400',
}

export default function BatchAnalysis() {
  
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [batchSize, setBatch] = useState(10)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ idx: 0, total: 0 })
  const [liveLog, setLiveLog] = useState([])
  const [error, setError]     = useState('')
  const logRef = useRef(null)

  const fetchStats = () => {
    setLoading(true)
    getStats().then(setStats).finally(() => setLoading(false))
  }
  useEffect(() => { fetchStats() }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [liveLog])

  const handleBatch = async () => {
    setRunning(true); setError(''); setLiveLog([]); setProgress({ idx: 0, total: 0 })
    try {
      const response = await createBatchStream(batchSize)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.done) {
              fetchStats()
            } else {
              setProgress({ idx: payload.idx, total: payload.total })
              setLiveLog(prev => [...prev, payload])
            }
          } catch {}
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const downloadCSV = () => {
    if (!stats?.results?.length) return
    const rows = stats.results.map(r => ([
      r.conv_id, r.customer, r.salesman, r.property,
      r.budget_range, r.preferred_area, r.interest_level,
      r.sentiment_score, r.sales_stage, r.conversion_likelihood,
      r.customer_persona, r.urgency,
    ].join(',')))
    const csv = [
      'Conv ID,Customer,Salesman,Property,Budget,Area,Interest,Sentiment,Stage,Likelihood,Persona,Urgency',
      ...rows
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'genai_analysis_results.csv'
    a.click()
  }

  const total    = stats?.total || 0
  const analysed = stats?.analysed || 0
  const remain   = total - analysed
  const pct      = total > 0 ? (analysed / total) * 100 : 0

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<ClipboardList size={22} />}
        title="Batch Analysis"
        subtitle="Analyse all conversations in bulk — results cached automatically"
      />

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Conversations', value: total, color: 'text-slate-100' },
            { label: '✅ Analysed',          value: analysed, color: 'text-emerald-400' },
            { label: '⏳ Remaining',         value: remain, color: remain > 0 ? 'text-amber-400' : 'text-slate-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-2">{label}</p>
              <p className={`text-4xl font-display ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="card space-y-3">
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>Analysis Progress</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="card space-y-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Batch Settings</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Conversations to analyse now</span>
              <span className="text-gold-400 font-mono font-medium">{batchSize}</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.min(remain || 1, 50)}
              value={batchSize}
              onChange={e => setBatch(Number(e.target.value))}
              disabled={remain === 0 || running}
              className="w-full accent-gold-500 cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-xs text-slate-600 font-mono">
              <span>1</span><span>{Math.min(remain || 50, 50)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="flex gap-3">
          {remain === 0 ? (
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 text-center">
              ✅ All conversations have been analysed!
            </div>
          ) : (
            <button
              onClick={handleBatch}
              disabled={running}
              className="gold-btn flex-1 flex items-center justify-center gap-2"
            >
              {running ? (
                <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Analysing {progress.idx}/{progress.total}…</>
              ) : (
                <><Play size={15} /> Analyse next {batchSize} conversations</>
              )}
            </button>
          )}
          {analysed > 0 && (
            <button onClick={downloadCSV} className="ghost-btn flex items-center gap-2">
              <Download size={14} /> CSV
            </button>
          )}
        </div>
      </div>

      {/* Live log */}
      {(running || liveLog.length > 0) && (
        <div className="card space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Live Progress</p>
          <div ref={logRef} className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
            {liveLog.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400 animate-fade-in">
                <span className="text-slate-600">{String(item.idx).padStart(3, '0')}</span>
                <span className="text-slate-300 w-28 truncate">{item.conv_id}</span>
                <span className={INTEREST_COLORS[item.interest_level] || 'text-slate-400'}>
                  {item.interest_level}
                </span>
                <span className="text-slate-500">{item.sentiment_score?.toFixed(2)}</span>
                <span className="text-slate-600 truncate">{item.budget_range}</span>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-2 text-gold-500 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gold-500" />
                Processing…
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results table */}
      {stats?.results?.length > 0 && (
        <div className="card space-y-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Analysis Results — {stats.results.length} records</p>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  {['Conv ID', 'Customer', 'Budget', 'Area', 'Interest', 'Sentiment', 'Stage', 'Persona', 'Urgency'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-slate-500 font-mono uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.results.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-500">{r.conv_id}</td>
                    <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{r.customer}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.budget_range}</td>
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{r.preferred_area}</td>
                    <td className="px-4 py-2.5"><InterestBadge level={r.interest_level} /></td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">{r.sentiment_score?.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{r.sales_stage}</td>
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{r.customer_persona}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.urgency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
