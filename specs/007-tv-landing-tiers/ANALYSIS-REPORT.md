# Specification Analysis Report: TV Landing Page with Tiered Package Marketing

**Feature**: `007-tv-landing-tiers`  
**Analysis Date**: 2026-07-16  
**Analyst**: GitHub Copilot (speckit.analyze mode)  
**Scope**: spec.md ↔ plan.md ↔ data-model.md ↔ contracts/ ↔ tasks.md  
**Constitution Reference**: Open E Masjid Constitution v1.0

---

## Analysis Summary

**Total Findings**: 12  
**Critical Issues**: 1  
**High-Priority Issues**: 5  
**Medium-Priority Issues**: 4  
**Low-Priority Issues**: 2  
**Status**: ⚠️ **BLOCKERS IDENTIFIED - Resolve before implementation**

---

## Detailed Analysis

### 1. CRITICAL: Missing Task Coverage for Dynamic Zone Updates (FR-013)

| ID     | Category     | Severity     | Location(s)                        | Summary                                                                                                                                                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                                                                                                                                                                |
| ------ | ------------ | ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | Coverage Gap | **CRITICAL** | spec.md:FR-013 tasks.md: T004-T007 | FR-013 requires "When a new JAKIM zone is added or prayer times are updated by JAKIM, auto-populated masjid data MUST refresh automatically (no manual intervention)". However, NO TASK exists for implementing automatic refresh logic (scheduled job, polling, webhook listener, or real-time subscription). T004 only seeds initial data; no refresh mechanism is defined. | Create TWO new tasks: (1) Task for implementing refresh strategy (cron job vs. webhook vs. polling vs. real-time); (2) Task for integrating chosen strategy into database layer. Document decision in research.md with rationale for chosen approach. **Required before database migration (T004) finishes.** |

---

### 2. HIGH: Task Count Inconsistency in Overview

| ID     | Category      | Severity | Location(s)       | Summary                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                                            |
| ------ | ------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A2** | Inconsistency | HIGH     | tasks.md:Overview | Overview states "**Total Tasks**: 45 (organized across 6 phases)" but actual task count is T001-T049 = **49 tasks across 8 phases**. The 6 phases listed don't match the 8 phases documented in Phase headers. Confusing for task assignment. | Update tasks.md Overview section: Change "Total Tasks: 45" to "Total Tasks: 49" and "6 phases" to "8 phases". Verify summary table on line ~80 accurately reflects Phase 0-8 task counts. |

---

### 3. HIGH: Zone Code Case Inconsistency

| ID     | Category      | Severity | Location(s)                               | Summary                                                                                                                                                                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                                                                                                                                                  |
| ------ | ------------- | -------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A3** | Inconsistency | HIGH     | spec.md:US3-AS1 vs data-model.md; plan.md | User Story 3 Acceptance Scenario 1 states: "User selects zone (e.g., '**Terengganu**')" with title case. Data model specifies zone_code must be "**lowercase, no spaces**" (e.g., "terengganu"). quickstart.md uses lowercase ("johor", "selangor"). This creates confusion: Should zone_name_ms display "Terengganu" (for UI) while zone_code is "terengganu" (for database)? Not clarified. | Clarify in spec.md: Zone display names are title case in UI (zone_name_ms/zone_name_en), but zone_code is lowercase for internal use. Add explicit example: "Zone display: 'Terengganu' (UI) ↔ zone_code: 'terengganu' (DB)". Update US3-AS1 to show lowercase zone_code in technical context. |

---

### 4. HIGH: Prayer Times Refresh Caching Strategy Underspecified

| ID     | Category           | Severity | Location(s)                                  | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Recommendation                                                                                                                                                                                                                                                                                                                                                                             |
| ------ | ------------------ | -------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A4** | Underspecification | HIGH     | spec.md:FR-011, data-model.md, quickstart.md | FR-011 requires "Prayer times... MUST be sourced from official JAKIM API (no manual updates required)". Data model shows prayer_times cached as JSONB. quickstart.md mentions "cache times 24h", but spec.md does NOT define cache TTL, refresh strategy (on-demand vs. scheduled), fallback behavior if JAKIM API unavailable, or stale data handling. SC-007 requires "99%+ prayer times accuracy" but no task validates cache staleness vs. accuracy. | Add to spec.md under FR-011 or new FR-011b: (1) Define cache TTL = 24 hours; (2) Define refresh trigger = on-page-load OR scheduled job at 1am daily; (3) Define fallback = serve stale cache if JAKIM API down + log error; (4) Define accuracy check = compare cached vs. JAKIM official daily for QA. Create task T050 for implementing cache management (eviction, refresh, fallback). |

---

### 5. HIGH: Missing Task for FR-020 (Tier-Specific UI Gating)

| ID     | Category     | Severity | Location(s)             | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Recommendation                                                                                                                                                                                                                                                                                                                                |
| ------ | ------------ | -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A5** | Coverage Gap | HIGH     | spec.md:FR-020 tasks.md | FR-020 requires "Tier-specific features (admin dashboard, custom content, etc.) MUST NOT be exposed in the UI if user is on a lower tier (e.g., Asas users should not see admin button)". Task T033 mentions "Render tier-specific UI (Asas = minimal, Gemilang = admin features)" but this is DISPLAY-SIDE rendering. NO TASK covers: (1) Package-level tier gating (preventing Asas tier code from importing admin components), (2) RLS policy enforcement to prevent Asas users from querying admin tables, (3) Testing tier-gating (Asas user cannot access Gemilang features). | Create task T050b: "Add tier-gating logic to packages/supabase-client RLS policies and UI components to prevent lower-tier users from accessing tier-specific features. Ensure Asas tier RLS policy restricts access to admin tables." Create task T050c: "Create tier-gating E2E test: Asas user cannot see/access Gemilang admin features." |

---

### 6. HIGH: FAQ Count Ambiguity (FR-006 vs SC-009)

| ID     | Category  | Severity | Location(s)                           | Summary                                                                                                                                                                                                                                                                                                                                                                                        | Recommendation                                                                                                                                                                                                                                                                                                                          |
| ------ | --------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A6** | Ambiguity | HIGH     | spec.md:FR-006, SC-009; tasks.md:T041 | FR-006 says "minimum 6 questions", SC-009 says "min. 6 questions", but task T041 says "Create 6+ Bahasa Malaysia FAQs". The spec lists 5 FAQ examples (tier differences, screens, pricing, payment, support, trial) = 6 total. But are these REQUIRED FAQs or just EXAMPLES? If required, why say "6+"? If examples, what's the exact requirement? This creates ambiguity for task completion. | Clarify in spec.md: "Landing page MUST include at least 6 FAQ items covering the following topics: (1) Tier differences, (2) Multiple screens, (3) Per-masjid pricing, (4) Payment methods, (5) Support levels, (6) Free trial details. Additional FAQs beyond these 6 are optional." Update task T041 to require exactly these 6 FAQs. |

---

### 7. HIGH: Missing Zone Coverage Verification Task

| ID     | Category     | Severity | Location(s)                                 | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Recommendation                                                                                                                                                                                                                                                                                                            |
| ------ | ------------ | -------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A7** | Coverage Gap | HIGH     | spec.md:FR-012, SC-002; tasks.md:T004, T006 | FR-012 & SC-002 require "System MUST ensure all Malaysia states and their JAKIM zones are covered" and "Zone dropdown is pre-populated with 100% of Malaysia JAKIM zones (min. 16 zones for Peninsular Malaysia, plus Sabah/Sarawak zones) with zero missing entries". Task T004 says "Insert all 18 Malaysia JAKIM zones" but does NOT specify HOW we verify all 18 are correct (are there 16 or 18 or 20 zones?). Task T006 contract test says "Verify all 18 JAKIM zones exist" but does NOT cross-reference official JAKIM zone list. | Create task T051: "Verify zone coverage against official JAKIM zone registry. Document all 18 zone codes (zone_code) from hub app prayer-times package. Cross-reference seed migration to ensure 100% coverage. Create mapping document in docs/JAKIM-ZONES-REFERENCE.md listing all zones." Make T006 dependent on T051. |

---

### 8. MEDIUM: Prayer Times Source Enum Mismatch

| ID     | Category      | Severity | Location(s)              | Summary                                                                                                                                                                                                                                                                                                                                                                                                 | Recommendation                                                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A8** | Inconsistency | MEDIUM   | spec.md vs data-model.md | Spec only discusses "prayer_times_source = JAKIM API" for free tier. Data model defines prayer_times_source enum as 'jakim_api' \| 'custom' \| 'imported'. For auto-populated Asas tier masjids, which value should be used? Spec implies all should be 'jakim_api', but data model allows flexibility. If 'custom' or 'imported' are supported, they should be documented in spec or marked as future. | Clarify in data-model.md Masjid entity section: "For this feature (007-tv-landing-tiers), prayer_times_source for auto-populated masjids MUST be 'jakim_api'. Values 'custom' and 'imported' are reserved for future paid-tier features where mosques provide their own times." Update task T004 to explicitly set prayer_times_source='jakim_api' for all seed data. |

---

### 9. MEDIUM: Missing Contract Test Task for API Contracts

| ID     | Category     | Severity | Location(s)               | Summary                                                                                                                                                                                                                                                                                                                                                                               | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------ | ------------ | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A9** | Coverage Gap | MEDIUM   | contracts/\*.ts; tasks.md | Three API contracts are defined (tier-package, jakim-zone, display-routing) with DTOs and example data, but NO TASK exists to create CONTRACT TESTS that validate: (1) Response DTOs match contract specifications, (2) Example data conforms to contract schema, (3) Error responses match defined error types. Contract tests are critical for ensuring services respect contracts. | Create task T052: "Create contract tests for three API services: (1) tier-package.contract.ts - test all 4 tiers match schema; (2) jakim-zone.contract.ts - test zone responses include all required fields; (3) display-routing.contract.ts - test landing page response includes tiers, zones, FAQs, metadata. Tests should validate against contract DTOs." Add dependency: T052 → T011, T013, T034 (after services are implemented). |

---

### 10. MEDIUM: Unclear Tier Service Data Source

| ID      | Category           | Severity | Location(s)                           | Summary                                                                                                                                                                                                                                                                                                                                                                                                                  | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------ | -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A10** | Underspecification | MEDIUM   | tasks.md:T012, quickstart.md, plan.md | Task T012 says "Load tier data from constants or i18n JSON (define source strategy)" but does NOT specify which approach to use. Are tiers stored in: (a) hardcoded constant in tier-service.ts, (b) i18n JSON files (tiers.json), (c) database table? Quickstart.md mentions "i18n JSON + Material-UI Accordion" for FAQs but not clear if tiers follow same pattern. If i18n JSON, then which package handles loading? | Clarify in plan.md Technical Context or quickstart.md: "Tier package data is STATIC (no real-time changes) and MARKETING-CONTROLLED. Decision: Store as constants in packages/supabase-client/src/constants/tiers.ts + sync with i18n JSON for display text. Do NOT store in database." Create task T053: "Implement tier service data loading: Define tier constants in tiers.ts with IDs, features, and references to i18n keys for names/descriptions." |

---

### 11. MEDIUM: Performance Baseline Measurement Missing

| ID      | Category     | Severity | Location(s)                   | Summary                                                                                                                                                                                                                                                                                                                                                                                                          | Recommendation                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------ | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A11** | Coverage Gap | MEDIUM   | spec.md:SC-001; tasks.md:T047 | SC-001 requires "Landing page loads in under 2 seconds (measured via Lighthouse); 95%+ of page traffic completes load within this time". Task T047 says "Optimize landing page performance" with Lighthouse targets, but does NOT include a BASELINE measurement task (run Lighthouse BEFORE optimization to establish current performance). Without baseline, we can't measure improvement or validate success. | Create task T054 (BEFORE T047): "Establish landing page performance baseline: Run Lighthouse on current landing page, record FCP, LCP, CLS scores. Document baseline in docs/PERFORMANCE-BASELINE.md. Baseline should show current state before optimization tasks begin." Make T047 dependent on T054. T048 (final validation) should compare against baseline. |

---

### 12. LOW: Missing Test Data Sync Documentation

| ID      | Category          | Severity | Location(s)                              | Summary                                                                                                                                                                                                                                                                                                 | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------- | ----------------- | -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A12** | Documentation Gap | LOW      | constitution.md:TDD, tasks.md:T011, T013 | Constitution mandates "Mock data MUST be synced with Supabase schema" and "E2E tests MUST retrieve real IDs from database". Tasks T011 & T013 include unit tests but do NOT specify how mock data is synced with migration. Are mocks hardcoded in test files, loaded from seed.sql, or auto-generated? | Add note to tasks.md Task T011 & T013: "Mock zone and tier data for tests must match schema created in T004. Use schema-synced mock data (auto-generated from migration or manually verified against migration schema). Ensure test data IDs match database IDs to enable E2E tests to use real IDs." Create helper script (T055 optional): "Create scripts/sync-test-data.sh to auto-generate mock data from supabase schema." |

---

## Coverage Analysis

### Requirements Coverage Summary

| Requirement Type            | Count  | Mapped to Tasks | Missing             | Coverage % |
| --------------------------- | ------ | --------------- | ------------------- | ---------- |
| Functional Requirements     | 21     | 20              | 1 (FR-013 refresh)  | 95%        |
| Non-Functional Requirements | 7      | 6               | 1 (cache strategy)  | 86%        |
| Success Criteria            | 12     | 11              | 1 (SC-001 baseline) | 92%        |
| User Story Scenarios        | 25     | 24              | 1 (tier gating)     | 96%        |
| **TOTAL**                   | **65** | **61**          | **4**               | **94%**    |

---

### User Story Task Mapping

| User Story               | Priority | Tasks     | Required for MVP | Status                   |
| ------------------------ | -------- | --------- | ---------------- | ------------------------ |
| US1: Discover Free Tier  | P1       | T015-T021 | ✅ Yes           | Complete                 |
| US2: Compare Tiers       | P1       | T022-T026 | ✅ Yes           | Complete                 |
| US3: Find Mosque by Zone | P1       | T027-T035 | ✅ Yes           | Complete                 |
| US4: Upgrade to Paid     | P2       | T036-T039 | ❌ No (post-MVP) | Complete                 |
| US5: FAQ Answers         | P2       | T040-T044 | ❌ No (post-MVP) | **Missing: Tier gating** |

---

### Constitution Alignment Check

| Principle                | Status  | Evidence                                                                           | Issue                                       |
| ------------------------ | ------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| **Package-First**        | ✅ PASS | Plan.md specifies shared-types, supabase-client packages                           | None                                        |
| **TDD Approach**         | ✅ PASS | Tasks T011, T013, T019, T029 require tests first                                   | None                                        |
| **Database-First**       | ✅ PASS | T004-T007 define migrations, RLS policies                                          | None - EXCEPT: FR-013 refresh not addressed |
| **Monorepo Discipline**  | ✅ PASS | Build order specified: shared-types → supabase-client → ui-components → tv-display | None                                        |
| **Environment Strategy** | ✅ PASS | Local Supabase, staging via dev, prod via main                                     | None                                        |
| **Multilingual Support** | ✅ PASS | Tasks T016, T018, T041 create i18n files for ms/en                                 | None                                        |
| **Documentation**        | ✅ PASS | Task T002 creates docs/TV-LANDING-PAGE-TIERS.md                                    | None                                        |

**Overall Constitution Alignment**: ✅ 7/7 principles compliant

---

### Unmapped Tasks

**None identified.** All 49 tasks map to spec requirements or constitute necessary infrastructure.

---

## Quality Gate Recommendations

### Before Task Execution Begins

- [ ] **BLOCKER 1**: Add task T050 + T050b + T050c for FR-013 (zone refresh) and FR-020 (tier gating)
- [ ] **BLOCKER 2**: Update tasks.md Overview: Change "45 tasks, 6 phases" to "49 tasks, 8 phases"
- [ ] **BLOCKER 3**: Create task T051 for zone coverage verification against official JAKIM registry
- [ ] **Resolution**: Create tasks T052-T055 for contract tests, tier source clarity, performance baseline, and test data sync
- [ ] **Clarification**: Update spec.md with zone_code casing, cache strategy, FAQ count, and prayer times source clarity

### Post-Blocker Resolution

- [ ] Estimate effort impact of new tasks (should add ~1-2 days)
- [ ] Update task dependencies and critical path
- [ ] Proceed to implementation

---

## Metrics Summary

| Metric                      | Value | Target | Status |
| --------------------------- | ----- | ------ | ------ |
| **Total Findings**          | 12    | N/A    | —      |
| **Critical Blockers**       | 1     | 0      | ⚠️     |
| **High-Priority Issues**    | 5     | ≤3     | ⚠️     |
| **Coverage %**              | 94%   | 100%   | ⚠️     |
| **Requirements Mapped**     | 61/65 | 65/65  | ⚠️     |
| **Tasks Defined**           | 49    | ≥45    | ✅     |
| **Constitution Compliance** | 7/7   | 7/7    | ✅     |

---

## Analysis Conclusion

### Status: ⚠️ **RESOLVE BLOCKERS BEFORE IMPLEMENTATION**

**Summary**: Specification is 94% complete with strong structure, but **1 CRITICAL blocker (FR-013 dynamic zone updates) and 5 HIGH-priority gaps** must be resolved before implementation begins. Constitution alignment is 100% ✅, and 49 actionable tasks are well-defined ✅.

### Critical Issues (Must Fix)

1. **A1**: Add automatic zone/prayer times refresh logic (missing from FR-013)
2. **A5**: Add tier-gating implementation tasks (FR-020 coverage gap)
3. **A2**: Correct task count in overview (45 → 49, 6 phases → 8 phases)

### High-Priority Clarifications (Should Fix)

4. **A3**: Clarify zone_code vs zone_name casing throughout
5. **A4**: Define prayer times cache strategy explicitly
6. **A6**: Specify exact FAQ requirements (6 minimum topics)
7. **A7**: Add zone coverage verification against JAKIM registry

### Nice-to-Have Improvements (Suggested)

8. **A8-A12**: Additional contract tests, tier data source clarity, performance baseline, test data sync documentation

### Recommendations for Next Phase

1. **This Week**: Address issues A1-A3 (1 critical, 2 high) and update all affected docs
2. **Estimate Impact**: +1-2 days of implementation for new tasks (T050-T054)
3. **Proceed When**: All blockers resolved, prerequisites checked, team ready
4. **Risk Mitigation**: Document decisions in updated research.md

---

**Report Generated**: 2026-07-16  
**Analyst**: GitHub Copilot (speckit.analyze)  
**Next Step**: Create 5 new tasks (T050, T050b, T050c, T051, T052) and clarify issues A3-A7 before implementation begins.
