# Implementation Plan: TV Landing Page with Tiered Package Marketing

**Branch**: `007-tv-landing-tiers` | **Date**: 2026-07-20 | **Spec**: `/specs/007-tv-landing-tiers/spec.md`
**Input**: Feature specification from `/specs/007-tv-landing-tiers/spec.md`

## Summary

Deliver a bilingual TV landing and zone-discovery experience with four tier packages, canonical JAKIM `zone_code` routing, and deterministic Asas auto-population coverage. Requirement ownership is explicitly split: FR-011 governs prayer-time freshness behavior (official source, cache-first SWR, Asia/Kuala_Lumpur midnight rollover), while FR-013 governs canonical-set drift reconciliation (scheduled zone sync plus migration/admin backfill paths for new/changed canonical metadata).

## Technical Context

**Language/Version**: TypeScript 5.2+, React 18+, Node.js >=18.0.0  
**Primary Dependencies**: Material-UI v6, React Router v6, Zustand, Vite  
**Storage**: Supabase (PostgreSQL + Auth + Storage + Real-time)  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (components)  
**Target Platform**: Web (Cloudflare deployment for staging/production)  
**Project Type**: Monorepo (Turborepo + pnpm)  
**Performance Goals**: p95 LCP <= 2.0s on local baseline and staging; UI interactions <200ms  
**Constraints**: WCAG 2.1 AA, multilingual ms/en, RLS multi-tenant security, package-first ownership  
**Scale/Scope**: Canonical active baseline is 58 JAKIM zones with one Asas auto-populated masjid per zone (58 total)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Package-First Architecture**: Business logic and policies live in package/services and Supabase layers; app layer composes UI and routing.
- [x] **Test-First Development**: TDD sequencing is represented across tasks and contracts (unit, contract, E2E).
- [x] **Database-First Development**: Migration + SQL verification + RLS policies are defined and tracked.
- [x] **Monorepo Discipline**: `pnpm` and `pnpm run build:clean` are the required baseline commands.
- [x] **Environment Strategy**: Local/staging/production execution and evidence flow are included.
- [x] **Multilingual Support**: ms/en content, labels, and FAQ payloads are mandatory outputs.
- [x] **Documentation**: `/docs/TV-LANDING-PAGE-TIERS.md` remains the release evidence target.

Post-design re-check result: PASS. No constitutional violations were introduced by the FR-011/FR-013 boundary refinement.

## Project Structure

### Documentation (this feature)

```text
specs/007-tv-landing-tiers/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
packages/
├── prayer-times/          # canonical MALAYSIAN_ZONES source + JAKIM integration
├── supabase-client/       # zone service, zone-sync service, SWR fallback service
└── shared-types/          # tier, zone, analytics shared contracts

apps/
└── tv-display/
    ├── src/app/landing/   # landing UI, tier cards, zone modal, FAQ
    └── src/routes/        # display routing and switch-zone flow

supabase/
├── migrations/            # auto-population + analytics schema constraints
└── functions/             # zones-index, zones-by-code, landing-analytics

docs/
└── TV-LANDING-PAGE-TIERS.md
```

**Structure Decision**: Extend existing `packages/supabase-client`, `packages/shared-types`, and `packages/prayer-times` for domain behavior and canonical registry logic, while keeping `apps/tv-display` as a presentation/routing consumer. Use Supabase migrations and edge functions for persistence, synchronization paths, and analytics ingestion.

## Execution Phase Mapping

This plan defines scope, architecture, and requirement boundaries; `tasks.md` is the canonical execution ledger.

- Phase 1-2 (Foundation): shared contracts, migrations, canonical zone/tier services.
- Phase 3-7 (User Stories): US1-US5 implementation and validation in priority order.
- Phase 8 (Polish and cross-cutting): quality attributes, evidence capture, and release readiness.

For sequencing, ownership, and completion status, use `/specs/007-tv-landing-tiers/tasks.md`.

## SC-009 Canonical FAQ Corpus

Canonical source for SC-009 corpus and coverage mapping: `/specs/007-tv-landing-tiers/plan.md` (this section).

Deterministic corpus (minimum 10 questions):

1. What is the difference between Asas and Maju?
2. What is the difference between Maju and Gemilang?
3. What is the difference between Gemilang and Istimewa?
4. Can we use more than one display screen?
5. Is pricing charged per masjid or per screen?
6. Is Asas free and does it require a credit card?
7. How do payment methods and billing frequency work?
8. What support channels are included for each tier?
9. How do we upgrade from Asas to a paid tier?
10. Can we keep existing settings/content after upgrading?

Process-only governance:

- Changes to this corpus must be made in this section before release evidence is generated.
- SC-009 evidence tasks must map each corpus question to ms/en FAQ answers and record covered/not-covered status.

## Complexity Tracking

No constitution violations require exception handling for this planning pass.
