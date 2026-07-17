import { useEffect, useState } from 'react'
import type { Lead, LeadStatus, UserLeadState } from '../types'
import { calculateLeadScore, formatMoney, scoreGrade } from '../lib/scoring'
import { createIssueUrl } from '../lib/github'
import { Icon } from './Icon'

interface Props {
  lead: Lead | null
  state?: UserLeadState
  onClose: () => void
  onUpdate: (leadId: string, patch: UserLeadState) => void
}

const statuses: LeadStatus[] = ['new', 'investigate', 'contacted', 'awaiting-reply', 'tour-verify', 'shortlist', 'rejected', 'plan-b']

export function LeadDrawer({ lead, state, onClose, onUpdate }: Props) {
  const [note, setNote] = useState('')
  useEffect(() => setNote(state?.note ?? ''), [lead?.id, state?.note])
  useEffect(() => {
    if (!lead) return
    const handler = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [lead, onClose])

  if (!lead) return null
  const merged = { ...lead, status: state?.status ?? lead.status }
  const score = calculateLeadScore(merged)
  const grade = scoreGrade(score)

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="lead-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div className={`grade grade-${grade.replace('+', 'plus').toLowerCase()}`}>{grade}</div>
          <div>
            <span className="eyebrow">{lead.id} · Score {score}/100</span>
            <h2 id="lead-title">{lead.title}</h2>
            <p>{lead.area} · {lead.propertyType}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
        </div>

        <div className="drawer-price-row">
          <div><span>Estimated all-in</span><strong>{formatMoney(lead.estimatedAllIn ?? lead.monthlyRent)}</strong></div>
          <div><span>Base rent</span><strong>{formatMoney(lead.monthlyRent)}</strong></div>
          <div><span>Commute</span><strong>{lead.commuteMinutes ? `~${lead.commuteMinutes} min` : 'TBD'}</strong></div>
        </div>

        <section className="detail-grid">
          <Detail icon="kitchen" label="Kitchen" value={lead.kitchenDetails} />
          <Detail icon="paw" label="Dogs" value={lead.petDetails} />
          <Detail icon="home" label="Furnishing" value={lead.furnished === true ? 'Furnished' : lead.furnished === false ? 'Unfurnished' : 'Needs verification'} />
          <Detail icon="map" label="Parking" value={lead.parking} />
          <Detail icon="clock" label="Minimum stay" value={lead.minStay} />
          <Detail icon="activity" label="Availability" value={lead.availability} />
        </section>

        <section className="drawer-section">
          <h3>Cost detail</h3>
          <div className="cost-lines">
            <CostLine label="Monthly rent" value={lead.monthlyRent} />
            <CostLine label="Utilities" value={lead.utilitiesIncluded ? 0 : lead.utilitiesMonthly} suffix={lead.utilitiesIncluded ? 'included' : undefined} />
            <CostLine label="Recurring pet cost" value={lead.petCostMonthly} />
            <CostLine label="One-time pet deposit" value={lead.petDeposit} />
          </div>
        </section>

        {lead.verificationGaps.length > 0 && (
          <section className="drawer-section warning-panel">
            <h3><Icon name="warning" /> Verification needed</h3>
            <ul>{lead.verificationGaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
          </section>
        )}

        <section className="drawer-section">
          <h3>Research notes</h3>
          <p className="body-copy">{lead.notes}</p>
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
            <a className="primary-button" href={lead.sourceUrl} target="_blank" rel="noreferrer"><Icon name="external" /> Open listing</a>
            {lead.phone && <a className="secondary-button" href={`tel:${lead.phone}`}>Call {lead.phone}</a>}
            {lead.email && <a className="secondary-button" href={`mailto:${lead.email}`}>Email contact</a>}
            <a className="secondary-button" href={createIssueUrl(lead, 'pursue')} target="_blank" rel="noreferrer"><Icon name="github" /> Create pursue issue</a>
            <a className="secondary-button" href={createIssueUrl(lead, 'verify')} target="_blank" rel="noreferrer"><Icon name="check" /> Request verification</a>
          </div>
          <p className="contact-meta">{lead.contactName || 'Contact not yet identified'} · {lead.contactMethod || lead.sourceName}</p>
        </section>

        <section className="drawer-section history">
          <h3>Lead history</h3>
          {lead.history.map((item) => <div key={`${item.date}-${item.note}`}><time>{item.date}</time><p>{item.note}</p></div>)}
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
