import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { BenefitsRegisterItem, BenefitType } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const EMPTY: Omit<BenefitsRegisterItem, 'id' | 'created_at'> = {
  case_id: '',
  benefit_description: '',
  type: 'non-cashable',
  value: null,
  realisation_date: null,
  owner: '',
  measurement_method: '',
}

export default function BenefitsTable() {
  const { currentCase, benefits, addBenefit, updateBenefit, deleteBenefit } = useCaseStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BenefitsRegisterItem | null>(null)
  const [form, setForm] = useState<Omit<BenefitsRegisterItem, 'id' | 'created_at'>>(EMPTY)

  const totalCashable = benefits.filter((b) => b.type === 'cashable').reduce((sum, b) => sum + (b.value ?? 0), 0)
  const totalAll = benefits.reduce((sum, b) => sum + (b.value ?? 0), 0)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, case_id: currentCase?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(b: BenefitsRegisterItem) {
    setEditing(b)
    setForm({ ...b })
    setShowForm(true)
  }

  async function handleSave() {
    if (!currentCase || !form.benefit_description.trim()) return
    if (editing) await updateBenefit(editing.id, form)
    else await addBenefit({ ...form, case_id: currentCase.id })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-navy">Benefits Register</h3>
          <p className="text-xs text-slate-500">{benefits.length} benefits · Cashable: {formatCurrency(totalCashable)} · Total monetised: {formatCurrency(totalAll)}</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add benefit
        </Button>
      </div>

      {/* Summary cards */}
      {benefits.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Cashable benefits', value: formatCurrency(totalCashable), color: 'text-green-600' },
            { label: 'Non-cashable (monetised)', value: formatCurrency(totalAll - totalCashable), color: 'text-blue-600' },
            { label: 'Total monetised', value: formatCurrency(totalAll), color: 'text-navy' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {benefits.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-slate-400 text-sm">
          No benefits registered yet. Add benefits to drive the NPSV calculation.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Benefit</th>
                <th className="text-center px-3 py-2 text-slate-500 font-medium w-24">Type</th>
                <th className="text-right px-3 py-2 text-slate-500 font-medium w-24">Value (£)</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium w-28">Realisation</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Owner</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {benefits.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-navy">{b.benefit_description}</p>
                    {b.measurement_method && <p className="text-slate-400 mt-0.5">Measured by: {b.measurement_method}</p>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-1.5 py-0.5 font-medium ${b.type === 'cashable' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {b.type === 'cashable' ? 'Cashable' : 'Non-cashable'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-navy">
                    {b.value != null ? formatCurrency(b.value) : '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{b.realisation_date ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{b.owner || '—'}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(b)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteBenefit(b.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></Button>
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
            <DialogTitle>{editing ? 'Edit benefit' : 'Add benefit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Benefit description *</label>
              <Textarea value={form.benefit_description} onChange={(e) => setForm({ ...form, benefit_description: e.target.value })} placeholder="Describe the benefit and how it arises…" className="min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as BenefitType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashable">Cashable</SelectItem>
                    <SelectItem value="non-cashable">Non-cashable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Monetised value (£)</label>
                <Input type="number" placeholder="0" value={form.value ?? ''} onChange={(e) => setForm({ ...form, value: e.target.value ? +e.target.value : null })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Expected realisation date</label>
                <Input type="date" value={form.realisation_date ?? ''} onChange={(e) => setForm({ ...form, realisation_date: e.target.value || null })} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Benefit owner</label>
                <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Name / role" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Measurement method</label>
              <Input value={form.measurement_method} onChange={(e) => setForm({ ...form, measurement_method: e.target.value })} placeholder="How will this benefit be measured?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.benefit_description.trim()}>{editing ? 'Save' : 'Add benefit'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
