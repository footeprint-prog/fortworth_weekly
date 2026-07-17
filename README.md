# Fort Worth Weekly Housing Dashboard

A focused rental-research dashboard for tracking furnished, dog-friendly housing within commuting range of Baylor Scott & White All Saints in Fort Worth.

## What it does

- Ranks leads using budget, kitchen, dogs, furnishing, privacy, commute, and verification confidence
- Shows unit details at a glance and in a full decision drawer
- Filters by price, area, privacy, status, pet policy, kitchen, furnishing, and shortlist
- Saves shortlist, notes, and status decisions locally in the browser
- Exports and imports portable decision backups
- Opens prefilled GitHub issues for pursuing or verifying a lead
- Displays search coverage and an auditable research log

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

Edit the JSON files in `public/data/`. See [the data schema](docs/DATA_SCHEMA.md) and [agent handoff brief](docs/AGENT_HANDOFF.md).

## Deployment

The included GitHub Actions workflow verifies the application and deploys the production build to GitHub Pages on every push to `main`. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not already selected.

The expected dashboard URL is:

`https://footeprint-prog.github.io/fortworth_weekly/`
