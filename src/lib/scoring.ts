import type { Lead, UnitCategory } from '../types'

export type FitTier = 'qualified' | 'promising' | 'research' | 'fallback' | 'disqualified'

export interface ScoreComponent {
  key: 'budget' | 'kitchen' | 'pets' | 'furnishing' | 'housing-type' | 'commute' | 'confidence' | 'verification'
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
  'guest-house': 15,
  'mother-in-law-suite': 14,
  'garage-apartment': 13,
  'furnished-studio': 12,
  'one-bedroom': 11,
  'travel-nurse-housing': 9,
  'private-suite': 8,
  'corporate-housing': 7,
  'conventional-apartment': 5,
  'private-room': 2,
  'inventory-pool': 1,
  other: 4,
}

const categoryLabels: Record<UnitCategory, string> = {
  'guest-house': 'Entire guest house',
  'mother-in-law-suite': 'Mother-in-law suite',
  'garage-apartment': 'Garage apartment',
  'furnished-studio': 'Furnished studio',
  'one-bedroom': 'One-bedroom apartment',
  'travel-nurse-housing': 'Travel nurse housing',
  'corporate-housing': 'Corporate housing',
  'private-suite': 'Private suite',
  'private-room': 'Private room',
  'conventional-apartment': 'Conventional apartment',
  'inventory-pool': 'Inventory pool',
  other: 'Other housing type',
}

export function assessLead(lead: Lead): LeadAssessment {
  const total = lead.estimatedAllIn ?? lead.monthlyRent
  const hardRequirementFailures: string[] = []
  const verificationWarnings: string[] = []

  const budget = budgetComponent(total)
  const kitchen = kitchenComponent(lead)
  const pets = petComponent(lead)
  const furnishing = furnishingComponent(lead)
  const housingType = housingTypeComponent(lead)
  const commute = commuteComponent(lead.commuteMinutes)
  const confidence = confidenceComponent(lead.confidence)
  const verification = verificationComponent(lead.verificationGaps.length)
  const breakdown = [budget, kitchen, pets, furnishing, housingType, commute, confidence, verification]

  if (lead.kitchen === 'none' || lead.kitchen === 'shared') {
    hardRequirementFailures.push(lead.kitchen === 'none' ? 'No qualifying kitchen' : 'Kitchen is shared rather than private')
  } else if (lead.kitchen === 'unknown') {
    verificationWarnings.push('Kitchen or kitchenette is unverified')
  }

  if (lead.petPolicy === 'not-allowed') {
    hardRequirementFailures.push('Two small dogs are not allowed')
  } else if (lead.petPolicy !== 'confirmed') {
    verificationWarnings.push('Approval for two small dogs is unverified')
  }

  if (lead.furnished === false) {
    hardRequirementFailures.push('Unit is unfurnished')
  } else if (lead.furnished === null) {
    verificationWarnings.push('Furnishings are unverified')
  }

  if (total === null) verificationWarnings.push('All-in monthly cost is unverified')
  if (total !== null && total > 1150) verificationWarnings.push('Estimated all-in cost exceeds the stretch target')
  if (lead.commuteMinutes === null) verificationWarnings.push('Commute has not been verified')
  if (lead.privacy === 'inventory-pool' || lead.unitCategory === 'inventory-pool') verificationWarnings.push('This is a search pool, not a specific available unit')

  let score = breakdown.reduce((sum, component) => sum + component.points, 0)
  if (lead.status === 'shortlist') score += 3
  if (lead.status === 'plan-b') score -= 4
  if (lead.status === 'market-benchmark') score -= 7
  if (lead.status === 'search-pool') score -= 10

  if (lead.kitchen === 'shared') score = Math.min(score, 49)
  if (lead.kitchen === 'none') score = Math.min(score, 20)
  if (lead.petPolicy === 'not-allowed') score = Math.min(score, 10)
  if (lead.furnished === false) score = Math.min(score, 59)
  if (lead.privacy === 'inventory-pool' || lead.unitCategory === 'inventory-pool') score = Math.min(score, 45)
  if (total !== null && total > 1500) score = Math.min(score, 40)
  if (lead.status === 'rejected') score = Math.min(score, 10)

  score = Math.max(0, Math.min(100, Math.round(score)))
  const fit = determineFit(lead, score, hardRequirementFailures, verificationWarnings)

  return {
    score,
    grade: scoreGrade(score),
    fit,
    hardRequirementFailures,
    verificationWarnings,
    breakdown,
  }
}

export function calculateLeadScore(lead: Lead): number {
  return assessLead(lead).score
}

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
  if (fit === 'fallback') return 'Plan B'
  if (fit === 'disqualified') return 'Does not qualify'
  return 'Research lead'
}

export function unitCategoryLabel(category: UnitCategory): string {
  return categoryLabels[category]
}

export function formatMoney(value: number | null): string {
  if (value === null) return 'Unknown'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function determineFit(
  lead: Lead,
  score: number,
  hardRequirementFailures: string[],
  verificationWarnings: string[],
): FitTier {
  if (lead.status === 'rejected' || lead.petPolicy === 'not-allowed' || lead.kitchen === 'none') return 'disqualified'
  if (lead.status === 'plan-b' || lead.furnished === false) return 'fallback'
  if (lead.status === 'search-pool' || lead.unitCategory === 'inventory-pool' || lead.privacy === 'inventory-pool') return 'research'
  if (hardRequirementFailures.length > 0 || verificationWarnings.length > 0) return score >= 62 ? 'promising' : 'research'
  return score >= 76 ? 'qualified' : score >= 62 ? 'promising' : 'research'
}

function budgetComponent(total: number | null): ScoreComponent {
  if (total === null) return component('budget', 'Budget value', 4, 24, 'All-in total unknown')
  if (total <= 1000) return component('budget', 'Budget value', 24, 24, 'At or below the $1,000 target')
  if (total <= 1150) return component('budget', 'Budget value', 18, 24, 'Within the exceptional-value stretch range')
  if (total <= 1300) return component('budget', 'Budget value', 8, 24, 'Above the stretch range')
  if (total <= 1500) return component('budget', 'Budget value', 3, 24, 'Materially above target')
  return component('budget', 'Budget value', 0, 24, 'Far above target')
}

function kitchenComponent(lead: Lead): ScoreComponent {
  if (lead.kitchen === 'full') return component('kitchen', 'Kitchen', 18, 18, 'Private full kitchen')
  if (lead.kitchen === 'kitchenette') return component('kitchen', 'Kitchen', 15, 18, 'Private kitchenette')
  if (lead.kitchen === 'shared') return component('kitchen', 'Kitchen', 2, 18, 'Shared kitchen does not meet the operating requirement')
  if (lead.kitchen === 'unknown') return component('kitchen', 'Kitchen', 5, 18, 'Kitchen details need verification')
  return component('kitchen', 'Kitchen', 0, 18, 'No kitchen')
}

function petComponent(lead: Lead): ScoreComponent {
  if (lead.petPolicy === 'confirmed') return component('pets', 'Two-dog policy', 17, 17, 'Two small dogs confirmed')
  if (lead.petPolicy === 'likely') return component('pets', 'Two-dog policy', 10, 17, 'Pets indicated, but two-dog approval is unconfirmed')
  if (lead.petPolicy === 'unknown') return component('pets', 'Two-dog policy', 4, 17, 'Pet policy unknown')
  return component('pets', 'Two-dog policy', 0, 17, 'Dogs not allowed')
}

function furnishingComponent(lead: Lead): ScoreComponent {
  if (lead.furnished === true) return component('furnishing', 'Furnishings', 12, 12, 'Furnished')
  if (lead.furnished === null) return component('furnishing', 'Furnishings', 4, 12, 'Furnishings unverified')
  return component('furnishing', 'Furnishings', 0, 12, 'Unfurnished fallback')
}

function housingTypeComponent(lead: Lead): ScoreComponent {
  return component('housing-type', 'Housing type', categoryPoints[lead.unitCategory], 15, categoryLabels[lead.unitCategory])
}

function commuteComponent(minutes: number | null): ScoreComponent {
  if (minutes === null) return component('commute', 'Commute', 2, 8, 'Commute unverified')
  if (minutes <= 20) return component('commute', 'Commute', 8, 8, 'Excellent commute')
  if (minutes <= 30) return component('commute', 'Commute', 6, 8, 'Preferred commute range')
  if (minutes <= 40) return component('commute', 'Commute', 3, 8, 'Acceptable for strong value')
  return component('commute', 'Commute', 0, 8, 'Outside the preferred radius')
}

function confidenceComponent(confidence: Lead['confidence']): ScoreComponent {
  if (confidence === 'high') return component('confidence', 'Research confidence', 3, 3, 'High-confidence details')
  if (confidence === 'medium') return component('confidence', 'Research confidence', 2, 3, 'Some details still need verification')
  return component('confidence', 'Research confidence', 0, 3, 'Low-confidence lead')
}

function verificationComponent(gapCount: number): ScoreComponent {
  if (gapCount === 0) return component('verification', 'Verification completeness', 3, 3, 'No listed verification gaps')
  if (gapCount <= 2) return component('verification', 'Verification completeness', 2, 3, `${gapCount} open questions`)
  if (gapCount <= 4) return component('verification', 'Verification completeness', 1, 3, `${gapCount} open questions`)
  return component('verification', 'Verification completeness', 0, 3, `${gapCount} open questions`)
}

function component(
  key: ScoreComponent['key'],
  label: string,
  points: number,
  maxPoints: number,
  detail: string,
): ScoreComponent {
  return { key, label, points, maxPoints, detail }
}
