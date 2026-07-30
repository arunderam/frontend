import { useState, useEffect } from 'react'
import { MessageSquareText, Zap, ChevronDown } from 'lucide-react'
import { analyseConversation, getConversations } from '../api/client'
import { PageHeader, AnalysisResultCard } from '../components/ui'

export default function AnalyseConversation() {
  
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getConversations().then(setConversations).catch(() => {})
  }, [])

  const handleSelect = (e) => {
    const id = e.target.value
    setSelected(id)
    const conv = conversations.find(c => c.id === id)
    if (conv) setText(conv.conversation)
  }

  const handleAnalyse = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await analyseConversation(text)
      if (res.error) setError(res.error)
      else setResult(res)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<MessageSquareText size={22} />}
        title="Analyse Conversation"
        subtitle="Paste any customer–salesman conversation for instant AI-powered intelligence"
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          {/* Sample selector */}
          <div className="card space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Load Sample</p>
            <div className="relative">
              <select
                value={selected}
                onChange={handleSelect}
                className="input-field appearance-none pr-10 cursor-pointer"
              >
                <option value="">— Paste your own conversation —</option>
                {conversations.map(c => (
                  <option key={c.id} value={c.id} className="bg-navy-800">
                    {c.id} · {c.customer} · {c.property}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Text area */}
          <div className="card space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Conversation</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={"[Salesman]: Hello, how can I help you today?\n[Customer]: Hi, I'm looking for a 3BHK apartment…"}
              className="input-field resize-none font-mono text-xs leading-relaxed"
              rows={18}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyse}
            disabled={loading || !text.trim()}
            className="gold-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
                Analysing with AI…
              </>
            ) : (
              <><Zap size={16} /> Analyse with AI</>
            )}
          </button>
        </div>

        {/* Result panel */}
        <div className="space-y-4">
          {loading && (
            <div className="card flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <span className="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">Gemini is analysing the conversation…</p>
            </div>
          )}
          {!loading && !result && (
            <div className="card flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="text-5xl opacity-20">🧠</div>
              <p className="text-slate-500 text-sm">AI analysis results will appear here</p>
            </div>
          )}
          {!loading && result && (
            <>
              {result.cached && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-xs text-blue-400 flex items-center gap-2">
                  <Zap size={12} /> Loaded from cache — no API call made
                </div>
              )}
              <AnalysisResultCard result={result} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
