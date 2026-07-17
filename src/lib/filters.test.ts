import { describe, expect, it } from 'vitest'
import type { Lead } from '../types'
import { defaultFilters, filterLeads, sortLeads } from './filters'

const makeLead = (id: string, price: number, kitchen: Lead['kitchen'] = 'full'): Lead => ({
  id, title: id, area: 'Area', propertyType: 'Studio', unitCategory: 'furnished-studio', privacy: 'entire-unit', monthlyRent: price,
  utilitiesMonthly: 0, utilitiesIncluded: true, petCostMonthly: 0, petDeposit: 0, estimatedAllIn: price,
  kitchen, kitchenDetails: '', furnished: true, petPolicy: 'confirmed', petDetails: '', parking: '', minStay: '', availability: '', availableFrom: null,
  commuteMinutes: 20, contactName: '', contactMethod: '', phone: '', email: '', sourceName: '', sourceUrl: 'https://example.com', lastChecked: '2026-07-16',
  status: 'new', confidence: 'high', priority: 'high', nextAction: '', notes: '', verificationGaps: [], tags: [], history: [],
})

describe('lead filters', () => {
  it('respects price ceiling and kitchen requirement', () => {
    const result = filterLeads([makeLead('a', 950), makeLead('b', 1400), makeLead('c', 900, 'shared')], { ...defaultFilters, maxPrice: 1200 }, new Set())
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
})
