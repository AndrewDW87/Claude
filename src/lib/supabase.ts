import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Running in demo mode.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function callAICopilot(payload: {
  action: 'draft' | 'critique' | 'research' | 'gap_analysis'
  caseContext: Record<string, unknown>
  sectionKey?: string
  sectionContent?: string
  userMessage?: string
  stage: string
}): Promise<{ content: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke('ai-copilot', {
    body: payload,
  })

  if (error) {
    return { content: '', error: error.message }
  }

  return data as { content: string }
}
