import type { Lead, UserLeadState } from '../types'
import { assessLead, fitLabel, formatMoney, unitCategoryLabel } from '../lib/scoring'
import { Icon } from './Icon'
import { hasDirectSource, hasUsableContact, leaseTermLabel, petCategoryLabel, petPolicyCategory } from '../lib/actionability'

interface Props {
  lead: Lead
  userState?: UserLeadState
  onOpen: (lead: Lead) => void
  onFavorite: (leadId: string) => void
}

export function LeadCard({ lead, userState, onOpen, onFavorite }: Props) {
  const assessment = assessLead({ ...lead, status: userState?.status ?? lead.status })
  const displayStatus = userState?.status ?? lead.status
  const total = lead.estimatedAllIn ?? lead.monthlyRent
  const kitchenReady = lead.kitchen === 'full' || lead.kitchen === 'kitchenette'
  const checkedDate = new Date(`${lead.lastChecked}T12:00:00`)
  const petCategory = petPolicyCategory(lead)
  const warnings = [
    petCategory !== 'accepts-two' ? petCategoryLabel(petCategory) : '',
    lead.leaseTermCategory === '12-plus' ? '12+ month requirement' : lead.leaseTermCategory === 'unknown' ? 'Term unverified' : '',
    lead.furnished === false ? 'Unfurnished' : lead.furnished === null ? 'Furnishing unclear' : '',
    total !== null && total > 1150 ? 'Over stretch budget' : '',
    !lead.contactVerified || !hasUsableContact(lead) ? 'Missing verified contact' : '',
    !lead.sourceVerified || !hasDirectSource(lead) ? 'Missing direct listing' : '',
  ].filter(Boolean)

  return (
    <article className="lead-card" tabIndex={0} aria-label={`${lead.title}, score ${assessment.score} out of 100`} onClick={() => onOpen(lead)} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpen(lead)
      }
    }}>
      <div className="lead-card-topline">
        <div className={`grade grade-${assessment.grade.replace('+', 'plus').toLowerCase()}`} aria-label={`Grade ${assessment.grade}`}>
          {assessment.grade}
        </div>
        <span className={`fit-badge fit-${assessment.fit}`}>{fitLabel(assessment.fit)}</span>
        <span className={`status status-${displayStatus}`}>{displayStatus.replaceAll('-', ' ')}</span>
        <button
          className="icon-button favorite"
          aria-label={userState?.favorite ? 'Remove from shortlist' : 'Add to shortlist'}
          onClick={(event) => {
            event.stopPropagation()
            onFavorite(lead.id)
          }}
        >
          <Icon name={userState?.favorite ? 'heart-filled' : 'heart'} size={19} />
        </button>
      </div>

      <div className="lead-card-heading">
        <div>
          <h3>{lead.title}</h3>
          <p>{lead.area} · {unitCategoryLabel(lead.unitCategory)}</p>
        </div>
        <div className="price-block">
          <strong>{formatMoney(total)}</strong>
          <span>/ month est.</span>
        </div>
      </div>

      <div className="score-summary" aria-label="Lead score">
        <strong>{assessment.score}</strong><span>/100 match score</span>
      </div>

      <div className="lead-facts">
        <span className={kitchenReady ? 'fact-good' : 'fact-warning'}><Icon name="kitchen" />{lead.kitchen === 'full' ? 'Full kitchen' : lead.kitchen === 'kitchenette' ? 'Kitchenette' : lead.kitchen === 'shared' ? 'Shared kitchen' : `Kitchen ${lead.kitchen}`}</span>
        <span className={lead.petPolicy === 'confirmed' ? 'fact-good' : lead.petPolicy === 'not-allowed' ? 'fact-bad' : 'fact-warning'}><Icon name="paw" />{lead.petPolicy === 'confirmed' ? 'Two dogs confirmed' : lead.petPolicy === 'likely' ? 'Dogs likely' : `Dogs ${lead.petPolicy}`}</span>
        <span className={lead.leaseTermCategory === '12-plus' ? 'fact-bad' : lead.leaseTermCategory === 'unknown' ? 'fact-warning' : 'fact-good'}><Icon name="clock" />{leaseTermLabel(lead.leaseTermCategory)}</span>
        <span><Icon name="clock" />{lead.commuteMinutes !== null ? `~${lead.commuteMinutes} min` : 'Commute TBD'}</span>
      </div>

      {warnings.length > 0 && <div className="warning-badges" aria-label="Listing warnings">{warnings.map((warning) => <span key={warning}>{warning}</span>)}</div>}

      <div className="lead-card-footer">
        <div className="tags">
          {lead.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <span className="checked">Checked {checkedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </article>
  )
}
