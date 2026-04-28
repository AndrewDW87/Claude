export type Stage = 'SOC' | 'OBC' | 'FBC'
export type CaseType = 'strategic' | 'economic' | 'commercial' | 'financial' | 'management'
export type SectionStatus = 'not_started' | 'drafting' | 'review' | 'complete'
export type Permission = 'owner' | 'editor' | 'reviewer'
export type OptionStatus = 'longlist' | 'shortlist' | 'preferred' | 'discounted'
export type RiskAllocation = 'authority' | 'supplier' | 'shared'
export type BenefitType = 'cashable' | 'non-cashable'
export type CostType = 'capital' | 'revenue'
export type AIActionType = 'draft' | 'critique' | 'research' | 'gap_analysis'

export interface Profile {
  id: string
  email: string
  full_name: string
  organisation: string
  role: string
  created_at: string
}

export interface BusinessCase {
  id: string
  owner_id: string
  title: string
  project_reference: string
  current_stage: Stage
  department: string
  sro_name: string
  senior_finance_name: string
  total_value_band: string
  created_at: string
  updated_at: string
}

export interface CaseSection {
  id: string
  case_id: string
  stage: Stage
  case_type: CaseType
  section_key: string
  content_json: Record<string, unknown>
  status: SectionStatus
  word_count: number
  last_edited_by: string | null
  last_edited_at: string
}

export interface OptionsRegisterItem {
  id: string
  case_id: string
  option_name: string
  scope: string
  service_solution: string
  service_delivery: string
  implementation: string
  funding: string
  status: OptionStatus
  rationale: string
  created_at: string
}

export interface RisksRegisterItem {
  id: string
  case_id: string
  risk_description: string
  category: string
  likelihood: number
  impact: number
  mitigation: string
  owner: string
  allocation: RiskAllocation
  created_at: string
}

export interface BenefitsRegisterItem {
  id: string
  case_id: string
  benefit_description: string
  type: BenefitType
  value: number | null
  realisation_date: string | null
  owner: string
  measurement_method: string
  created_at: string
}

export interface CostsRegisterItem {
  id: string
  case_id: string
  cost_line: string
  year: number | null
  capital_revenue: CostType
  amount: number | null
  real_nominal: 'real' | 'nominal'
  optimism_bias_pct: number
  created_at: string
}

export interface AIInteraction {
  id: string
  case_id: string
  section_id: string | null
  type: AIActionType
  prompt: string
  response: string
  accepted: boolean
  created_at: string
}

export interface ResearchArtefact {
  id: string
  case_id: string
  title: string
  source_url: string
  content: string
  tags: string[]
  attached_to_section_id: string | null
  created_at: string
}

export interface SectionDefinition {
  key: string
  title: string
  description: string
  guidance: string
  placeholder: string
  required: boolean
  fields?: StructuredField[]
}

export interface StructuredField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'date'
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface ComplianceItem {
  id: string
  label: string
  description: string
  case_type: CaseType | 'all'
  section_key?: string
  stage: Stage | 'all'
  check: (sections: CaseSection[], registers: RegisterData) => boolean
}

export interface RegisterData {
  options: OptionsRegisterItem[]
  risks: RisksRegisterItem[]
  benefits: BenefitsRegisterItem[]
  costs: CostsRegisterItem[]
}
