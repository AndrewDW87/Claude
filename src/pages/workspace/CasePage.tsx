import { useState } from 'react'
import SectionEditor from '@/components/editor/SectionEditor'
import AIPanel from '@/components/ai/AIPanel'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useCaseStore } from '@/store/caseStore'
import { caseTypeLabel, cn } from '@/lib/utils'
import { CASE_SECTIONS } from '@/lib/methodology'
import type { CaseType } from '@/types'
import { PanelRightOpen, PanelRightClose } from 'lucide-react'

interface CasePageProps {
  caseType: CaseType
  headerColor: string
  HeaderIcon: React.ComponentType<{ className?: string }>
}

export default function CasePage({ caseType, headerColor, HeaderIcon }: CasePageProps) {
  const { currentCase, getSectionCompletion } = useCaseStore()
  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [activeSectionKey, setActiveSectionKey] = useState<string>('')
  const [activeSectionContent, setActiveSectionContent] = useState('')
  const [aiAction, setAiAction] = useState<'draft' | 'critique' | 'research' | 'gap_analysis'>('draft')

  const sections = CASE_SECTIONS[caseType]
  const completion = getSectionCompletion(caseType)

  if (!currentCase) return null

  function handleAIAction(action: 'draft' | 'critique' | 'research' | 'gap_analysis', sectionKey: string, content: string) {
    setActiveSectionKey(sectionKey)
    setActiveSectionContent(content)
    setAiAction(action)
    setAiPanelOpen(true)
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Main content */}
      <div className={cn('flex-1 overflow-auto', aiPanelOpen ? 'max-w-[calc(100%-320px)]' : 'max-w-full')}>
        {/* Case header */}
        <div className={cn('px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeaderIcon className={cn('h-5 w-5', headerColor)} />
              <div>
                <h1 className="text-lg font-bold text-navy">{caseTypeLabel(caseType)}</h1>
                <p className="text-xs text-slate-500">
                  {currentCase.current_stage} · {currentCase.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Progress value={completion} className="w-24 h-1.5" />
                <span className="text-xs text-slate-500">{completion}%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                title={aiPanelOpen ? 'Hide AI panel' : 'Show AI panel'}
              >
                {aiPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-4 max-w-3xl">
          {sections.map((section) => (
            <SectionEditor
              key={section.key}
              section={section}
              caseType={caseType}
              onAIAction={(action, content) => handleAIAction(action, section.key, content)}
            />
          ))}
        </div>
      </div>

      {/* AI Panel */}
      {aiPanelOpen && (
        <div className="w-80 shrink-0 h-full border-l border-slate-200 overflow-hidden">
          <AIPanel
            caseType={caseType}
            activeSectionKey={activeSectionKey}
            sectionContent={activeSectionContent}
            defaultAction={aiAction}
          />
        </div>
      )}
    </div>
  )
}
