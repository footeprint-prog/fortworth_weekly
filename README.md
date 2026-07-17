# Fort Worth Premium Housing Locator

A production-oriented decision-support dashboard for finding furnished, dog-friendly housing near Baylor Scott & White All Saints Medical Center in Fort Worth.

## Product capabilities

- Ranks specific listings and research pools with an explainable 100-point score
- Enforces the real operating requirements: private kitchenette/full kitchen, furnished, and approval for two small dogs
- Prioritizes guest houses, mother-in-law suites, garage apartments, furnished studios, and one-bedrooms
- Separates requirement-ready leads, promising leads, research leads, disqualified options, and unfurnished Plan B inventory
- Filters by price, area, housing type, privacy, status, pet policy, furnishings, and shortlist
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

Edit the JSON files in `public/data/`. See:

- [Data schema](docs/DATA_SCHEMA.md)
- [Agent handoff](docs/AGENT_HANDOFF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Deployment

The included GitHub Actions workflow verifies the application and deploys `dist/` to GitHub Pages on every push to `main`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

Expected dashboard URL:

`https://footeprint-prog.github.io/fortworth_weekly/`
