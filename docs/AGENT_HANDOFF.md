# Agent handoff: Fort Worth premium housing locator

## Mission

Find the highest-value furnished home base near Baylor Scott & White All Saints Medical Center, centered on approximately **$1,000 monthly all-in** with a stretch ceiling near **$1,150** for exceptional value.

## Hard requirements

- At least a private kitchenette or full kitchen. Shared kitchens do not qualify as requirement-ready.
- Two small dogs must be accepted.
- Furnished is required for primary candidates. Conventional unfurnished apartments may be retained only as clearly labeled Plan B options with furnishing costs included.

## Housing priority order

1. Entire guest house
2. Mother-in-law suite
3. Garage apartment
4. Furnished studio
5. One-bedroom apartment
6. Travel nurse housing
7. Corporate housing
8. Exceptional private suite or room

Record the normalized priority in `unitCategory` rather than relying on free-text property descriptions.

## Search guidance

- Record parking but do not use it as a hard filter.
- Search up to roughly 40 minutes from 1400 8th Ave, Fort Worth.
- Always calculate likely all-in monthly cost; headline rent alone is insufficient.
- Preserve rejected leads when they teach something useful, with a dated reason.
- Separate specific listings from inventory/search pools.

## Current research priorities

1. Benbrook
2. Hulen and southwest Fort Worth
3. Lake Worth and River Oaks
4. White Settlement and west Fort Worth
5. West Arlington
6. North Richland Hills and Haltom City
7. Crowley and Burleson
8. Owner-direct channels, travel-clinician groups, local property managers, sublets, and lease takeovers

## Update protocol

1. Add or update a lead in `public/data/leads.json`.
2. Append a search pass to `public/data/search-log.json`.
3. Update the relevant row in `public/data/area-coverage.json`.
4. Preserve stable IDs and append history when facts change.
5. Run `npm run check` before publishing.
6. Use GitHub issues for contact outcomes, pursue decisions, and agent-to-agent questions.

## Verification checklist

- Current availability and move-in date
- Total monthly rent after utilities and mandatory fees
- Pet approval for two small dogs, including deposits and recurring rent
- Private full kitchen or kitchenette details
- Furnishings included
- Minimum stay and termination terms
- Approximate typical commute
- Contact method and next action

## Search cadence

The rental watch runs three times daily at approximately 8:00 a.m., 1:00 p.m., and 6:00 p.m. Central. Material findings should be reflected in this repository during active working sessions.

## July 16, 2026 initialization update

- The dashboard now uses normalized housing categories and an explainable, hard-requirement-aware scoring model.
- Runtime validation protects the application from malformed research JSON.
- Filters distinguish specific listings, requirement-ready leads, fallback inventory, and research pools.
- Operations reporting now exposes coverage gaps and current search metrics.
- Five current Airbnb guest-house records were added as `L-010` through `L-014`; exact date pricing and dog verification remain explicit next actions.
- The GitHub repository is readable but the connected integration returns HTTP 403 for every write operation. See `docs/GITHUB_CONNECTION_BLOCKER.md` and use the prepared Git bundle or source ZIP until the integration is reinstalled with write access.
