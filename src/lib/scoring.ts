import type { Lead } from '../types'

export function calculateLeadScore(lead: Lead): number {
  let score = 50
  const total = lead.estimatedAllIn ?? lead.monthlyRent

  if (total !== null) {
    if (total <= 1000) score += 25
    else if (total <= 1150) score += 16
    else if (total <= 1300) score += 6
    else score -= Math.min(24, Math.round((total - 1300) / 50) * 2)
  } else {
    score -= 8
  }

  if (lead.kitchen === 'full') score += 14
  else if (lead.kitchen === 'kitchenette') score += 11
  else if (lead.kitchen === 'shared') score += 2
  else if (lead.kitchen === 'none') score -= 30

  if (lead.petPolicy === 'confirmed') score += 12
  else if (lead.petPolicy === 'likely') score += 5
  else if (lead.petPolicy === 'not-allowed') score -= 40

  if (lead.furnished === true) score += 8
  else if (lead.furnished === false) score -= 10

  if (lead.privacy === 'entire-unit') score += 10
  else if (lead.privacy === 'private-suite') score += 6
  else if (lead.privacy === 'private-room') score -= 4

  if (lead.commuteMinutes !== null) {
    if (lead.commuteMinutes <= 25) score += 8
    else if (lead.commuteMinutes <= 35) score += 4
    else if (lead.commuteMinutes > 45) score -= 8
  }

  if (lead.status === 'rejected') score = Math.min(score, 15)
  if (lead.status === 'shortlist') score += 5
  if (lead.status === 'plan-b') score -= 5

  score -= lead.verificationGaps.length * 2
  return Math.max(0, Math.min(100, score))
}

export function scoreGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 88) return 'A+'
  if (score >= 76) return 'A'
  if (score >= 62) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}

export function formatMoney(value: number | null): string {
  if (value === null) return 'Unknown'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
