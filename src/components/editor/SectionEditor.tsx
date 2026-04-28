import { useState, useCallback, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCaseStore } from '@/store/caseStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { wordCount } from '@/lib/utils'
import type { SectionDefinition, CaseType, SectionStatus } from '@/types'
import { Info, CheckCircle2, Clock, Edit3, Eye } from 'lucide-react'

interface SectionEditorProps {
  section: SectionDefinition
  caseType: CaseType
  onAIAction?: (action: 'draft' | 'critique' | 'research' | 'gap_analysis', content: string) => void
}

const STATUS_OPTIONS: { value: SectionStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'drafting', label: 'In progress' },
  { value: 'review', label: 'Under review' },
  { value: 'complete', label: 'Complete' },
]

const STATUS_ICONS: Record<SectionStatus, React.ReactNode> = {
  not_started: <div className="w-2 h-2 rounded-full bg-slate-300" />,
  drafting: <Edit3 className="h-3 w-3 text-amber-500" />,
  review: <Eye className="h-3 w-3 text-blue-500" />,
  complete: <CheckCircle2 className="h-3 w-3 text-green-500" />,
}

export default function SectionEditor({ section, caseType, onAIAction }: SectionEditorProps) {
  const { currentCase, getSection, upsertSection, updateSectionStatus } = useCaseStore()
  const existingSection = getSection(caseType, section.key)

  const [content, setContent] = useState(
    () => (existingSection?.content_json as { html?: string })?.html ?? '',
  )
  const [words, setWords] = useState(existingSection?.word_count ?? 0)
  const [status, setStatus] = useState<SectionStatus>(existingSection?.status ?? 'not_started')
  const [showGuidance, setShowGuidance] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  const handleSave = useCallback(async (html: string) => {
    if (!currentCase) return
    setSaveStatus('saving')
    await upsertSection(currentCase.id, currentCase.current_stage, caseType, section.key, { html })
    setSaveStatus('saved')
  }, [currentCase, caseType, section.key, upsertSection])

  useAutoSave(content, handleSave, 500)

  useEffect(() => {
    const sectionData = getSection(caseType, section.key)
    if (sectionData) {
      const html = (sectionData.content_json as { html?: string })?.html ?? ''
      setContent(html)
      setWords(sectionData.word_count)
      setStatus(sectionData.status)
    }
  }, [caseType, section.key, getSection])

  function handleChange(html: string, text: string) {
    setContent(html)
    setWords(wordCount(text))
    setSaveStatus('unsaved')
    if (status === 'not_started' && text.trim().length > 0) {
      setStatus('drafting')
    }
  }

  async function handleStatusChange(newStatus: SectionStatus) {
    setStatus(newStatus)
    if (existingSection) {
      await updateSectionStatus(existingSection.id, newStatus)
    }
  }

  return (
    <div id={section.key} className="scroll-mt-4">
      <div className="section-card overflow-hidden">
        {/* Section header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-navy">{section.title}</h3>
              {section.required && (
                <Badge variant="outline" className="text-xs py-0">Required</Badge>
              )}
              <div className="flex items-center gap-1">
                {STATUS_ICONS[status]}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
          </div>

          <div className="flex items-center gap-2 ml-3 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowGuidance(!showGuidance)}
                    className="p-1 text-slate-400 hover:text-navy rounded transition-colors"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>HMT guidance for this section</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={status} onValueChange={(v) => handleStatusChange(v as SectionStatus)}>
              <SelectTrigger className="h-7 text-xs w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* HMT Guidance panel */}
        {showGuidance && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-1">HM Treasury Guidance (May 2024)</p>
            <p className="text-xs text-blue-700 leading-relaxed">{section.guidance}</p>
          </div>
        )}

        {/* AI quick actions */}
        {onAIAction && (
          <div className="flex items-center gap-2 px-4 py-2 bg-coral/5 border-b border-coral/10">
            <span className="text-xs text-coral font-medium">AI Co-Author:</span>
            <div className="flex gap-1.5">
              {(['draft', 'critique', 'research'] as const).map((action) => (
                <Button
                  key={action}
                  variant="coral-outline"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => onAIAction(action, content)}
                >
                  {action === 'draft' ? 'Draft' : action === 'critique' ? 'Critique' : 'Research'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="p-4">
          <RichTextEditor
            content={content}
            onChange={handleChange}
            placeholder={section.placeholder}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{words} words</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' && <span className="text-slate-400">Saving…</span>}
            {saveStatus === 'saved' && content && <span className="text-green-500">Saved</span>}
            {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
