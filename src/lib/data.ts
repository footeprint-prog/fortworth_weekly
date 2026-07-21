import type { AreaCoverage, Lead, LeaseTermCategory, SearchLogEntry } from '../types'

interface DashboardData {
  leads: Lead[]
  logs: SearchLogEntry[]
  coverage: AreaCoverage[]
}

export async function loadDashboardData(baseUrl: string): Promise<DashboardData> {
  const [leadData, logData, coverageData] = await Promise.all([
    fetchJson(`${baseUrl}data/leads.json`, 'Lead database'),
    fetchJson(`${baseUrl}data/search-log.json`, 'Search log'),
    fetchJson(`${baseUrl}data/area-coverage.json`, 'Area coverage'),
  ])

  return {
    leads: validateLeads(leadData),
    logs: validateSearchLogs(logData),
    coverage: validateCoverage(coverageData),
  }
}

export function validateLeads(value: unknown): Lead[] {
  if (!Array.isArray(value)) throw new Error('Lead database must be an array')
  const seen = new Set<string>()
  return value.map((lead, index) => {
    assertRecord(lead, `Lead ${index + 1}`)
    assertString(lead.id, `Lead ${index + 1} id`)
    if (seen.has(lead.id)) throw new Error(`Duplicate lead id: ${lead.id}`)
    seen.add(lead.id)
    for (const field of ['title', 'area', 'propertyType', 'unitCategory', 'privacy', 'kitchen', 'petPolicy', 'sourceUrl', 'lastChecked', 'status']) {
      assertString(lead[field], `${lead.id} ${field}`)
    }
    for (const field of ['verificationGaps', 'tags', 'history']) {
      if (!Array.isArray(lead[field])) throw new Error(`${lead.id} ${field} must be an array`)
    }
    assertNullableNumber(lead.monthlyRent, `${lead.id} monthlyRent`)
    assertNullableNumber(lead.estimatedAllIn, `${lead.id} estimatedAllIn`)
    assertIsoDate(lead.lastChecked, `${lead.id} lastChecked`)
    const migrated = migrateLead(lead)
    for (const field of ['address', 'upfrontCosts']) assertText(migrated[field], `${lead.id} ${field}`)
    for (const field of ['mandatoryFeesMonthly', 'parkingCostMonthly', 'leaseTermMinMonths', 'leaseTermMaxMonths']) {
      assertNullableNumber(migrated[field], `${lead.id} ${field}`)
    }
    const leaseMin = migrated.leaseTermMinMonths as number | null
    const leaseMax = migrated.leaseTermMaxMonths as number | null
    if (leaseMin !== null && leaseMax !== null && leaseMax < leaseMin) {
      throw new Error(`${lead.id} leaseTermMaxMonths must be at least leaseTermMinMonths`)
    }
    if (!leaseTermCategories.includes(migrated.leaseTermCategory as LeaseTermCategory)) throw new Error(`${lead.id} leaseTermCategory is invalid`)
    for (const field of ['sublet', 'leaseTakeover', 'ownerDirect']) assertNullableBoolean(migrated[field], `${lead.id} ${field}`)
    for (const field of ['contactVerified', 'sourceVerified']) {
      if (typeof migrated[field] !== 'boolean') throw new Error(`${lead.id} ${field} must be a boolean`)
    }
    return migrated as unknown as Lead
  })
}

const leaseTermCategories: LeaseTermCategory[] = ['confirmed-3-6', 'under-12', '12-plus', 'flexible', 'unknown']

function migrateLead(lead: Record<string, unknown>): Record<string, unknown> {
  return {
    ...lead,
    address: lead.address === undefined ? '' : lead.address,
    mandatoryFeesMonthly: lead.mandatoryFeesMonthly ?? null,
    parkingCostMonthly: lead.parkingCostMonthly ?? null,
    upfrontCosts: lead.upfrontCosts === undefined ? '' : lead.upfrontCosts,
    leaseTermMinMonths: lead.leaseTermMinMonths ?? null,
    leaseTermMaxMonths: lead.leaseTermMaxMonths ?? null,
    leaseTermCategory: lead.leaseTermCategory ?? 'unknown',
    sublet: lead.sublet ?? null,
    leaseTakeover: lead.leaseTakeover ?? null,
    ownerDirect: lead.ownerDirect ?? null,
    contactVerified: lead.contactVerified === undefined ? false : lead.contactVerified,
    sourceVerified: lead.sourceVerified === undefined ? false : lead.sourceVerified,
  }
}

export function validateSearchLogs(value: unknown): SearchLogEntry[] {
  if (!Array.isArray(value)) throw new Error('Search log must be an array')
  value.forEach((log, index) => {
    assertRecord(log, `Search log ${index + 1}`)
    for (const field of ['id', 'searchedAt', 'area', 'platform', 'query', 'outcome', 'nextSearch', 'agent']) {
      assertString(log[field], `Search log ${index + 1} ${field}`)
    }
    const reviewed = log.reviewed
    const qualified = log.qualified
    const searchedAt = log.searchedAt
    if (typeof reviewed !== 'number' || !Number.isInteger(reviewed) || reviewed < 0) throw new Error(`${log.id} reviewed must be a non-negative integer`)
    if (typeof qualified !== 'number' || !Number.isInteger(qualified) || qualified < 0) throw new Error(`${log.id} qualified must be a non-negative integer`)
    assertString(searchedAt, `${log.id} searchedAt`)
    if (Number.isNaN(Date.parse(searchedAt))) throw new Error(`${log.id} searchedAt must be an ISO date-time`)
  })
  return value as SearchLogEntry[]
}

export function validateCoverage(value: unknown): AreaCoverage[] {
  if (!Array.isArray(value)) throw new Error('Area coverage must be an array')
  value.forEach((area, index) => {
    assertRecord(area, `Area coverage ${index + 1}`)
    for (const field of ['area', 'priority', 'commuteGoal', 'status', 'outlook', 'nextStep']) {
      assertString(area[field], `Area coverage ${index + 1} ${field}`)
    }
    if (!Array.isArray(area.platforms) || area.platforms.some((platform) => typeof platform !== 'string')) {
      throw new Error(`${area.area} platforms must be an array of strings`)
    }
    if (area.lastSearch !== null) assertIsoDate(area.lastSearch, `${area.area} lastSearch`)
  })
  return value as AreaCoverage[]
}

async function fetchJson(url: string, label: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${label} unavailable (${response.status})`)
  try {
    return await response.json()
  } catch {
    throw new Error(`${label} contains invalid JSON`)
  }
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${label} must be an object`)
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`)
}

function assertNullableNumber(value: unknown, label: string): void {
  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
    throw new Error(`${label} must be null or a non-negative number`)
  }
}

function assertText(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`)
}

function assertNullableBoolean(value: unknown, label: string): void {
  if (value !== null && typeof value !== 'boolean') throw new Error(`${label} must be null or a boolean`)
}

function assertIsoDate(value: unknown, label: string): void {
  assertString(value, label)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T12:00:00Z`))) {
    throw new Error(`${label} must use YYYY-MM-DD`)
  }
}
