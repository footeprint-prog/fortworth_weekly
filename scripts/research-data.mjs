const leaseTerms = new Set(['confirmed-3-6', 'under-12', '12-plus', 'flexible', 'unknown'])

export function normalizeSourceUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key)
    return url.toString().replace(/\/$/, '').toLowerCase()
  } catch { return '' }
}

export function validateLead(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) throw new Error('Lead must be an object')
  for (const field of ['id', 'title', 'area', 'propertyType', 'unitCategory', 'privacy', 'kitchen', 'petPolicy', 'minStay', 'leaseTermCategory', 'availability', 'contactMethod', 'sourceName', 'sourceUrl', 'lastChecked', 'status', 'confidence', 'priority', 'nextAction']) {
    if (typeof lead[field] !== 'string') throw new Error(`${lead.id || 'Lead'} ${field} must be a string`)
  }
  if (!lead.id.trim()) throw new Error('Lead id is required')
  if (!leaseTerms.has(lead.leaseTermCategory)) throw new Error(`${lead.id} leaseTermCategory is invalid`)
  for (const field of ['monthlyRent', 'mandatoryFeesMonthly', 'utilitiesMonthly', 'petCostMonthly', 'petDeposit', 'parkingCostMonthly', 'estimatedAllIn', 'leaseTermMinMonths', 'leaseTermMaxMonths', 'commuteMinutes']) {
    if (lead[field] !== null && (typeof lead[field] !== 'number' || !Number.isFinite(lead[field]) || lead[field] < 0)) throw new Error(`${lead.id} ${field} must be null or a non-negative number`)
  }
  for (const field of ['sublet', 'leaseTakeover', 'ownerDirect', 'furnished', 'utilitiesIncluded']) if (lead[field] !== null && typeof lead[field] !== 'boolean') throw new Error(`${lead.id} ${field} must be null or boolean`)
  for (const field of ['contactVerified', 'sourceVerified']) if (typeof lead[field] !== 'boolean') throw new Error(`${lead.id} ${field} must be boolean`)
  for (const field of ['verificationGaps', 'tags', 'history']) if (!Array.isArray(lead[field])) throw new Error(`${lead.id} ${field} must be an array`)
  if (lead.leaseTermMinMonths !== null && lead.leaseTermMaxMonths !== null && lead.leaseTermMaxMonths < lead.leaseTermMinMonths) throw new Error(`${lead.id} has an invalid lease-term range`)
  const directUrl = normalizeSourceUrl(lead.sourceUrl)
  const contact = [lead.phone, lead.email].some((value) => typeof value === 'string' && value.trim()) || (lead.contactName?.trim() && lead.contactMethod.trim())
  if (lead.sourceVerified && !directUrl) throw new Error(`${lead.id} cannot verify a missing or invalid source URL`)
  if (lead.contactVerified && !contact) throw new Error(`${lead.id} cannot verify a missing contact method`)
  return lead
}

export function applyResearchPayload(data, payload, today = new Date().toISOString().slice(0, 10)) {
  const next = structuredClone(data)
  const summary = { added: [], updated: [], logsAppended: [], coverageUpdated: [] }
  const incomingLeads = payload.leads ?? (payload.lead ? [payload.lead] : [])
  const incomingLogs = payload.searchLogs ?? (payload.searchLog ? [payload.searchLog] : [])
  const incomingCoverage = payload.coverageUpdates ?? (payload.coverage ? [payload.coverage] : [])

  for (const incoming of incomingLeads) {
    const idIndex = next.leads.findIndex((lead) => lead.id === incoming.id)
    const source = normalizeSourceUrl(incoming.sourceUrl)
    const urlIndex = source ? next.leads.findIndex((lead) => normalizeSourceUrl(lead.sourceUrl) === source) : -1
    if (idIndex >= 0 && urlIndex >= 0 && idIndex !== urlIndex) throw new Error(`${incoming.id} conflicts with another lead's source URL`)
    const index = idIndex >= 0 ? idIndex : urlIndex
    if (index >= 0) {
      const existing = next.leads[index]
      const merged = { ...existing, ...incoming, id: existing.id }
      const before = JSON.stringify({ ...existing, history: [] })
      const after = JSON.stringify({ ...merged, history: [] })
      if (before !== after) {
        merged.history = [...existing.history, { date: today, note: payload.historyNote || 'Updated through validated research ingestion.' }]
        next.leads[index] = validateLead(merged)
        summary.updated.push(existing.id)
      }
    } else {
      validateLead(incoming)
      next.leads.push(incoming)
      summary.added.push(incoming.id)
    }
  }

  const ids = new Set(next.leads.map((lead) => lead.id))
  if (ids.size !== next.leads.length) throw new Error('Lead IDs must remain unique')
  for (const log of incomingLogs) {
    if (!log?.id || next.logs.some((entry) => entry.id === log.id)) throw new Error(`Search log id ${log?.id || '(missing)'} already exists or is invalid`)
    next.logs.unshift(log)
    summary.logsAppended.push(log.id)
  }
  for (const update of incomingCoverage) {
    if (!update?.area) throw new Error('Coverage update requires area')
    const index = next.coverage.findIndex((entry) => entry.area === update.area)
    if (index >= 0) next.coverage[index] = { ...next.coverage[index], ...update }
    else next.coverage.push(update)
    summary.coverageUpdated.push(update.area)
  }
  next.leads.forEach(validateLead)
  return { data: next, summary }
}
