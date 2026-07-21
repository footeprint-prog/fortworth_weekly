export type LeadStatus =
  | 'new'
  | 'investigate'
  | 'contacted'
  | 'awaiting-reply'
  | 'tour-verify'
  | 'shortlist'
  | 'rejected'
  | 'plan-b'
  | 'market-benchmark'
  | 'search-pool'

export type Confidence = 'high' | 'medium' | 'low'
export type KitchenLevel = 'full' | 'kitchenette' | 'shared' | 'unknown' | 'none'
export type PetPolicy = 'confirmed' | 'likely' | 'unknown' | 'not-allowed'
export type PetPolicyCategory = 'accepts-two' | 'unclear' | 'not-allowed'
export type LeaseTermCategory = 'confirmed-3-6' | 'under-12' | '12-plus' | 'flexible' | 'unknown'
export type UnitPrivacy = 'entire-unit' | 'private-suite' | 'private-room' | 'shared-room' | 'inventory-pool'

export type UnitCategory =
  | 'guest-house'
  | 'mother-in-law-suite'
  | 'garage-apartment'
  | 'furnished-studio'
  | 'one-bedroom'
  | 'travel-nurse-housing'
  | 'corporate-housing'
  | 'private-suite'
  | 'private-room'
  | 'conventional-apartment'
  | 'inventory-pool'
  | 'other'

export interface LeadHistoryItem {
  date: string
  note: string
}

export interface Lead {
  id: string
  title: string
  area: string
  propertyType: string
  address: string
  unitCategory: UnitCategory
  privacy: UnitPrivacy
  monthlyRent: number | null
  mandatoryFeesMonthly: number | null
  utilitiesMonthly: number | null
  utilitiesIncluded: boolean | null
  petCostMonthly: number | null
  petDeposit: number | null
  parkingCostMonthly: number | null
  estimatedAllIn: number | null
  upfrontCosts: string
  kitchen: KitchenLevel
  kitchenDetails: string
  furnished: boolean | null
  petPolicy: PetPolicy
  petDetails: string
  parking: string
  minStay: string
  leaseTermMinMonths: number | null
  leaseTermMaxMonths: number | null
  leaseTermCategory: LeaseTermCategory
  sublet: boolean | null
  leaseTakeover: boolean | null
  ownerDirect: boolean | null
  availability: string
  availableFrom: string | null
  commuteMinutes: number | null
  contactName: string
  contactMethod: string
  phone: string
  email: string
  sourceName: string
  sourceUrl: string
  contactVerified: boolean
  sourceVerified: boolean
  lastChecked: string
  status: LeadStatus
  confidence: Confidence
  priority: 'high' | 'medium' | 'low'
  nextAction: string
  notes: string
  verificationGaps: string[]
  tags: string[]
  history: LeadHistoryItem[]
}

export interface SearchLogEntry {
  id: string
  searchedAt: string
  area: string
  platform: string
  query: string
  reviewed: number
  qualified: number
  outcome: string
  nextSearch: string
  agent: string
}

export interface AreaCoverage {
  area: string
  priority: 'high' | 'medium' | 'low'
  commuteGoal: string
  status: 'not-searched' | 'initial-pass' | 'deep-searched' | 'monitoring'
  platforms: string[]
  lastSearch: string | null
  outlook: 'strong' | 'possible' | 'weak' | 'unknown'
  nextStep: string
}

export interface UserLeadState {
  favorite?: boolean
  status?: LeadStatus
  note?: string
  lastUpdated?: string
}

export interface UserState {
  version: 1
  leads: Record<string, UserLeadState>
}
