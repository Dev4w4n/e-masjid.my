# Quickstart: TV Landing Page with Tiered Package Marketing

## Prerequisites

- Node.js >=18
- pnpm >=8
- Supabase CLI configured for local project

## 1) Install and clean build

```bash
pnpm install
pnpm run build:clean
```

## 2) Apply and verify migration

```bash
supabase db push
```

Run migration verification script:

```bash
supabase db execute --file supabase/tests/verify_jakim_zones_migration.sql
```

Expected verification:

- 58 active canonical JAKIM zones.
- 58 auto-populated Asas masjids (1:1 zone mapping).
- Anonymous read-only RLS available for discovery paths.

## 3) Execute package and app tests

```bash
pnpm test
pnpm --filter @masjid-suite/tv-display test:contracts
pnpm --filter @masjid-suite/tv-display test:e2e
```

Must-pass focus areas:

- Canonical `zone_code` lookup and zone endpoint contract behavior.
- Display routing by `display_id` contract.
- Tier-gating checks (compile-time boundaries, RLS denial, runtime UI checks).
- FR-011: prayer-time SWR fallback and KL-midnight rollover logic.
- FR-013: canonical-set drift sync/backfill behavior for newly added or updated zone metadata.

## 4) Run tv-display locally

```bash
pnpm --filter @masjid-suite/tv-display dev
```

Default local target: `http://localhost:3001`

## 5) Manual smoke validation

- Landing renders hero + 4 tier cards in ms/en.
- "Cari kawasan anda" opens modal and returns zone options.
- Selecting a zone routes to `/display/[display-id]` behavior.
- Asas display works without login.
- Upgrade entry points exist and are tier-aware.

## 6) Performance and accessibility checks

```bash
pnpm --filter @masjid-suite/tv-display test tests/performance-baseline.spec.ts
```

Manual checks:

- Landing load <=2s (local baseline, then staging).
- Keyboard navigation for zone modal and FAQ section.
- Touch targets >=48px on mobile layouts.

## 7) Pre-PR validation

```bash
pnpm run build:clean
pnpm lint
pnpm type-check
pnpm test
```

## Operational notes

- Keep all business validation and data policy in `packages/`; app layer composes only.
- If JAKIM API is unavailable, cache-first fallback must still render display path.
- Track CTA and zone-selection telemetry to validate SC-010 and SC-011 post-release.
