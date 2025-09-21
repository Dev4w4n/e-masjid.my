# Tasks: Masjid Digital Display TV App

**Input**: Design documents from `/specs/002-create-a-new/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Tech stack: React 19, Next.js 15, TypeScript 5.2+, Tailwind CSS, Playwright
   → Structure: Web application (frontend + backend integration)
   → Target: TV display kiosks with turborepo integration
2. Load design documents:
   → data-model.md: 6 entities (Masjid, ContentItem, DisplayConfiguration, etc.)
   → contracts/: 3 test files + API spec (display content, prayer times, config)
   → research.md: Technology decisions and architecture patterns
   → quickstart.md: Setup instructions and validation scenarios
3. Generate tasks by category:
   → Setup: Next.js app, dependencies, turborepo integration
   → Tests: 3 contract tests, 5 integration tests from user stories
   → Core: 6 models, display components, API routes
   → Integration: Supabase, JAKIM API, prayer times
   → Polish: E2E tests, performance optimization, documentation
4. Applied task rules:
   → Different files marked [P] for parallel execution
   → Contract tests before implementation (TDD)
   → Models before services before UI components
5. Generated 32 numbered tasks (T001-T032)
6. Dependencies mapped for optimal execution order
7. Parallel execution examples provided
8. Validation: All contracts tested, all entities modeled, all endpoints implemented
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- File paths adjusted for Next.js app structure in turborepo

## Path Conventions

Based on plan.md structure decision (Web application with turborepo integration):

- **Frontend**: `apps/tv-display/src/`
- **API Routes**: `apps/tv-display/src/app/api/`
- **Tests**: `apps/tv-display/tests/`
- **Shared Types**: `packages/shared-types/src/`

## Phase 3.1: Setup

- [x] T001 Create Next.js app structure in apps/tv-display following turborepo patterns
- [x] T002 Setup package.json with React 19, Next.js 15, TypeScript 5.2+, Playwright dependencies
- [x] T003 Configure Tailwind CSS with TV display optimizations (screen sizes, typography, animations)
- [x] T004 Setup Playwright testing framework with TV display viewport configurations
- [x] T005 Configure ESLint and Prettier with turborepo shared config
- [x] T006 Setup environment variables and Next.js configuration for display app

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (from contracts/ directory)

- [ ] T007 [P] Contract test GET /displays/{displayId}/content in apps/tv-display/tests/contract/display-content.test.ts
- [ ] T008 [P] Contract test GET /displays/{displayId}/prayer-times in apps/tv-display/tests/contract/prayer-times.test.ts
- [ ] T009 [P] Contract test GET/PUT /displays/{displayId}/config in apps/tv-display/tests/contract/display-config.test.ts

### Integration Tests (from user stories in spec.md)

- [ ] T010 [P] Integration test content carousel display in apps/tv-display/tests/integration/content-carousel.test.ts
- [ ] T011 [P] Integration test prayer times overlay in apps/tv-display/tests/integration/prayer-overlay.test.ts
- [ ] T012 [P] Integration test multi-display configuration in apps/tv-display/tests/integration/multi-display.test.ts
- [ ] T013 [P] Integration test sponsorship ranking in apps/tv-display/tests/integration/sponsorship-ranking.test.ts
- [ ] T014 [P] Integration test offline fallback behavior in apps/tv-display/tests/integration/offline-mode.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models (from data-model.md entities)

- [ ] T015 [P] Masjid model in packages/shared-types/src/masjid.ts
- [ ] T016 [P] ContentItem model in packages/shared-types/src/content-item.ts
- [ ] T017 [P] DisplayConfiguration model in packages/shared-types/src/display-config.ts
- [ ] T018 [P] PrayerSchedule model in packages/shared-types/src/prayer-schedule.ts
- [ ] T019 [P] SponsorshipRecord model in packages/shared-types/src/sponsorship-record.ts
- [ ] T020 [P] DisplayContentAssignment model in packages/shared-types/src/display-assignment.ts

### API Routes (from contracts/api-spec.yaml)

- [ ] T021 GET /api/displays/[displayId]/content route in apps/tv-display/src/app/api/displays/[displayId]/content/route.ts
- [ ] T022 GET /api/displays/[displayId]/prayer-times route in apps/tv-display/src/app/api/displays/[displayId]/prayer-times/route.ts
- [ ] T023 GET /api/displays/[displayId]/config route in apps/tv-display/src/app/api/displays/[displayId]/config/route.ts
- [ ] T024 PUT /api/displays/[displayId]/config route in apps/tv-display/src/app/api/displays/[displayId]/config/route.ts
- [ ] T025 POST /api/displays/[displayId]/heartbeat route in apps/tv-display/src/app/api/displays/[displayId]/heartbeat/route.ts

### Display Components

- [ ] T026 [P] ContentCarousel component in apps/tv-display/src/components/carousel/ContentCarousel.tsx
- [ ] T027 [P] PrayerTimesOverlay component in apps/tv-display/src/components/prayer/PrayerTimesOverlay.tsx
- [ ] T028 [P] ContentItem component for YouTube/image display in apps/tv-display/src/components/carousel/ContentItem.tsx

## Phase 3.4: Integration

### External Services Integration

- [ ] T029 JAKIM API service integration in apps/tv-display/src/lib/services/jakim-api.ts
- [ ] T030 Supabase client integration for display data in apps/tv-display/src/lib/supabase/client.ts
- [ ] T031 Content management service with caching in apps/tv-display/src/lib/services/content-service.ts

### Display Page Implementation

- [ ] T032 Main display page in apps/tv-display/src/app/display/[displayId]/page.tsx with dual-layer architecture

## Phase 3.5: Polish

### End-to-End Testing

- [ ] T033 [P] E2E test full display functionality in apps/tv-display/tests/e2e/display-flow.spec.ts
- [ ] T034 [P] E2E test error handling scenarios in apps/tv-display/tests/e2e/error-handling.spec.ts
- [ ] T035 [P] Performance test 60fps animation target in apps/tv-display/tests/performance/animation.spec.ts

### Optimization and Documentation

- [ ] T036 [P] Optimize bundle size and loading performance for TV displays
- [ ] T037 [P] Add comprehensive TypeScript documentation and JSDoc comments
- [ ] T038 [P] Update turborepo root documentation with TV display app information
- [ ] T039 Run quickstart.md validation scenarios and fix any issues

## Dependencies

### Critical Path Dependencies

- Setup (T001-T006) must complete before any other work
- Contract tests (T007-T009) must complete before API routes (T021-T025)
- Integration tests (T010-T014) must complete before component implementation (T026-T028)
- Models (T015-T020) must complete before API routes and components
- API routes (T021-T025) must complete before main display page (T032)
- External integrations (T029-T031) must complete before main display page (T032)

### Parallel Execution Blocks

1. **Setup Block**: T003, T004, T005 can run parallel after T001-T002
2. **Test Block**: T007-T014 can all run in parallel
3. **Model Block**: T015-T020 can all run in parallel
4. **Component Block**: T026-T028 can run in parallel after models complete
5. **Polish Block**: T033-T038 can run in parallel after main implementation

## Parallel Execution Examples

### Phase 3.2 - All Contract and Integration Tests

```bash
# Launch all tests simultaneously (different files):
Task: "Contract test GET /displays/{displayId}/content in apps/tv-display/tests/contract/display-content.test.ts"
Task: "Contract test GET /displays/{displayId}/prayer-times in apps/tv-display/tests/contract/prayer-times.test.ts"
Task: "Contract test GET/PUT /displays/{displayId}/config in apps/tv-display/tests/contract/display-config.test.ts"
Task: "Integration test content carousel in apps/tv-display/tests/integration/content-carousel.test.ts"
Task: "Integration test prayer times overlay in apps/tv-display/tests/integration/prayer-overlay.test.ts"
Task: "Integration test multi-display configuration in apps/tv-display/tests/integration/multi-display.test.ts"
Task: "Integration test sponsorship ranking in apps/tv-display/tests/integration/sponsorship-ranking.test.ts"
Task: "Integration test offline fallback in apps/tv-display/tests/integration/offline-mode.test.ts"
```

### Phase 3.3 - All Data Models

```bash
# Launch all model creation simultaneously:
Task: "Masjid model in packages/shared-types/src/masjid.ts"
Task: "ContentItem model in packages/shared-types/src/content-item.ts"
Task: "DisplayConfiguration model in packages/shared-types/src/display-config.ts"
Task: "PrayerSchedule model in packages/shared-types/src/prayer-schedule.ts"
Task: "SponsorshipRecord model in packages/shared-types/src/sponsorship-record.ts"
Task: "DisplayContentAssignment model in packages/shared-types/src/display-assignment.ts"
```

### Phase 3.5 - Polish Tasks

```bash
# Launch final optimization and documentation:
Task: "E2E test full display functionality in apps/tv-display/tests/e2e/display-flow.spec.ts"
Task: "E2E test error handling in apps/tv-display/tests/e2e/error-handling.spec.ts"
Task: "Performance test 60fps target in apps/tv-display/tests/performance/animation.spec.ts"
Task: "Optimize bundle size for TV displays"
Task: "Add TypeScript documentation and JSDoc comments"
Task: "Update turborepo documentation with TV display app"
```

## Task Generation Analysis

### From Contracts (3 files generated 3 contract tests)

- `display-content.test.ts` → T007 contract test for content API
- `prayer-times.test.ts` → T008 contract test for prayer times API
- `display-config.test.ts` → T009 contract test for configuration API

### From Data Model (6 entities generated 6 model tasks)

- Masjid → T015 model creation
- ContentItem → T016 model creation
- DisplayConfiguration → T017 model creation
- PrayerSchedule → T018 model creation
- SponsorshipRecord → T019 model creation
- DisplayContentAssignment → T020 model creation

### From User Stories (5 scenarios generated 5 integration tests)

- Content carousel display → T010 integration test
- Prayer times overlay → T011 integration test
- Multi-display support → T012 integration test
- Sponsorship ranking → T013 integration test
- Offline fallback → T014 integration test

### From API Specification (5 endpoints generated 5 route implementations)

- GET content → T021 API route
- GET prayer-times → T022 API route
- GET config → T023 API route
- PUT config → T024 API route
- POST heartbeat → T025 API route

## Validation Checklist

_GATE: All items must be checked before task execution_

- [x] All contracts have corresponding tests (3/3)
- [x] All entities have model tasks (6/6)
- [x] All API endpoints have implementation tasks (5/5)
- [x] All user stories have integration tests (5/5)
- [x] All tests come before implementation (TDD order preserved)
- [x] Parallel tasks are truly independent (different files verified)
- [x] Each task specifies exact file path with apps/tv-display prefix
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly mapped for execution order
- [x] Performance and optimization included in polish phase

## Notes

- TV display app integrates with existing turborepo packages (@emasjid/shared-types, @emasjid/supabase-client)
- Playwright tests configured for TV viewport sizes and kiosk browser behavior
- All components designed for 60fps performance on TV hardware
- Error handling includes offline mode and network retry logic per specification
- Bahasa Malaysia interface requirements addressed in component implementations
