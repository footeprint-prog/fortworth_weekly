import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { calculateLeadScore, scoreGrade } from './scoring'

const baseLead: Lead = {
  id: 'T-1', title: 'Test', area: 'Benbrook', propertyType: 'Guest house', privacy: 'entire-unit',
  monthlyRent: 1000, utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0,
  estimatedAllIn: 1000, kitchen: 'full', kitchenDetails: 'Full kitchen', furnished: true,
  petPolicy: 'confirmed', petDetails: 'Two dogs allowed', parking: 'Driveway', minStay: '1 month',
  availability: 'Available', availableFrom: null, commuteMinutes: 24, contactName: '', contactMethod: '', phone: '', email: '',
  sourceName: 'Test', sourceUrl: 'https://example.com', lastChecked: '2026-07-17', status: 'new', confidence: 'high', priority: 'high',
  nextAction: '', notes: '', verificationGaps: [], tags: [], history: [],
}

describe('lead scoring', () => {
  it('rewards an on-budget private furnished unit with dogs and a full kitchen', () => {
    const score = calculateLeadScore(baseLead)
    expect(score).toBeGreaterThanOrEqual(88)
    expect(scoreGrade(score)).toBe('A+')
  })

  it('penalizes no kitchen and no pets', () => {
    const score = calculateLeadScore({ ...baseLead, kitchen: 'none', petPolicy: 'not-allowed' })
    expect(score).toBeLessThan(50)
  })

  it('caps rejected leads', () => {
    expect(calculateLeadScore({ ...baseLead, status: 'rejected' })).toBeLessThanOrEqual(15)
  })
})
