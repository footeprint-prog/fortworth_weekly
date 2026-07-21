# Validated research ingestion

Use `scripts/upsert-research.mjs` to turn reviewed external research into a safe repository diff. The script does not access Gmail and contains no mail credentials.

## Workflow

```bash
npm run research:upsert -- research-payload.json
npm run research:upsert -- research-payload.json --write
npm run check
git diff -- public/data
```

Dry run is the default. `--write` atomically rewrites all three research files only after the complete payload validates.
Start from `scripts/fixtures/research-payload.example.json` when preparing a new payload.

## Payload

The payload may contain `leads`, `searchLogs`, and `coverageUpdates` arrays. Singular `lead`, `searchLog`, and `coverage` keys are also accepted.

```json
{
  "historyNote": "Rechecked price, pets, and August availability.",
  "leads": [
    {
      "id": "L-013",
      "leaseTermMinMonths": 3,
      "leaseTermMaxMonths": 6,
      "leaseTermCategory": "confirmed-3-6",
      "contactVerified": true,
      "sourceVerified": true
    }
  ],
  "searchLogs": [],
  "coverageUpdates": []
}
```

A new lead must include the complete `Lead` contract. An existing lead may be patched by stable `id`; source-URL matching is also supported. Tracking parameters are removed when matching URLs. If an incoming ID and source URL point to different existing records, ingestion stops rather than merging ambiguous records.

Material updates preserve the existing stable ID and append a dated history entry. Search-log IDs must be new. Coverage is merged by exact area name.

`contactVerified: true` requires a phone, email, or named contact plus identified inquiry channel. `sourceVerified: true` requires a valid direct HTTP(S) source. Verification booleans are human research assertions: do not set them for generic search pages, stale listings, or unverified contact paths.
