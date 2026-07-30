import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import AnalyseConversation from './pages/AnalyseConversation'
import VoiceAnalysis from './pages/VoiceAnalysis'
import BatchAnalysis from './pages/BatchAnalysis'
import DeepInsights from './pages/DeepInsights'
import AskTheData from './pages/AskTheData'
import Salespeople from './pages/Salespeople'

export const AppCtx = createContext({})
export const useApp = () => useContext(AppCtx)

export default function App() {
  return (
    <AppCtx.Provider value={{}}>
      <div className="flex h-screen overflow-hidden bg-navy-950 noise-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyse" element={<AnalyseConversation />} />
            <Route path="/voice" element={<VoiceAnalysis />} />
            <Route path="/batch" element={<BatchAnalysis />} />
            <Route path="/salespeople" element={<Salespeople />} />
            <Route path="/insights" element={<DeepInsights />} />
            <Route path="/ask" element={<AskTheData />} />
          </Routes>
        </main>
      </div>
    </AppCtx.Provider>
  )
}
