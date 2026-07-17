import type { AreaCoverage, Lead, SearchLogEntry } from '../types'
import { assessLead } from '../lib/scoring'
import { Icon } from './Icon'

export function OperationsView({ coverage, logs, leads }: { coverage: AreaCoverage[]; logs: SearchLogEntry[]; leads: Lead[] }) {
  const activeAreas = coverage.filter((area) => area.status === 'deep-searched' || area.status === 'monitoring').length
  const highPriorityGaps = coverage.filter((area) => area.priority === 'high' && area.status === 'not-searched')
  const specificLeads = leads.filter((lead) => lead.unitCategory !== 'inventory-pool').length
  const readyLeads = leads.filter((lead) => assessLead(lead).fit === 'qualified').length
  const orderedLogs = [...logs].sort((a, b) => b.searchedAt.localeCompare(a.searchedAt))

  return (
    <div className="operations-page">
      <section className="operations-metrics" aria-label="Research operations summary">
        <OperationMetric label="Active coverage" value={`${activeAreas}/${coverage.length}`} detail="deep-searched or monitored" />
        <OperationMetric label="Specific listings" value={String(specificLeads)} detail="excluding inventory pools" />
        <OperationMetric label="Requirement-ready" value={String(readyLeads)} detail="all critical facts confirmed" />
        <OperationMetric label="High-priority gaps" value={String(highPriorityGaps.length)} detail="areas not yet searched" />
      </section>

      {highPriorityGaps.length > 0 && (
        <section className="priority-callout">
          <div><Icon name="warning" /><div><span className="eyebrow">Next research priority</span><h2>Close the highest-value coverage gaps</h2></div></div>
          <div className="priority-items">{highPriorityGaps.map((area) => <span key={area.area}>{area.area}</span>)}</div>
        </section>
      )}

      <div className="operations-layout">
        <section className="panel-card">
          <div className="panel-heading"><div><span className="eyebrow">Search map</span><h2>Area coverage</h2></div><span>{activeAreas}/{coverage.length} active</span></div>
          <div className="coverage-list">
            {coverage.map((area) => (
              <article key={area.area} className="coverage-row">
                <div className={`coverage-dot status-${area.status}`} />
                <div><h3>{area.area}</h3><p>{area.nextStep}</p><div className="mini-tags">{area.platforms.length ? area.platforms.map((platform) => <span key={platform}>{platform}</span>) : <span>No platforms logged</span>}</div></div>
                <div className="coverage-meta"><strong>{area.commuteGoal}</strong><span>{area.status.replaceAll('-', ' ')}</span><span className={`outlook outlook-${area.outlook}`}>{area.outlook}</span>{area.lastSearch && <time>{formatDate(area.lastSearch)}</time>}</div>
              </article>
            ))}
          </div>
        </section>
        <section className="panel-card">
          <div className="panel-heading"><div><span className="eyebrow">Audit trail</span><h2>Search log</h2></div><Icon name="activity" /></div>
          <div className="log-list">
            {orderedLogs.map((log) => (
              <article key={log.id}>
                <time>{new Date(log.searchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
                <div><h3>{log.area} · {log.platform}</h3><p>{log.outcome}</p><small>{log.reviewed} reviewed · {log.qualified} qualified · Next: {log.nextSearch}</small></div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function OperationMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
}

function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
