import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAI } from '@/hooks/useAI'
import { useCaseStore } from '@/store/caseStore'
import { CASE_SECTIONS } from '@/lib/methodology'
import type { CaseType } from '@/types'
import {
  Sparkles, MessageSquare, ClipboardCheck, SearchIcon, AlertTriangle,
  Copy, Check, ChevronRight, Loader2, X,
} from 'lucide-react'
import { toast } from '@/components/ui/toaster'

interface AIPanelProps {
  caseType: CaseType
  activeSectionKey?: string
  sectionContent?: string
  defaultAction?: 'draft' | 'critique' | 'research' | 'gap_analysis'
}

export default function AIPanel({
  caseType,
  activeSectionKey,
  sectionContent = '',
  defaultAction,
}: AIPanelProps) {
  const { currentCase, sections } = useCaseStore()
  const { loading, response, error, run, clear } = useAI()
  const [activeTab, setActiveTab] = useState<'draft' | 'critique' | 'research' | 'gap_analysis'>(defaultAction ?? 'draft')
  const [researchQuery, setResearchQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [acceptedResponse, setAcceptedResponse] = useState<string | null>(null)

  const sectionDef = activeSectionKey
    ? CASE_SECTIONS[caseType]?.find((s) => s.key === activeSectionKey)
    : null

  async function runAction(action: 'draft' | 'critique' | 'research' | 'gap_analysis') {
    setAcceptedResponse(null)
    await run({
      action,
      businessCase: currentCase,
      caseType,
      sectionKey: activeSectionKey ?? '',
      sectionContent,
      userMessage: action === 'research' ? researchQuery : undefined,
    })
  }

  async function runGapAnalysis() {
    const allContent = sections
      .filter((s) => s.case_id === currentCase?.id && s.stage === currentCase?.current_stage)
      .map((s) => `${s.case_type}/${s.section_key}: ${JSON.stringify(s.content_json)}`)
      .join('\n\n')

    await run({
      action: 'gap_analysis',
      businessCase: currentCase,
      caseType,
      sectionKey: 'all',
      sectionContent: allContent,
    })
  }

  function handleCopy() {
    if (!response) return
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied to clipboard' })
  }

  function handleAccept() {
    setAcceptedResponse(response)
    toast({ title: 'Response accepted', description: 'Copy it into the editor above.', variant: 'success' })
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 shrink-0">
        <div className="w-5 h-5 rounded bg-coral flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm font-semibold text-navy">AI Co-Author</span>
        {sectionDef && (
          <Badge variant="secondary" className="text-xs ml-auto max-w-[100px] truncate">
            {sectionDef.title}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); clear() }} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-2 mt-2 shrink-0 grid grid-cols-4 h-8">
          <TabsTrigger value="draft" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" />
            Draft
          </TabsTrigger>
          <TabsTrigger value="critique" className="text-xs gap-1">
            <ClipboardCheck className="h-3 w-3" />
            Critique
          </TabsTrigger>
          <TabsTrigger value="research" className="text-xs gap-1">
            <SearchIcon className="h-3 w-3" />
            Research
          </TabsTrigger>
          <TabsTrigger value="gap_analysis" className="text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />
            Gaps
          </TabsTrigger>
        </TabsList>

        {/* Draft tab */}
        <TabsContent value="draft" className="flex-1 flex flex-col min-h-0 mx-2 mt-2">
          <div className="text-xs text-slate-500 mb-2 leading-relaxed">
            Generate a first draft for <span className="font-medium text-navy">{sectionDef?.title ?? 'this section'}</span> based on your case context and existing content.
          </div>
          <Button
            variant="coral"
            size="sm"
            className="w-full"
            onClick={() => runAction('draft')}
            disabled={loading || !activeSectionKey}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            {loading ? 'Generating…' : 'Generate draft'}
          </Button>
          <AIResponse response={response} error={error} loading={loading} onCopy={handleCopy} onAccept={handleAccept} copied={copied} accepted={!!acceptedResponse} />
        </TabsContent>

        {/* Critique tab */}
        <TabsContent value="critique" className="flex-1 flex flex-col min-h-0 mx-2 mt-2">
          <div className="text-xs text-slate-500 mb-2 leading-relaxed">
            Score your content against HM Treasury Better Business Cases criteria (May 2024). Get specific feedback on what's missing.
          </div>
          <Button
            variant="coral"
            size="sm"
            className="w-full"
            onClick={() => runAction('critique')}
            disabled={loading || !sectionContent.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ClipboardCheck className="h-4 w-4 mr-1" />}
            {loading ? 'Analysing…' : 'Critique this section'}
          </Button>
          {!sectionContent.trim() && (
            <p className="text-xs text-slate-400 mt-2 text-center">Write some content first to critique it.</p>
          )}
          <AIResponse response={response} error={error} loading={loading} onCopy={handleCopy} onAccept={handleAccept} copied={copied} accepted={!!acceptedResponse} />
        </TabsContent>

        {/* Research tab */}
        <TabsContent value="research" className="flex-1 flex flex-col min-h-0 mx-2 mt-2">
          <div className="text-xs text-slate-500 mb-2 leading-relaxed">
            Ask a question about HM Treasury guidance, the Green Book, optimism bias, procurement routes, or any business case topic.
          </div>
          <Textarea
            placeholder="e.g. What optimism bias rate should I use for an IT-enabled business change project?"
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            className="text-xs min-h-[80px] mb-2"
          />
          <Button
            variant="coral"
            size="sm"
            className="w-full"
            onClick={() => runAction('research')}
            disabled={loading || !researchQuery.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <SearchIcon className="h-4 w-4 mr-1" />}
            {loading ? 'Researching…' : 'Research'}
          </Button>
          <AIResponse response={response} error={error} loading={loading} onCopy={handleCopy} onAccept={handleAccept} copied={copied} accepted={!!acceptedResponse} />
        </TabsContent>

        {/* Gap analysis tab */}
        <TabsContent value="gap_analysis" className="flex-1 flex flex-col min-h-0 mx-2 mt-2">
          <div className="text-xs text-slate-500 mb-2 leading-relaxed">
            Scan all sections of your current stage and identify missing evidence, incomplete elements, and what you need to gather before submission.
          </div>
          <Button
            variant="coral"
            size="sm"
            className="w-full"
            onClick={runGapAnalysis}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
            {loading ? 'Analysing…' : 'Run gap analysis'}
          </Button>
          <AIResponse response={response} error={error} loading={loading} onCopy={handleCopy} onAccept={handleAccept} copied={copied} accepted={!!acceptedResponse} showAccept={false} />
        </TabsContent>
      </Tabs>

      {/* Green Book reference */}
      <div className="px-3 py-2 border-t border-slate-100 shrink-0">
        <p className="text-xs text-slate-400 leading-relaxed">
          AI is calibrated against <span className="font-medium">HM Treasury Better Business Cases guidance (May 2024)</span> and the Green Book.
        </p>
      </div>
    </div>
  )
}

function AIResponse({
  response,
  error,
  loading,
  onCopy,
  onAccept,
  copied,
  accepted,
  showAccept = true,
}: {
  response: string
  error: string | null
  loading: boolean
  onCopy: () => void
  onAccept: () => void
  copied: boolean
  accepted: boolean
  showAccept?: boolean
}) {
  if (!response && !error && !loading) return null

  return (
    <div className="mt-3 flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-coral">AI Response</span>
        {response && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onCopy} title="Copy">
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 rounded-md border border-coral/20 bg-coral/5">
        <div className="p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating response…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600">
              <X className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {response && (
            <div className="text-xs text-navy whitespace-pre-wrap leading-relaxed">{response}</div>
          )}
        </div>
      </ScrollArea>

      {response && showAccept && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full text-xs gap-1"
          onClick={onAccept}
          disabled={accepted}
        >
          {accepted ? (
            <><Check className="h-3 w-3 text-green-500" /> Accepted — copy into editor</>
          ) : (
            <><ChevronRight className="h-3 w-3" /> Accept & use this draft</>
          )}
        </Button>
      )}
    </div>
  )
}
