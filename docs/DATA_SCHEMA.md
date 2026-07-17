# Rental research data schema

The deployed dashboard reads three version-controlled JSON files from `public/data/`. Runtime validation rejects malformed datasets, duplicate lead IDs, invalid dates, and missing decision fields rather than silently rendering bad research.

## `leads.json`

Each record must have a unique stable `id`. Keep URLs public and do not commit private phone numbers or email addresses unless the contact has explicitly published them for the rental.

### Core classification

- `propertyType`: human-readable source description
- `unitCategory`: normalized ranking category
  - `guest-house`
  - `mother-in-law-suite`
  - `garage-apartment`
  - `furnished-studio`
  - `one-bedroom`
  - `travel-nurse-housing`
  - `corporate-housing`
  - `private-suite`
  - `private-room`
  - `conventional-apartment`
  - `inventory-pool`
  - `other`
- `privacy`: `entire-unit`, `private-suite`, `private-room`, `shared-room`, or `inventory-pool`

### Cost and requirements

- `monthlyRent`, `utilitiesMonthly`, `petCostMonthly`, `petDeposit`, `estimatedAllIn`
- `kitchen`: `full`, `kitchenette`, `shared`, `unknown`, or `none`
- `petPolicy`: `confirmed`, `likely`, `unknown`, or `not-allowed`
- `furnished`: `true`, `false`, or `null`
- `status`: research workflow status
- `confidence`: `high`, `medium`, or `low`
- `verificationGaps`: unresolved factual questions
- `history`: dated notes showing how the lead changed

Use `null` for unknown numeric values. Do not use zero unless a cost is confirmed to be zero.

### Ranking behavior

The scoring model is implemented in `src/lib/scoring.ts` and is fully tested. It weights:

1. All-in value
2. Private kitchen or kitchenette
3. Approval for two small dogs
4. Furnishings
5. Housing-type priority
6. Commute
7. Research confidence and verification completeness

Hard-requirement conflicts cap a lead even when the headline price is attractive. Shared kitchens cannot rank as requirement-ready, inventory pools cannot outrank specific listings, rejected leads are capped, and unfurnished units remain Plan B.

## `search-log.json`

Append one record per meaningful search pass. Record the platform, area, query, number reviewed, number qualified, observed outcome, next search, timestamp, and agent.

## `area-coverage.json`

Maintain one row per geographic area or non-geographic search channel. Update `status`, `platforms`, `lastSearch`, `outlook`, and `nextStep` after each pass.

## Browser decisions

Shortlists, private notes, and user-overridden statuses are saved locally in the browser and are not committed to GitHub. Use the dashboard export button to download a portable JSON backup. Create a GitHub issue when a decision or contact outcome should be shared with agents.
