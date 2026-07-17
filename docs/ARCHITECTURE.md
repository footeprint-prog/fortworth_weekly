# Architecture

## System overview

The dashboard is a static React + TypeScript application built by Vite and deployed to GitHub Pages. GitHub is the canonical system of record for research data and operational documentation.

```text
public/data/*.json
        │
        ▼
src/lib/data.ts ── runtime validation
        │
        ▼
React application state
        │
        ├── scoring and fit assessment
        ├── filtering and sorting
        ├── lead decision drawer
        └── operations/coverage view

Browser localStorage
        └── personal shortlist, notes, and status overrides
```

## Design decisions

### Version-controlled research, local personal decisions

Research facts belong in `public/data/` so every agent sees the same source material and changes are auditable. Personal notes and provisional decisions stay in local storage to avoid committing sensitive or noisy content. Export/import provides portability.

### Explainable scoring

`assessLead()` returns the score, grade, fit tier, requirement conflicts, verification warnings, and component-level breakdown. The UI does not treat a single number as sufficient evidence.

### Normalized unit categories

`unitCategory` prevents fragile ranking based only on free-text property names and encodes the assignment's priority order. `propertyType` remains available for human-readable source language.

### No backend dependency yet

The application remains deployable as a static site. GitHub issues provide a lightweight shared workflow for contact outcomes and handoffs. A backend should be introduced only when automated ingestion, authenticated collaboration, or server-side secrets justify it.

## Extension points

- Add source adapters that emit validated `Lead` records
- Introduce JSON Schema generation from the TypeScript model
- Add automated URL health and staleness checks
- Add geocoded commute estimates without storing private addresses
- Add authenticated shared decisions when multi-user collaboration becomes necessary
- Add duplicate detection based on normalized URL, address fingerprint, and host/property identifiers

## Quality gates

`npm run check` must pass before publication. It runs:

1. Oxlint
2. Vitest unit tests
3. TypeScript project build
4. Vite production build
