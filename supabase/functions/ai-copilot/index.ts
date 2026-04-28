// Supabase Edge Function: ai-copilot
// Proxies requests to Anthropic Claude API.
// API key is stored as a Supabase secret (ANTHROPIC_API_KEY) and never exposed to clients.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 2048

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  action: 'draft' | 'critique' | 'research' | 'gap_analysis'
  caseContext: {
    title: string
    department: string
    stage: string
    sro: string
    valueBand: string
    caseType: string
    sectionKey: string
  }
  sectionKey?: string
  sectionContent?: string
  userMessage?: string
  stage: string
}

function buildSystemPrompt(action: string, caseContext: RequestPayload['caseContext']): string {
  const baseContext = `You are an expert UK government business case writer and reviewer, trained on HM Treasury's Better Business Cases guidance (May 2024) and the Green Book. You are assisting with a ${caseContext.stage} (${caseContext.stage === 'SOC' ? 'Strategic Outline Case' : caseContext.stage === 'OBC' ? 'Outline Business Case' : 'Full Business Case'}) for:
- Project: ${caseContext.title}
- Department: ${caseContext.department || 'Not specified'}
- SRO: ${caseContext.sro || 'Not specified'}
- Value band: ${caseContext.valueBand || 'Not specified'}
- Case type: ${caseContext.caseType}
- Section: ${caseContext.sectionKey}

The Five Case Model requires: Strategic Case (case for change, objectives, risks), Economic Case (options analysis, NPSV, preferred option), Commercial Case (procurement strategy, risk allocation), Financial Case (affordability, funding), Management Case (governance, SRO, benefits realisation, evaluation).`

  const prompts: Record<string, string> = {
    draft: `${baseContext}

Your task: Generate a high-quality first draft for the specified section. The content should:
1. Be written in clear, professional UK civil service style
2. Be factual and specific, not generic
3. Follow exactly what HM Treasury guidance requires for this section
4. Reference the Green Book and Better Business Cases guidance where appropriate
5. Flag where the user needs to insert specific data, evidence, or statistics with [INSERT: description]
6. Be proportionate to the project value band
7. Use proper paragraph structure with clear topic sentences

Return only the draft content, ready to be used. Use UK English. Do not include headers or preamble.`,

    critique: `${baseContext}

Your task: Critically assess the provided section content against HM Treasury Better Business Cases guidance (May 2024) and Green Book criteria. Return your assessment in this exact format:

SCORE: [1-5]/5

STRENGTHS:
- [bullet point strengths]

WEAKNESSES:
- [bullet point weaknesses and gaps]

MISSING ELEMENTS:
- [elements required by HMT guidance that are absent]

SPECIFIC IMPROVEMENTS:
- [actionable, specific improvements the user should make]

REVIEWER'S VERDICT: [One sentence summary of whether this section would satisfy an HMT or IPA reviewer]

Be direct, rigorous, and specific. Reference actual HMT requirements, not generic advice.`,

    research: `${baseContext}

Your task: Answer the user's research question with specific, accurate information relevant to UK government business cases. Reference:
- HM Treasury Better Business Cases guidance (May 2024)
- The Green Book (HM Treasury, 2022 updated)
- Green Book supplementary guidance (optimism bias, distributional weighting, etc.)
- Procurement Act 2023
- Infrastructure and Projects Authority guidance where relevant
- Published government business cases where illustrative

Be specific with numbers (e.g. exact optimism bias percentages from Green Book Annex 6), cite the correct guidance documents, and flag where guidance has been updated. Use UK English.`,

    gap_analysis: `${baseContext}

Your task: Analyse the complete business case content provided and identify gaps against HM Treasury Better Business Cases guidance (May 2024). For each gap:
1. Name the missing element
2. Explain why HMT requires it
3. Tell the user exactly what to do to fill it — including what data/evidence to gather

Structure your response:

CRITICAL GAPS (must fix before submission):
- [gap]: [why required] → [what to do]

SIGNIFICANT GAPS (should fix):
- [gap]: [why required] → [what to do]

RECOMMENDATIONS:
- [any other improvements]

VERDICT: [Overall assessment of readiness for submission]

Be specific about what HMT reviewers look for. Reference specific sections of the May 2024 guidance.`,
  }

  return prompts[action] ?? prompts.draft
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Set it in Supabase Edge Function secrets.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const payload: RequestPayload = await req.json()
    const { action, caseContext, sectionContent, userMessage } = payload

    const systemPrompt = buildSystemPrompt(action, caseContext)

    let userContent = ''
    if (action === 'research') {
      userContent = userMessage ?? 'Please provide general guidance on this topic.'
    } else if (action === 'gap_analysis') {
      userContent = `Here is the complete business case content to analyse:\n\n${sectionContent || '[No content drafted yet]'}`
    } else {
      userContent = sectionContent
        ? `Here is the existing content for this section:\n\n${sectionContent}\n\nPlease ${action === 'draft' ? 'generate a draft' : 'critique this content'}.`
        : `Please ${action === 'draft' ? 'generate a first draft' : 'note that this section has no content yet and generate appropriate content'} for the ${caseContext.sectionKey} section.`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic API error: ${response.status} ${err}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text ?? ''

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
