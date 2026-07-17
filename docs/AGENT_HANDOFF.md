# Agent handoff: Fort Worth weekly housing

## Mission

Find a practical furnished home base for weekly Baylor Scott & White All Saints contract stays, centered on approximately **$1,000 monthly all-in** with a stretch ceiling near **$1,150**.

## Hard requirements

- At least a genuine kitchenette or full kitchen. A microwave-only room does not qualify.
- Two small dogs must be accepted.
- Furnished is strongly preferred. Conventional unfurnished apartments may be retained only as a clearly labeled Plan B with furnishing costs included.

## Search guidance

- Do not require special long-term parking. Record available parking details only.
- Do not filter for explicit two-adult language. Flag only unusual occupancy restrictions.
- Search up to roughly 40 minutes from 1400 8th Ave, Fort Worth.
- Prioritize entire guest houses, ADUs, garage apartments, furnished studios, one-bedrooms, and private suites before private rooms.
- Always calculate the likely all-in monthly cost. Headline rent alone is insufficient.

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
4. Preserve rejected leads when they teach something useful; mark them `rejected` and record the reason.
5. Run `npm run check` before publishing.
6. Use GitHub issues for contact outcomes, pursue decisions, and agent-to-agent questions.

## Verification checklist for each promising lead

- Current availability and move-in date
- Total monthly rent after utilities and mandatory fees
- Pet approval for two small dogs, including deposits and recurring rent
- Real kitchen or kitchenette details
- Furnishings included
- Minimum stay and termination terms
- Approximate typical commute
- Contact method and next action

## Search cadence

The associated ChatGPT rental watch runs three times daily at approximately 8:00 a.m., 1:00 p.m., and 6:00 p.m. Central through July 21, 2026. Material findings should be reflected in this repository during active working sessions.
