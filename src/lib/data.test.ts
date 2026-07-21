import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { validateLeads } from './data'

const lead: Lead = {
  id: 'L-001', title: 'Guest house', area: 'Benbrook', propertyType: 'Guest house', unitCategory: 'guest-house', privacy: 'entire-unit',
  address: '123 Main St', monthlyRent: 1000, mandatoryFeesMonthly: 0, utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0, parkingCostMonthly: 0, estimatedAllIn: 1000, upfrontCosts: 'None',
  kitchen: 'full', kitchenDetails: 'Full kitchen', furnished: true, petPolicy: 'confirmed', petDetails: 'Two small dogs allowed',
  parking: 'Driveway', minStay: '3 months', leaseTermMinMonths: 3, leaseTermMaxMonths: 6, leaseTermCategory: 'confirmed-3-6', sublet: false, leaseTakeover: false, ownerDirect: true, availability: 'Available', availableFrom: null, commuteMinutes: 25,
  contactName: 'Host', contactMethod: 'Platform', phone: '', email: '', sourceName: 'Source', sourceUrl: 'https://example.com/listing/1', contactVerified: true, sourceVerified: true,
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

  it('migrates older records without inventing normalized facts', () => {
    const legacy = { ...lead } as Record<string, unknown>
    for (const field of ['address', 'mandatoryFeesMonthly', 'parkingCostMonthly', 'upfrontCosts', 'leaseTermMinMonths', 'leaseTermMaxMonths', 'leaseTermCategory', 'sublet', 'leaseTakeover', 'ownerDirect', 'contactVerified', 'sourceVerified']) delete legacy[field]
    const [migrated] = validateLeads([legacy])
    expect(migrated.leaseTermCategory).toBe('unknown')
    expect(migrated.leaseTermMinMonths).toBeNull()
    expect(migrated.contactVerified).toBe(false)
  })

  it('rejects invalid normalized lease ranges', () => {
    expect(() => validateLeads([{ ...lead, leaseTermMinMonths: 6, leaseTermMaxMonths: 3 }])).toThrow('leaseTermMaxMonths')
  })

  it.each([
    ['leaseTermCategory', 'invalid'],
    ['sublet', 'yes'],
    ['contactVerified', null],
    ['mandatoryFeesMonthly', -1],
    ['address', 123],
  ])('rejects an invalid %s field', (field, value) => {
    expect(() => validateLeads([{ ...lead, [field]: value }])).toThrow(field)
  })
})
