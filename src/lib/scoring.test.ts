import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { assessLead, calculateLeadScore, scoreGrade } from './scoring'

const baseLead: Lead = {
  id: 'T-1', title: 'Test', area: 'Benbrook', propertyType: 'Guest house', unitCategory: 'guest-house', privacy: 'entire-unit',
  address: '123 Main St', monthlyRent: 1000, mandatoryFeesMonthly: 0, utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0, parkingCostMonthly: 0,
  estimatedAllIn: 1000, upfrontCosts: 'None', kitchen: 'full', kitchenDetails: 'Full kitchen', furnished: true,
  petPolicy: 'confirmed', petDetails: 'Two dogs allowed', parking: 'Driveway', minStay: '3 months', leaseTermMinMonths: 3, leaseTermMaxMonths: 6, leaseTermCategory: 'confirmed-3-6', sublet: false, leaseTakeover: false, ownerDirect: true,
  availability: 'Available', availableFrom: null, commuteMinutes: 18, contactName: 'Host', contactMethod: 'Listing inquiry', phone: '', email: '',
  sourceName: 'Test', sourceUrl: 'https://example.com/listing/1', contactVerified: true, sourceVerified: true, lastChecked: '2026-07-16', status: 'new', confidence: 'high', priority: 'high',
  nextAction: '', notes: '', verificationGaps: [], tags: [], history: [],
}

describe('lead scoring', () => {
  it('rewards an on-budget private furnished guest house with confirmed dogs and a full kitchen', () => {
    const assessment = assessLead(baseLead)
    expect(assessment.score).toBeGreaterThanOrEqual(88)
    expect(assessment.grade).toBe('A+')
    expect(assessment.fit).toBe('qualified')
  })

  it('caps a shared-kitchen lead because a private kitchenette is required', () => {
    const assessment = assessLead({ ...baseLead, kitchen: 'shared' })
    expect(assessment.score).toBeLessThanOrEqual(55)
    expect(assessment.hardRequirementFailures).toContain('Kitchen is shared rather than private')
  })

  it('penalizes no kitchen and no pets', () => {
    const assessment = assessLead({ ...baseLead, kitchen: 'none', petPolicy: 'not-allowed' })
    expect(assessment.score).toBeLessThanOrEqual(20)
    expect(assessment.fit).toBe('disqualified')
  })

  it('caps inventory pools below actionable specific listings', () => {
    const assessment = assessLead({
      ...baseLead,
      unitCategory: 'inventory-pool',
      privacy: 'inventory-pool',
      status: 'search-pool',
    })
    expect(assessment.score).toBeLessThanOrEqual(45)
    expect(assessment.fit).toBe('research')
  })

  it('keeps unfurnished units in fallback territory', () => {
    const assessment = assessLead({ ...baseLead, furnished: false, status: 'plan-b' })
    expect(assessment.score).toBeLessThanOrEqual(59)
    expect(assessment.fit).toBe('fallback')
  })

  it('keeps no-dog and 12-month listings visible only as fallbacks', () => {
    for (const change of [{ petPolicy: 'not-allowed' as const }, { leaseTermCategory: '12-plus' as const }]) {
      const assessment = assessLead({ ...baseLead, ...change })
      expect(assessment.fit).toBe('fallback')
      expect(assessment.score).toBeLessThanOrEqual(55)
    }
  })

  it('keeps listings beyond Erica’s 20-minute commute limit visible only as fallbacks', () => {
    const assessment = assessLead({ ...baseLead, commuteMinutes: 21 })
    expect(assessment.fit).toBe('fallback')
    expect(assessment.score).toBeLessThanOrEqual(55)
    expect(assessment.hardRequirementFailures).toContain('Commute exceeds the 20-minute maximum')
  })

  it('does not call an otherwise strong lead actionable without verified contact', () => {
    const assessment = assessLead({ ...baseLead, contactVerified: false })
    expect(assessment.fit).toBe('research')
    expect(assessment.verificationWarnings).toContain('Direct contact or inquiry channel is missing or unverified')
  })

  it('caps rejected leads', () => {
    expect(calculateLeadScore({ ...baseLead, status: 'rejected' })).toBeLessThanOrEqual(10)
    expect(scoreGrade(10)).toBe('D')
  })
})
