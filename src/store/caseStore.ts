import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type {
  BusinessCase,
  CaseSection,
  OptionsRegisterItem,
  RisksRegisterItem,
  BenefitsRegisterItem,
  CostsRegisterItem,
  CaseType,
  Stage,
  SectionStatus,
} from '@/types'

interface CaseStore {
  currentCase: BusinessCase | null
  sections: CaseSection[]
  options: OptionsRegisterItem[]
  risks: RisksRegisterItem[]
  benefits: BenefitsRegisterItem[]
  costs: CostsRegisterItem[]
  loading: boolean
  error: string | null

  loadCase: (id: string) => Promise<void>
  updateSection: (sectionId: string, contentJson: Record<string, unknown>, wordCount: number) => Promise<void>
  updateSectionStatus: (sectionId: string, status: SectionStatus) => Promise<void>
  upsertSection: (caseId: string, stage: Stage, caseType: CaseType, sectionKey: string, contentJson: Record<string, unknown>) => Promise<void>
  updateCase: (updates: Partial<BusinessCase>) => Promise<void>

  addOption: (item: Omit<OptionsRegisterItem, 'id' | 'created_at'>) => Promise<void>
  updateOption: (id: string, updates: Partial<OptionsRegisterItem>) => Promise<void>
  deleteOption: (id: string) => Promise<void>

  addRisk: (item: Omit<RisksRegisterItem, 'id' | 'created_at'>) => Promise<void>
  updateRisk: (id: string, updates: Partial<RisksRegisterItem>) => Promise<void>
  deleteRisk: (id: string) => Promise<void>

  addBenefit: (item: Omit<BenefitsRegisterItem, 'id' | 'created_at'>) => Promise<void>
  updateBenefit: (id: string, updates: Partial<BenefitsRegisterItem>) => Promise<void>
  deleteBenefit: (id: string) => Promise<void>

  addCost: (item: Omit<CostsRegisterItem, 'id' | 'created_at'>) => Promise<void>
  updateCost: (id: string, updates: Partial<CostsRegisterItem>) => Promise<void>
  deleteCost: (id: string) => Promise<void>

  getSection: (caseType: CaseType, sectionKey: string) => CaseSection | undefined
  getSectionCompletion: (caseType: CaseType) => number
  getTotalCompletion: () => number
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  currentCase: null,
  sections: [],
  options: [],
  risks: [],
  benefits: [],
  costs: [],
  loading: false,
  error: null,

  loadCase: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const [caseRes, sectionsRes, optionsRes, risksRes, benefitsRes, costsRes] = await Promise.all([
        supabase.from('business_cases').select('*').eq('id', id).single(),
        supabase.from('case_sections').select('*').eq('case_id', id),
        supabase.from('options_register').select('*').eq('case_id', id),
        supabase.from('risks_register').select('*').eq('case_id', id),
        supabase.from('benefits_register').select('*').eq('case_id', id),
        supabase.from('costs_register').select('*').eq('case_id', id),
      ])

      if (caseRes.error) throw caseRes.error

      set({
        currentCase: caseRes.data as BusinessCase,
        sections: (sectionsRes.data ?? []) as CaseSection[],
        options: (optionsRes.data ?? []) as OptionsRegisterItem[],
        risks: (risksRes.data ?? []) as RisksRegisterItem[],
        benefits: (benefitsRes.data ?? []) as BenefitsRegisterItem[],
        costs: (costsRes.data ?? []) as CostsRegisterItem[],
        loading: false,
      })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  updateSection: async (sectionId, contentJson, wordCount) => {
    const { error } = await supabase
      .from('case_sections')
      .update({ content_json: contentJson, word_count: wordCount, last_edited_at: new Date().toISOString() })
      .eq('id', sectionId)

    if (!error) {
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, content_json: contentJson, word_count: wordCount } : sec,
        ),
      }))
    }
  },

  updateSectionStatus: async (sectionId, status) => {
    const { error } = await supabase
      .from('case_sections')
      .update({ status })
      .eq('id', sectionId)

    if (!error) {
      set((s) => ({
        sections: s.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, status } : sec,
        ),
      }))
    }
  },

  upsertSection: async (caseId, stage, caseType, sectionKey, contentJson) => {
    const existing = get().sections.find(
      (s) => s.case_id === caseId && s.stage === stage && s.case_type === caseType && s.section_key === sectionKey,
    )

    if (existing) {
      await get().updateSection(existing.id, contentJson, 0)
    } else {
      const { data, error } = await supabase
        .from('case_sections')
        .insert({ case_id: caseId, stage, case_type: caseType, section_key: sectionKey, content_json: contentJson })
        .select()
        .single()

      if (!error && data) {
        set((s) => ({ sections: [...s.sections, data as CaseSection] }))
      }
    }
  },

  updateCase: async (updates) => {
    const { currentCase } = get()
    if (!currentCase) return

    const { error } = await supabase
      .from('business_cases')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', currentCase.id)

    if (!error) {
      set((s) => ({ currentCase: s.currentCase ? { ...s.currentCase, ...updates } : null }))
    }
  },

  addOption: async (item) => {
    const { data, error } = await supabase.from('options_register').insert(item).select().single()
    if (!error && data) set((s) => ({ options: [...s.options, data as OptionsRegisterItem] }))
  },
  updateOption: async (id, updates) => {
    await supabase.from('options_register').update(updates).eq('id', id)
    set((s) => ({ options: s.options.map((o) => (o.id === id ? { ...o, ...updates } : o)) }))
  },
  deleteOption: async (id) => {
    await supabase.from('options_register').delete().eq('id', id)
    set((s) => ({ options: s.options.filter((o) => o.id !== id) }))
  },

  addRisk: async (item) => {
    const { data, error } = await supabase.from('risks_register').insert(item).select().single()
    if (!error && data) set((s) => ({ risks: [...s.risks, data as RisksRegisterItem] }))
  },
  updateRisk: async (id, updates) => {
    await supabase.from('risks_register').update(updates).eq('id', id)
    set((s) => ({ risks: s.risks.map((r) => (r.id === id ? { ...r, ...updates } : r)) }))
  },
  deleteRisk: async (id) => {
    await supabase.from('risks_register').delete().eq('id', id)
    set((s) => ({ risks: s.risks.filter((r) => r.id !== id) }))
  },

  addBenefit: async (item) => {
    const { data, error } = await supabase.from('benefits_register').insert(item).select().single()
    if (!error && data) set((s) => ({ benefits: [...s.benefits, data as BenefitsRegisterItem] }))
  },
  updateBenefit: async (id, updates) => {
    await supabase.from('benefits_register').update(updates).eq('id', id)
    set((s) => ({ benefits: s.benefits.map((b) => (b.id === id ? { ...b, ...updates } : b)) }))
  },
  deleteBenefit: async (id) => {
    await supabase.from('benefits_register').delete().eq('id', id)
    set((s) => ({ benefits: s.benefits.filter((b) => b.id !== id) }))
  },

  addCost: async (item) => {
    const { data, error } = await supabase.from('costs_register').insert(item).select().single()
    if (!error && data) set((s) => ({ costs: [...s.costs, data as CostsRegisterItem] }))
  },
  updateCost: async (id, updates) => {
    await supabase.from('costs_register').update(updates).eq('id', id)
    set((s) => ({ costs: s.costs.map((c) => (c.id === id ? { ...c, ...updates } : c)) }))
  },
  deleteCost: async (id) => {
    await supabase.from('costs_register').delete().eq('id', id)
    set((s) => ({ costs: s.costs.filter((c) => c.id !== id) }))
  },

  getSection: (caseType, sectionKey) => {
    const { sections, currentCase } = get()
    if (!currentCase) return undefined
    return sections.find(
      (s) =>
        s.case_id === currentCase.id &&
        s.stage === currentCase.current_stage &&
        s.case_type === caseType &&
        s.section_key === sectionKey,
    )
  },

  getSectionCompletion: (caseType) => {
    const { sections, currentCase } = get()
    if (!currentCase) return 0
    const caseSections = sections.filter(
      (s) => s.case_id === currentCase.id && s.stage === currentCase.current_stage && s.case_type === caseType,
    )
    if (caseSections.length === 0) return 0
    const complete = caseSections.filter((s) => s.status === 'complete').length
    return Math.round((complete / caseSections.length) * 100)
  },

  getTotalCompletion: () => {
    const { sections, currentCase } = get()
    if (!currentCase) return 0
    const caseSections = sections.filter(
      (s) => s.case_id === currentCase.id && s.stage === currentCase.current_stage,
    )
    if (caseSections.length === 0) return 0
    const complete = caseSections.filter((s) => s.status === 'complete').length
    return Math.round((complete / caseSections.length) * 100)
  },
}))
