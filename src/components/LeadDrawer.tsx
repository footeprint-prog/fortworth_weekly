import { useEffect, useRef, useState } from 'react'
import type { Lead, LeadStatus, UserLeadState } from '../types'
import { assessLead, fitLabel, formatMoney, unitCategoryLabel } from '../lib/scoring'
import { createIssueUrl } from '../lib/github'
import { Icon } from './Icon'
import { hasDirectSource, hasUsableContact, isActionable, leaseTermLabel, petCategoryLabel, petPolicyCategory } from '../lib/actionability'

interface Props {
  lead: Lead | null
  state?: UserLeadState
  onClose: () => void
  onUpdate: (leadId: string, patch: UserLeadState) => void
}

const statuses: LeadStatus[] = ['new', 'investigate', 'contacted', 'awaiting-reply', 'tour-verify', 'shortlist', 'rejected', 'plan-b', 'market-benchmark', 'search-pool']

export function LeadDrawer({ lead, state, onClose, onUpdate }: Props) {
  const [note, setNote] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => setNote(state?.note ?? ''), [lead?.id, state?.note])
  useEffect(() => {
    if (!lead) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [lead, onClose])

  if (!lead) return null
  const merged = { ...lead, status: state?.status ?? lead.status }
  const assessment = assessLead(merged)
  const actionable = isActionable(lead)
  const copyText = (value: string) => value && navigator.clipboard.writeText(value)

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="lead-title" aria-describedby="lead-summary" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div className={`grade grade-${assessment.grade.replace('+', 'plus').toLowerCase()}`}>{assessment.grade}</div>
          <div>
            <span className="eyebrow">{lead.id} · Score {assessment.score}/100</span>
            <h2 id="lead-title">{lead.title}</h2>
            <p id="lead-summary">{lead.area} · {unitCategoryLabel(lead.unitCategory)}</p>
          </div>
          <button ref={closeButtonRef} className="icon-button" onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
        </div>

        <div className="drawer-fit-row">
          <span className={`fit-badge fit-${assessment.fit}`}>{fitLabel(assessment.fit)}</span>
          <span>{lead.confidence} research confidence</span>
          <span>Checked {new Date(`${lead.lastChecked}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div className="drawer-price-row">
          <div><span>Estimated all-in</span><strong>{formatMoney(lead.estimatedAllIn ?? lead.monthlyRent)}</strong></div>
          <div><span>Base rent</span><strong>{formatMoney(lead.monthlyRent)}</strong></div>
          <div><span>Commute</span><strong>{lead.commuteMinutes !== null ? `~${lead.commuteMinutes} min` : 'TBD'}</strong></div>
        </div>

        <section className="detail-grid">
          <Detail icon="map" label="Address / location" value={lead.address || lead.area} />
          <Detail icon="kitchen" label="Kitchen" value={lead.kitchenDetails} />
          <Detail icon="paw" label="Dogs" value={lead.petDetails} />
          <Detail icon="home" label="Furnishing" value={lead.furnished === true ? 'Furnished' : lead.furnished === false ? 'Unfurnished' : 'Needs verification'} />
          <Detail icon="map" label="Parking" value={lead.parking} />
          <Detail icon="clock" label="Minimum stay" value={lead.minStay} />
          <Detail icon="clock" label="Normalized lease term" value={leaseTermLabel(lead.leaseTermCategory)} />
          <Detail icon="activity" label="Availability" value={lead.availability} />
          <Detail icon="paw" label="Pet-policy category" value={petCategoryLabel(petPolicyCategory(lead))} />
        </section>

        <section className="drawer-section">
          <h3>Decision score</h3>
          <div className="score-breakdown">
            {assessment.breakdown.map((component) => (
              <div className="score-line" key={component.key}>
                <div><strong>{component.label}</strong><span>{component.detail}</span></div>
                <div className="score-points"><strong>{component.points}</strong><span>/{component.maxPoints}</span></div>
              </div>
            ))}
          </div>
        </section>

        {(assessment.hardRequirementFailures.length > 0 || assessment.verificationWarnings.length > 0) && (
          <section className="drawer-section requirement-panel">
            <h3><Icon name={assessment.hardRequirementFailures.length ? 'warning' : 'check'} /> Requirement readiness</h3>
            {assessment.hardRequirementFailures.length > 0 && <div className="requirement-group"><strong>Conflicts</strong><ul>{assessment.hardRequirementFailures.map((item) => <li key={item}>{item}</li>)}</ul></div>}
            {assessment.verificationWarnings.length > 0 && <div className="requirement-group"><strong>Verify</strong><ul>{assessment.verificationWarnings.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          </section>
        )}

        <section className="drawer-section">
          <h3>Cost detail</h3>
          <div className="cost-lines">
            <CostLine label="Monthly rent" value={lead.monthlyRent} />
            <CostLine label="Mandatory recurring fees" value={lead.mandatoryFeesMonthly} />
            <CostLine label="Utilities" value={lead.utilitiesIncluded ? 0 : lead.utilitiesMonthly} suffix={lead.utilitiesIncluded ? 'included' : undefined} />
            <CostLine label="Recurring pet cost" value={lead.petCostMonthly} />
            <CostLine label="Monthly parking" value={lead.parkingCostMonthly} />
            <CostLine label="One-time pet deposit" value={lead.petDeposit} />
          </div>
          <p className="body-copy"><strong>Upfront move-in costs:</strong> {lead.upfrontCosts || 'Not verified'}</p>
        </section>

        {lead.verificationGaps.length > 0 && (
          <section className="drawer-section warning-panel">
            <h3><Icon name="warning" /> Listing questions</h3>
            <ul>{lead.verificationGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
          </section>
        )}

        <section className="drawer-section">
          <h3>Research notes</h3>
          <p className="body-copy">{lead.notes || 'No research notes recorded.'}</p>
          <p className="next-action"><strong>Next action:</strong> {lead.nextAction}</p>
        </section>

        <section className="drawer-section">
          <h3>Your decision</h3>
          <div className="decision-row">
            <label>
              Status
              <select value={state?.status ?? lead.status} onChange={(event) => onUpdate(lead.id, { status: event.target.value as LeadStatus, lastUpdated: new Date().toISOString() })}>
                {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('-', ' ')}</option>)}
              </select>
            </label>
            <button className={`secondary-button ${state?.favorite ? 'active' : ''}`} onClick={() => onUpdate(lead.id, { favorite: !state?.favorite, lastUpdated: new Date().toISOString() })}>
              <Icon name={state?.favorite ? 'heart-filled' : 'heart'} /> {state?.favorite ? 'Shortlisted' : 'Add to shortlist'}
            </button>
          </div>
          <label className="note-field">
            Private notes saved in this browser
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record call outcomes, impressions, or questions…" />
          </label>
          <button className="secondary-button" onClick={() => onUpdate(lead.id, { note, lastUpdated: new Date().toISOString() })}>Save note</button>
        </section>

        <section className="drawer-section">
          <h3>Contact and handoff</h3>
          <div className="action-grid">
            {hasDirectSource(lead) && <a className="primary-button" href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"><Icon name="external" /> Open direct listing</a>}
            {lead.phone && <a className="secondary-button" href={`tel:${lead.phone}`}>Call {lead.phone}</a>}
            {lead.email && <a className="secondary-button" href={`mailto:${lead.email}`}>Email contact</a>}
            <button className="secondary-button" disabled={!lead.address} onClick={() => copyText(lead.address)}>Copy address</button>
            <button className="secondary-button" disabled={!hasUsableContact(lead)} onClick={() => copyText([lead.contactName, lead.contactMethod, lead.phone, lead.email].filter(Boolean).join(' · '))}>Copy contact details</button>
            <button className="secondary-button" onClick={() => onUpdate(lead.id, { status: 'contacted', lastUpdated: new Date().toISOString() })}>Mark contacted</button>
            <a className="secondary-button" href={createIssueUrl(lead, 'pursue')} target="_blank" rel="noreferrer"><Icon name="github" /> Create pursue issue</a>
            <a className="secondary-button" href={createIssueUrl(lead, 'verify')} target="_blank" rel="noreferrer"><Icon name="check" /> Request verification</a>
          </div>
          <p className="contact-meta"><strong>{actionable ? 'Ready to contact' : 'Incomplete research lead'}</strong> · {lead.contactName || 'Contact not yet identified'} · {lead.contactMethod || lead.sourceName}</p>
          <p className="contact-meta">Source: {lead.sourceName} · {lead.sourceVerified ? 'direct source verified' : 'source needs verification'} · {lead.contactVerified ? 'contact channel verified' : 'contact needs verification'}</p>
        </section>

        <section className="drawer-section history">
          <h3>Lead history</h3>
          {lead.history.length ? lead.history.map((item) => <div key={`${item.date}-${item.note}`}><time>{item.date}</time><p>{item.note}</p></div>) : <p className="body-copy">No lead history recorded.</p>}
        </section>
      </aside>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string }) {
  return <div className="detail-item"><Icon name={icon} /><div><span>{label}</span><strong>{value}</strong></div></div>
}

function CostLine({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  return <div><span>{label}</span><strong>{suffix ?? formatMoney(value)}</strong></div>
}
