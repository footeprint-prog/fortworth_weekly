import { describe, expect, it } from 'vitest'
import { applyResearchPayload, normalizeSourceUrl, validateLead } from './research-data.mjs'

const lead = {
  id: 'L-100', title: 'Test', area: 'Fort Worth', propertyType: 'Studio', unitCategory: 'furnished-studio', privacy: 'entire-unit', address: '',
  monthlyRent: 950, mandatoryFeesMonthly: null, utilitiesMonthly: null, utilitiesIncluded: null, petCostMonthly: null, petDeposit: null, parkingCostMonthly: null, estimatedAllIn: 950, upfrontCosts: '',
  kitchen: 'full', kitchenDetails: 'Private full kitchen', furnished: true, petPolicy: 'confirmed', petDetails: 'Two dogs confirmed', parking: 'Unknown', minStay: '3 months',
  leaseTermMinMonths: 3, leaseTermMaxMonths: 6, leaseTermCategory: 'confirmed-3-6', sublet: null, leaseTakeover: null, ownerDirect: null,
  availability: 'Available', availableFrom: null, commuteMinutes: 20, contactName: 'Host', contactMethod: 'Listing inquiry', phone: '', email: '', sourceName: 'Example', sourceUrl: 'https://example.com/listing/100?utm_source=test', contactVerified: true, sourceVerified: true,
  lastChecked: '2026-07-20', status: 'new', confidence: 'high', priority: 'high', nextAction: 'Contact', notes: '', verificationGaps: [], tags: [], history: [],
}

describe('research ingestion', () => {
  it('normalizes tracking parameters in source URLs', () => expect(normalizeSourceUrl(lead.sourceUrl)).toBe('https://example.com/listing/100'))
  it('rejects false contact verification', () => expect(() => validateLead({ ...lead, contactName: '', contactMethod: '', contactVerified: true })).toThrow('missing contact'))
  it('upserts by normalized source URL while preserving the stable id and appending history', () => {
    const result = applyResearchPayload({ leads: [lead], logs: [], coverage: [] }, { lead: { ...lead, id: 'TEMP', monthlyRent: 900 }, historyNote: 'Price rechecked.' }, '2026-07-21')
    expect(result.data.leads[0].id).toBe('L-100')
    expect(result.data.leads[0].monthlyRent).toBe(900)
    expect(result.data.leads[0].history.at(-1)).toEqual({ date: '2026-07-21', note: 'Price rechecked.' })
  })
  it('rejects duplicate search-log ids', () => expect(() => applyResearchPayload({ leads: [lead], logs: [{ id: 'S-1' }], coverage: [] }, { searchLog: { id: 'S-1' } })).toThrow('already exists'))
})
