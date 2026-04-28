import type { Stage, CaseType } from '@/types'

export const STAGES: Stage[] = ['SOC', 'OBC', 'FBC']

export const CASE_TYPES: CaseType[] = [
  'strategic',
  'economic',
  'commercial',
  'financial',
  'management',
]

export const STAGE_DESCRIPTIONS: Record<Stage, string> = {
  SOC: 'Establishes the case for change, strategic fit, longlist of options, and preferred way forward. Approves entry into business planning.',
  OBC: 'Refines analysis, conducts shortlisting, identifies preferred option, sets out commercial/financial/management arrangements. Approves procurement.',
  FBC: 'Finalises after procurement. Confirms affordability, value for money, and deliverability of the negotiated deal. Approves implementation.',
}

export const VALUE_BANDS = [
  'Under £1m',
  '£1m – £5m',
  '£5m – £10m',
  '£10m – £50m',
  '£50m – £100m',
  '£100m – £500m',
  'Over £500m',
]

export const DEPARTMENTS = [
  'Cabinet Office',
  'Department for Business and Trade',
  'Department for Culture, Media and Sport',
  'Department for Education',
  'Department for Energy Security and Net Zero',
  'Department for Environment, Food and Rural Affairs',
  'Department for Health and Social Care',
  'Department for Science, Innovation and Technology',
  'Department for Transport',
  'Department for Work and Pensions',
  'Foreign, Commonwealth and Development Office',
  'HM Revenue & Customs',
  'HM Treasury',
  'Home Office',
  'Ministry of Defence',
  'Ministry of Housing, Communities and Local Government',
  'Ministry of Justice',
  'NHS England',
  'Other',
]

export const RISK_CATEGORIES = [
  'Strategic',
  'Operational',
  'Financial',
  'Commercial',
  'Legal/Regulatory',
  'Technical',
  'Reputational',
  'People/Capability',
  'Programme/Project',
]

export const BENEFIT_CATEGORIES = [
  'Financial savings',
  'Efficiency gains',
  'Service quality improvement',
  'User satisfaction',
  'Risk reduction',
  'Compliance',
  'Policy outcome',
  'Environmental',
  'Social value',
]

export const OPTIONS_FRAMEWORK_DIMENSIONS = [
  {
    key: 'scope',
    label: 'Scope',
    description: 'What is included in or excluded from the programme/project',
    positions: ['Do nothing (BAU)', 'Minimum change', 'Intermediate change', 'Maximum change'],
  },
  {
    key: 'service_solution',
    label: 'Service Solution',
    description: 'The technical and service design approach',
    positions: ['Do nothing (BAU)', 'Minimum change', 'Intermediate change', 'Maximum change'],
  },
  {
    key: 'service_delivery',
    label: 'Service Delivery',
    description: 'How services will be delivered and by whom',
    positions: ['Do nothing (BAU)', 'Minimum change', 'Intermediate change', 'Maximum change'],
  },
  {
    key: 'implementation',
    label: 'Implementation',
    description: 'The approach to delivering the change',
    positions: ['Do nothing (BAU)', 'Minimum change', 'Intermediate change', 'Maximum change'],
  },
  {
    key: 'funding',
    label: 'Funding',
    description: 'How the programme/project will be funded',
    positions: ['Do nothing (BAU)', 'Minimum change', 'Intermediate change', 'Maximum change'],
  },
] as const

export const CRITICAL_SUCCESS_FACTORS = [
  {
    id: 'strategic_fit',
    label: 'Strategic Fit',
    description: 'The degree to which the options under consideration are in line with the existing strategies and policies of the organisation.',
  },
  {
    id: 'potential_vfm',
    label: 'Potential Value for Money',
    description: 'The degree to which the options under consideration offer potential value for money in terms of cost, quality and time.',
  },
  {
    id: 'supplier_capability',
    label: 'Supplier Capacity and Capability',
    description: 'The degree to which the options under consideration are likely to be deliverable by the market.',
  },
  {
    id: 'potential_affordability',
    label: 'Potential Affordability',
    description: 'The degree to which the options under consideration are likely to be affordable to the organisation.',
  },
  {
    id: 'potential_achievability',
    label: 'Potential Achievability',
    description: 'The degree to which the options under consideration are likely to be achievable given existing plans, capacity and capability.',
  },
] as const

export const GREEN_BOOK_DISCOUNT_RATE = 0.035

export const OPTIMISM_BIAS_RATES: Record<string, number> = {
  'Standard civil engineering': 44,
  'Non-standard civil engineering': 66,
  'Standard buildings': 24,
  'Non-standard buildings': 51,
  'Equipment/development': 54,
  'Outsourcing': 41,
  'IT-enabled business change': 37,
  'Organisation and change management': 37,
  'Development': 43,
}
