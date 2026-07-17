import type { Lead } from '../types'
import { assessLead, fitLabel, formatMoney, unitCategoryLabel } from './scoring'

const REPO_URL = 'https://github.com/footeprint-prog/fortworth_weekly'

export function createIssueUrl(lead: Lead, action: 'pursue' | 'verify' | 'update'): string {
  const assessment = assessLead(lead)
  const titlePrefix = action === 'pursue' ? 'Pursue' : action === 'verify' ? 'Verify' : 'Update'
  const title = `${titlePrefix}: ${lead.title}`
  const body = [
    `## Lead`,
    `- **ID:** ${lead.id}`,
    `- **Area:** ${lead.area}`,
    `- **Housing type:** ${unitCategoryLabel(lead.unitCategory)}`,
    `- **Estimated all-in:** ${formatMoney(lead.estimatedAllIn ?? lead.monthlyRent)}/month`,
    `- **Assessment:** ${assessment.grade} · ${assessment.score}/100 · ${fitLabel(assessment.fit)}`,
    `- **Kitchen:** ${lead.kitchenDetails}`,
    `- **Pet policy:** ${lead.petDetails}`,
    `- **Availability:** ${lead.availability}`,
    `- **Source:** ${lead.sourceUrl}`,
    '',
    `## Requested action`,
    action === 'pursue'
      ? 'Contact the property or host and record the response, full monthly cost, pet terms, and next step.'
      : action === 'verify'
        ? `Resolve these gaps: ${lead.verificationGaps.join('; ') || 'No gaps listed.'}`
        : 'Record the new information and update the lead database.',
    '',
    '## Requirement conflicts',
    assessment.hardRequirementFailures.length ? assessment.hardRequirementFailures.map((item) => `- ${item}`).join('\n') : '- None recorded',
    '',
    '## Notes',
    lead.notes,
  ].join('\n')
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent('lead')}`
}

export function repoUrl(): string {
  return REPO_URL
}
