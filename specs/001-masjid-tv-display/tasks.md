# Tasks: Auto-Generated Masjid Display Mapping

**Input**: Design documents from `/specs/001-masjid-tv-display/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. The specification explicitly requires TDD and verification-first behavior.

**Organization**: Tasks are grouped by user story so each story remains independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare workspace, documentation target, and contract scaffolding references.

- [ ] T001 Validate workspace baseline with `pnpm run build:clean` from repository root
- [ ] T002 Create bilingual (Bahasa Malaysia and English) feature documentation section for mapping integrity in `docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T003 [P] Add contract index notes in `specs/001-masjid-tv-display/contracts/discovery-routing.openapi.yaml` and `specs/001-masjid-tv-display/contracts/mapping-verification.openapi.yaml`
- [ ] T004 [P] Add quickstart validation checklist for local/staging release checks in `specs/001-masjid-tv-display/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core schema/query foundations and shared service boundaries before story work.

**CRITICAL**: No user story work should begin until this phase is complete.

- [x] T005 Create failing SQL verification script for one-to-one generated mapping in `supabase/tests/verify_jakim_zones_migration.sql`
- [x] T006 Update generated-scope derivation query using zone seed joins sourced from `packages/prayer-times/src/jakim-api.ts` (`MALAYSIAN_ZONES`) in `supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T007 [P] Add deterministic selection helper SQL (`created_at ASC, id ASC`) in `supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T008 Implement exclusion logic for invalid generated mappings in discovery-facing SQL sections of `supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T009 [P] Add verification output fields (`generated_masjid_count`, `linked_display_count`, `violation_count`, `excluded_generated_masjid_ids`) in `supabase/tests/verify_jakim_zones_migration.sql`
- [x] T010 Create failing unit tests for generated-target resolution in `packages/supabase-client/src/services/zone-service.test.ts`
- [ ] T011 [P] Create failing unit tests for verification result shape in `packages/supabase-client/src/services/statistics.test.ts`
- [x] T012 Implement generated-scope selector service in `packages/supabase-client/src/services/zone-service.ts`
- [ ] T013 [P] Implement mapping verification service contract adapter in `packages/supabase-client/src/services/statistics.ts`
- [x] T014 Export/align shared verification types in `packages/shared-types/src/types/tier.ts` and `packages/shared-types/src/index.ts`

**Checkpoint**: Database and package foundations are ready for independent story implementation.

---

## Phase 3: User Story 1 - Guarantee One Display Per Auto-Generated Masjid (Priority: P1) 🎯 MVP

**Goal**: Guarantee discoverable generated masjids resolve to exactly one display target.

**Independent Test**: Run SQL verification and discovery-target API checks to prove one-to-one mapping and deterministic target routing.

### Tests for User Story 1 (TDD)

- [ ] T015 [P] [US1] Add SQL test for exactly-one-display invariant in `supabase/tests/verify_jakim_zones_migration.sql`
- [ ] T016 [P] [US1] Add contract test for successful target resolution in `apps/tv-display/tests/contract/discovery-target.spec.ts`
- [x] T017 [P] [US1] Add deterministic-order test (`created_at`, `id`) in `packages/supabase-client/src/services/zone-service.test.ts`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement discovery target endpoint as a thin adapter in `apps/tv-display/src/app/api/zones/[zone_code]/discovery-target/route.ts`
- [ ] T019 [US1] Integrate endpoint with package selector in `packages/supabase-client/src/services/zone-service.ts`
- [ ] T020 [US1] Update zone discovery caller to use the package-backed target endpoint in `apps/tv-display/src/lib/zone-client.ts`
- [x] T021 [US1] Implement deterministic ordering and active-display filtering in package query path in `packages/supabase-client/src/services/zone-service.ts`
- [ ] T022 [US1] Validate route payload against contract fields in `apps/tv-display/src/app/api/zones/[zone_code]/discovery-target/route.ts`
- [ ] T023 [US1] Document US1 verification steps in `docs/TV-LANDING-PAGE-TIERS.md`

**Checkpoint**: US1 is independently functional and testable as MVP.

---

## Phase 4: User Story 2 - Prevent Invalid Generated Data States (Priority: P2)

**Goal**: Ensure invalid generated mappings are excluded from discovery and reported without blocking deployment.

**Independent Test**: Seed invalid mapping cases and verify exclusion behavior plus non-blocking verification reporting.

### Tests for User Story 2 (TDD)

- [ ] T024 [P] [US2] Add SQL test for invalid-generated exclusion behavior in `supabase/tests/verify_jakim_zones_migration.sql`
- [ ] T025 [P] [US2] Add contract test for no-valid-target response in `apps/tv-display/tests/contract/discovery-target.spec.ts`

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement invalid-generated exclusion filter in `packages/supabase-client/src/services/zone-service.ts`
- [ ] T027 [US2] Return no-valid-target response payload from the thin adapter discovery endpoint in `apps/tv-display/src/app/api/zones/[zone_code]/discovery-target/route.ts`
- [ ] T028 [P] [US2] Implement verification violation aggregation in `packages/supabase-client/src/services/statistics.ts`
- [ ] T029 [US2] Add deployment-safe verification runner script in `supabase/tests/verify_jakim_zones_migration.sql`
- [ ] T030 [US2] Update operational remediation guidance in `docs/TV-LANDING-PAGE-TIERS.md`

**Checkpoint**: US2 independently proves exclusion/reporting behavior for invalid generated rows.

---

## Phase 5: User Story 3 - Audit Mapping Completeness (Priority: P3)

**Goal**: Provide auditable verification output for release approval.

**Independent Test**: Query verification endpoint/result and confirm required counts and excluded identifiers are present.

### Tests for User Story 3 (TDD)

- [ ] T031 [P] [US3] Add contract test for verification endpoint response shape in `apps/tv-display/tests/contract/mapping-verification.spec.ts`
- [ ] T032 [P] [US3] Add unit test for verification DTO mapping in `packages/supabase-client/src/services/statistics.test.ts`

### Implementation for User Story 3

- [ ] T033 [P] [US3] Implement verification endpoint route as a thin adapter in `apps/tv-display/src/app/api/internal/mapping-verification/generated-masjids/route.ts`
- [ ] T034 [US3] Implement verification response assembler in `packages/supabase-client/src/services/statistics.ts`
- [ ] T035 [US3] Expose verification types for consumers in `packages/shared-types/src/types/tier.ts`
- [ ] T036 [US3] Add release approval query examples in `specs/001-masjid-tv-display/quickstart.md`
- [ ] T037 [US3] Add audit-report section to docs in `docs/TV-LANDING-PAGE-TIERS.md`

**Checkpoint**: US3 independently provides auditable release evidence.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, quality gates, and cross-story hardening.

- [ ] T038 [P] Align OpenAPI contracts with final route behavior in `specs/001-masjid-tv-display/contracts/discovery-routing.openapi.yaml` and `specs/001-masjid-tv-display/contracts/mapping-verification.openapi.yaml`
- [ ] T039 [P] Add regression test matrix for seed-join scope derivation in `packages/supabase-client/src/services/zone-service.test.ts`
- [ ] T040 Add end-to-end validation script references in `specs/001-masjid-tv-display/quickstart.md`
- [ ] T041 Run full validation suite `pnpm run build:clean && pnpm test && pnpm test:e2e`
- [ ] T042 Finalize bilingual (Bahasa Malaysia and English) release documentation and rollback/remediation notes in `docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T043 [P] Add bilingual documentation parity verification checklist (ms/en) in `docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T044 [P] Measure and assert verification runtime threshold (<=2 minutes) in `supabase/tests/verify_jakim_zones_migration.sql` and document result in `docs/TV-LANDING-PAGE-TIERS.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Phase 1 and blocks all user stories.
- US1 (Phase 3): depends on Phase 2.
- US2 (Phase 4): depends on Phase 2, can run independently of US1 but integrates cleanly after US1 endpoint path is present.
- US3 (Phase 5): depends on Phase 2 and verification service outputs from US2.
- Polish (Phase 6): depends on completion of chosen user stories.

### User Story Dependencies

- US1 (P1): first MVP slice; no dependency on US2/US3.
- US2 (P2): depends on foundational verification/query layers; independent user value by preventing bad discovery exposure.
- US3 (P3): depends on verification result generation and exposes audit output.

### Within Each User Story

- Tests must be written and fail before implementation.
- SQL/data logic before API route wiring.
- Route behavior before docs finalization.

## Parallel Execution Examples

### US1 Parallel Example

- T015 [P] [US1] Add SQL test for exactly-one-display invariant in `supabase/tests/verify_jakim_zones_migration.sql`
- T016 [P] [US1] Add contract test for successful target resolution in `apps/tv-display/tests/contract/discovery-target.spec.ts`
- T017 [P] [US1] Add deterministic-order test (`created_at`, `id`) in `packages/supabase-client/src/services/zone-service.test.ts`
- T018 [P] [US1] Implement discovery target endpoint in `apps/tv-display/src/app/api/zones/[zone_code]/discovery-target/route.ts`

### US2 Parallel Example

- T024 [P] [US2] Add SQL test for invalid-generated exclusion behavior in `supabase/tests/verify_jakim_zones_migration.sql`
- T025 [P] [US2] Add contract test for no-valid-target response in `apps/tv-display/tests/contract/discovery-target.spec.ts`
- T026 [P] [US2] Implement invalid-generated exclusion filter in `packages/supabase-client/src/services/zone-service.ts`
- T028 [P] [US2] Implement verification violation aggregation in `packages/supabase-client/src/services/statistics.ts`

### US3 Parallel Example

- T031 [P] [US3] Add contract test for verification endpoint response shape in `apps/tv-display/tests/contract/mapping-verification.spec.ts`
- T032 [P] [US3] Add unit test for verification DTO mapping in `packages/supabase-client/src/services/statistics.test.ts`
- T033 [P] [US3] Implement verification endpoint route in `apps/tv-display/src/app/api/internal/mapping-verification/generated-masjids/route.ts`

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver US1 (Phase 3).
3. Validate SQL + contract behavior for deterministic one-to-one discovery routing.

### Incremental Delivery

1. Deliver US1 for baseline integrity and routing.
2. Deliver US2 for exclusion and non-blocking remediation reporting.
3. Deliver US3 for release-audit visibility.
4. Complete Polish phase and run full validation.

## Task Count Summary

- Total tasks: 44
- Setup: 4
- Foundational: 10
- US1: 9
- US2: 7
- US3: 7
- Polish: 7
