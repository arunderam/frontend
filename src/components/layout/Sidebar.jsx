import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, MessageSquareText, Mic, ClipboardList,
  Microscope, BrainCircuit, Trash2, Users
} from 'lucide-react'
import { clearCache } from '../../api/client'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyse',   icon: MessageSquareText, label: 'Analyse Conversation' },
  { to: '/voice',     icon: Mic,              label: 'Voice Analysis' },
  { to: '/batch',     icon: ClipboardList,    label: 'Batch Analysis' },
  { to: '/salespeople', icon: Users,          label: 'Salespeople' },
  { to: '/insights',  icon: Microscope,       label: 'Deep Insights' },
  { to: '/ask',       icon: BrainCircuit,     label: 'Ask the Data' },
]

export default function Sidebar() {
  const [show, setShow] = useState(false)
  const [clearing, setClearing] = useState(false)
  const location = useLocation()

  const handleClear = async () => {
    setClearing(true)
    await clearCache()
    setClearing(false)
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-navy-900 border-r border-white/8">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-navy-950 font-display text-lg font-bold shadow-lg shadow-gold-600/30">
            R
          </div>
          <div>
            <p className="font-display text-base text-slate-100 leading-tight">RealEstate</p>
            <p className="text-[10px] text-gold-500 font-mono tracking-widest uppercase">GenAI Analytics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer controls */}
      <div className="px-4 pb-4 border-t border-white/8 pt-4 space-y-3">
        {/* Clear cache */}
        <button
          onClick={handleClear}
          disabled={clearing}
          className="ghost-btn w-full flex items-center justify-center gap-2 text-xs py-2"
        >
          <Trash2 size={13} />
          {clearing ? 'Clearing…' : 'Clear Cache'}
        </button>

        <p className="text-[10px] text-slate-600 text-center font-mono">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </aside>
  )
}
