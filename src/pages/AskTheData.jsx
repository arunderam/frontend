import { useState } from 'react'
import { BrainCircuit, Send, Lightbulb } from 'lucide-react'
import { askData } from '../api/client'
import { PageHeader } from '../components/ui'
import { clsx } from 'clsx'

const SUGGESTIONS = [
  'Which customers are most likely to convert?',
  'What are the top pain points across all customers?',
  'Which salesman has the most hot leads?',
  'What budget range is most common?',
  'Which areas are most in demand?',
  'Who should I follow up with today?',
  'What is the average sentiment score of Highly Interested customers?',
  'List customers with Immediate urgency.',
]

export default function AskTheData() {
  
  const [question, setQuestion] = useState('')
  const [answer, setAnswer]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [history, setHistory]   = useState([])

  const handleAsk = async (q) => {
    const text = (q || question).trim()
    if (!text) return
    setLoading(true); setError(''); setAnswer('')
    try {
      const res = await askData(text)
      const ans = res.answer || 'No answer received.'
      setAnswer(ans)
      setHistory(h => [{ q: text, a: ans }, ...h.slice(0, 9)])
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk()
  }

  
  const renderAnswer = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-gold-400 mt-3 mb-1">{line.slice(2,-2)}</p>
      }
      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
            <span className="text-gold-500 mt-1 shrink-0">·</span>
            <span>{line.slice(2)}</span>
          </div>
        )
      }
      if (/^\d+\./.test(line)) {
        return (
          <div key={i} className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
            <span className="text-gold-500 font-mono text-xs mt-1 shrink-0">{line.split('.')[0]}.</span>
            <span>{line.split('.').slice(1).join('.').trim()}</span>
          </div>
        )
      }
      if (!line.trim()) return <div key={i} className="h-2" />
      return <p key={i} className="text-slate-300 text-sm leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<BrainCircuit size={22} />}
        title="Ask the Data"
        subtitle="Ask natural language questions — AI answers using your analysed dataset"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="col-span-2 space-y-4">
          {/* Suggestions */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={13} className="text-gold-500" />
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Try asking</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuestion(s); handleAsk(s) }}
                  className="text-xs border border-white/10 rounded-full px-3 py-1.5 text-slate-400 hover:border-gold-500/30 hover:text-gold-400 hover:bg-gold-500/5 transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="card space-y-3">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your conversation data…"
              className="input-field resize-none leading-relaxed"
              rows={3}
            />
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">⌘ + Enter to send</p>
              <button
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="gold-btn flex items-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Thinking…</>
                ) : (
                  <><Send size={14} /> Ask AI</>
                )}
              </button>
            </div>
          </div>

          {/* Answer */}
          {loading && (
            <div className="card flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
              </div>
              <p className="text-slate-500 text-sm">Gemini is analysing your dataset…</p>
            </div>
          )}
          {!loading && answer && (
            <div className="card space-y-4 animate-fade-up">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">🤖 AI Answer</p>
              <div className="space-y-1.5 border-l-2 border-gold-500/30 pl-4">
                {renderAnswer(answer)}
              </div>
            </div>
          )}
          {!loading && !answer && !error && (
            <div className="card flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="text-5xl opacity-20">💬</div>
              <p className="text-slate-500 text-sm">Ask a question to get AI insights from your data</p>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono px-1">Recent Questions</p>
          {history.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-600 text-xs">No questions yet</p>
            </div>
          ) : (
            history.map((item, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(item.q); setAnswer(item.a) }}
                className={clsx(
                  'card w-full text-left space-y-2 hover:border-gold-500/20 transition-all duration-200',
                  i === 0 && 'border-gold-500/20'
                )}
              >
                <p className="text-xs text-gold-400 font-medium line-clamp-2">{item.q}</p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.a}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
