import type { AreaCoverage, SearchLogEntry } from '../types'
import { Icon } from './Icon'

export function OperationsView({ coverage, logs }: { coverage: AreaCoverage[]; logs: SearchLogEntry[] }) {
  return (
    <div className="operations-layout">
      <section className="panel-card">
        <div className="panel-heading"><div><span className="eyebrow">Search map</span><h2>Area coverage</h2></div><span>{coverage.filter((a) => a.status === 'deep-searched' || a.status === 'monitoring').length}/{coverage.length} active</span></div>
        <div className="coverage-list">
          {coverage.map((area) => (
            <article key={area.area} className="coverage-row">
              <div className={`coverage-dot status-${area.status}`} />
              <div><h3>{area.area}</h3><p>{area.nextStep}</p><div className="mini-tags">{area.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div></div>
              <div className="coverage-meta"><strong>{area.commuteGoal}</strong><span>{area.status.replaceAll('-', ' ')}</span><span className={`outlook outlook-${area.outlook}`}>{area.outlook}</span></div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel-card">
        <div className="panel-heading"><div><span className="eyebrow">Audit trail</span><h2>Search log</h2></div><Icon name="activity" /></div>
        <div className="log-list">
          {logs.map((log) => (
            <article key={log.id}>
              <time>{new Date(log.searchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time>
              <div><h3>{log.area} · {log.platform}</h3><p>{log.outcome}</p><small>{log.reviewed} reviewed · {log.qualified} qualified · Next: {log.nextSearch}</small></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
