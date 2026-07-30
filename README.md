# Fort Worth Premium Housing Locator

A production-oriented decision-support dashboard for finding furnished, dog-friendly housing within a 20-minute commute of Erica’s work destination at 1400 8th Ave in Fort Worth.

## Product capabilities

- Ranks specific listings and research pools with an explainable 100-point score
- Normalizes and ranks 3–6 month, under-one-year, flexible, unknown, and 12-month fallback terms
- Groups results by confirmed two-dog acceptance, unclear pet policy, and no-dog fallback comparisons
- Requires a verified direct source and usable contact channel before calling a lead actionable
- Prioritizes guest houses, mother-in-law suites, garage apartments, furnished studios, and one-bedrooms
- Separates requirement-ready leads, promising leads, research leads, disqualified options, and unfurnished Plan B inventory
- Filters by price, area, housing type, privacy, status, pet policy, lease term, kitchen, furnishings, sublet, owner-direct, lease takeover, and shortlist
- Saves shortlist, notes, and status decisions locally in the browser
- Imports and exports portable decision backups
- Opens prefilled GitHub issues for pursuing or verifying a lead
- Displays area coverage, unresolved search gaps, and an auditable research log
- Validates version-controlled JSON at runtime before rendering it

## Local development

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Quality checks

```bash
npm run check
```

This runs linting, unit tests, TypeScript compilation, and a production build.

## Updating research data

Use the validated ingestion command for structured research updates:

```bash
npm run research:upsert -- path/to/payload.json
npm run research:upsert -- path/to/payload.json --write
npm run check
```

The first command is a dry run. The write form preserves stable IDs, matches normalized source URLs, appends history for material changes, and updates leads, search logs, and coverage atomically. Review the Git diff before publishing. See:

- [Data schema](docs/DATA_SCHEMA.md)
- [Agent handoff](docs/AGENT_HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Research ingestion](docs/RESEARCH_INGESTION.md)
- [Roadmap](docs/ROADMAP.md)

## Deployment

The included GitHub Actions workflow verifies the application and deploys `dist/` to GitHub Pages on every push to `main`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

Expected dashboard URL:

`https://footeprint-prog.github.io/fortworth_weekly/`
