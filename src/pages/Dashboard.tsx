import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { formatDate, generateRef } from '@/lib/utils'
import { DEPARTMENTS, VALUE_BANDS } from '@/lib/constants'
import type { BusinessCase } from '@/types'
import type { Session } from '@supabase/supabase-js'
import {
  Plus, FileText, ArrowRight, Loader2, Clock, LayoutDashboard,
  Briefcase, LogOut,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const [cases, setCases] = useState<BusinessCase[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    title: '',
    project_reference: generateRef(),
    department: '',
    sro_name: '',
    senior_finance_name: '',
    total_value_band: '',
    current_stage: 'SOC' as const,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadCases(session.user.id)
    })
  }, [])

  async function loadCases(userId: string) {
    const { data } = await supabase
      .from('business_cases')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })
    setCases((data ?? []) as BusinessCase[])
    setLoading(false)
  }

  async function createCase() {
    if (!session || !form.title.trim()) return
    setCreating(true)
    const { data, error } = await supabase
      .from('business_cases')
      .insert({ ...form, owner_id: session.user.id })
      .select()
      .single()

    if (!error && data) {
      navigate(`/case/${data.id}/strategic`)
    }
    setCreating(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const stageBadge = (stage: string) => {
    if (stage === 'SOC') return 'soc'
    if (stage === 'OBC') return 'obc'
    return 'fbc'
  }

  const stageLabel = (stage: string) => {
    const l: Record<string, string> = { SOC: 'Strategic Outline Case', OBC: 'Outline Business Case', FBC: 'Full Business Case' }
    return l[stage] ?? stage
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-navy rounded flex items-center justify-center">
            <span className="text-cream text-xs font-bold">CW</span>
          </div>
          <span className="font-semibold text-navy">CaseWorks</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500 hidden sm:block">{session?.user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-navy" />
            <h1 className="text-xl font-bold text-navy">Your business cases</h1>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New business case
          </Button>
        </div>

        {/* Stats */}
        {cases.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total cases', value: cases.length, icon: Briefcase },
              { label: 'SOC stage', value: cases.filter((c) => c.current_stage === 'SOC').length, icon: FileText },
              { label: 'OBC/FBC stage', value: cases.filter((c) => c.current_stage !== 'SOC').length, icon: ArrowRight },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-navy">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                    <Icon className="h-5 w-5 text-slate-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cases list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-navy mb-2">No business cases yet</h2>
            <p className="text-slate-500 text-sm mb-6">Create your first business case to get started with CaseWorks.</p>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New business case
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {cases.map((bc) => (
              <Card
                key={bc.id}
                className="cursor-pointer hover:border-navy/30 hover:shadow-md transition-all"
                onClick={() => navigate(`/case/${bc.id}/strategic`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-navy truncate">{bc.title}</h3>
                        <Badge variant={stageBadge(bc.current_stage) as 'soc' | 'obc' | 'fbc'}>
                          {bc.current_stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{stageLabel(bc.current_stage)}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        {bc.department && <span>{bc.department}</span>}
                        {bc.total_value_band && <span>{bc.total_value_band}</span>}
                        {bc.project_reference && <span className="font-mono">{bc.project_reference}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(bc.updated_at)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={0} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New business case</DialogTitle>
            <DialogDescription>
              Set up the basic details for your business case. You can update these later in the workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="case-title">Case title *</Label>
              <Input
                id="case-title"
                placeholder="e.g. Digital Case Management System"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ref">Project reference</Label>
                <Input
                  id="ref"
                  value={form.project_reference}
                  onChange={(e) => setForm({ ...form, project_reference: e.target.value })}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label>Starting stage</Label>
                <Select value={form.current_stage} onValueChange={(v) => setForm({ ...form, current_stage: v as 'SOC' })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOC">SOC — Strategic Outline Case</SelectItem>
                    <SelectItem value="OBC">OBC — Outline Business Case</SelectItem>
                    <SelectItem value="FBC">FBC — Full Business Case</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Department / organisation</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department…" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Total programme value</Label>
              <Select value={form.total_value_band} onValueChange={(v) => setForm({ ...form, total_value_band: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select value band…" />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_BANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sro">SRO name</Label>
                <Input
                  id="sro"
                  placeholder="Jane Smith"
                  value={form.sro_name}
                  onChange={(e) => setForm({ ...form, sro_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sfo">Senior Finance Officer</Label>
                <Input
                  id="sfo"
                  placeholder="John Brown"
                  value={form.senior_finance_name}
                  onChange={(e) => setForm({ ...form, senior_finance_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={createCase} disabled={creating || !form.title.trim()} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create business case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
