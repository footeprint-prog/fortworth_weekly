import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { defaultFilters, filterLeads, sortLeads } from './filters'

const makeLead = (id: string, price: number, kitchen: Lead['kitchen'] = 'full'): Lead => ({
  id, title: id, area: 'Area', propertyType: 'Studio', unitCategory: 'furnished-studio', privacy: 'entire-unit', monthlyRent: price,
  address: '', mandatoryFeesMonthly: 0, utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0, parkingCostMonthly: 0, estimatedAllIn: price, upfrontCosts: '',
  kitchen, kitchenDetails: '', furnished: true, petPolicy: 'confirmed', petDetails: '', parking: '', minStay: '3 months', leaseTermMinMonths: 3, leaseTermMaxMonths: 6, leaseTermCategory: 'confirmed-3-6', sublet: false, leaseTakeover: false, ownerDirect: false, availability: '', availableFrom: null,
  commuteMinutes: 20, contactName: 'Host', contactMethod: 'Platform inquiry', phone: '', email: '', sourceName: 'Source', sourceUrl: 'https://example.com/listing/1', contactVerified: true, sourceVerified: true, lastChecked: '2026-07-16',
  status: 'new', confidence: 'high', priority: 'high', nextAction: '', notes: '', verificationGaps: [], tags: [], history: [],
})

describe('lead filters', () => {
  it('respects price ceiling and kitchen requirement', () => {
    const result = filterLeads([makeLead('a', 950), makeLead('b', 1400), makeLead('c', 900, 'shared')], { ...defaultFilters, maxPrice: 1200, kitchens: ['full', 'kitchenette'] }, new Set())
    expect(result.map((lead) => lead.id)).toEqual(['a'])
  })

  it('can isolate requirement-ready listings', () => {
    const uncertain = { ...makeLead('b', 900), petPolicy: 'unknown' as const }
    const result = filterLeads([makeLead('a', 950), uncertain], { ...defaultFilters, requirementReadyOnly: true }, new Set())
    expect(result.map((lead) => lead.id)).toEqual(['a'])
  })

  it('sorts lowest price first', () => {
    const result = sortLeads([makeLead('a', 1100), makeLead('b', 900)], 'price')
    expect(result[0].id).toBe('b')
  })

  it('does not hide no-dog comparisons by default and can filter lease terms', () => {
    const noDogs = { ...makeLead('b', 800), petPolicy: 'not-allowed' as const, leaseTermCategory: '12-plus' as const }
    expect(filterLeads([noDogs], defaultFilters, new Set())).toHaveLength(1)
    expect(filterLeads([noDogs], { ...defaultFilters, leaseTermCategories: ['confirmed-3-6'] }, new Set())).toHaveLength(0)
  })
})
