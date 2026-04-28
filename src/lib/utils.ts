import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `£${(value / 1_000_000_000).toFixed(1)}bn`
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`
  return `£${value.toFixed(0)}`
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    SOC: 'Strategic Outline Case',
    OBC: 'Outline Business Case',
    FBC: 'Full Business Case',
  }
  return labels[stage] ?? stage
}

export function caseTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    strategic: 'Strategic Case',
    economic: 'Economic Case',
    commercial: 'Commercial Case',
    financial: 'Financial Case',
    management: 'Management Case',
  }
  return labels[type] ?? type
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    not_started: 'Not started',
    drafting: 'In progress',
    review: 'Under review',
    complete: 'Complete',
  }
  return labels[status] ?? status
}

export function riskScore(likelihood: number, impact: number): number {
  return likelihood * impact
}

export function riskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 4) return 'low'
  if (score <= 9) return 'medium'
  if (score <= 16) return 'high'
  return 'critical'
}

export function calculateNPSV(
  benefits: number[],
  costs: number[],
  discountRate = 0.035,
): number {
  const totalBenefits = benefits.reduce((sum, b, i) => sum + b / Math.pow(1 + discountRate, i), 0)
  const totalCosts = costs.reduce((sum, c, i) => sum + c / Math.pow(1 + discountRate, i), 0)
  return totalBenefits - totalCosts
}

export function applyOptimismBias(amount: number, biasPct: number): number {
  return amount * (1 + biasPct / 100)
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

export function generateRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
