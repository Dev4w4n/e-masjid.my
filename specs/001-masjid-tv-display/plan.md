# Implementation Plan: Auto-Generated Masjid Display Mapping

**Branch**: `001-masjid-tv-display` | **Date**: 2026-07-18 | **Spec**: `/specs/001-masjid-tv-display/spec.md`
**Input**: Feature specification from `/specs/001-masjid-tv-display/spec.md`

## Summary

Enforce and verify a one-to-one mapping between auto-generated masjids and tv-display records for discovery flows. Auto-generated scope is identified via joins against the official zone seed list (no new generated marker column). Invalid mappings are excluded from discovery while deployment continues, and verification outputs must include violation counts and excluded identifiers.

## Technical Context

**Language/Version**: SQL (PostgreSQL/Supabase), TypeScript 5.2+, Node.js >=18.0.0  
**Primary Dependencies**: Supabase PostgreSQL, `@masjid-suite/supabase-client`, `@masjid-suite/shared-types`, Vitest, Playwright  
**Storage**: Supabase PostgreSQL with RLS  
**Testing**: SQL verification scripts + Vitest unit tests + Playwright/E2E contract checks  
**Target Platform**: Web + Supabase-backed APIs (staging/prod via Cloudflare deployment flow)  
**Project Type**: Monorepo (Turborepo + pnpm)  
**Performance Goals**: Mapping verification <=2 minutes per deployment run; deterministic discovery target resolution for unchanged data  
**Constraints**: Package-first ownership, database-first migration flow, bilingual documentation updates, non-blocking deployment for invalid generated mappings  
**Scale/Scope**: 68 official JAKIM zones; 1 discoverable auto-generated masjid target per zone; deterministic selector `created_at ASC, id ASC`

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Package-First Architecture**: Domain logic and selectors are defined in packages and SQL artifacts; apps remain consumers.
- [x] **Test-First Development**: Plan includes failing SQL/contract checks before implementation hardening.
- [x] **Database-First Development**: Uses Supabase migration and verification-first workflow.
- [x] **Monorepo Discipline**: Uses pnpm and `pnpm run build:clean` for validation.
- [x] **Environment Strategy**: Local, staging, production release checks are included in quickstart.
- [x] **Multilingual Support**: Documentation updates include ms/en guidance text for ops handoff.
- [x] **Documentation**: `/docs` update is explicitly planned.

No violations requiring complexity exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-masjid-tv-display/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── discovery-routing.openapi.yaml
│   └── mapping-verification.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
packages/
├── prayer-times/
│   └── src/jakim-api.ts
├── shared-types/
│   └── src/types/
├── supabase-client/
│   └── src/services/

apps/
└── tv-display/
    └── src/app/

supabase/
├── migrations/
│   └── 20260716000001_auto_populate_jakim_zones.sql
└── tests/

docs/
└── TV-LANDING-PAGE-TIERS.md
```

**Structure Decision**: Extend existing migration, verification SQL, and package services instead of creating a new package. Discovery and validation rules are centralized in Supabase and package-layer selectors, while `packages/prayer-times/src/jakim-api.ts` remains the authoritative source for the official zone seed list.

## Phase 0: Research Decisions

See `/specs/001-masjid-tv-display/research.md`.

## Phase 1: Design Outputs

- Data model: `/specs/001-masjid-tv-display/data-model.md`
- Contracts: `/specs/001-masjid-tv-display/contracts/`
- Quickstart: `/specs/001-masjid-tv-display/quickstart.md`

## Post-Design Constitution Check

- [x] Package-first responsibilities are preserved.
- [x] TDD-first sequencing is captured in verification-first workflow.
- [x] Database-first and RLS-compatible constraints are represented.
- [x] Monorepo build and test commands are explicit.
- [x] Documentation and bilingual requirements are represented.

## Complexity Tracking

No constitution exceptions required.
