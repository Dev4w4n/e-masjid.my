# Implementation Plan: TV Landing Page with Tiered Package Marketing

**Branch**: `007-tv-landing-tiers` | **Date**: 2026-07-18 | **Spec**: `/specs/007-tv-landing-tiers/spec.md`
**Input**: Feature specification from `/specs/007-tv-landing-tiers/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a marketing-first TV landing flow with four tiers (Asas, Maju, Gemilang, Istimewa), zone discovery by official JAKIM `zone_code`, and no-login Asas entry. The solution is package-first: domain types and contracts in `packages/shared-types`, zone/tier business logic and prayer-time resiliency in `packages/supabase-client`, and UI composition in `apps/tv-display`.

## Technical Context

**Language/Version**: TypeScript 5.2+, React 18+, Node.js >=18.0.0  
**Primary Dependencies**: Material-UI v6, Vite build system, React Router v6, Zustand, Supabase JS client  
**Storage**: Supabase PostgreSQL + RLS + realtime; prayer-time cache persisted in the existing `prayer_times` table and accessed through a package-owned SWR adapter in `packages/supabase-client`
**Testing**: Vitest (unit), Playwright (E2E/contract), React Testing Library (component), SQL contract tests  
**Target Platform**: Web (Cloudflare staging/production)  
**Project Type**: Monorepo (Turborepo + pnpm)  
**Performance Goals**: Landing <=2s load, zone selection interaction <=500ms, cache-first prayer-times render  
**Constraints**: WCAG 2.1 AA, bilingual ms/en content, explicit anonymous read-only RLS for Asas discovery, package-first boundaries  
**Scale/Scope**: 58 canonical active JAKIM zones, exactly 58 auto-populated Asas masjids (1:1), four marketed tiers
**Observability**: Landing analytics events are part of the planned contract surface so SC-010/SC-011 can be measured and reviewed in docs/tests

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Package-First Architecture**: Business logic is planned in `packages/supabase-client`; app layer remains presentation/composition.
- [x] **Test-First Development**: Contract/component/service tests are planned before implementation tasks.
- [x] **Database-First Development**: Supabase migration + SQL verification tests + RLS policies are included.
- [x] **Monorepo Discipline**: pnpm and `pnpm run build:clean` are the prescribed build path.
- [x] **Environment Strategy**: local/staging/production workflow remains intact.
- [x] **Multilingual Support**: ms/en content required for tier cards, zone labels, FAQs, and CTAs.
- [x] **Documentation**: Feature documentation update in `/docs/TV-LANDING-PAGE-TIERS.md` is included.

Post-design re-check: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/007-tv-landing-tiers/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── display-routing.contract.ts
│   ├── jakim-zone.contract.ts
│   ├── tier-package.contract.ts
│   └── analytics-events.contract.ts
└── tasks.md
```

### Source Code (repository root)

```text
packages/
├── shared-types/
│   └── src/types/tier.ts
├── supabase-client/
│   └── src/
│       ├── services/zone-service.ts
│       ├── services/tier-service.ts
│       └── lib/zone-client.ts
apps/
└── tv-display/
    └── src/
        ├── app/landing/
        ├── routes/AppRouter.tsx
        ├── routes/LandingRoute.tsx
        └── routes/DisplayRoute.tsx

supabase/
├── migrations/
│   └── 20260716000001_auto_populate_jakim_zones.sql
├── functions/
│   ├── zones-index/
│   │   └── index.ts
│   └── zones-by-code/
│       └── index.ts
└── tests/
    └── verify_jakim_zones_migration.sql

docs/
└── TV-LANDING-PAGE-TIERS.md
```

**Structure Decision**: Extend existing packages instead of creating a new feature package. This preserves package-first ownership while minimizing integration overhead in `apps/tv-display`.

## Phase 0: Research Decisions

See `/specs/007-tv-landing-tiers/research.md`.

## Phase 1: Design Outputs

- Data model: `/specs/007-tv-landing-tiers/data-model.md`
- Contracts: `/specs/007-tv-landing-tiers/contracts/`
- Quickstart: `/specs/007-tv-landing-tiers/quickstart.md`

## Post-Design Constitution Check

- [x] Package-first boundaries preserved in artifacts.
- [x] TDD-first sequencing represented in test and validation workflow.
- [x] Database-first/RLS constraints represented in model/contracts.
- [x] Monorepo/build rules represented in quickstart.
- [x] Multilingual requirements preserved in data contracts and acceptance flow.

## Complexity Tracking

No constitution deviations required. The tv-display shell now uses Vite + React Router v6, which matches the mandatory frontend stack.
