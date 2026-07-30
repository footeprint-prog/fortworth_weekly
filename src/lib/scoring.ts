import type { Lead, UnitCategory } from '../types'
import { searchCriteria } from '../config/searchCriteria'
import { hasDirectSource, hasUsableContact, isActionable } from './actionability'

export type FitTier = 'qualified' | 'promising' | 'research' | 'fallback' | 'disqualified'

export interface ScoreComponent {
  key: 'budget' | 'kitchen' | 'pets' | 'furnishing' | 'lease-term' | 'housing-type' | 'commute' | 'actionability' | 'confidence' | 'verification'
  label: string
  points: number
  maxPoints: number
  detail: string
}

export interface LeadAssessment {
  score: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'
  fit: FitTier
  hardRequirementFailures: string[]
  verificationWarnings: string[]
  breakdown: ScoreComponent[]
}

const categoryPoints: Record<UnitCategory, number> = {
  'guest-house': 10, 'mother-in-law-suite': 10, 'garage-apartment': 9, 'furnished-studio': 9,
  'one-bedroom': 8, 'travel-nurse-housing': 7, 'private-suite': 6, 'corporate-housing': 5,
  'conventional-apartment': 4, 'private-room': 2, 'inventory-pool': 1, other: 3,
}

const categoryLabels: Record<UnitCategory, string> = {
  'guest-house': 'Entire guest house', 'mother-in-law-suite': 'Mother-in-law suite',
  'garage-apartment': 'Garage apartment', 'furnished-studio': 'Furnished studio',
  'one-bedroom': 'One-bedroom apartment', 'travel-nurse-housing': 'Travel nurse housing',
  'corporate-housing': 'Corporate housing', 'private-suite': 'Private suite', 'private-room': 'Private room',
  'conventional-apartment': 'Conventional apartment', 'inventory-pool': 'Inventory pool', other: 'Other housing type',
}

export function assessLead(lead: Lead): LeadAssessment {
  const total = lead.estimatedAllIn ?? lead.monthlyRent
  const hardRequirementFailures: string[] = []
  const verificationWarnings: string[] = []
  const breakdown = [
    budgetComponent(total), kitchenComponent(lead), petComponent(lead), furnishingComponent(lead),
    leaseTermComponent(lead), housingTypeComponent(lead), commuteComponent(lead.commuteMinutes),
    actionabilityComponent(lead), confidenceComponent(lead.confidence), verificationComponent(lead.verificationGaps.length),
  ]

  if (lead.kitchen === 'none' || lead.kitchen === 'shared') hardRequirementFailures.push(lead.kitchen === 'none' ? 'No qualifying kitchen' : 'Kitchen is shared rather than private')
  else if (lead.kitchen === 'unknown') verificationWarnings.push('Private kitchen or kitchenette is unverified')

  if (lead.petPolicy === 'not-allowed') hardRequirementFailures.push('Two small dogs are not allowed')
  else if (lead.petPolicy !== 'confirmed') verificationWarnings.push('Approval for two small dogs is unverified')

  if (lead.furnished === false) hardRequirementFailures.push('Unit is unfurnished')
  else if (lead.furnished === null) verificationWarnings.push('Furnishings are unverified')

  if (lead.leaseTermCategory === '12-plus') hardRequirementFailures.push('Requires a 12-month or longer term')
  else if (!['confirmed-3-6', 'under-12', 'flexible'].includes(lead.leaseTermCategory)) verificationWarnings.push('A term under one year is unverified')

  if (!hasDirectSource(lead) || !lead.sourceVerified) verificationWarnings.push('Direct listing URL is missing or unverified')
  if (!hasUsableContact(lead) || !lead.contactVerified) verificationWarnings.push('Direct contact or inquiry channel is missing or unverified')
  if (total === null) verificationWarnings.push('All-in monthly cost is unverified')
  if (total !== null && total > searchCriteria.stretchAllIn) verificationWarnings.push('Estimated all-in cost exceeds the stretch target')
  if (lead.commuteMinutes === null) verificationWarnings.push('Commute has not been verified')
  else if (lead.commuteMinutes > searchCriteria.maxCommuteMinutes) hardRequirementFailures.push(`Commute exceeds the ${searchCriteria.maxCommuteMinutes}-minute maximum`)
  if (lead.privacy === 'inventory-pool' || lead.unitCategory === 'inventory-pool') verificationWarnings.push('This is a search pool, not a specific available unit')

  let score = breakdown.reduce((sum, item) => sum + item.points, 0)
  if (lead.status === 'shortlist') score += 3
  if (lead.status === 'plan-b') score -= 3
  if (lead.status === 'market-benchmark') score -= 6
  if (lead.status === 'search-pool') score -= 8
  if (lead.petPolicy === 'not-allowed' || lead.kitchen === 'shared' || lead.furnished === false || lead.leaseTermCategory === '12-plus' || (lead.commuteMinutes !== null && lead.commuteMinutes > searchCriteria.maxCommuteMinutes)) score = Math.min(score, 55)
  if (lead.kitchen === 'none') score = Math.min(score, 20)
  if (!isActionable(lead)) score = Math.min(score, 69)
  if (lead.privacy === 'inventory-pool' || lead.unitCategory === 'inventory-pool') score = Math.min(score, 45)
  if (total !== null && total > 1500) score = Math.min(score, 40)
  if (lead.status === 'rejected') score = Math.min(score, 10)

  score = Math.max(0, Math.min(100, Math.round(score)))
  return { score, grade: scoreGrade(score), fit: determineFit(lead, score), hardRequirementFailures, verificationWarnings, breakdown }
}

export function calculateLeadScore(lead: Lead): number { return assessLead(lead).score }
export function scoreGrade(score: number): LeadAssessment['grade'] {
  if (score >= 88) return 'A+'
  if (score >= 76) return 'A'
  if (score >= 62) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}
export function fitLabel(fit: FitTier): string {
  if (fit === 'qualified') return 'Requirement-ready'
  if (fit === 'promising') return 'Promising'
  if (fit === 'fallback') return 'Explicit fallback'
  if (fit === 'disqualified') return 'Does not qualify'
  return 'Research lead'
}
export function unitCategoryLabel(category: UnitCategory): string { return categoryLabels[category] }
export function formatMoney(value: number | null): string {
  if (value === null) return 'Unknown'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function determineFit(lead: Lead, score: number): FitTier {
  if (lead.status === 'rejected' || lead.kitchen === 'none') return 'disqualified'
  if (lead.petPolicy === 'not-allowed' || lead.kitchen === 'shared' || lead.furnished === false || lead.leaseTermCategory === '12-plus' || (lead.commuteMinutes !== null && lead.commuteMinutes > searchCriteria.maxCommuteMinutes) || lead.status === 'plan-b') return 'fallback'
  if (lead.status === 'search-pool' || lead.unitCategory === 'inventory-pool' || lead.privacy === 'inventory-pool') return 'research'
  if (lead.petPolicy !== 'confirmed' || lead.kitchen === 'unknown' || lead.furnished === null || lead.leaseTermCategory === 'unknown' || !isActionable(lead)) return 'research'
  if (lead.leaseTermCategory === 'flexible') return score >= 62 ? 'promising' : 'research'
  return score >= 76 ? 'qualified' : score >= 62 ? 'promising' : 'research'
}

function budgetComponent(total: number | null): ScoreComponent {
  if (total === null) return component('budget', 'Budget value', 3, 20, 'All-in total unknown')
  if (total <= searchCriteria.targetAllIn) return component('budget', 'Budget value', 20, 20, `At or below the $${searchCriteria.targetAllIn.toLocaleString()} target`)
  if (total <= searchCriteria.stretchAllIn) return component('budget', 'Budget value', 15, 20, 'Within the stretch range')
  if (total <= 1300) return component('budget', 'Budget value', 7, 20, 'Above the stretch range')
  if (total <= 1500) return component('budget', 'Budget value', 2, 20, 'Materially above target')
  return component('budget', 'Budget value', 0, 20, 'Far above target')
}
function kitchenComponent(lead: Lead): ScoreComponent {
  if (lead.kitchen === 'full') return component('kitchen', 'Kitchen', 15, 15, 'Private full kitchen')
  if (lead.kitchen === 'kitchenette') return component('kitchen', 'Kitchen', 13, 15, 'Private kitchenette')
  if (lead.kitchen === 'shared') return component('kitchen', 'Kitchen', 2, 15, 'Shared-kitchen comparison only')
  if (lead.kitchen === 'unknown') return component('kitchen', 'Kitchen', 4, 15, 'Kitchen details need verification')
  return component('kitchen', 'Kitchen', 0, 15, 'No kitchen')
}
function petComponent(lead: Lead): ScoreComponent {
  if (lead.petPolicy === 'confirmed') return component('pets', 'Two-dog policy', 15, 15, 'Two small dogs confirmed')
  if (lead.petPolicy === 'likely') return component('pets', 'Two-dog policy', 7, 15, 'Pet-friendly claim; two dogs unconfirmed')
  if (lead.petPolicy === 'unknown') return component('pets', 'Two-dog policy', 3, 15, 'Pet policy unclear')
  return component('pets', 'Two-dog policy', 0, 15, 'Dogs not allowed; fallback only')
}
function furnishingComponent(lead: Lead): ScoreComponent {
  if (lead.furnished === true) return component('furnishing', 'Furnishings', 10, 10, 'Furnished')
  if (lead.furnished === null) return component('furnishing', 'Furnishings', 3, 10, 'Furnishings unverified')
  return component('furnishing', 'Furnishings', 0, 10, 'Unfurnished fallback')
}
function leaseTermComponent(lead: Lead): ScoreComponent {
  if (lead.leaseTermCategory === 'confirmed-3-6') return component('lease-term', 'Lease term', 15, 15, '3–6 month term confirmed')
  if (lead.leaseTermCategory === 'flexible') return component('lease-term', 'Lease term', 12, 15, 'Flexible term; confirm exact dates')
  if (lead.leaseTermCategory === 'under-12') return component('lease-term', 'Lease term', 10, 15, 'Term under one year confirmed')
  if (lead.leaseTermCategory === 'unknown') return component('lease-term', 'Lease term', 3, 15, 'Term needs verification')
  return component('lease-term', 'Lease term', 0, 15, '12 months or longer; fallback only')
}
function housingTypeComponent(lead: Lead): ScoreComponent { return component('housing-type', 'Housing type', categoryPoints[lead.unitCategory], 10, categoryLabels[lead.unitCategory]) }
function commuteComponent(minutes: number | null): ScoreComponent {
  if (minutes === null) return component('commute', 'Commute', 1, 5, 'Commute unverified')
  if (minutes <= searchCriteria.maxCommuteMinutes) return component('commute', 'Commute', 5, 5, `Within the ${searchCriteria.maxCommuteMinutes}-minute commute limit`)
  return component('commute', 'Commute', 0, 5, `Exceeds the ${searchCriteria.maxCommuteMinutes}-minute commute limit`)
}
function actionabilityComponent(lead: Lead): ScoreComponent {
  const source = hasDirectSource(lead) && lead.sourceVerified
  const contact = hasUsableContact(lead) && lead.contactVerified
  if (source && contact) return component('actionability', 'Actionability', 6, 6, 'Direct source and contact verified')
  if (source || contact) return component('actionability', 'Actionability', 2, 6, source ? 'Contact needs verification' : 'Direct source needs verification')
  return component('actionability', 'Actionability', 0, 6, 'Direct source and contact are incomplete')
}
function confidenceComponent(confidence: Lead['confidence']): ScoreComponent {
  return component('confidence', 'Research confidence', confidence === 'high' ? 2 : confidence === 'medium' ? 1 : 0, 2, `${confidence} confidence`)
}
function verificationComponent(count: number): ScoreComponent {
  return component('verification', 'Verification completeness', count === 0 ? 2 : count <= 2 ? 1 : 0, 2, count === 0 ? 'No listed gaps' : `${count} open questions`)
}
function component(key: ScoreComponent['key'], label: string, points: number, maxPoints: number, detail: string): ScoreComponent { return { key, label, points, maxPoints, detail } }
