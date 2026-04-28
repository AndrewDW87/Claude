import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Target, TrendingUp, ShoppingCart, PoundSterling, ClipboardList,
  Sparkles, CheckCircle, ArrowRight, FileText, Shield, Users,
} from 'lucide-react'

const FEATURES = [
  {
    Icon: Target,
    title: 'Five Case Model',
    description: 'Full HM Treasury framework: Strategic, Economic, Commercial, Financial, and Management cases — all five, all stages.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    Icon: Sparkles,
    title: 'AI Co-Author',
    description: 'Powered by Claude. Drafts sections, critiques against Green Book criteria, researches guidance, and identifies gaps.',
    color: 'text-coral bg-coral-50',
  },
  {
    Icon: TrendingUp,
    title: 'Options Framework',
    description: 'First-class Options Framework matrix UI across all five dimensions — the hardest part of OBC drafting, made structured.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    Icon: Shield,
    title: 'Compliance Checklist',
    description: 'Auto-tracked compliance against May 2024 HMT guidance. Know exactly what\'s missing before submission.',
    color: 'text-green-600 bg-green-50',
  },
  {
    Icon: FileText,
    title: 'Export to DOCX/PDF',
    description: 'Cabinet Office template structure — cover page, five cases, appendices, version control — ready to submit.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    Icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time multi-user editing with presence indicators. Owner, editor, and reviewer roles.',
    color: 'text-rose-600 bg-rose-50',
  },
]

const STAGES = [
  {
    stage: 'SOC',
    full: 'Strategic Outline Case',
    description: 'Establish the case for change, strategic fit, and preferred way forward. Approve entry into business planning.',
    color: 'border-blue-200 bg-blue-50',
    badge: 'soc' as const,
  },
  {
    stage: 'OBC',
    full: 'Outline Business Case',
    description: 'Refine analysis, shortlist options, and set out commercial, financial, and management arrangements. Approve procurement.',
    color: 'border-amber-200 bg-amber-50',
    badge: 'obc' as const,
  },
  {
    stage: 'FBC',
    full: 'Full Business Case',
    description: 'Finalise after procurement. Confirm affordability, value for money, and deliverability. Approve implementation.',
    color: 'border-green-200 bg-green-50',
    badge: 'fbc' as const,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-navy rounded flex items-center justify-center">
              <span className="text-cream text-xs font-bold">CW</span>
            </div>
            <span className="font-semibold text-navy">CaseWorks</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Sparkles className="h-3 w-3 text-coral" />
          Built on HM Treasury Better Business Cases guidance (May 2024)
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-navy leading-tight mb-4">
          UK Government Business Cases,<br />
          <span className="text-coral">written right</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          CaseWorks is an AI-co-authored workspace for SOC, OBC, and FBC business cases
          following HM Treasury's Five Case Model. For civil servants and consultants who
          need to get it right first time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <Button size="xl" className="gap-2">
              Start your business case
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button size="xl" variant="outline">
            View example SOC
          </Button>
        </div>
      </section>

      {/* Stage pathway */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-navy text-center mb-8">
          The full SOC → OBC → FBC pathway
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {STAGES.map(({ stage, full, description, color, badge }) => (
            <div key={stage} className={`rounded-lg border p-5 ${color}`}>
              <Badge variant={badge} className="mb-3">{stage}</Badge>
              <h3 className="font-semibold text-navy mb-2">{full}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Five cases */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-navy text-center mb-2">All five cases, fully structured</h2>
          <p className="text-slate-500 text-center mb-8">Every section mapped to HMT requirements, with embedded guidance and AI assistance.</p>
          <div className="grid sm:grid-cols-5 gap-3">
            {[
              { Icon: Target, label: 'Strategic', color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { Icon: TrendingUp, label: 'Economic', color: 'text-purple-600 bg-purple-50 border-purple-100' },
              { Icon: ShoppingCart, label: 'Commercial', color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { Icon: PoundSterling, label: 'Financial', color: 'text-green-600 bg-green-50 border-green-100' },
              { Icon: ClipboardList, label: 'Management', color: 'text-rose-600 bg-rose-50 border-rose-100' },
            ].map(({ Icon, label, color }) => (
              <div key={label} className={`rounded-lg border p-4 text-center ${color}`}>
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm font-medium text-navy">{label} Case</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-navy text-center mb-2">Everything you need to get approved</h2>
        <p className="text-slate-500 text-center mb-8">From first outline to final submission.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, description, color }) => (
            <div key={title} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-navy mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-cream mb-3">Ready to start your business case?</h2>
          <p className="text-navy-200 mb-6 text-slate-300">
            Trusted by civil servants and consultants across government.
            Calibrated to the May 2024 HMT guidance.
          </p>
          <Link to="/auth">
            <Button size="xl" variant="coral" className="gap-2">
              Get started free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-navy rounded flex items-center justify-center">
              <span className="text-cream text-xs font-bold">CW</span>
            </div>
            <span className="text-sm text-slate-500">CaseWorks</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Aligned with HM Treasury Better Business Cases guidance (May 2024) and the Green Book
          </div>
        </div>
      </footer>
    </div>
  )
}
