# Tasks: Masjid Digital Display TV App

**Input**: Design documents from `/specs/002-create-a-tv/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/api-spec.yaml (✓), quickstart.md (✓)

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✓ React 18 + TypeScript + Vite + Supabase + Framer Motion
   → ✓ Single-page app structure: apps/tv-display/
2. Load design documents:
   → ✓ data-model.md: 4 entities (DisplayContentItem, DisplaySettings, PrayerTimes, Masjid extensions)
   → ✓ contracts/api-spec.yaml: 4 RPC endpoints for TV display
   → ✓ research.md: JAKIM API, performance patterns, offline strategies
   → ✓ quickstart.md: 6 test scenarios for validation
3. Generate tasks by category:
   → Setup: React app, dependencies, TypeScript, Vite
   → Tests: API contract tests, integration tests, E2E
   → Core: Components, hooks, services, types
   → Integration: Supabase, JAKIM API, real-time
   → Polish: Performance optimization, offline mode
4. Apply task rules:
   → Different components/files = [P] parallel
   → Shared services = sequential
   → Tests before implementation (TDD)
5. Number tasks T001-T030
6. Mark dependencies and parallel opportunities
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths for all tasks

## Path Conventions (from plan.md)

```
apps/tv-display/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   └── utils/         # Utilities
├── tests/
│   ├── contract/      # API contract tests
│   ├── integration/   # Component integration
│   └── e2e/          # End-to-end TV tests
└── package.json
```

## Phase 3.1: Setup & Project Structure

- [ ] T001 Create apps/tv-display project structure with Vite + React 18 + TypeScript
- [ ] T002 [P] Configure package.json with dependencies (React Query, Framer Motion, Supabase client)
- [ ] T003 [P] Setup Vite config optimized for TV performance (apps/tv-display/vite.config.ts)
- [ ] T004 [P] Configure TypeScript strict mode (apps/tv-display/tsconfig.json)
- [ ] T005 [P] Setup Tailwind CSS for TV display styling (apps/tv-display/tailwind.config.js)
- [ ] T006 [P] Create environment configuration template (apps/tv-display/.env.example)

## Phase 3.2: Database & API Contracts

- [ ] T007 Create masjid_display_content table migration (supabase/migrations/007_create_display_content.sql)
- [ ] T008 Create masjid_display_settings table migration (supabase/migrations/008_create_display_settings.sql)
- [ ] T009 Create prayer_times_cache table migration (supabase/migrations/009_create_prayer_times_cache.sql)
- [ ] T010 Add prayer_zone_code to masjids table (supabase/migrations/010_add_prayer_zone_to_masjids.sql)
- [ ] T011 Create RLS policies for TV display tables (supabase/migrations/011_create_tv_display_rls.sql)

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T012 [P] Contract test get_display_content RPC (apps/tv-display/tests/contract/test_display_content.test.ts)
- [ ] T013 [P] Contract test get_display_settings RPC (apps/tv-display/tests/contract/test_display_settings.test.ts)
- [ ] T014 [P] Contract test get_prayer_times RPC (apps/tv-display/tests/contract/test_prayer_times.test.ts)
- [ ] T015 [P] Contract test get_masjid_zone RPC (apps/tv-display/tests/contract/test_masjid_zone.test.ts)
- [ ] T016 [P] Integration test carousel display with top 10 ranking (apps/tv-display/tests/integration/test_content_carousel.test.ts)
- [ ] T017 [P] Integration test prayer times overlay positioning (apps/tv-display/tests/integration/test_prayer_overlay.test.ts)
- [ ] T018 [P] Integration test fullscreen TV mode (apps/tv-display/tests/integration/test_fullscreen_mode.test.ts)
- [ ] T019 [P] Integration test offline mode graceful degradation (apps/tv-display/tests/integration/test_offline_mode.test.ts)

## Phase 3.4: Core Types & Models (ONLY after tests are failing)

- [ ] T020 [P] Create DisplayContentItem type interface (apps/tv-display/src/types/content.ts)
- [ ] T021 [P] Create DisplaySettings type interface (apps/tv-display/src/types/settings.ts)
- [ ] T022 [P] Create PrayerTimes type interface (apps/tv-display/src/types/prayer.ts)
- [ ] T023 [P] Create API response types (apps/tv-display/src/types/api.ts)

## Phase 3.5: API Services

- [ ] T024 [P] Create Supabase client service (apps/tv-display/src/services/supabase.ts)
- [ ] T025 [P] Create display content service with ranking (apps/tv-display/src/services/contentService.ts)
- [ ] T026 [P] Create display settings service (apps/tv-display/src/services/settingsService.ts)
- [ ] T027 Create prayer times service with JAKIM API integration (apps/tv-display/src/services/prayerService.ts)
- [ ] T028 Create real-time subscription service (apps/tv-display/src/services/realtimeService.ts)

## Phase 3.6: React Components

- [ ] T029 [P] Create ContentItem component for YouTube/Image display (apps/tv-display/src/components/ContentItem/ContentItem.tsx)
- [ ] T030 [P] Create Carousel component with smooth transitions (apps/tv-display/src/components/Carousel/Carousel.tsx)
- [ ] T031 [P] Create PrayerTimes overlay component (apps/tv-display/src/components/PrayerTimes/PrayerTimes.tsx)
- [ ] T032 [P] Create Layout component for fullscreen TV mode (apps/tv-display/src/components/Layout/TVLayout.tsx)
- [ ] T033 [P] Create OfflineIndicator component (apps/tv-display/src/components/Layout/OfflineIndicator.tsx)
- [ ] T034 [P] Create LoadingSpinner component (apps/tv-display/src/components/Layout/LoadingSpinner.tsx)

## Phase 3.7: Custom Hooks

- [ ] T035 [P] Create useDisplayContent hook with ranking logic (apps/tv-display/src/hooks/useDisplayContent.ts)
- [ ] T036 [P] Create useDisplaySettings hook (apps/tv-display/src/hooks/useDisplaySettings.ts)
- [ ] T037 [P] Create usePrayerTimes hook with caching (apps/tv-display/src/hooks/usePrayerTimes.ts)
- [ ] T038 [P] Create useFullscreen hook for TV mode (apps/tv-display/src/hooks/useFullscreen.ts)
- [ ] T039 [P] Create useOfflineDetection hook (apps/tv-display/src/hooks/useOfflineDetection.ts)
- [ ] T040 [P] Create useCarousel hook for rotation logic (apps/tv-display/src/hooks/useCarousel.ts)

## Phase 3.8: Main Application

- [ ] T041 Create main TV display page component (apps/tv-display/src/pages/TVDisplay.tsx)
- [ ] T042 Setup React Query provider and error boundaries (apps/tv-display/src/providers/QueryProvider.tsx)
- [ ] T043 Create main App component with routing (apps/tv-display/src/App.tsx)
- [ ] T044 Setup main entry point (apps/tv-display/src/main.tsx)
- [ ] T045 Create index.html for fullscreen TV display (apps/tv-display/index.html)

## Phase 3.9: Performance & Integration

- [ ] T046 Implement Service Worker for offline caching (apps/tv-display/public/sw.js)
- [ ] T047 Add performance monitoring and memory management (apps/tv-display/src/utils/performance.ts)
- [ ] T048 Implement error logging and reporting (apps/tv-display/src/utils/errorReporting.ts)
- [ ] T049 Setup real-time content updates subscription
- [ ] T050 Optimize bundle size and lazy loading

## Phase 3.10: End-to-End Testing

- [ ] T051 [P] E2E test fullscreen carousel rotation (apps/tv-display/tests/e2e/test_tv_carousel.spec.ts)
- [ ] T052 [P] E2E test prayer times accuracy (apps/tv-display/tests/e2e/test_prayer_times.spec.ts)
- [ ] T053 [P] E2E test content ranking by sponsorship (apps/tv-display/tests/e2e/test_content_ranking.spec.ts)
- [ ] T054 [P] E2E test offline mode functionality (apps/tv-display/tests/e2e/test_offline_behavior.spec.ts)
- [ ] T055 [P] E2E performance test 24/7 operation (apps/tv-display/tests/e2e/test_performance.spec.ts)

## Phase 3.11: Polish & Documentation

- [ ] T056 [P] Create seed data for TV display testing (apps/tv-display/scripts/seed-tv-data.ts)
- [ ] T057 [P] Update monorepo scripts for TV app (package.json, turbo.json)
- [ ] T058 [P] Create TV deployment documentation (apps/tv-display/README.md)
- [ ] T059 [P] Performance optimization review and tuning
- [ ] T060 Execute quickstart.md validation scenarios

## Dependencies

### Sequential Dependencies (blocking)

- **Setup phase** (T001-T006) must complete before any other work
- **Database migrations** (T007-T011) before API services (T024-T028)
- **Tests** (T012-T019) MUST be written and failing before implementation (T020+)
- **Types** (T020-T023) before services and components that use them
- **Services** (T024-T028) before hooks (T035-T040) and main app (T041-T045)
- **Core components** (T029-T034) before main app integration (T041-T045)
- **Main app** (T041-T045) before performance optimization (T046-T050)

### Parallel Opportunities [P]

```
Phase 3.1 Setup: T002, T003, T004, T005, T006 (different config files)
Phase 3.3 Contract Tests: T012, T013, T014, T015 (different test files)
Phase 3.3 Integration Tests: T016, T017, T018, T019 (different test files)
Phase 3.4 Types: T020, T021, T022, T023 (different type files)
Phase 3.5 Services: T024, T025, T026 (independent services)
Phase 3.6 Components: T029, T030, T031, T032, T033, T034 (different components)
Phase 3.7 Hooks: T035, T036, T037, T038, T039, T040 (different hooks)
Phase 3.10 E2E Tests: T051, T052, T053, T054, T055 (different test scenarios)
Phase 3.11 Polish: T056, T057, T058, T059 (different areas)
```

## Parallel Execution Examples

### Contract Tests (After DB setup)

```bash
# Launch T012-T015 together:
Task: "Contract test get_display_content RPC in apps/tv-display/tests/contract/test_display_content.test.ts"
Task: "Contract test get_display_settings RPC in apps/tv-display/tests/contract/test_display_settings.test.ts"
Task: "Contract test get_prayer_times RPC in apps/tv-display/tests/contract/test_prayer_times.test.ts"
Task: "Contract test get_masjid_zone RPC in apps/tv-display/tests/contract/test_masjid_zone.test.ts"
```

### Components Development (After types and services)

```bash
# Launch T029-T034 together:
Task: "Create ContentItem component for YouTube/Image display in apps/tv-display/src/components/ContentItem/ContentItem.tsx"
Task: "Create Carousel component with smooth transitions in apps/tv-display/src/components/Carousel/Carousel.tsx"
Task: "Create PrayerTimes overlay component in apps/tv-display/src/components/PrayerTimes/PrayerTimes.tsx"
Task: "Create Layout component for fullscreen TV mode in apps/tv-display/src/components/Layout/TVLayout.tsx"
```

## Critical Success Factors

### Performance Requirements (from plan.md)

- 60fps smooth transitions during carousel
- <200ms content loading time
- <50MB memory usage for 24/7 operation
- Fullscreen TV compatibility

### Malaysian Context Requirements

- All UI text in Bahasa Malaysia
- JAKIM prayer times API integration
- Malaysian Ringgit (RM) currency display
- Prayer zone code mapping

### TV Display Requirements

- Fullscreen kiosk mode operation
- Offline graceful degradation
- Error recovery without user intervention
- Professional TV display appearance

## Validation Checklist

_GATE: Must pass before considering tasks complete_

- [ ] All 4 API contracts have corresponding test files (T012-T015)
- [ ] All 4 entities have TypeScript interfaces (T020-T023)
- [ ] All integration scenarios from quickstart.md covered (T016-T019, T051-T055)
- [ ] Performance targets measurable in tests (T055, T059)
- [ ] TDD enforced: tests written before implementation
- [ ] Parallel tasks are truly independent (no shared file modifications)
- [ ] Each task specifies exact file path
- [ ] Database schema changes precede application code
- [ ] Offline mode and error handling covered

## Notes for Implementation

- Verify all tests fail before starting implementation phase
- Use React 18 concurrent features for smooth TV performance
- Implement proper cleanup for long-running carousel operations
- Test on actual TV hardware during E2E phase
- Monitor memory usage continuously during 24/7 operation tests
- Ensure Bahasa Malaysia text throughout the interface
