# Quickstart: Auto-Generated Masjid Display Mapping

## 1. Preconditions

- Use `pnpm` workspace tooling only.
- Ensure Supabase CLI and local stack are available if running local DB validation.
- Work from branch `001-masjid-tv-display`.

## 2. Implement Migration and Verification

1. Update migration logic in:

- `supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`

2. Add or update verification SQL in:

- `supabase/tests/verify_jakim_zones_migration.sql`

3. Ensure generated scope derivation uses zone seed join logic (no marker column).

4. Ensure invalid generated mappings are excluded from discovery and reported.

5. Ensure deterministic selector for multiple valid generated rows:

- `ORDER BY created_at ASC, id ASC`

## 3. Package and API Integration

1. Update package-level selectors/services in:

- `packages/supabase-client/src/services/`

2. Keep app layers as consumers only:

- `apps/tv-display/src/app/`

3. Ensure discovery route returns:

- one deterministic target when available
- no-data response when no valid generated target exists

## 4. Test-First Validation Flow

1. Write/adjust failing tests first:

- SQL integrity checks
- package unit tests for target resolution
- integration/contract checks for API responses

2. Apply migration and run verification.

3. Confirm success criteria:

- 100% discoverable generated masjids map to exactly one display
- 0 discoverable rows with missing/duplicate display links
- verification output includes counts and excluded IDs

## 5. Build and Test Commands

Run from repository root:

```bash
pnpm run build:clean
pnpm test
pnpm test:e2e
```

Optional DB-oriented checks if local Supabase is available:

```bash
supabase db push
supabase test db
```

## 6. Documentation Update

Update release documentation with:

- one-to-one invariant definition
- exclusion behavior for invalid mappings
- deterministic selection rule
- verification output fields and operational interpretation

Suggested target:

- `docs/TV-LANDING-PAGE-TIERS.md`
