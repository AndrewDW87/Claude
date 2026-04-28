import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { riskScore, riskLevel, cn } from '@/lib/utils'
import { RISK_CATEGORIES } from '@/lib/constants'
import type { RisksRegisterItem, RiskAllocation } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const RISK_LEVEL_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

const EMPTY: Omit<RisksRegisterItem, 'id' | 'created_at'> = {
  case_id: '',
  risk_description: '',
  category: '',
  likelihood: 3,
  impact: 3,
  mitigation: '',
  owner: '',
  allocation: 'authority',
}

export default function RisksTable() {
  const { currentCase, risks, addRisk, updateRisk, deleteRisk } = useCaseStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RisksRegisterItem | null>(null)
  const [form, setForm] = useState<Omit<RisksRegisterItem, 'id' | 'created_at'>>(EMPTY)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, case_id: currentCase?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(r: RisksRegisterItem) {
    setEditing(r)
    setForm({ ...r })
    setShowForm(true)
  }

  async function handleSave() {
    if (!currentCase || !form.risk_description.trim()) return
    if (editing) await updateRisk(editing.id, form)
    else await addRisk({ ...form, case_id: currentCase.id })
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this risk?')) await deleteRisk(id)
  }

  const sorted = [...risks].sort((a, b) => riskScore(b.likelihood, b.impact) - riskScore(a.likelihood, a.impact))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-navy">Risks Register</h3>
          <p className="text-xs text-slate-500">{risks.length} risks · Scored by likelihood × impact</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add risk
        </Button>
      </div>

      {risks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-400 text-sm">
          No risks registered yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Risk</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Category</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-12">L</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-12">I</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-16">Score</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Owner</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-20">Allocation</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((risk) => {
                const score = riskScore(risk.likelihood, risk.impact)
                const level = riskLevel(score)
                return (
                  <tr key={risk.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-3 py-2">
                      <p className="font-medium text-navy line-clamp-2">{risk.risk_description}</p>
                      {risk.mitigation && (
                        <p className="text-slate-400 line-clamp-1 mt-0.5">↳ {risk.mitigation}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{risk.category || '—'}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{risk.likelihood}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{risk.impact}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn('rounded-full px-1.5 py-0.5 font-semibold text-xs', RISK_LEVEL_COLORS[level])}>
                        {score}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{risk.owner || '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="capitalize text-slate-500">{risk.allocation}</span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(risk)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(risk.id)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit risk' : 'Add risk'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Risk description *</label>
              <Textarea value={form.risk_description} onChange={(e) => setForm({ ...form, risk_description: e.target.value })} placeholder="Describe the risk and its potential consequence…" className="min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{RISK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Allocation</label>
                <Select value={form.allocation} onValueChange={(v) => setForm({ ...form, allocation: v as RiskAllocation })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authority">Authority</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Likelihood (1–5)</label>
                <Input type="number" min={1} max={5} value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: +e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Impact (1–5)</label>
                <Input type="number" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: +e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Score</label>
                <div className="h-9 flex items-center">
                  <span className={cn('rounded-full px-2 py-1 text-sm font-bold', RISK_LEVEL_COLORS[riskLevel(riskScore(form.likelihood, form.impact))])}>
                    {riskScore(form.likelihood, form.impact)} — {riskLevel(riskScore(form.likelihood, form.impact))}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Mitigation</label>
              <Textarea value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} placeholder="How will this risk be mitigated?" className="min-h-[60px]" />
            </div>
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Risk owner</label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Name / role" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.risk_description.trim()}>{editing ? 'Save' : 'Add risk'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
