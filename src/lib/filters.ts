import type { KitchenLevel, Lead, LeadStatus, LeaseTermCategory, PetPolicy, UnitCategory, UnitPrivacy } from '../types'
import { assessLead, calculateLeadScore } from './scoring'

export interface LeadFilters {
  query: string
  maxPrice: number
  areas: string[]
  statuses: LeadStatus[]
  categories: UnitCategory[]
  privacy: UnitPrivacy[]
  petPolicies: PetPolicy[]
  leaseTermCategories: LeaseTermCategory[]
  kitchens: KitchenLevel[]
  furnishingStatuses: Array<'furnished' | 'unfurnished' | 'unknown'>
  subletOnly: boolean
  ownerDirectOnly: boolean
  leaseTakeoverOnly: boolean
  requirementReadyOnly: boolean
  specificListingsOnly: boolean
  favoritesOnly: boolean
}

export type SortKey = 'score' | 'price' | 'commute' | 'updated'

export const defaultFilters: LeadFilters = {
  query: '',
  maxPrice: 1300,
  areas: [],
  statuses: [],
  categories: [],
  privacy: [],
  petPolicies: [],
  leaseTermCategories: [],
  kitchens: [],
  furnishingStatuses: [],
  subletOnly: false,
  ownerDirectOnly: false,
  leaseTakeoverOnly: false,
  requirementReadyOnly: false,
  specificListingsOnly: false,
  favoritesOnly: false,
}

export function filterLeads(
  leads: Lead[],
  filters: LeadFilters,
  favorites: Set<string>,
): Lead[] {
  const q = filters.query.trim().toLowerCase()
  return leads.filter((lead) => {
    const price = lead.estimatedAllIn ?? lead.monthlyRent
    if (price !== null && price > filters.maxPrice) return false
    if (filters.areas.length && !filters.areas.includes(lead.area)) return false
    if (filters.statuses.length && !filters.statuses.includes(lead.status)) return false
    if (filters.categories.length && !filters.categories.includes(lead.unitCategory)) return false
    if (filters.privacy.length && !filters.privacy.includes(lead.privacy)) return false
    if (filters.petPolicies.length && !filters.petPolicies.includes(lead.petPolicy)) return false
    if (filters.leaseTermCategories.length && !filters.leaseTermCategories.includes(lead.leaseTermCategory)) return false
    if (filters.kitchens.length && !filters.kitchens.includes(lead.kitchen)) return false
    const furnishingStatus = lead.furnished === true ? 'furnished' : lead.furnished === false ? 'unfurnished' : 'unknown'
    if (filters.furnishingStatuses.length && !filters.furnishingStatuses.includes(furnishingStatus)) return false
    if (filters.subletOnly && lead.sublet !== true) return false
    if (filters.ownerDirectOnly && lead.ownerDirect !== true) return false
    if (filters.leaseTakeoverOnly && lead.leaseTakeover !== true) return false
    if (filters.requirementReadyOnly && assessLead(lead).fit !== 'qualified') return false
    if (filters.specificListingsOnly && (lead.unitCategory === 'inventory-pool' || lead.privacy === 'inventory-pool')) return false
    if (filters.favoritesOnly && !favorites.has(lead.id)) return false
    if (q) {
      const haystack = [
        lead.title,
        lead.area,
        lead.propertyType,
        lead.unitCategory,
        lead.address,
        lead.leaseTermCategory,
        lead.notes,
        lead.tags.join(' '),
        lead.sourceName,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function sortLeads(leads: Lead[], sort: SortKey): Lead[] {
  const copy = [...leads]
  if (sort === 'score') return copy.sort((a, b) => calculateLeadScore(b) - calculateLeadScore(a))
  if (sort === 'price') {
    return copy.sort(
      (a, b) =>
        (a.estimatedAllIn ?? a.monthlyRent ?? Number.MAX_SAFE_INTEGER) -
        (b.estimatedAllIn ?? b.monthlyRent ?? Number.MAX_SAFE_INTEGER),
    )
  }
  if (sort === 'commute') {
    return copy.sort(
      (a, b) => (a.commuteMinutes ?? Number.MAX_SAFE_INTEGER) - (b.commuteMinutes ?? Number.MAX_SAFE_INTEGER),
    )
  }
  return copy.sort((a, b) => b.lastChecked.localeCompare(a.lastChecked))
}
