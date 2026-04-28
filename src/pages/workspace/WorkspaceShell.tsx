import { useEffect, useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCaseStore } from '@/store/caseStore'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import StrategicCase from './StrategicCase'
import EconomicCase from './EconomicCase'
import CommercialCase from './CommercialCase'
import FinancialCase from './FinancialCase'
import ManagementCase from './ManagementCase'
import Registers from './Registers'
import Review from './Review'
import ExportPage from './ExportPage'
import type { Session } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'

export default function WorkspaceShell() {
  const { id } = useParams<{ id: string }>()
  const { loadCase, loading, currentCase } = useCaseStore()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  }, [])

  useEffect(() => {
    if (id) loadCase(id)
  }, [id, loadCase])

  if (loading || !currentCase) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
          <span className="text-sm text-slate-500">Loading business case…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream">
      {session && <Header session={session} />}

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="strategic" element={<StrategicCase />} />
            <Route path="economic" element={<EconomicCase />} />
            <Route path="commercial" element={<CommercialCase />} />
            <Route path="financial" element={<FinancialCase />} />
            <Route path="management" element={<ManagementCase />} />
            <Route path="registers" element={<Registers />} />
            <Route path="research" element={<Research />} />
            <Route path="review" element={<Review />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="*" element={<StrategicCase />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function Research() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-navy mb-2">Research Library</h2>
      <p className="text-slate-500 text-sm mb-6">
        Research artefacts gathered via the AI Research tab are saved here, tagged to sections.
      </p>
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">
        <p className="text-sm">Use the AI Research tab in any section to gather and save research.</p>
      </div>
    </div>
  )
}
