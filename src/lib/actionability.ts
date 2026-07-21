import type { Lead, LeaseTermCategory, PetPolicyCategory } from '../types'

export function petPolicyCategory(lead: Pick<Lead, 'petPolicy'>): PetPolicyCategory {
  if (lead.petPolicy === 'confirmed') return 'accepts-two'
  if (lead.petPolicy === 'not-allowed') return 'not-allowed'
  return 'unclear'
}

export function hasUsableContact(lead: Pick<Lead, 'phone' | 'email' | 'contactName' | 'contactMethod'>): boolean {
  return Boolean(lead.phone.trim() || lead.email.trim() || (lead.contactName.trim() && lead.contactMethod.trim()))
}

export function hasDirectSource(lead: Pick<Lead, 'sourceUrl'>): boolean {
  try {
    const url = new URL(lead.sourceUrl)
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function isActionable(lead: Lead): boolean {
  return lead.sourceVerified && lead.contactVerified && hasDirectSource(lead) && hasUsableContact(lead)
}

export function leaseTermLabel(category: LeaseTermCategory): string {
  const labels: Record<LeaseTermCategory, string> = {
    'confirmed-3-6': 'Confirmed 3–6 months',
    'under-12': 'Confirmed under one year',
    '12-plus': '12 months or longer',
    flexible: 'Flexible term',
    unknown: 'Term unknown',
  }
  return labels[category]
}

export function petCategoryLabel(category: PetPolicyCategory): string {
  if (category === 'accepts-two') return 'Accepts two small dogs'
  if (category === 'not-allowed') return 'Dogs not allowed'
  return 'Pet policy unclear'
}
