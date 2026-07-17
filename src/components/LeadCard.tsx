import type { Lead, UserLeadState } from '../types'
import { calculateLeadScore, formatMoney, scoreGrade } from '../lib/scoring'
import { Icon } from './Icon'

interface Props {
  lead: Lead
  userState?: UserLeadState
  onOpen: (lead: Lead) => void
  onFavorite: (leadId: string) => void
}

export function LeadCard({ lead, userState, onOpen, onFavorite }: Props) {
  const score = calculateLeadScore({ ...lead, status: userState?.status ?? lead.status })
  const grade = scoreGrade(score)
  const displayStatus = userState?.status ?? lead.status
  const total = lead.estimatedAllIn ?? lead.monthlyRent

  return (
    <article className="lead-card" tabIndex={0} onClick={() => onOpen(lead)} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') onOpen(lead)
    }}>
      <div className="lead-card-topline">
        <div className={`grade grade-${grade.replace('+', 'plus').toLowerCase()}`} aria-label={`Grade ${grade}`}>
          {grade}
        </div>
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
          <p>{lead.area} · {lead.propertyType}</p>
        </div>
        <div className="price-block">
          <strong>{formatMoney(total)}</strong>
          <span>/ month est.</span>
        </div>
      </div>

      <div className="lead-facts">
        <span><Icon name="kitchen" />{lead.kitchen === 'full' ? 'Full kitchen' : lead.kitchen === 'kitchenette' ? 'Kitchenette' : lead.kitchen}</span>
        <span className={lead.petPolicy === 'confirmed' ? 'fact-good' : ''}><Icon name="paw" />{lead.petPolicy === 'confirmed' ? 'Dogs confirmed' : `Dogs ${lead.petPolicy}`}</span>
        <span><Icon name="clock" />{lead.commuteMinutes ? `~${lead.commuteMinutes} min` : 'Commute TBD'}</span>
      </div>

      <div className="lead-card-footer">
        <div className="tags">
          {lead.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <span className="checked">Checked {new Date(`${lead.lastChecked}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </article>
  )
}
