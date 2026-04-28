import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { CASE_SECTIONS } from '@/lib/methodology'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { stageLabel, formatDate, formatCurrency } from '@/lib/utils'
import {
  Document, Paragraph, HeadingLevel, TextRun, AlignmentType, Packer,
} from 'docx'
import type { CaseType } from '@/types'
import { Download, FileText, Printer, Loader2 } from 'lucide-react'

const CASE_TYPE_ORDER: CaseType[] = ['strategic', 'economic', 'commercial', 'financial', 'management']
const CASE_LABELS: Record<CaseType, string> = {
  strategic: 'Strategic Case',
  economic: 'Economic Case',
  commercial: 'Commercial Case',
  financial: 'Financial Case',
  management: 'Management Case',
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()
}

export default function ExportPage() {
  const { currentCase, sections, options, risks, benefits } = useCaseStore()
  const [generating, setGenerating] = useState(false)

  if (!currentCase) return null

  async function generateDocx() {
    if (!currentCase) return
    setGenerating(true)

    try {
      const children: Paragraph[] = []

      // Cover page
      children.push(
        new Paragraph({
          children: [new TextRun({ text: currentCase.title, bold: true, size: 48, color: '0B2545' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 2000, after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: stageLabel(currentCase.current_stage), size: 28, color: '64748B' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: currentCase.department || '', size: 24, color: '64748B' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `SRO: ${currentCase.sro_name || ''}`, size: 24, color: '64748B' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Version 1.0 — ${formatDate(new Date())}`, size: 20, color: '94A3B8' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Ref: ${currentCase.project_reference || ''}`, size: 20, italics: true, color: '94A3B8' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 2000 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'This document follows HM Treasury Better Business Cases guidance (May 2024) and the Five Case Model.', size: 18, italics: true, color: '94A3B8' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          pageBreakBefore: false,
        }),
      )

      // Page break before main content
      children.push(new Paragraph({ pageBreakBefore: true, children: [] }))

      // Five cases
      for (const caseType of CASE_TYPE_ORDER) {
        children.push(
          new Paragraph({
            text: CASE_LABELS[caseType],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
        )

        const caseSections = CASE_SECTIONS[caseType]
        for (const section of caseSections) {
          const sectionData = sections.find(
            (s) =>
              s.case_id === currentCase.id &&
              s.stage === currentCase.current_stage &&
              s.case_type === caseType &&
              s.section_key === section.key,
          )
          const content = htmlToText((sectionData?.content_json as { html?: string })?.html ?? '')

          children.push(
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 },
            }),
          )

          if (content) {
            const paragraphs = content.split('\n').filter(Boolean)
            for (const para of paragraphs) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: para, size: 22 })],
                  spacing: { after: 120 },
                }),
              )
            }
          } else {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: '[Section not yet drafted]', italics: true, color: '94A3B8', size: 20 })],
                spacing: { after: 120 },
              }),
            )
          }
        }
      }

      // Appendix — Options Register
      if (options.length > 0) {
        children.push(
          new Paragraph({ pageBreakBefore: true, children: [] }),
          new Paragraph({ text: 'Appendix A: Options Register', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        )
        for (const opt of options) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: opt.option_name, bold: true, size: 22 }),
                new TextRun({ text: ` — ${opt.status}`, size: 22, color: '64748B' }),
              ],
              spacing: { before: 200, after: 80 },
            }),
          )
          if (opt.rationale) {
            children.push(new Paragraph({ children: [new TextRun({ text: opt.rationale, size: 20 })], spacing: { after: 80 } }))
          }
        }
      }

      // Appendix — Risks Register
      if (risks.length > 0) {
        children.push(
          new Paragraph({ pageBreakBefore: true, children: [] }),
          new Paragraph({ text: 'Appendix B: Risks Register', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        )
        for (const risk of risks) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: risk.risk_description, bold: true, size: 22 })],
              spacing: { before: 160, after: 60 },
            }),
            new Paragraph({
              children: [new TextRun({ text: `Likelihood: ${risk.likelihood} · Impact: ${risk.impact} · Score: ${risk.likelihood * risk.impact} · Allocation: ${risk.allocation}`, size: 20, color: '64748B' })],
              spacing: { after: 60 },
            }),
          )
          if (risk.mitigation) {
            children.push(new Paragraph({ children: [new TextRun({ text: `Mitigation: ${risk.mitigation}`, size: 20 })], spacing: { after: 60 } }))
          }
        }
      }

      // Appendix — Benefits Register
      if (benefits.length > 0) {
        children.push(
          new Paragraph({ pageBreakBefore: true, children: [] }),
          new Paragraph({ text: 'Appendix C: Benefits Register', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
        )
        for (const b of benefits) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: b.benefit_description, bold: true, size: 22 }),
                new TextRun({ text: ` (${b.type})`, size: 22, color: '64748B' }),
                ...(b.value != null ? [new TextRun({ text: ` — ${formatCurrency(b.value)}`, size: 22, color: '64748B' })] : []),
              ],
              spacing: { before: 160, after: 60 },
            }),
          )
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
        styles: {
          default: {
            document: {
              run: { font: 'Arial', size: 22, color: '0B2545' },
            },
          },
        },
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentCase.title} — ${currentCase.current_stage} — ${formatDate(new Date())}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  function printToPDF() {
    window.print()
  }

  const totalSections = CASE_TYPE_ORDER.flatMap((ct) => CASE_SECTIONS[ct]).length
  const completedSections = sections.filter(
    (s) => s.case_id === currentCase.id && s.stage === currentCase.current_stage && s.status === 'complete',
  ).length

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Download className="h-5 w-5 text-navy" />
          <h1 className="text-xl font-bold text-navy">Export</h1>
        </div>

        {/* Status summary */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Sections completed</span>
              <span className="font-semibold text-navy">{completedSections} / {totalSections}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600">Stage</span>
              <span className="font-semibold text-navy">{stageLabel(currentCase.current_stage)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600">Risks</span>
              <span className="font-semibold">{risks.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600">Benefits</span>
              <span className="font-semibold">{benefits.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-slate-600">Options</span>
              <span className="font-semibold">{options.length}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          <Card className="border-navy/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-navy" />
                Export to Word (DOCX)
              </CardTitle>
              <CardDescription>
                Cabinet Office template structure — cover page, all five cases as Heading 1/2/3, appendices for registers.
                Arial font, professional formatting.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={generateDocx} disabled={generating} className="w-full gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {generating ? 'Generating DOCX…' : 'Download DOCX'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Printer className="h-4 w-4 text-slate-500" />
                Print to PDF
              </CardTitle>
              <CardDescription>
                Use your browser's print dialog (Ctrl/Cmd+P) and select "Save as PDF". Works best in Chrome.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button onClick={printToPDF} variant="outline" className="w-full gap-2">
                <Printer className="h-4 w-4" />
                Open print dialog
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Exports are generated locally in your browser. No content is sent to third parties.
        </p>
      </div>
    </div>
  )
}
