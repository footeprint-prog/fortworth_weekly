# Rental lead data schema

The deployed dashboard reads three version-controlled JSON files from `public/data/`.

## `leads.json`

Each record must have a unique stable `id`. Keep URLs public and do not commit private phone numbers or email addresses unless the contact has explicitly published them for the rental.

Required decision fields:

- `monthlyRent`, `utilitiesMonthly`, `petCostMonthly`, `estimatedAllIn`
- `kitchen`: `full`, `kitchenette`, `shared`, `unknown`, or `none`
- `petPolicy`: `confirmed`, `likely`, `unknown`, or `not-allowed`
- `privacy`: `entire-unit`, `private-suite`, `private-room`, `shared-room`, or `inventory-pool`
- `status`: research workflow status
- `verificationGaps`: unresolved factual questions
- `history`: dated notes showing how the lead changed

Use `null` for unknown numeric values. Do not use zero unless the cost is confirmed to be zero.

## `search-log.json`

Append one record per meaningful search pass. Record the platform, area, query, number reviewed, number qualified, observed outcome, and next search.

## `area-coverage.json`

Maintain one row per geographic area or non-geographic search channel. Update `status`, `platforms`, `lastSearch`, and `nextStep` after each pass.

## Browser decisions

Shortlists, personal notes, and user-overridden statuses are saved locally in the browser and are not committed to GitHub. Use the dashboard export button to download a portable JSON backup. Create a GitHub issue when a decision or contact outcome should be shared with agents.
