import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import type { AreaCoverage, Lead, SearchLogEntry, UserLeadState, UserState } from './types'
import { defaultFilters, filterLeads, sortLeads, type LeadFilters, type SortKey } from './lib/filters'
import { assessLead } from './lib/scoring'
import { loadDashboardData } from './lib/data'
import { downloadJson, loadUserState, saveUserState } from './lib/storage'
import { repoUrl } from './lib/github'
import { Icon } from './components/Icon'
import { LeadCard } from './components/LeadCard'
import { LeadDrawer } from './components/LeadDrawer'
import { FilterPanel } from './components/FilterPanel'
import { OperationsView } from './components/OperationsView'
import { petCategoryLabel, petPolicyCategory } from './lib/actionability'

type View = 'leads' | 'operations'

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [logs, setLogs] = useState<SearchLogEntry[]>([])
  const [coverage, setCoverage] = useState<AreaCoverage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters)
  const [sort, setSort] = useState<SortKey>('score')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [userState, setUserState] = useState<UserState>(() => loadUserState())
  const [view, setView] = useState<View>('leads')
  const [mobileFilters, setMobileFilters] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const refreshData = useCallback(() => {
    setLoading(true)
    setLoadError('')
    loadDashboardData(import.meta.env.BASE_URL)
      .then((data) => {
        setLeads(data.leads)
        setLogs(data.logs)
        setCoverage(data.coverage)
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => refreshData(), [refreshData])
  useEffect(() => saveUserState(userState), [userState])

  const favorites = useMemo(() => new Set(Object.entries(userState.leads).filter(([, state]) => state.favorite).map(([id]) => id)), [userState])
  const mergedLeads = useMemo(() => leads.map((lead) => ({ ...lead, status: userState.leads[lead.id]?.status ?? lead.status })), [leads, userState])
  const visibleLeads = useMemo(() => sortLeads(filterLeads(mergedLeads, filters, favorites), sort), [mergedLeads, filters, favorites, sort])
  const petGroups = useMemo(() => (['accepts-two', 'unclear', 'not-allowed'] as const).map((category) => ({
    category,
    leads: visibleLeads.filter((lead) => petPolicyCategory(lead) === category),
  })).filter((group) => group.leads.length > 0), [visibleLeads])
  const metrics = useMemo(() => {
    const assessments = mergedLeads.map(assessLead)
    return {
      total: leads.length,
      ready: assessments.filter((assessment) => assessment.fit === 'qualified').length,
      promising: assessments.filter((assessment) => assessment.fit === 'promising').length,
      underBudget: leads.filter((lead) => (lead.estimatedAllIn ?? lead.monthlyRent ?? Infinity) <= 1000).length,
      favorites: favorites.size,
    }
  }, [leads, mergedLeads, favorites])

  function updateLeadState(leadId: string, patch: UserLeadState) {
    setUserState((current) => ({ ...current, leads: { ...current.leads, [leadId]: { ...current.leads[leadId], ...patch } } }))
  }

  function importState(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as UserState
        if (parsed.version !== 1 || typeof parsed.leads !== 'object' || parsed.leads === null || Array.isArray(parsed.leads)) {
          throw new Error('Unsupported dashboard file')
        }
        setUserState(parsed)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Could not import file')
      }
    }
    reader.readAsText(file)
  }

  const closeDrawer = useCallback(() => setSelected(null), [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Fort Worth Housing home"><div className="brand-mark"><Icon name="home" size={22} /></div><div><strong>Fort Worth Housing</strong><span>Premium locator dashboard</span></div></a>
        <nav className="main-nav" aria-label="Primary navigation">
          <button className={view === 'leads' ? 'active' : ''} aria-current={view === 'leads' ? 'page' : undefined} onClick={() => setView('leads')}><Icon name="list" /> Leads</button>
          <button className={view === 'operations' ? 'active' : ''} aria-current={view === 'operations' ? 'page' : undefined} onClick={() => setView('operations')}><Icon name="activity" /> Operations</button>
        </nav>
        <div className="top-actions">
          <button className="icon-button mobile-filter-button" onClick={() => setMobileFilters(true)} aria-label="Open filters"><Icon name="filter" /></button>
          <a className="icon-button" href={repoUrl()} target="_blank" rel="noreferrer" aria-label="Open GitHub repository"><Icon name="github" /></a>
          <button className="icon-button" onClick={() => downloadJson(`fort-worth-decisions-${new Date().toISOString().slice(0, 10)}.json`, userState)} aria-label="Export decisions"><Icon name="download" /></button>
          <button className="icon-button" onClick={() => fileRef.current?.click()} aria-label="Import decisions"><Icon name="upload" /></button>
          <input hidden ref={fileRef} type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && importState(event.target.files[0])} />
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div><span className="eyebrow">Baylor All Saints · 1400 8th Ave</span><h1>Find the right Fort Worth home base.</h1><p>Furnished, dog-friendly housing with a private kitchen, ranked for value, privacy and commute.</p></div>
          <div className="hero-budget"><span>Target all-in</span><strong>$1,000</strong><small>Stretch ceiling $1,150</small></div>
        </section>

        <section className="metric-strip" aria-label="Lead summary">
          <Metric label="Tracked leads" value={metrics.total} />
          <Metric label="Requirement-ready" value={metrics.ready} />
          <Metric label="Promising" value={metrics.promising} />
          <Metric label="At budget" value={metrics.underBudget} />
          <Metric label="Shortlisted" value={metrics.favorites} />
          <div className="search-cadence"><span className="pulse" /><div><strong>Search watch active</strong><span>3 scans daily · 8am, 1pm, 6pm CT</span></div></div>
        </section>

        {view === 'leads' ? (
          <div className="workspace">
            <FilterPanel leads={leads} filters={filters} sort={sort} onFilters={setFilters} onSort={setSort} mobileOpen={mobileFilters} onMobileClose={() => setMobileFilters(false)} />
            <section className="lead-content" aria-live="polite">
              <div className="content-heading"><div><span className="eyebrow">Ranked inventory</span><h2>{visibleLeads.length} matching {visibleLeads.length === 1 ? 'lead' : 'leads'}</h2></div><button className="secondary-button mobile-filter-button" onClick={() => setMobileFilters(true)}><Icon name="filter" /> Filters</button></div>
              {loading && <div className="empty-state"><div className="spinner" /><h3>Loading lead database…</h3></div>}
              {loadError && <div className="empty-state error"><Icon name="warning" size={30} /><h3>Could not load the database</h3><p>{loadError}</p><button className="secondary-button" onClick={refreshData}>Try again</button></div>}
              {!loading && !loadError && visibleLeads.length === 0 && <div className="empty-state"><Icon name="search" size={30} /><h3>No leads match these filters</h3><p>Raise the price ceiling or clear one of the selected filters.</p><button className="secondary-button" onClick={() => setFilters({ ...defaultFilters })}>Reset filters</button></div>}
              <div className="lead-groups">
                {petGroups.map((group) => <section className={`pet-group pet-group-${group.category}`} key={group.category} aria-labelledby={`pet-group-${group.category}`}>
                  <div className="group-heading"><h3 id={`pet-group-${group.category}`}>{petCategoryLabel(group.category)}</h3><span>{group.leads.length}</span></div>
                  <div className="lead-list">{group.leads.map((lead) => <LeadCard key={lead.id} lead={lead} userState={userState.leads[lead.id]} onOpen={setSelected} onFavorite={(id) => updateLeadState(id, { favorite: !userState.leads[id]?.favorite, lastUpdated: new Date().toISOString() })} />)}</div>
                </section>)}
              </div>
            </section>
          </div>
        ) : <OperationsView coverage={coverage} logs={logs} leads={mergedLeads} />}
      </main>

      <footer><span>Data is research support, not a booking guarantee. Verify pricing, availability, pet terms and lease conditions directly.</span><a href={repoUrl()} target="_blank" rel="noreferrer">Agent handoff repository <Icon name="external" size={14} /></a></footer>
      <LeadDrawer lead={selected} state={selected ? userState.leads[selected.id] : undefined} onClose={closeDrawer} onUpdate={updateLeadState} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>
}
