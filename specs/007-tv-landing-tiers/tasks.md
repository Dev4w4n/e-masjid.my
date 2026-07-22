# Tasks: TV Landing Page with Tiered Package Marketing

**Input**: Design documents from `/specs/007-tv-landing-tiers/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included. TDD is explicitly required by the feature spec and constitution.

**Organization**: Tasks are grouped by user story to preserve independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared scaffolding for landing flow, routing shell, and localized content containers.

- [x] T001 Validate baseline monorepo build command in `/Users/rohaizan/Codes/ai-gen/e-masjid.my` using `pnpm run build:clean`
- [x] T002 Create feature documentation scaffold in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [x] T003 [P] Align tv-display Vite shell entry files in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/index.html`, `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/vite.config.ts`, `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/main.tsx`, and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/App.tsx`
- [x] T004 [P] Align React Router shell files in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/AppRouter.tsx`, `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/LandingRoute.tsx`, and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx`
- [x] T005 [P] Create landing locale payload files in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/ms/landing.json` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/en/landing.json`
- [x] T006 [P] Create FAQ locale payload files in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/ms/faqs.json` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/en/faqs.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core schema, package contracts, zone/tier services, analytics sink governance, and invariant tests.

**CRITICAL**: No user story phase may start before this phase is complete.

- [x] T007 Create migration for JAKIM zone + masjid auto-population in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T008 [P] Seed canonical 58 active JAKIM zones using official `zone_code` in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T009 [P] Seed exactly one Asas masjid per active zone (58 total) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T010 [P] Add anonymous-read Asas discovery RLS and owner-write policies in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260716000001_auto_populate_jakim_zones.sql`
- [x] T011 Create SQL verification script for zone/masjid/display invariants in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/tests/verify_jakim_zones_migration.sql`
- [x] T012 Apply migration locally from `/Users/rohaizan/Codes/ai-gen/e-masjid.my` using `supabase db push` and execute `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/tests/verify_jakim_zones_migration.sql`
- [x] T013 [P] Add shared tier and analytics types in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/shared-types/src/types/tier.ts` and export in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/shared-types/src/index.ts`
- [x] T014 [P] Create failing zone service tests in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/zone-service.test.ts`
- [x] T015 [P] Create failing tier service tests in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/tier-service.test.ts`
- [x] T016 [P] Implement package zone service with canonical `zone_code` validation in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/zone-service.ts`
- [x] T017 [P] Implement package tier service and comparison primitives in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/tier-service.ts` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/tier-comparison.ts`
- [x] T018 Implement package zone client adapter in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/zone-client.ts`
- [x] T019 Implement FR-011 prayer-time cache-first SWR fallback service (official JAKIM source + KL-midnight rollover) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/jakim-fallback.ts`
- [x] T020 Implement FR-013 canonical-zone scheduled synchronization service (new/changed metadata drift + backfill path) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/zone-sync.ts`
- [x] T021 Define analytics event contracts for FR-022 in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/specs/007-tv-landing-tiers/contracts/analytics-events.contract.ts`
- [x] T022 [P] Create Supabase Edge Function ingestion endpoint for analytics sink in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/functions/landing-analytics/index.ts`
- [x] T023 [P] Add analytics_events schema constraints (idempotency key + 180-day retention strategy) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260719090000_landing_analytics_events.sql`

**Checkpoint**: Foundation complete; story phases may begin.

---

## Phase 3: User Story 1 - Mosque Manager Discovers Free Tier (Priority: P1)

**Goal**: Make Asas value and no-login entry immediately clear and actionable.

**Independent Test**: User reaches landing, sees Asas primary CTA above fold, opens zone selector, and can continue without authentication.

### Tests for User Story 1 (TDD)

- [x] T024 [P] [US1] Create hero component test for Asas prominence in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/HeroSection.test.tsx`
- [x] T025 [P] [US1] Create tier card grid test for 4-tier visibility in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/TierCardGrid.test.tsx`
- [x] T026 [P] [US1] Create E2E free-entry journey in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/landing-free-tier.spec.ts`

### Implementation for User Story 1

- [x] T027 [P] [US1] Implement landing hero section in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/HeroSection.tsx`
- [x] T028 [P] [US1] Implement tier card component in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierCard.tsx`
- [x] T029 [P] [US1] Implement tier grid section in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierCardGrid.tsx`
- [x] T030 [US1] Compose landing page with hero and cards in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx`
- [x] T031 [US1] Wire landing routes in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/LandingRoute.tsx` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/AppRouter.tsx`
- [x] T032 [US1] Add localized hero/tier copy in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/ms/landing.json` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/en/landing.json`
- [x] T033 [US1] Add Asas no-login CTA action plumbing in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx`
- [ ] T034 [US1] Document US1 behavior and acceptance notes in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`

**Checkpoint**: US1 is complete and independently testable.

---

## Phase 4: User Story 2 - Mosque Admin Compares Tier Features (Priority: P1)

**Goal**: Make 4-tier differentiation scannable and decision-ready.

**Independent Test**: User can compare all required dimensions and identify differences between Asas/Maju/Gemilang/Istimewa.

### Tests for User Story 2 (TDD)

- [x] T035 [P] [US2] Create tier comparison model test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/__tests__/tier-comparison.test.ts`
- [x] T036 [P] [US2] Create comparison table component test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/TierComparisonTable.test.tsx`
- [x] T037 [P] [US2] Extend landing E2E assertions for comparison behavior in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/landing-free-tier.spec.ts`

### Implementation for User Story 2

- [x] T038 [P] [US2] Implement comparison table UI in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierComparisonTable.tsx`
- [x] T039 [US2] Add comparison toggle and featured-tier emphasis in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierCardGrid.tsx`
- [x] T040 [US2] Add localized comparison labels and values in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/ms/landing.json` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/en/landing.json`
- [x] T041 [US2] Enforce FR-015 eight-dimension mapping in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/tier-comparison.ts`
- [x] T042 [US2] Ensure mobile readable comparison mode (scroll or stacked) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierComparisonTable.tsx`
- [ ] T043 [US2] Document comparison semantics and tier differences in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`

**Checkpoint**: US2 is complete and independently testable.

---

## Phase 5: User Story 3 - User Finds Their Mosque by JAKIM Zone (Priority: P1)

**Goal**: Enable fast, canonical zone discovery and display routing with resilient prayer-time retrieval.

**Independent Test**: User selects a zone, reaches `/display/[display-id]`, sees prayer times quickly, and can switch zones while retaining session context.

### Tests for User Story 3 (TDD)

- [x] T044 [P] [US3] Create zone modal behavior test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/ZoneModal.test.tsx`
- [x] T045 [P] [US3] Create zones API contract test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/jakim-zone.spec.ts`
- [x] T046 [P] [US3] Create display routing contract test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/display-routing.spec.ts`
- [x] T047 [P] [US3] Create zone selection E2E flow in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/zone-selection.spec.ts`
- [x] T048 [P] [US3] Create return-to-landing session restore regression test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/zone-session-restore.spec.ts`
- [x] T049 [P] [US3] Create switch-zone persistence regression test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/zone-switch-state.spec.ts`

### Implementation for User Story 3

- [x] T050 [P] [US3] Implement zone selection modal UI in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/ZoneModal.tsx`
- [x] T051 [US3] Connect modal selection to package zone client and navigation in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx`
- [x] T052 [P] [US3] Implement zones index Edge Function in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/functions/zones-index/index.ts`
- [x] T053 [P] [US3] Implement zones-by-code Edge Function in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/functions/zones-by-code/index.ts`
- [x] T054 [US3] Add canonical `zone_code` and error taxonomy enforcement in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/zone-service.ts`
- [x] T055 [US3] Update display route for zone-aware rendering and switch-zone affordance in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx`
- [x] T056 [US3] Integrate FR-011 SWR prayer-time fallback into display route in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx`
- [x] T057 [US3] Add FR-019 session helper usage for locale/zone/context restore in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/lib/zone-session-state.ts` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx`

**Checkpoint**: US3 is complete and independently testable.

---

## Phase 6: User Story 4 - Mosque Upgrades from Free to Paid Tier (Priority: P2)

**Goal**: Provide a clear and safe upgrade path that preserves current state and unlocks features immediately.

**Independent Test**: User upgrades from Asas to Maju/Gemilang flow, prior settings persist, and entitled features appear immediately.

### Tests for User Story 4 (TDD)

- [x] T058 [P] [US4] Create upgrade modal component test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/UpgradeModal.test.tsx`
- [x] T059 [P] [US4] Extend E2E zone-selection flow with upgrade assertions in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/zone-selection.spec.ts`
- [x] T060 [P] [US4] Create upgrade preserve-state integration test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/upgrade-preserve-state.spec.ts`
- [x] T061 [P] [US4] Create immediate-unlock acceptance test for upgraded tier features in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/upgrade-immediate-unlock.spec.ts`

### Implementation for User Story 4

- [x] T062 [P] [US4] Implement upgrade modal UI in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/UpgradeModal.tsx`
- [x] T063 [P] [US4] Implement package upgrade intent resolver in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/upgrade-intent.ts`
- [x] T064 [US4] Add upgrade entry flow in display route in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx`
- [x] T065 [US4] Implement upgrade client adapter delegating to package layer in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/lib/upgrade-client.ts`
- [x] T066 [US4] Implement tier-change settings/content preservation in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/tier-service.ts`
- [x] T067 [US4] Implement upgrade failure rollback handling in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/services/tier-service.ts`

**Checkpoint**: US4 is complete and independently testable.

---

## Phase 7: User Story 5 - FAQ Answers Common Questions (Priority: P2)

**Goal**: Provide self-serve bilingual FAQ that reduces support friction.

**Independent Test**: User can find and read at least six FAQ answers in ms/en with accessible interactions.

### Tests for User Story 5 (TDD)

- [x] T068 [P] [US5] Create FAQ section component test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/FAQSection.test.tsx`
- [x] T069 [P] [US5] Extend landing E2E test with FAQ assertions in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/landing-free-tier.spec.ts`

### Implementation for User Story 5

- [x] T070 [P] [US5] Implement FAQ section component in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/FAQSection.tsx`
- [x] T071 [P] [US5] Populate bilingual FAQ entries (>=6) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/ms/faqs.json` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/i18n/locales/en/faqs.json`
- [x] T072 [US5] Add FAQ search/filter interactions in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/FAQSection.tsx`
- [x] T073 [US5] Integrate FAQ section into landing composition in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx`
- [x] T074 [US5] Add FAQ expand event instrumentation hooks in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/FAQSection.tsx`
- [ ] T075 [US5] Add localized FAQ/tier support notes in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T076 [US5] Verify WCAG keyboard and screen-reader behavior for FAQ interactions in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/FAQSection.tsx`

**Checkpoint**: US5 is complete and independently testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Complete cross-story hardening for boundaries, analytics governance, performance, accessibility, and release evidence.

- [ ] T077 [P] Split public and admin exports for compile-time tier boundaries in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/index.ts`
- [ ] T078 [P] Add compile-time public export boundary test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/__tests__/public-exports-boundary.test.ts`
- [ ] T079 [P] Add RLS denial verification checks for lower-tier admin paths in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/tests/verify_jakim_zones_migration.sql`
- [ ] T080 [P] Add runtime tier-gating checks in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierCardGrid.tsx`
- [ ] T081 [P] Instrument landing/display required FR-022 events in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/LandingPage.tsx` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/routes/DisplayRoute.tsx`
- [x] T082 [P] Implement analytics transport adapter with idempotency key propagation in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/lib/analytics-client.ts`
- [ ] T083 Add analytics contract/integration tests for required event fields and sink ingestion in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/analytics-events.spec.ts`
- [ ] T084 [P] Add 180-day retention and backfill-safe maintenance job for `public.analytics_events` in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/migrations/20260719091000_analytics_retention_job.sql`
- [ ] T085 [P] Add explicit FR-014 viewport contract test for 320/375/768/1024/1280 with no overflow and 48px CTA touch targets in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/tier-cards-responsive.spec.ts`
- [ ] T086 [P] Add CTA contrast/hover/focus contract test for FR-018 in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/cta-accessibility.spec.ts`
- [ ] T087 Run release validation suite from `/Users/rohaizan/Codes/ai-gen/e-masjid.my` using `pnpm run build:clean && pnpm lint && pnpm type-check && pnpm test && pnpm --filter @masjid-suite/tv-display test:e2e`
- [ ] T088 Publish SC-001/SC-010/SC-011/SC-012 evidence and governance sign-off notes in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T089 Add zone-modal WCAG validation tests for FR-016 (keyboard flow, focus return, aria semantics, axe critical=0) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/ZoneModal.accessibility.test.tsx`
- [ ] T090 Execute FR-017 Lighthouse protocol (>=30 cold-cache mobile runs per environment for local+staging, median+p95 LCP) and publish raw JSON + summary evidence in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T091 Add SC-007 prayer-time accuracy verification script/report (58 masjids, daily 06:00 Asia/Kuala_Lumpur, 14-day pass-rate computation) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/tests/verify_prayer_times_accuracy.sql` and `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T092 Add SC-005/SC-008/SC-009 measurement evidence pack (zone-discovery weekly rollup query, moderated comparison study scoring sheet, FAQ corpus coverage matrix) in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T093 Execute SC-008 moderated comprehension study (minimum 20 representative participants, <=30 second timed prompts, no facilitator hints), record raw outcomes and computed pass rate in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T094 Define and run SC-007 14-day execution schedule (daily 06:00 Asia/Kuala_Lumpur) with named owner, runbook, and daily evidence capture in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T095 Publish manual WCAG evidence for the FR-016 keyboard/screen-reader checklist and sign-off in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/docs/TV-LANDING-PAGE-TIERS.md`
- [ ] T096 Extend `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/zone-session-restore.spec.ts` with an FR-019 comparison-context restore assertion for return-to-landing

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies.
- Phase 2 (Foundational): depends on Phase 1 and blocks all story phases.
- Phase 3 (US1): depends on Phase 2.
- Phase 4 (US2): depends on Phase 2; can execute after or alongside US1 once landing shell is stable.
- Phase 5 (US3): depends on Phase 2 and package zone services.
- Phase 6 (US4): depends on Phase 2 and display-route baseline from US3.
- Phase 7 (US5): depends on Phase 2 and landing baseline from US1.
- Phase 8 (Polish): depends on completion of targeted stories.

### User Story Dependencies

- US1: foundational acquisition flow; no dependency on other stories.
- US2: independent comparison value; leverages US1 layout only.
- US3: independent discovery value; relies on foundational package/services.
- US4: depends on display-context established by US3.
- US5: depends on landing composition from US1.

### Within Each User Story

- Tests must be authored and fail before implementation.
- Data/service changes before route wiring.
- Route wiring before UX polish and docs updates.

---

## Parallel Execution Examples

### User Story 1

- T024 [P] [US1] Create hero component test for Asas prominence in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/HeroSection.test.tsx`
- T025 [P] [US1] Create tier card grid test for 4-tier visibility in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/TierCardGrid.test.tsx`
- T027 [P] [US1] Implement landing hero section in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/HeroSection.tsx`
- T028 [P] [US1] Implement tier card component in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/TierCard.tsx`

### User Story 3

- T044 [P] [US3] Create zone modal behavior test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/ZoneModal.test.tsx`
- T045 [P] [US3] Create zones API contract test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/contract/jakim-zone.spec.ts`
- T052 [P] [US3] Implement zones index Edge Function in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/functions/zones-index/index.ts`
- T053 [P] [US3] Implement zones-by-code Edge Function in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/supabase/functions/zones-by-code/index.ts`

### User Story 4

- T058 [P] [US4] Create upgrade modal component test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/__tests__/UpgradeModal.test.tsx`
- T060 [P] [US4] Create upgrade preserve-state integration test in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/tests/upgrade-preserve-state.spec.ts`
- T062 [P] [US4] Implement upgrade modal UI in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/apps/tv-display/src/app/landing/UpgradeModal.tsx`
- T063 [P] [US4] Implement package upgrade intent resolver in `/Users/rohaizan/Codes/ai-gen/e-masjid.my/packages/supabase-client/src/lib/upgrade-intent.ts`

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Deliver US1 (Phase 3) as initial acquisition MVP.
3. Deliver US3 (Phase 5) to complete discovery-to-display path.
4. Validate before starting paid-conversion and FAQ stories.

### Incremental Delivery

1. US1 -> acquisition clarity.
2. US2 -> tier comparison confidence.
3. US3 -> route-to-display usability.
4. US4 -> monetization path.
5. US5 -> support deflection.
6. Polish -> governance, performance, accessibility evidence.

---

## Summary Metrics

- Total tasks: 96
- Setup tasks: 6
- Foundational tasks: 17
- US1 tasks: 11
- US2 tasks: 9
- US3 tasks: 14
- US4 tasks: 10
- US5 tasks: 9
- Polish tasks: 20
- Parallelizable tasks (`[P]`): 52
