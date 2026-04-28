import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { OPTIONS_FRAMEWORK_DIMENSIONS } from '@/lib/constants'
import type { OptionsRegisterItem, OptionStatus } from '@/types'
import { Plus, Pencil, Trash2, Star, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<OptionStatus, { label: string; color: string }> = {
  longlist: { label: 'Longlist', color: 'bg-slate-100 text-slate-700' },
  shortlist: { label: 'Shortlist', color: 'bg-blue-100 text-blue-700' },
  preferred: { label: 'Preferred', color: 'bg-green-100 text-green-700' },
  discounted: { label: 'Discounted', color: 'bg-red-100 text-red-700' },
}

const EMPTY_OPTION: Omit<OptionsRegisterItem, 'id' | 'created_at'> = {
  case_id: '',
  option_name: '',
  scope: '',
  service_solution: '',
  service_delivery: '',
  implementation: '',
  funding: '',
  status: 'longlist',
  rationale: '',
}

export default function OptionsMatrix() {
  const { currentCase, options, addOption, updateOption, deleteOption } = useCaseStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<OptionsRegisterItem | null>(null)
  const [form, setForm] = useState<Omit<OptionsRegisterItem, 'id' | 'created_at'>>(EMPTY_OPTION)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFramework, setShowFramework] = useState(false)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY_OPTION, case_id: currentCase?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(opt: OptionsRegisterItem) {
    setEditing(opt)
    setForm({ ...opt })
    setShowForm(true)
  }

  async function handleSave() {
    if (!currentCase || !form.option_name.trim()) return
    if (editing) {
      await updateOption(editing.id, form)
    } else {
      await addOption({ ...form, case_id: currentCase.id })
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this option?')) await deleteOption(id)
  }

  const grouped: Record<OptionStatus, OptionsRegisterItem[]> = {
    preferred: options.filter((o) => o.status === 'preferred'),
    shortlist: options.filter((o) => o.status === 'shortlist'),
    longlist: options.filter((o) => o.status === 'longlist'),
    discounted: options.filter((o) => o.status === 'discounted'),
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-navy">Options Framework</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            HM Treasury Five Case Model — longlist through to preferred option.
            {' '}<button onClick={() => setShowFramework(!showFramework)} className="text-blue-600 underline">
              {showFramework ? 'Hide' : 'View'} framework guide
            </button>
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add option
        </Button>
      </div>

      {/* Framework guide */}
      {showFramework && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              The HMT Options Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-blue-700 mb-3">
              Generate options by varying each of the five dimensions. The Do-Nothing option must always be included.
              Assess all longlist options against your Critical Success Factors to identify a shortlist of 3–6 for detailed appraisal.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {OPTIONS_FRAMEWORK_DIMENSIONS.map((dim) => (
                <div key={dim.key} className="bg-white rounded-md border border-blue-100 p-2">
                  <p className="text-xs font-semibold text-blue-800 mb-1">{dim.label}</p>
                  <p className="text-xs text-blue-600 leading-relaxed">{dim.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options count */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(Object.keys(STATUS_CONFIG) as OptionStatus[]).map((status) => (
          <div key={status} className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS_CONFIG[status].color)}>
            {grouped[status].length} {STATUS_CONFIG[status].label}
          </div>
        ))}
      </div>

      {/* Options grouped by status */}
      {options.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">
          <p className="text-sm">No options yet. Add your first option to build the longlist.</p>
          <Button onClick={openNew} size="sm" className="mt-3 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add first option
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(Object.keys(STATUS_CONFIG) as OptionStatus[]).map((status) => {
            const group = grouped[status]
            if (group.length === 0) return null
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_CONFIG[status].color)}>
                    {STATUS_CONFIG[status].label}
                  </div>
                  {status === 'preferred' && <Star className="h-3.5 w-3.5 text-green-600 fill-green-600" />}
                </div>
                <div className="space-y-2">
                  {group.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      expanded={expandedId === opt.id}
                      onToggle={() => setExpandedId(expandedId === opt.id ? null : opt.id)}
                      onEdit={() => openEdit(opt)}
                      onDelete={() => handleDelete(opt.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit option' : 'Add option'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Option name *</label>
                <Input
                  placeholder="e.g. Option A — In-house development"
                  value={form.option_name}
                  onChange={(e) => setForm({ ...form, option_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-navy mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as OptionStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_CONFIG) as OptionStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold text-navy -mb-2">Options Framework dimensions</p>
            {OPTIONS_FRAMEWORK_DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  {dim.label}
                  <span className="font-normal ml-1 text-slate-400">— {dim.description}</span>
                </label>
                <Input
                  placeholder={`Describe the ${dim.label.toLowerCase()} position for this option…`}
                  value={form[dim.key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [dim.key]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-navy mb-1 block">Rationale / assessment against CSFs</label>
              <Textarea
                placeholder="Why was this option longisted / shortlisted / preferred / discounted?"
                value={form.rationale}
                onChange={(e) => setForm({ ...form, rationale: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.option_name.trim()}>
              {editing ? 'Save changes' : 'Add option'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OptionCard({
  option, expanded, onToggle, onEdit, onDelete,
}: {
  option: OptionsRegisterItem
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const status = STATUS_CONFIG[option.status]
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onToggle} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-navy truncate">{option.option_name}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium shrink-0', status.color)}>
              {status.label}
            </span>
          </div>
          {option.rationale && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{option.rationale}</p>
          )}
        </button>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onToggle}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="grid grid-cols-5 gap-3">
            {OPTIONS_FRAMEWORK_DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{dim.label}</p>
                <p className="text-xs text-navy">
                  {(option[dim.key as keyof OptionsRegisterItem] as string) || '—'}
                </p>
              </div>
            ))}
          </div>
          {option.rationale && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1">Rationale</p>
              <p className="text-xs text-navy leading-relaxed">{option.rationale}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
