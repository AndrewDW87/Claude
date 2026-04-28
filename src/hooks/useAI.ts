import { useState, useCallback } from 'react'
import { callAICopilot } from '@/lib/supabase'
import type { AIActionType, CaseType } from '@/types'
import type { BusinessCase } from '@/types'

interface UseAIReturn {
  loading: boolean
  response: string
  error: string | null
  run: (opts: {
    action: AIActionType
    businessCase: BusinessCase | null
    caseType: CaseType
    sectionKey: string
    sectionContent: string
    userMessage?: string
  }) => Promise<string>
  clear: () => void
}

export function useAI(): UseAIReturn {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async ({
    action,
    businessCase,
    caseType,
    sectionKey,
    sectionContent,
    userMessage,
  }: {
    action: AIActionType
    businessCase: BusinessCase | null
    caseType: CaseType
    sectionKey: string
    sectionContent: string
    userMessage?: string
  }): Promise<string> => {
    setLoading(true)
    setError(null)
    setResponse('')

    const result = await callAICopilot({
      action,
      caseContext: {
        title: businessCase?.title ?? '',
        department: businessCase?.department ?? '',
        stage: businessCase?.current_stage ?? 'SOC',
        sro: businessCase?.sro_name ?? '',
        valueBand: businessCase?.total_value_band ?? '',
        caseType,
        sectionKey,
      },
      sectionKey,
      sectionContent,
      userMessage,
      stage: businessCase?.current_stage ?? 'SOC',
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return ''
    }

    setResponse(result.content)
    return result.content
  }, [])

  const clear = useCallback(() => {
    setResponse('')
    setError(null)
  }, [])

  return { loading, response, error, run, clear }
}
