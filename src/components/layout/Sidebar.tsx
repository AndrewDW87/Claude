import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCaseStore } from '@/store/caseStore'
import { CASE_SECTIONS } from '@/lib/methodology'
import type { CaseType, Stage } from '@/types'
import {
  Target, TrendingUp, ShoppingCart, PoundSterling, ClipboardList,
  List, Search, CheckSquare, Download, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const CASE_NAV = [
  { type: 'strategic' as CaseType, label: 'Strategic Case', Icon: Target, path: 'strategic', color: 'text-blue-600' },
  { type: 'economic' as CaseType, label: 'Economic Case', Icon: TrendingUp, path: 'economic', color: 'text-purple-600' },
  { type: 'commercial' as CaseType, label: 'Commercial Case', Icon: ShoppingCart, path: 'commercial', color: 'text-amber-600' },
  { type: 'financial' as CaseType, label: 'Financial Case', Icon: PoundSterling, path: 'financial', color: 'text-green-600' },
  { type: 'management' as CaseType, label: 'Management Case', Icon: ClipboardList, path: 'management', color: 'text-rose-600' },
]

const OTHER_NAV = [
  { label: 'Registers', Icon: List, path: 'registers' },
  { label: 'Research', Icon: Search, path: 'research' },
  { label: 'Review & Compliance', Icon: CheckSquare, path: 'review' },
  { label: 'Export', Icon: Download, path: 'export' },
]

const STAGES: Stage[] = ['SOC', 'OBC', 'FBC']
const STAGE_LABELS: Record<Stage, string> = { SOC: 'SOC', OBC: 'OBC', FBC: 'FBC' }

function statusDot(status: string) {
  const colors: Record<string, string> = {
    not_started: 'bg-slate-300',
    drafting: 'bg-amber-400',
    review: 'bg-blue-400',
    complete: 'bg-green-500',
  }
  return colors[status] ?? 'bg-slate-300'
}

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { id } = useParams<{ id: string }>()
  const { currentCase, sections, getSectionCompletion } = useCaseStore()
  const [expandedCase, setExpandedCase] = useState<CaseType | null>('strategic')

  if (!currentCase || !id) return null

  const stage = currentCase.current_stage
  const totalCompletion = Math.round(
    CASE_NAV.reduce((sum, c) => sum + getSectionCompletion(c.type), 0) / CASE_NAV.length,
  )

  function getSectionStatus(caseType: CaseType, sectionKey: string) {
    const section = sections.find(
      (s) => s.case_id === currentCase!.id && s.stage === stage && s.case_type === caseType && s.section_key === sectionKey,
    )
    return section?.status ?? 'not_started'
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
      {/* Stage selector */}
      <div className="p-3 border-b border-slate-100">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Stage</p>
        <div className="flex gap-1">
          {STAGES.map((s) => (
            <button
              key={s}
              className={cn(
                'flex-1 py-1 rounded text-xs font-semibold transition-colors',
                currentCase.current_stage === s
                  ? 'bg-navy text-cream'
                  : 'text-slate-500 hover:bg-slate-50',
              )}
              title={s === 'SOC' ? 'Strategic Outline Case' : s === 'OBC' ? 'Outline Business Case' : 'Full Business Case'}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Overall progress */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Overall progress</span>
          <span className="text-xs font-medium text-navy">{totalCompletion}%</span>
        </div>
        <Progress value={totalCompletion} className="h-1.5" />
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          {/* Five cases */}
          {CASE_NAV.map(({ type, label, Icon, path, color }) => {
            const completion = getSectionCompletion(type)
            const isExpanded = expandedCase === type
            const caseSections = CASE_SECTIONS[type]

            return (
              <div key={type}>
                <div className="flex items-center">
                  <NavLink
                    to={`/case/${id}/${path}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                        isActive ? 'bg-navy/5 text-navy font-medium' : 'text-slate-600 hover:bg-slate-50',
                      )
                    }
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', color)} />
                    <span className="truncate">{label}</span>
                    <span className="ml-auto text-xs text-slate-400">{completion}%</span>
                  </NavLink>
                  <button
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    onClick={() => setExpandedCase(isExpanded ? null : type)}
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {caseSections.map((section) => {
                      const status = getSectionStatus(type, section.key)
                      return (
                        <NavLink
                          key={section.key}
                          to={`/case/${id}/${path}#${section.key}`}
                          onClick={onNavigate}
                          className="flex items-center gap-2 px-2 py-1 rounded text-xs text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors"
                        >
                          <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot(status))} />
                          <span className="truncate">{section.title}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <div className="pt-2 mt-2 border-t border-slate-100 space-y-0.5">
            {OTHER_NAV.map(({ label, Icon, path }) => (
              <NavLink
                key={path}
                to={`/case/${id}/${path}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    isActive ? 'bg-navy/5 text-navy font-medium' : 'text-slate-600 hover:bg-slate-50',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Case metadata footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs font-medium text-navy truncate">{currentCase.title}</p>
        {currentCase.project_reference && (
          <p className="text-xs text-slate-400 mt-0.5">{currentCase.project_reference}</p>
        )}
        {currentCase.sro_name && (
          <p className="text-xs text-slate-400 truncate">SRO: {currentCase.sro_name}</p>
        )}
      </div>
    </aside>
  )
}
