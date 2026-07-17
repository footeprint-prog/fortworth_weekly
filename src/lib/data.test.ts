import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { validateLeads } from './data'

const lead: Lead = {
  id: 'L-001', title: 'Guest house', area: 'Benbrook', propertyType: 'Guest house', unitCategory: 'guest-house', privacy: 'entire-unit',
  monthlyRent: 1000, utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0, estimatedAllIn: 1000,
  kitchen: 'full', kitchenDetails: 'Full kitchen', furnished: true, petPolicy: 'confirmed', petDetails: 'Two small dogs allowed',
  parking: 'Driveway', minStay: '1 month', availability: 'Available', availableFrom: null, commuteMinutes: 25,
  contactName: 'Host', contactMethod: 'Platform', phone: '', email: '', sourceName: 'Source', sourceUrl: 'https://example.com',
  lastChecked: '2026-07-16', status: 'new', confidence: 'high', priority: 'high', nextAction: 'Contact host', notes: '',
  verificationGaps: [], tags: [], history: [],
}

describe('dashboard data validation', () => {
  it('accepts valid lead data', () => {
    expect(validateLeads([lead])).toEqual([lead])
  })

  it('rejects duplicate stable ids', () => {
    expect(() => validateLeads([lead, { ...lead }])).toThrow('Duplicate lead id')
  })

  it('rejects missing unit categories', () => {
    const invalid = { ...lead } as Record<string, unknown>
    delete invalid.unitCategory
    expect(() => validateLeads([invalid])).toThrow('unitCategory')
  })
})
