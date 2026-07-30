import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Upload, Play, Square, Zap, RefreshCw, Languages } from 'lucide-react'
import { transcribeAudio, analyseTranscript } from '../api/client'
import { PageHeader, AnalysisResultCard } from '../components/ui'
import { clsx } from 'clsx'

const TABS = ['🎤 Record', '📂 Upload']

export default function VoiceAnalysis() {
  
  const [tab, setTab] = useState(0)


  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioFilename, setAudioFilename] = useState('recording.wav')
  const mediaRef = useRef(null)
  const chunksRef = useRef([])


  const [langHint, setLangHint] = useState('')
  const [transcript, setTranscript] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [transcriptMeta, setTranscriptMeta] = useState(null)


  const startRecording = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setAudioFilename('recording.webm')
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setRecording(true)
    } catch {
      setError('Microphone access denied. Please allow mic permissions and retry.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
  }, [])

  
  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioBlob(file)
    setAudioUrl(URL.createObjectURL(file))
    setAudioFilename(file.name)
    setTranscript(''); setResult(null); setError('')
  }

 
  const handleTranscribe = async () => {
    if (!audioBlob) {
      setError('No audio to transcribe.')
      return
    }
    setTranscribing(true); setError(''); setResult(null)
    try {
      const data = await transcribeAudio(audioBlob, langHint, audioFilename)
      if (!data.success) { setError(data.error || 'Transcription failed.'); return }
      setTranscript(data.transcript)
      setTranscriptMeta({ words: data.word_count, turns: data.turn_count, structured: data.is_structured })
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setTranscribing(false)
    }
  }


  const handleAnalyse = async () => {
    if (!transcript.trim()) return
    setAnalysing(true); setError('')
    try {
      const res = await analyseTranscript(transcript)
      if (res.error) setError(res.error)
      else setResult(res)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setAnalysing(false)
    }
  }

  const reset = () => {
    setAudioBlob(null); setAudioUrl(''); setTranscript('')
    setResult(null); setError(''); setTranscriptMeta(null)
  }

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        icon={<Mic size={22} />}
        title="Voice Analysis"
        subtitle="Record or upload a sales call — AI transcribes and analyses it using Gemini"
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => { setTab(i); reset() }}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  tab === i ? 'bg-gold-500/20 text-gold-400 border border-gold-500/20' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Record tab */}
          {tab === 0 && (
            <div className="card space-y-6">
              <div className="flex flex-col items-center gap-6 py-6">
                {/* Big mic button */}
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={clsx(
                    'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl',
                    recording
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse-slow shadow-red-500/30'
                      : 'bg-gold-500/10 border-2 border-gold-500/50 text-gold-400 hover:bg-gold-500/20 hover:border-gold-500 shadow-gold-500/20 hover:scale-105'
                  )}
                >
                  {recording ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
                <p className="text-sm text-slate-400">
                  {recording ? '🔴 Recording… click to stop' : 'Click to start recording'}
                </p>
                {audioUrl && !recording && (
                  <div className="w-full space-y-2">
                    <p className="text-xs text-emerald-400 text-center">✅ Recording captured</p>
                    <audio controls src={audioUrl} className="w-full h-10" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload tab */}
          {tab === 1 && (
            <div className="card space-y-4">
              <label className="flex flex-col items-center gap-4 py-10 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-gold-500/30 hover:bg-gold-500/5 transition-all duration-200 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 group-hover:bg-gold-500/10 flex items-center justify-center transition-colors">
                  <Upload size={24} className="text-slate-500 group-hover:text-gold-400 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 text-sm font-medium">Drop audio file or click to browse</p>
                  <p className="text-slate-500 text-xs mt-1">WAV · MP3 · M4A · OGG · WEBM · FLAC · AAC</p>
                </div>
                <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
              </label>
              {audioUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-400">✅ {audioFilename}</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Language hint */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Languages size={14} className="text-slate-500" />
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Language Hint (optional)</p>
            </div>
            <input
              type="text"
              value={langHint}
              onChange={e => setLangHint(e.target.value)}
              placeholder="e.g. English, Hindi, Kannada, Hinglish"
              className="input-field text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleTranscribe}
              disabled={!audioBlob || transcribing}
              className="gold-btn flex-1 flex items-center justify-center gap-2"
            >
              {transcribing ? (
                <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Transcribing…</>
              ) : (
                <><Play size={15} /> Transcribe</>
              )}
            </button>
            <button onClick={reset} className="ghost-btn flex items-center gap-2">
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Right: Transcript + Analysis */}
        <div className="space-y-4">
          {/* Transcript */}
          {transcript ? (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Transcript</p>
                {transcriptMeta && (
                  <div className="flex gap-3 text-xs text-slate-500 font-mono">
                    <span>{transcriptMeta.words} words</span>
                    <span>{transcriptMeta.turns} turns</span>
                    {transcriptMeta.structured && <span className="text-emerald-400">✓ Structured</span>}
                  </div>
                )}
              </div>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                className="input-field font-mono text-xs leading-relaxed resize-none"
                rows={12}
              />
              <button
                onClick={handleAnalyse}
                disabled={analysing || !transcript.trim()}
                className="gold-btn w-full flex items-center justify-center gap-2"
              >
                {analysing ? (
                  <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Analysing…</>
                ) : (
                  <><Zap size={15} /> Analyse Transcript with AI</>
                )}
              </button>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="text-5xl opacity-20">🎙️</div>
              <p className="text-slate-500 text-sm">Transcription will appear here after recording or uploading audio</p>
            </div>
          )}

          {/* Analysis result */}
          {analysing && (
            <div className="card flex items-center justify-center py-12 gap-3">
              <span className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Gemini is analysing the transcript…</p>
            </div>
          )}
          {!analysing && result && <AnalysisResultCard result={result} />}
        </div>
      </div>
    </div>
  )
}
