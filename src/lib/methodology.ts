import type { SectionDefinition, CaseType, Stage } from '@/types'

const STRATEGIC_SECTIONS: SectionDefinition[] = [
  {
    key: 'strategic_context',
    title: 'Strategic Context',
    description: 'Provides the organisational setting and demonstrates alignment with wider government priorities.',
    guidance: `Describe the organisational context, including the department's mission and relevant strategies. Demonstrate clear alignment with cross-government priorities (e.g., Spending Review commitments, departmental plans). Reference any relevant national strategies or policy frameworks. This section sets the scene for everything that follows — a reviewer should understand exactly where this proposal sits in the broader policy landscape.`,
    placeholder: 'Describe the organisational context, relevant government priorities, and how this proposal aligns with departmental strategy...',
    required: true,
  },
  {
    key: 'case_for_change',
    title: 'Case for Change',
    description: 'Demonstrates the problem or opportunity that justifies public spending.',
    guidance: `Set out the current situation and explain what is wrong with the status quo. Use evidence — data, performance metrics, user research, audit findings — to substantiate the need for change. Quantify the problem where possible. The case for change must be compelling and evidence-based; narrative assertions without supporting data will not satisfy HM Treasury reviewers.`,
    placeholder: 'Describe the current situation, the problems with the status quo, and the evidence base for change...',
    required: true,
  },
  {
    key: 'spending_objectives',
    title: 'Spending Objectives',
    description: 'SMART objectives that define what the investment is intended to achieve.',
    guidance: `Set out 3–6 spending objectives that are Specific, Measurable, Achievable, Relevant and Time-bound (SMART). Objectives should focus on outcomes, not activities. Each objective should be testable — you must be able to demonstrate at the end whether it has been achieved. Avoid vague language. These objectives will be used throughout the business case to assess options and measure benefits.`,
    placeholder: 'List your SMART spending objectives (e.g. "Reduce average processing time from 15 days to 5 days by April 2027")...',
    required: true,
  },
  {
    key: 'existing_arrangements',
    title: 'Existing Arrangements and Business Needs',
    description: 'Describes the current state and what the business requires.',
    guidance: `Describe the existing arrangements in detail: current systems, processes, contracts, staffing, and their performance. Set out the business needs — what the organisation requires from any solution. This section forms the baseline against which options will be assessed and should be factual and specific.`,
    placeholder: 'Describe existing arrangements, current contracts, systems, processes, and the specific business needs that must be met...',
    required: true,
  },
  {
    key: 'potential_scope',
    title: 'Potential Business Scope',
    description: 'Defines the broad scope and key service requirements.',
    guidance: `Set out the potential scope of the programme or project — what is in scope and what is out of scope. Describe the key service requirements at a high level. This should not pre-empt the options analysis but should define the boundaries within which options will be considered. Include any key constraints (legal, technical, geographic) that limit the scope.`,
    placeholder: 'Describe the potential scope, key service requirements, and any constraints that define the boundaries of the proposal...',
    required: true,
  },
  {
    key: 'main_benefits',
    title: 'Main Benefits and Success Criteria',
    description: 'Outlines the anticipated benefits and how success will be measured.',
    guidance: `Provide a high-level summary of the main expected benefits. Link to your benefits register for detail. Set out the key success criteria — how you will know if the programme has succeeded. At SOC stage these can be preliminary; they will be developed in detail in the OBC. Include both monetisable and non-monetisable benefits.`,
    placeholder: 'Describe the anticipated benefits (financial and non-financial) and the criteria by which success will be judged...',
    required: true,
  },
  {
    key: 'main_risks',
    title: 'Main Risks',
    description: 'Identifies the key risks at this stage.',
    guidance: `Identify the main risks associated with the proposal at this stage — strategic risks, delivery risks, and risks of not acting. Link to your risks register for full detail. For each risk, note the potential impact and any initial mitigation thinking. At SOC stage this is a preliminary risk assessment; it will be developed into a full risk register in the OBC.`,
    placeholder: 'Describe the main risks, their potential impact, and initial mitigation thinking...',
    required: true,
  },
  {
    key: 'constraints_dependencies',
    title: 'Constraints and Dependencies',
    description: 'Sets out limitations and linkages to other programmes or decisions.',
    guidance: `List the constraints that must be respected (legal requirements, policy boundaries, budget caps, timescales set externally). List the dependencies — other programmes, decisions, or external factors that this proposal depends on or that depend on it. Be specific: vague references to "dependencies with other projects" are not helpful.`,
    placeholder: 'List constraints (legal, financial, technical, policy) and dependencies on or from other programmes or external decisions...',
    required: true,
  },
]

const ECONOMIC_SECTIONS: SectionDefinition[] = [
  {
    key: 'critical_success_factors',
    title: 'Critical Success Factors',
    description: 'The five standard CSFs used to assess and weight options.',
    guidance: `Set out the five Critical Success Factors (CSFs): Strategic Fit, Potential Value for Money, Supplier Capacity and Capability, Potential Affordability, and Potential Achievability. For each CSF, describe what "success" means in the context of this specific programme. Assign a relative weighting to each CSF (totalling 100%). These weightings will be used in the options appraisal. Be prepared to justify your weightings.`,
    placeholder: 'Describe each of the five CSFs in the context of this programme and assign relative weightings...',
    required: true,
  },
  {
    key: 'longlist_options',
    title: 'Longlist Options Analysis',
    description: 'The Options Framework analysis generating a longlist of options.',
    guidance: `Use the Options Framework to generate a longlist of options by varying five dimensions: Scope, Service Solution, Service Delivery, Implementation, and Funding. For each dimension, identify the realistic positions from Do Nothing through to Maximum Change. Combine positions across dimensions to create a longlist of viable options. Use the options register to document all longlist options. Filter against the CSFs to identify a shortlist of 3–6 options for detailed appraisal. Document the rationale for any options discounted at longlist stage.`,
    placeholder: 'Describe the longlist options generated from the Options Framework and the rationale for shortlisting...',
    required: true,
  },
  {
    key: 'economic_appraisal',
    title: 'Economic Appraisal',
    description: 'Social cost-benefit analysis of shortlisted options.',
    guidance: `For each shortlisted option, set out the monetised costs and benefits. Apply the HM Treasury Green Book discount rate (3.5% real) to calculate Net Present Social Value (NPSV). Apply optimism bias in line with Green Book guidance and HM Treasury supplementary guidance (use the costs register). Conduct sensitivity analysis — test how the NPSV changes under different assumptions. Calculate switching values. Assess non-monetised costs and benefits. The preferred option should maximise NPSV unless there are clearly evidenced reasons to prefer another option.`,
    placeholder: 'Present the economic appraisal including NPSVs, sensitivity analysis, and switching values for each shortlisted option...',
    required: true,
  },
  {
    key: 'non_monetised',
    title: 'Non-Monetised Costs and Benefits',
    description: 'Assessment of impacts that cannot be reliably monetised.',
    guidance: `Identify all material costs and benefits that cannot be reliably monetised. Use qualitative assessment — a simple scoring matrix against the CSFs is acceptable. Explain why monetisation was not possible. Ensure this assessment feeds into the overall option recommendation alongside the NPSV calculation.`,
    placeholder: 'Describe non-monetised impacts and how they are assessed qualitatively...',
    required: false,
  },
  {
    key: 'preferred_option',
    title: 'Preferred Option Recommendation',
    description: 'The recommended option with clear justification.',
    guidance: `State clearly which option is recommended as the preferred option and why. The justification must reference the NPSV analysis, CSF assessment, and any non-monetised factors. If the recommended option is not the one with the highest NPSV, explain clearly why — this is permissible but must be robustly justified. Set out what further analysis will be conducted in the OBC/FBC.`,
    placeholder: 'State and justify the preferred option, referencing the economic appraisal and CSF assessment...',
    required: true,
  },
]

const COMMERCIAL_SECTIONS: SectionDefinition[] = [
  {
    key: 'procurement_strategy',
    title: 'Procurement Strategy',
    description: 'The route to market and commercial approach.',
    guidance: `Set out the proposed procurement strategy. Reference the Procurement Act 2023 (which replaced the Public Contracts Regulations 2015) and identify the appropriate procedure: competitive flexible procedure, open procedure, framework agreement, dynamic purchasing system, or other. Consider whether Crown Commercial Service frameworks are appropriate. Address supplier market capacity and any market engagement planned. Describe how the specification will be output-based.`,
    placeholder: 'Describe the procurement approach, relevant Procurement Act 2023 procedure, and market strategy...',
    required: true,
  },
  {
    key: 'output_specification',
    title: 'Output-Based Specification',
    description: 'How service requirements will be specified.',
    guidance: `Describe how requirements will be specified in outcome/output terms rather than prescribing solutions. This encourages supplier innovation and supports competitive tendering. Identify any technical standards or interoperability requirements. Note any intellectual property considerations.`,
    placeholder: 'Describe the approach to output-based specification and key requirements...',
    required: true,
  },
  {
    key: 'risk_allocation',
    title: 'Risk Allocation',
    description: 'How risks will be allocated between authority and supplier.',
    guidance: `Set out the proposed risk allocation between the authority and supplier. The principle is that risk should be allocated to the party best able to manage it. Link to the risks register and indicate for each significant risk whether it is borne by the authority, the supplier, or shared. Avoid transferring risks that the supplier cannot manage — this simply increases cost without improving VfM.`,
    placeholder: 'Describe the risk allocation approach and the basis for allocating key risks...',
    required: true,
  },
  {
    key: 'payment_mechanisms',
    title: 'Charging and Payment Mechanisms',
    description: 'How the supplier will be paid and incentivised.',
    guidance: `Describe the proposed payment mechanism. Consider how payment will be linked to performance and outcomes. For PFI/PF2 or complex service contracts, include the payment mechanism design. For simpler contracts, describe the pricing approach (fixed price, schedule of rates, time and materials, etc.) and any KPIs linked to payment.`,
    placeholder: 'Describe the payment mechanism and performance incentive structure...',
    required: true,
  },
  {
    key: 'contract_length',
    title: 'Contract Length and Key Terms',
    description: 'Duration and key contractual arrangements.',
    guidance: `Specify the proposed contract term and justify its length. Longer contracts reduce transaction costs but reduce flexibility; shorter contracts enable re-competition but increase procurement overhead. Set out key contractual provisions: break clauses, step-in rights, change mechanisms, exit arrangements, dispute resolution, and GDPR/data handling requirements.`,
    placeholder: 'Describe the proposed contract length, justification, and key contractual provisions...',
    required: true,
  },
  {
    key: 'personnel',
    title: 'Personnel Implications',
    description: 'TUPE and people considerations.',
    guidance: `Assess whether TUPE (Transfer of Undertakings (Protection of Employment) Regulations) applies. If so, describe the obligations and how they will be managed. Consider implications for civil service terms and conditions, Fair Deal, and any pension transfer issues. Describe any workforce management or restructuring plans.`,
    placeholder: 'Describe TUPE applicability, workforce transfer arrangements, and people implications...',
    required: false,
  },
  {
    key: 'accountancy_treatment',
    title: 'Accountancy Treatment',
    description: 'Balance sheet and accounting classification.',
    guidance: `Set out the proposed accounting treatment: whether the arrangement will be on or off the public sector balance sheet, and the rationale. Reference IFRS 16 for leases and IFRS 10 for consolidation where relevant. Include the finance director's assessment. HM Treasury will need to approve any off-balance-sheet treatment for significant arrangements.`,
    placeholder: 'Describe the accounting treatment, balance sheet position, and relevant IFRS implications...',
    required: true,
  },
]

const FINANCIAL_SECTIONS: SectionDefinition[] = [
  {
    key: 'capital_revenue',
    title: 'Capital and Revenue Requirements',
    description: 'The full cost profile by year and type.',
    guidance: `Set out the full cost profile of the preferred option by year, distinguishing capital from revenue expenditure. Include optimism bias (applied to costs before discounting). Use the costs register as the underlying data. Present costs in both real and nominal terms where material. The time horizon should cover the full economic life of the project (at minimum the contract term).`,
    placeholder: 'Describe the capital and revenue cost profile, referencing the costs register...',
    required: true,
  },
  {
    key: 'affordability',
    title: 'Overall Affordability',
    description: 'Confirmation that costs are within approved budget.',
    guidance: `Confirm that the proposal is affordable within existing spending review settlements or identify new funding required. Map costs against budget lines. Describe how any funding gap will be resolved. Include a statement from the Senior Finance Officer confirming affordability. Note any impact on departmental Annually Managed Expenditure (AME) or Departmental Expenditure Limit (DEL) baselines.`,
    placeholder: 'Confirm affordability against budget settlements and describe funding sources...',
    required: true,
  },
  {
    key: 'funding_sources',
    title: 'Funding Sources',
    description: 'Where the money is coming from.',
    guidance: `Identify all funding sources: departmental DEL/AME budgets, cross-departmental funding, external grants, commercial income, or other. For each source, confirm the status (agreed/provisional/subject to approval) and the authority to commit. Include UKEF, lottery, or other third-party funding arrangements where relevant.`,
    placeholder: 'List all funding sources with status and confirm authority to commit...',
    required: true,
  },
  {
    key: 'finance_director',
    title: 'Statement of Finance Director Support',
    description: 'Formal sign-off from the Senior Finance Officer.',
    guidance: `Include a statement from the departmental or organisational Senior Finance Officer (SFO) confirming: (1) the financial information is accurate; (2) the proposal is affordable; (3) the accounting treatment is appropriate; (4) they support the business case proceeding. This is a mandatory HMT requirement.`,
    placeholder: 'Include the Finance Director\'s statement of support, covering accuracy, affordability, and accounting treatment...',
    required: true,
  },
]

const MANAGEMENT_SECTIONS: SectionDefinition[] = [
  {
    key: 'governance',
    title: 'Programme/Project Governance',
    description: 'The governance structure and key roles.',
    guidance: `Set out the governance structure: the Senior Responsible Owner (SRO), Programme/Project Board, and any sub-committees. Describe reporting lines and escalation routes. Identify the SRO by name and confirm they have the authority and capacity to fulfil the role. Reference the Infrastructure and Projects Authority (IPA) project classification and any Gateway Review requirements. Describe how assurance reviews will be incorporated.`,
    placeholder: 'Describe the governance structure, SRO, project board composition, and assurance review schedule...',
    required: true,
  },
  {
    key: 'project_plan',
    title: 'Project Plan and Milestones',
    description: 'High-level timeline and key milestones.',
    guidance: `Present a high-level project plan covering key milestones from business case approval through to benefits realisation. Include procurement milestones, key decision points, and dependencies. At SOC/OBC stage, indicative timescales are acceptable; the FBC should contain a detailed plan. Identify the critical path. Note any fixed external deadlines.`,
    placeholder: 'Present key milestones, indicative timescales, and the critical path...',
    required: true,
  },
  {
    key: 'change_management',
    title: 'Change Management',
    description: 'How the organisation will manage the transition.',
    guidance: `Describe the approach to managing organisational change — communications, training, stakeholder engagement, and cultural change. Identify who is responsible for change management. Set out how the organisation will support staff through the transition. Reference any specific methodologies (e.g. PROSCI, Kotter) where used.`,
    placeholder: 'Describe the change management approach, stakeholder engagement, and training plans...',
    required: true,
  },
  {
    key: 'benefits_realisation',
    title: 'Benefits Realisation',
    description: 'How benefits will be tracked and realised.',
    guidance: `Describe the arrangements for benefits realisation management. Link to the benefits register. Set out who owns each benefit, how it will be measured, and when it is expected to be realised. Describe the benefits tracking mechanism and reporting arrangements. Reference the Magenta Book for evaluation approaches where applicable.`,
    placeholder: 'Describe benefits ownership, measurement, tracking mechanisms, and reporting arrangements...',
    required: true,
  },
  {
    key: 'risk_management',
    title: 'Risk Management',
    description: 'The approach to ongoing risk management.',
    guidance: `Describe the risk management arrangements: risk registers (link to the risks register), risk appetite, escalation process, and ownership. Set out how risks will be reviewed and updated throughout the programme lifecycle. Identify any insurance arrangements and contingency provisions.`,
    placeholder: 'Describe risk management arrangements, including governance, appetite, and escalation processes...',
    required: true,
  },
  {
    key: 'evaluation',
    title: 'Post-Implementation Evaluation',
    description: 'How the programme will be evaluated against its objectives.',
    guidance: `Set out the arrangements for post-implementation evaluation, referencing the Magenta Book (HM Treasury's guidance on evaluation). Describe the evaluation methodology, who will conduct it, when, and how findings will be published. Link evaluation back to the spending objectives and benefits register. For significant programmes, a formal evaluation plan should be agreed with HM Treasury.`,
    placeholder: 'Describe the evaluation approach, methodology, timeline, and governance for post-implementation review...',
    required: true,
  },
  {
    key: 'contingency',
    title: 'Contingency Plans',
    description: 'Fallback arrangements if the programme fails.',
    guidance: `Set out contingency plans for the main failure scenarios. What happens if the procurement fails? What are the exit provisions from any contract? What is the fallback position if the preferred option is not deliverable? These plans should be realistic and costed where possible.`,
    placeholder: 'Describe contingency plans for key failure scenarios, including procurement failure and contract exit...',
    required: true,
  },
]

export const CASE_SECTIONS: Record<CaseType, SectionDefinition[]> = {
  strategic: STRATEGIC_SECTIONS,
  economic: ECONOMIC_SECTIONS,
  commercial: COMMERCIAL_SECTIONS,
  financial: FINANCIAL_SECTIONS,
  management: MANAGEMENT_SECTIONS,
}

export const SECTION_AI_PROMPTS: Record<string, Record<string, string>> = {
  draft: {
    strategic_context: 'Generate a strategic context section that sets out the organisational background and demonstrates alignment with government priorities. Use the case metadata provided.',
    case_for_change: 'Draft a compelling case for change section. Structure it as: (1) Current situation, (2) Problems with status quo (with evidence), (3) Cost of inaction, (4) Opportunity or imperative for change.',
    spending_objectives: 'Generate 4–6 SMART spending objectives appropriate for this type of programme. Each objective should be specific, measurable, achievable, relevant, and time-bound.',
    default: 'Generate draft content for this business case section following HM Treasury Better Business Cases guidance (May 2024). Use the case context to make the content specific and evidence-based.',
  },
  critique: {
    default: 'Assess this content against HM Treasury Better Business Cases guidance. Return: (1) Score 1–5 with justification, (2) Strengths, (3) Weaknesses and missing elements, (4) Specific improvements needed.',
  },
}

export function getSectionsForStage(caseType: CaseType, stage: Stage): SectionDefinition[] {
  const all = CASE_SECTIONS[caseType]
  if (stage === 'SOC') return all.filter((s) => s.required)
  return all
}

export function getAllSections(): { caseType: CaseType; section: SectionDefinition }[] {
  return CASE_TYPES_ORDER.flatMap((caseType) =>
    CASE_SECTIONS[caseType].map((section) => ({ caseType, section })),
  )
}

const CASE_TYPES_ORDER: CaseType[] = [
  'strategic',
  'economic',
  'commercial',
  'financial',
  'management',
]
