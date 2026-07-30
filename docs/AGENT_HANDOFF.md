# Agent handoff: Fort Worth premium housing locator

## Mission

Find the highest-value furnished home base within a **20-minute commute** of Erica’s work destination at **1400 8th Ave, Fort Worth, TX 76104**, centered on approximately **$1,000 monthly all-in** with a stretch ceiling near **$1,150** for exceptional value.

## Primary qualification

- At least a private kitchenette or full kitchen. Shared kitchens do not qualify as requirement-ready.
- Two small dogs must be accepted.
- Furnished is preferred for primary candidates. Clearly label unfurnished and partially furnished Plan B options and estimate minimal furnishing costs when practical.
- Require a confirmed 3–6 month term, or at minimum a confirmed term under one year, for requirement-ready leads.
- Require a verified direct listing/source URL and a usable verified contact or listing inquiry channel before presenting a lead as ready to contact.
- Require an estimated typical commute of 20 minutes or less to 1400 8th Ave for requirement-ready leads. Longer commutes remain visible only as explicit fallbacks.

No-dog, shared-kitchen, unfurnished, and 12-month-only options may remain visible as explicit comparisons. They must never rank as requirement-ready or promising pet-compatible inventory.

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
- Search within a 20-minute typical commute of 1400 8th Ave, Fort Worth, TX 76104. Retain unusually strong results beyond that limit only as clearly labeled commute fallbacks.
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

1. Prepare a structured payload described in `docs/RESEARCH_INGESTION.md`.
2. Dry-run `npm run research:upsert -- payload.json`.
3. Review the summary, then repeat with `--write`.
4. Preserve stable IDs and append history when facts change; the CLI enforces both ID and normalized-source matching.
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

The rental watch runs four times daily at approximately 8:00 a.m., 1:00 p.m., 6:00 p.m., and 10:00 p.m. Central. The Erica reply watch and the data publisher run hourly. Material findings should be reflected through a validated data-only pull request.

## July 16, 2026 initialization update

- The dashboard now uses normalized housing categories and an explainable, hard-requirement-aware scoring model.
- Runtime validation protects the application from malformed research JSON.
- Filters distinguish specific listings, requirement-ready leads, fallback inventory, and research pools.
- Operations reporting now exposes coverage gaps and current search metrics.
- Five current Airbnb guest-house records were added as `L-010` through `L-014`; exact date pricing and dog verification remain explicit next actions.
- The GitHub repository is readable but the connected integration returns HTTP 403 for every write operation. See `docs/GITHUB_CONNECTION_BLOCKER.md` and use the prepared Git bundle or source ZIP until the integration is reinstalled with write access.

## July 20, 2026 Codex migration

- Added normalized lease-term fields, source/contact verification, actionability checks, and sublet/owner-direct/lease-takeover flags.
- Pet categories now remain visibly grouped; no-dog listings are fallback-only instead of hidden.
- Added safe-area, 44-pixel target, portrait/landscape, drawer, and mobile-action hardening for iPhone 16 Pro Max.
- Added the dry-run-first research ingestion CLI. This prepares repository updates from external email research but does not connect Gmail or claim an automated email-to-GitHub write path.

## July 30, 2026 recovery backfill

- Live GitHub inspection confirmed that the earlier one-time retries had not created a backfill branch or pull request and that `main` still ended with July 16 research.
- Reopened eight direct listing sources and added `L-015` through `L-023`. The owner-direct 76105 Facebook studio is retained as explicitly unverified because the direct post could not be opened; it must not be presented as actionable.
- Corrected Furnished Finder property `816590_7` from the handoff's reported “Unit 617” label to the current source title, **Axis Waterfront 1018**.
- Preserved the low-cost but limited comparisons: 1115 S Jennings Unit 11 is no-dog and 12-month-only; Bryan Flats uses a shared full kitchen and has an unresolved two-dog conflict; CoHo and Axis are over the stretch budget.
- Replaced the shared generic Zillow search URL on `L-005` and `L-006` with distinct official property URLs, eliminating the pre-existing normalized-source collision while preserving both stable IDs and their histories.
- Added reconciliation log `S-005` and refreshed coverage for Hulen, West Arlington, Near Southside, owner-direct channels, and Eastchase.
- GitHub connector permissions are now verified as admin/push capable. The July 16 HTTP 403 note is historical and no longer describes the active connection.
- Gmail outbound capability was proven by a controlled self-delivery from Aaron's authenticated account and independent Sent-folder verification. No test message was sent to Erica.
- Publication remains subject to a data-only pull request, duplicate and history checks, repository validation, successful GitHub checks, merge verification on `main`, and deployed-dashboard verification.

## July 30, 2026 evening rental-watch update

- Added `L-024`, an available owner-direct backyard tiny house at 1404 Sunny Glen St for $950 all bills paid.
- Verified a private kitchenette, $950 deposit, direct landlord contact, and a six-month lease across current Apartments.com, Realtor.com, TurboTenant, and RentalSource syndication.
- The listing allows pets only with approval and charges a $300 nonrefundable deposit per pet; two small dogs remain unconfirmed.
- The unit is treated as an unfurnished fallback and its typical commute to 1400 8th Ave remains a verification item near the 20-minute ceiling.
- Updated the Crowley coverage record and appended search log `S-006`.
