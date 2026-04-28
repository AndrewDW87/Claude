import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { useAI } from '@/hooks/useAI'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { CaseType } from '@/types'
import {
  CheckCircle2, XCircle, CheckSquare, Sparkles,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'

interface CheckItem {
  id: string
  label: string
  description: string
  caseType: CaseType | 'all'
  check: () => boolean
}

function useComplianceChecks() {
  const { currentCase, sections, options, risks, benefits, costs } = useCaseStore()

  const hasSectionContent = (caseType: CaseType, sectionKey: string): boolean => {
    const s = sections.find(
      (sec) =>
        sec.case_id === currentCase?.id &&
        sec.stage === currentCase?.current_stage &&
        sec.case_type === caseType &&
        sec.section_key === sectionKey,
    )
    const html = (s?.content_json as { html?: string })?.html ?? ''
    return html.replace(/<[^>]*>/g, '').trim().length > 50
  }


  const checks: CheckItem[] = [
    // Strategic case
    { id: 'sc_context', label: 'Strategic context documented', description: 'Organisation and policy alignment described', caseType: 'strategic', check: () => hasSectionContent('strategic', 'strategic_context') },
    { id: 'sc_change', label: 'Case for change evidenced', description: 'Current situation and problems with evidence', caseType: 'strategic', check: () => hasSectionContent('strategic', 'case_for_change') },
    { id: 'sc_objectives', label: 'SMART spending objectives included', description: 'Objectives must be Specific, Measurable, Achievable, Relevant, Time-bound', caseType: 'strategic', check: () => hasSectionContent('strategic', 'spending_objectives') },
    { id: 'sc_risks', label: 'Main risks identified', description: 'Key risks at this stage documented', caseType: 'strategic', check: () => hasSectionContent('strategic', 'main_risks') },
    { id: 'sc_scope', label: 'Business scope defined', description: 'Potential scope and key service requirements set out', caseType: 'strategic', check: () => hasSectionContent('strategic', 'potential_scope') },

    // Economic case
    { id: 'ec_csf', label: 'Five Critical Success Factors addressed', description: 'All five CSFs described with weightings', caseType: 'economic', check: () => hasSectionContent('economic', 'critical_success_factors') },
    { id: 'ec_longlist', label: 'Longlist options analysis completed', description: 'Options Framework used to generate longlist', caseType: 'economic', check: () => options.filter((o) => o.status === 'longlist' || o.status === 'shortlist' || o.status === 'discounted').length >= 3 },
    { id: 'ec_preferred', label: 'Preferred option recommended', description: 'Single preferred option with clear justification', caseType: 'economic', check: () => options.some((o) => o.status === 'preferred') },
    { id: 'ec_appraisal', label: 'Economic appraisal undertaken', description: 'NPSV analysis with sensitivity testing', caseType: 'economic', check: () => hasSectionContent('economic', 'economic_appraisal') },
    { id: 'ec_options_register', label: 'Options register populated', description: 'At least 3 options in the register (including do-nothing)', caseType: 'economic', check: () => options.length >= 3 },

    // Commercial case
    { id: 'cc_procurement', label: 'Procurement strategy set out', description: 'Route to market and Procurement Act 2023 compliance', caseType: 'commercial', check: () => hasSectionContent('commercial', 'procurement_strategy') },
    { id: 'cc_risk', label: 'Risk allocation documented', description: 'Authority/supplier/shared allocation for key risks', caseType: 'commercial', check: () => hasSectionContent('commercial', 'risk_allocation') },
    { id: 'cc_accounting', label: 'Accountancy treatment addressed', description: 'On/off balance sheet position and IFRS implications', caseType: 'commercial', check: () => hasSectionContent('commercial', 'accountancy_treatment') },

    // Financial case
    { id: 'fc_costs', label: 'Cost profile included', description: 'Capital and revenue by year with optimism bias', caseType: 'financial', check: () => costs.length > 0 },
    { id: 'fc_affordability', label: 'Affordability confirmed', description: 'Costs within spending review settlement', caseType: 'financial', check: () => hasSectionContent('financial', 'affordability') },
    { id: 'fc_sfo', label: 'Finance Director support statement', description: 'Mandatory SFO sign-off included', caseType: 'financial', check: () => hasSectionContent('financial', 'finance_director') },

    // Management case
    { id: 'mc_governance', label: 'SRO named and governance described', description: 'Named SRO with governance structure', caseType: 'management', check: () => (!!currentCase?.sro_name && hasSectionContent('management', 'governance')) },
    { id: 'mc_benefits', label: 'Benefits realisation plan included', description: 'Arrangements for tracking and realising benefits', caseType: 'management', check: () => hasSectionContent('management', 'benefits_realisation') && benefits.length > 0 },
    { id: 'mc_evaluation', label: 'Post-implementation evaluation planned', description: 'Evaluation methodology referenced (Magenta Book)', caseType: 'management', check: () => hasSectionContent('management', 'evaluation') },
    { id: 'mc_risks_mgmt', label: 'Risk management arrangements', description: 'Risk governance and escalation process described', caseType: 'management', check: () => hasSectionContent('management', 'risk_management') && risks.length > 0 },

    // Cross-case
    { id: 'x_sro', label: 'SRO identified', description: 'Senior Responsible Owner named in case metadata', caseType: 'all', check: () => !!currentCase?.sro_name },
    { id: 'x_risks_register', label: 'Risks register populated', description: 'At least one risk documented', caseType: 'all', check: () => risks.length > 0 },
    { id: 'x_benefits_register', label: 'Benefits register populated', description: 'At least one benefit documented', caseType: 'all', check: () => benefits.length > 0 },
  ]

  const passing = checks.filter((c) => c.check()).length
  const total = checks.length
  const pct = Math.round((passing / total) * 100)

  return { checks, passing, total, pct }
}

const CASE_TYPE_ORDER: (CaseType | 'all')[] = ['strategic', 'economic', 'commercial', 'financial', 'management', 'all']
const CASE_LABELS: Record<string, string> = {
  strategic: 'Strategic Case', economic: 'Economic Case', commercial: 'Commercial Case',
  financial: 'Financial Case', management: 'Management Case', all: 'Cross-case',
}

export default function Review() {
  const { currentCase, sections } = useCaseStore()
  const { checks, passing, total, pct } = useComplianceChecks()
  const { loading, response, error, run } = useAI()
  const [expandedGroup, setExpandedGroup] = useState<string | null>('strategic')
  const [showGapAnalysis, setShowGapAnalysis] = useState(false)

  if (!currentCase) return null

  const grouped = CASE_TYPE_ORDER.reduce((acc, ct) => {
    acc[ct] = checks.filter((c) => c.caseType === ct)
    return acc
  }, {} as Record<string, CheckItem[]>)

  async function runGapAnalysis() {
    setShowGapAnalysis(true)
    const allContent = sections
      .filter((s) => s.case_id === currentCase!.id && s.stage === currentCase!.current_stage)
      .map((s) => `[${s.case_type}/${s.section_key}]: ${JSON.stringify(s.content_json)}`)
      .join('\n\n')

    await run({
      action: 'gap_analysis',
      businessCase: currentCase,
      caseType: 'strategic',
      sectionKey: 'all',
      sectionContent: allContent,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-navy" />
          <h1 className="text-lg font-bold text-navy">Review & Compliance</h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Automatically checked against HM Treasury Better Business Cases guidance (May 2024)
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Overall score */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-navy">Compliance score</h2>
                <p className="text-xs text-slate-500">{passing} of {total} checks passing</p>
              </div>
              <div className="text-right">
                <span className={cn('text-3xl font-bold', pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600')}>
                  {pct}%
                </span>
              </div>
            </div>
            <Progress value={pct} className="h-2" />
            <div className="flex gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {passing} passing
              </div>
              <div className="flex items-center gap-1.5 text-red-500">
                <XCircle className="h-3.5 w-3.5" />
                {total - passing} failing
              </div>
            </div>
          </div>

          {/* AI Gap Analysis */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-navy flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-coral" />
                  AI Gap Analysis
                </h2>
                <p className="text-xs text-slate-500">Full AI review of your case against HMT requirements</p>
              </div>
              <Button onClick={runGapAnalysis} disabled={loading} variant="coral" size="sm" className="gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? 'Analysing…' : 'Run analysis'}
              </Button>
            </div>
            {showGapAnalysis && response && (
              <div className="mt-3 rounded-md bg-coral/5 border border-coral/20 p-4">
                <p className="text-xs text-navy whitespace-pre-wrap leading-relaxed">{response}</p>
              </div>
            )}
            {showGapAnalysis && error && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-100 p-3 text-xs text-red-600">{error}</div>
            )}
          </div>

          {/* Compliance checklist by group */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-navy">Compliance Checklist</h2>
              <p className="text-xs text-slate-500">HM Treasury Better Business Cases guidance (May 2024) — {currentCase.current_stage}</p>
            </div>

            {CASE_TYPE_ORDER.map((ct) => {
              const group = grouped[ct]
              if (!group || group.length === 0) return null
              const groupPassing = group.filter((c) => c.check()).length
              const isExpanded = expandedGroup === ct

              return (
                <div key={ct} className="border-b border-slate-100 last:border-b-0">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : ct)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={cn('w-2 h-2 rounded-full', groupPassing === group.length ? 'bg-green-500' : groupPassing > 0 ? 'bg-amber-400' : 'bg-red-400')} />
                    <span className="flex-1 text-sm font-medium text-navy">{CASE_LABELS[ct]}</span>
                    <span className="text-xs text-slate-500">{groupPassing}/{group.length}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2">
                      {group.map((check) => {
                        const passing = check.check()
                        return (
                          <div key={check.id} className="flex items-start gap-3 py-1.5">
                            {passing ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={cn('text-sm', passing ? 'text-navy' : 'text-red-700')}>{check.label}</p>
                              <p className="text-xs text-slate-400">{check.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
