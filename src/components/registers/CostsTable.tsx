import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency, applyOptimismBias } from '@/lib/utils'
import { OPTIMISM_BIAS_RATES } from '@/lib/constants'
import type { CostsRegisterItem, CostType } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const EMPTY: Omit<CostsRegisterItem, 'id' | 'created_at'> = {
  case_id: '',
  cost_line: '',
  year: null,
  capital_revenue: 'capital',
  amount: null,
  real_nominal: 'real',
  optimism_bias_pct: 0,
}

export default function CostsTable() {
  const { currentCase, costs, addCost, updateCost, deleteCost } = useCaseStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CostsRegisterItem | null>(null)
  const [form, setForm] = useState<Omit<CostsRegisterItem, 'id' | 'created_at'>>(EMPTY)

  const totalCapital = costs.filter((c) => c.capital_revenue === 'capital').reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const totalRevenue = costs.filter((c) => c.capital_revenue === 'revenue').reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const totalWithOB = costs.reduce((sum, c) => sum + applyOptimismBias(c.amount ?? 0, c.optimism_bias_pct), 0)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, case_id: currentCase?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(c: CostsRegisterItem) {
    setEditing(c)
    setForm({ ...c })
    setShowForm(true)
  }

  async function handleSave() {
    if (!currentCase || !form.cost_line.trim()) return
    if (editing) await updateCost(editing.id, form)
    else await addCost({ ...form, case_id: currentCase.id })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-navy">Costs Register</h3>
          <p className="text-xs text-slate-500">Capital: {formatCurrency(totalCapital)} · Revenue: {formatCurrency(totalRevenue)} · With optimism bias: {formatCurrency(totalWithOB)}</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add cost line
        </Button>
      </div>

      {costs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total capital', value: formatCurrency(totalCapital), color: 'text-purple-600' },
            { label: 'Total revenue', value: formatCurrency(totalRevenue), color: 'text-blue-600' },
            { label: 'With optimism bias', value: formatCurrency(totalWithOB), color: 'text-coral' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {costs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-400 text-sm">
          No cost lines yet. Add costs to drive the financial case and NPSV calculation.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Cost line</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-12">Year</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-20">Cap/Rev</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-24">Amount (£)</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-24">OB adj. (£)</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-16">OB %</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {costs.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-3 py-2 font-medium text-navy">{c.cost_line}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{c.year ?? '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-1.5 py-0.5 font-medium ${c.capital_revenue === 'capital' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.capital_revenue === 'capital' ? 'Cap' : 'Rev'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-navy">{c.amount != null ? formatCurrency(c.amount) : '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-coral">{c.amount != null ? formatCurrency(applyOptimismBias(c.amount, c.optimism_bias_pct)) : '—'}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{c.optimism_bias_pct}%</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteCost(c.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit cost line' : 'Add cost line'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Cost line *</label>
              <Input value={form.cost_line} onChange={(e) => setForm({ ...form, cost_line: e.target.value })} placeholder="e.g. Software development — Year 1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Year</label>
                <Input type="number" placeholder="2025" value={form.year ?? ''} onChange={(e) => setForm({ ...form, year: e.target.value ? +e.target.value : null })} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Type</label>
                <Select value={form.capital_revenue} onValueChange={(v) => setForm({ ...form, capital_revenue: v as CostType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capital">Capital</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Real / Nominal</label>
                <Select value={form.real_nominal} onValueChange={(v) => setForm({ ...form, real_nominal: v as 'real' | 'nominal' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real">Real</SelectItem>
                    <SelectItem value="nominal">Nominal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Amount (£)</label>
                <Input type="number" placeholder="0" value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: e.target.value ? +e.target.value : null })} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Optimism bias %</label>
                <Select value={String(form.optimism_bias_pct)} onValueChange={(v) => setForm({ ...form, optimism_bias_pct: +v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% — custom</SelectItem>
                    {Object.entries(OPTIMISM_BIAS_RATES).map(([k, v]) => (
                      <SelectItem key={k} value={String(v)}>{v}% — {k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.amount != null && form.optimism_bias_pct > 0 && (
              <div className="rounded-md bg-coral/10 border border-coral/20 px-3 py-2 text-xs text-navy">
                Adjusted amount with {form.optimism_bias_pct}% optimism bias: <strong>{formatCurrency(applyOptimismBias(form.amount, form.optimism_bias_pct))}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.cost_line.trim()}>{editing ? 'Save' : 'Add cost line'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
