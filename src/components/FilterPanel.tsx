import type { Lead, LeadStatus, PetPolicy, UnitPrivacy } from '../types'
import type { LeadFilters, SortKey } from '../lib/filters'
import { defaultFilters } from '../lib/filters'
import { Icon } from './Icon'

interface Props {
  leads: Lead[]
  filters: LeadFilters
  sort: SortKey
  onFilters: (filters: LeadFilters) => void
  onSort: (sort: SortKey) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const statusOptions: LeadStatus[] = ['new', 'investigate', 'contacted', 'awaiting-reply', 'tour-verify', 'shortlist', 'rejected', 'plan-b']
const privacyOptions: UnitPrivacy[] = ['entire-unit', 'private-suite', 'private-room', 'inventory-pool']
const petOptions: PetPolicy[] = ['confirmed', 'likely', 'unknown', 'not-allowed']

export function FilterPanel({ leads, filters, sort, onFilters, onSort, mobileOpen, onMobileClose }: Props) {
  const areas = [...new Set(leads.map((lead) => lead.area))].sort()
  const toggle = <T extends string>(key: 'areas' | 'statuses' | 'privacy' | 'petPolicies', value: T) => {
    const current = filters[key] as T[]
    onFilters({ ...filters, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] })
  }

  return (
    <aside className={`filters-panel ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="filter-header">
        <div><Icon name="filter" /><h2>Filters</h2></div>
        <button className="icon-button mobile-only" onClick={onMobileClose} aria-label="Close filters"><Icon name="close" /></button>
      </div>
      <label className="field-label">Search
        <div className="search-field"><Icon name="search" /><input value={filters.query} onChange={(event) => onFilters({ ...filters, query: event.target.value })} placeholder="Area, property, notes…" /></div>
      </label>
      <label className="field-label">Maximum monthly total
        <div className="price-filter"><input type="range" min="800" max="1800" step="25" value={filters.maxPrice} onChange={(event) => onFilters({ ...filters, maxPrice: Number(event.target.value) })} /><strong>${filters.maxPrice.toLocaleString()}</strong></div>
      </label>
      <label className="field-label">Sort by
        <select value={sort} onChange={(event) => onSort(event.target.value as SortKey)}>
          <option value="score">Best match</option><option value="price">Lowest total</option><option value="commute">Shortest commute</option><option value="updated">Recently checked</option>
        </select>
      </label>
      <FilterGroup title="Essentials">
        <Check label="Real kitchen/kitchenette" checked={filters.kitchensOnly} onChange={() => onFilters({ ...filters, kitchensOnly: !filters.kitchensOnly })} />
        <Check label="Furnished only" checked={filters.furnishedOnly} onChange={() => onFilters({ ...filters, furnishedOnly: !filters.furnishedOnly })} />
        <Check label="Shortlisted only" checked={filters.favoritesOnly} onChange={() => onFilters({ ...filters, favoritesOnly: !filters.favoritesOnly })} />
      </FilterGroup>
      <FilterGroup title="Dog policy">
        {petOptions.map((option) => <Check key={option} label={option.replaceAll('-', ' ')} checked={filters.petPolicies.includes(option)} onChange={() => toggle('petPolicies', option)} />)}
      </FilterGroup>
      <FilterGroup title="Privacy">
        {privacyOptions.map((option) => <Check key={option} label={option.replaceAll('-', ' ')} checked={filters.privacy.includes(option)} onChange={() => toggle('privacy', option)} />)}
      </FilterGroup>
      <FilterGroup title="Status">
        {statusOptions.map((option) => <Check key={option} label={option.replaceAll('-', ' ')} checked={filters.statuses.includes(option)} onChange={() => toggle('statuses', option)} />)}
      </FilterGroup>
      <FilterGroup title="Area">
        {areas.map((area) => <Check key={area} label={area} checked={filters.areas.includes(area)} onChange={() => toggle('areas', area)} />)}
      </FilterGroup>
      <button className="text-button reset" onClick={() => onFilters(defaultFilters)}>Reset all filters</button>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="filter-group"><legend>{title}</legend>{children}</fieldset>
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="check-row"><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span></label>
}
