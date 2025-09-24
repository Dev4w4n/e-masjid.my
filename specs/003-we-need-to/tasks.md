# Tasks: Hub App Content Management and Approval System

**Input**: Design documents from `/specs/003-we-need-to/`  
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Loaded: React 18+, Material-UI v6, Supabase, pnpm, Vite, Playwright
   → Extract: content-management package, hub app extensions
2. Load design documents:
   → data-model.md: Content, DisplaySettings, User roles
   → contracts/: content-management-api.yaml → 5 endpoints
   → quickstart.md: 7 test scenarios for E2E validation
3. Generate tasks by category:
   → Setup: package init, migrations, mock data
   → Tests: contract tests [P], E2E tests, integration tests
   → Core: services, hooks, components [P]
   → Integration: hub app pages, routing, permissions
   → Polish: performance, docs, validation
4. Apply TDD rules:
   → All tests before implementation
   → Mock data before tests
   → Different files = [P] for parallel
5. Number tasks sequentially (T001-T032)
6. Dependencies validated: Setup → Tests → Core → Integration → Polish
7. SUCCESS: 32 tasks ready for execution
```

## Path Conventions

- **Package Structure**: `./packages/content-management/` for business logic
- **Applications**: Hub app extensions in `./apps/hub/src/`
- **Database**: Schema changes in `./supabase/migrations/`
- **Package Manager**: `pnpm` exclusively (no npm/yarn)
- **Testing**: Mock data in `./packages/shared-types/src/test-fixtures/`

## Phase 3.1: Setup

- [ ] T001 Create content-management package structure in ./packages/content-management with package.json, tsconfig.json, and workspace configuration
- [ ] T002 Initialize content-management package dependencies using pnpm workspace (React 18+, Material-UI v6, Supabase client, Vitest)
- [ ] T003 [P] Configure ESLint, Prettier, and TypeScript in ./packages/content-management/
- [ ] T004 Create database migration in ./supabase/migrations/009_extend_display_content_for_approval.sql for approval_notes and resubmission_of fields
- [ ] T005 Update ./scripts/setup-supabase.sh with content management test data (test users, masjid admins, sample content)
- [ ] T006 [P] Generate mock data fixtures in ./packages/shared-types/src/test-fixtures/content-management.ts synced with display_content schema

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T007 [P] Setup E2E test data retrieval hooks in apps/hub/tests/setup/content-test-setup.ts for masjid and user ID retrieval
- [ ] T008 [P] Contract test POST /api/content using schema-synced fixtures in ./packages/content-management/tests/contract/create-content.test.ts
- [ ] T009 [P] Contract test GET /api/content using schema-synced fixtures in ./packages/content-management/tests/contract/list-content.test.ts
- [ ] T010 [P] Contract test PATCH /api/content/{id}/approve using schema-synced fixtures in ./packages/content-management/tests/contract/approve-content.test.ts
- [ ] T011 [P] Contract test GET /api/approvals using schema-synced fixtures in ./packages/content-management/tests/contract/pending-approvals.test.ts
- [ ] T012 [P] Contract test GET/PATCH /api/display-settings/{masjid_id} using schema-synced fixtures in ./packages/content-management/tests/contract/display-settings.test.ts
- [ ] T013 [P] E2E test content creation flow (Scenario 1) with beforeEach ID retrieval in apps/hub/tests/e2e/content-creation.spec.ts
- [ ] T014 [P] E2E test YouTube content creation (Scenario 2) with beforeEach ID retrieval in apps/hub/tests/e2e/youtube-content.spec.ts
- [ ] T015 [P] E2E test admin approval dashboard (Scenario 3) with beforeEach ID retrieval in apps/hub/tests/e2e/approval-dashboard.spec.ts
- [ ] T016 [P] E2E test content notifications (Scenario 4) with beforeEach ID retrieval in apps/hub/tests/e2e/content-notifications.spec.ts
- [ ] T017 [P] E2E test display settings (Scenario 5) with beforeEach ID retrieval in apps/hub/tests/e2e/display-settings.spec.ts
- [ ] T018 [P] E2E test permission enforcement (Scenario 7) with beforeEach ID retrieval in apps/hub/tests/e2e/permission-enforcement.spec.ts
- [ ] T019 [P] Integration test content service with database cleanup in ./packages/content-management/tests/integration/content-service.test.ts
- [ ] T020 [P] Integration test approval workflow with database cleanup in ./packages/content-management/tests/integration/approval-workflow.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T021 [P] Content types and interfaces in ./packages/content-management/src/types/content.ts
- [ ] T022 [P] Display settings types in ./packages/content-management/src/types/display-settings.ts
- [ ] T023 [P] Content service (CRUD operations) in ./packages/content-management/src/services/content.service.ts
- [ ] T024 [P] Approval service (approve/reject workflow) in ./packages/content-management/src/services/approval.service.ts
- [ ] T025 [P] Display settings service in ./packages/content-management/src/services/display-settings.service.ts
- [ ] T026 [P] Real-time notifications hook in ./packages/content-management/src/hooks/useContentNotifications.ts
- [ ] T027 [P] Content management hooks in ./packages/content-management/src/hooks/useContentManagement.ts
- [ ] T028 [P] File upload utilities in ./packages/content-management/src/utils/file-upload.ts
- [ ] T029 [P] YouTube validation utilities in ./packages/content-management/src/utils/youtube-validator.ts
- [ ] T030 [P] Content validation utilities in ./packages/content-management/src/utils/content-validator.ts

## Phase 3.4: React Components (after services complete)

- [ ] T031 [P] ContentCreationForm component in ./packages/content-management/src/components/ContentCreationForm.tsx
- [ ] T032 [P] ApprovalDashboard component in ./packages/content-management/src/components/ApprovalDashboard.tsx
- [ ] T033 [P] ContentCard component in ./packages/content-management/src/components/ContentCard.tsx
- [ ] T034 [P] ApprovalActions component in ./packages/content-management/src/components/ApprovalActions.tsx
- [ ] T035 [P] DisplaySettingsForm component in ./packages/content-management/src/components/DisplaySettingsForm.tsx
- [ ] T036 [P] ContentPreview component in ./packages/content-management/src/components/ContentPreview.tsx

## Phase 3.5: Hub App Integration

- [ ] T037 Content creation page in apps/hub/src/pages/content/CreateContent.tsx using content-management package
- [ ] T038 Content history page in apps/hub/src/pages/content/MyContent.tsx using content-management package
- [ ] T039 Admin approvals page in apps/hub/src/pages/admin/ApprovalsDashboard.tsx using content-management package
- [ ] T040 Display settings page in apps/hub/src/pages/admin/DisplaySettings.tsx using content-management package
- [ ] T041 Add content management routes to apps/hub/src/App.tsx with proper authentication guards
- [ ] T042 Update navigation components in apps/hub/src/components/ to include content management links
- [ ] T043 Integrate real-time notifications in apps/hub/src/components/NotificationProvider.tsx

## Phase 3.6: Testing and Validation

- [ ] T044 [P] Unit tests for content service using mock data in ./packages/content-management/tests/unit/content.service.test.ts
- [ ] T045 [P] Unit tests for approval workflow using mock data in ./packages/content-management/tests/unit/approval.service.test.ts
- [ ] T046 [P] Unit tests for React hooks using mock data in ./packages/content-management/tests/unit/hooks.test.ts
- [ ] T047 [P] Unit tests for validation utilities using mock data in ./packages/content-management/tests/unit/validators.test.ts
- [ ] T048 [P] Component tests for ContentCreationForm in ./packages/content-management/tests/components/ContentCreationForm.test.tsx
- [ ] T049 [P] Component tests for ApprovalDashboard in ./packages/content-management/tests/components/ApprovalDashboard.test.tsx

## Phase 3.7: Polish and Performance

- [ ] T050 [P] Performance tests for content upload (<2s) in apps/hub/tests/performance/content-upload.test.ts
- [ ] T051 [P] Performance tests for approval notifications (<1s) in apps/hub/tests/performance/notification-speed.test.ts
- [ ] T052 [P] Update packages/content-management/README.md with API documentation and usage examples
- [ ] T053 [P] Add content management section to root README.md with quickstart instructions
- [ ] T054 Run quickstart validation scenarios from specs/003-we-need-to/quickstart.md
- [ ] T055 [P] Validate mock data generators still match schema after implementation in ./packages/shared-types/src/test-fixtures/
- [ ] T056 Final integration test running complete approval workflow end-to-end

## Dependencies

**Critical Path**:

- T001-T006 (Setup) → T007-T020 (Tests) → T021-T030 (Core) → T031-T036 (Components) → T037-T043 (Integration) → T044-T056 (Polish)

**Blocking Dependencies**:

- T006 (Mock data) blocks T008-T012, T019-T020 (Tests using mock data)
- T007 (E2E setup) blocks T013-T018 (E2E tests)
- T021-T022 (Types) block T023-T025 (Services using types)
- T023-T025 (Services) block T031-T036 (Components using services)
- T031-T036 (Components) block T037-T043 (Pages using components)
- T004 (Migration) blocks T019-T020 (Integration tests with DB)

## Parallel Execution Examples

### Phase 1: Setup Parallel Tasks

```
Task: "Configure ESLint, Prettier, and TypeScript in ./packages/content-management/"
Task: "Generate mock data fixtures in ./packages/shared-types/src/test-fixtures/content-management.ts synced with display_content schema"
```

### Phase 2: Contract Tests (run together)

```
Task: "Contract test POST /api/content using schema-synced fixtures in ./packages/content-management/tests/contract/create-content.test.ts"
Task: "Contract test GET /api/content using schema-synced fixtures in ./packages/content-management/tests/contract/list-content.test.ts"
Task: "Contract test PATCH /api/content/{id}/approve using schema-synced fixtures in ./packages/content-management/tests/contract/approve-content.test.ts"
Task: "Contract test GET /api/approvals using schema-synced fixtures in ./packages/content-management/tests/contract/pending-approvals.test.ts"
Task: "Contract test GET/PATCH /api/display-settings/{masjid_id} using schema-synced fixtures in ./packages/content-management/tests/contract/display-settings.test.ts"
```

### Phase 3: E2E Tests (run together)

```
Task: "E2E test content creation flow (Scenario 1) with beforeEach ID retrieval in apps/hub/tests/e2e/content-creation.spec.ts"
Task: "E2E test YouTube content creation (Scenario 2) with beforeEach ID retrieval in apps/hub/tests/e2e/youtube-content.spec.ts"
Task: "E2E test admin approval dashboard (Scenario 3) with beforeEach ID retrieval in apps/hub/tests/e2e/approval-dashboard.spec.ts"
```

### Phase 4: Services (run together after types complete)

```
Task: "Content service (CRUD operations) in ./packages/content-management/src/services/content.service.ts"
Task: "Approval service (approve/reject workflow) in ./packages/content-management/src/services/approval.service.ts"
Task: "Display settings service in ./packages/content-management/src/services/display-settings.service.ts"
```

## Validation Checklist

_GATE: Verified during task generation_

- [x] All 5 API contracts have corresponding test tasks (T008-T012)
- [x] All 3 main entities (Content, DisplaySettings, User roles) have model tasks
- [x] All 7 quickstart scenarios have E2E test tasks (T013-T018)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks [P] are truly independent (different files)
- [x] Each task specifies exact file path
- [x] Mock data generation (T006) precedes all test tasks
- [x] E2E tests include database ID retrieval setup (T007)
- [x] Constitutional requirements met: Package-first, TDD, Supabase-first, React-first

## Task Generation Rules Applied

**From Contracts (5 endpoints)**:

- POST /api/content → T008 contract test [P]
- GET /api/content → T009 contract test [P]
- PATCH /api/content/{id}/approve → T010 contract test [P]
- GET /api/approvals → T011 contract test [P]
- GET/PATCH /api/display-settings → T012 contract test [P]

**From Data Model (3 entities)**:

- Content → T021 types [P], T023 service [P]
- DisplaySettings → T022 types [P], T025 service [P]
- User roles → integrated into services and permissions

**From Quickstart (7 scenarios)**:

- Scenario 1: Content creation → T013 E2E test [P]
- Scenario 2: YouTube content → T014 E2E test [P]
- Scenario 3: Admin approval → T015 E2E test [P]
- Scenario 4: Notifications → T016 E2E test [P]
- Scenario 5: Display settings → T017 E2E test [P]
- Scenario 6: Live display → Covered by existing TV display app
- Scenario 7: Permissions → T018 E2E test [P]

**Constitutional Compliance**:

- Package-first: T001-T002 create content-management package
- Test-first: T007-T020 before T021-T043
- Supabase-first: T004-T005 for migrations and seed data
- Mock data synced: T006, T055 maintain schema synchronization
- E2E ID retrieval: T007, T013-T018 follow constitutional protocol

## Notes

- [P] tasks indicate parallel execution capability (different files, no dependencies)
- All tests must fail initially before implementation begins (TDD)
- Commit after completing each task for progress tracking
- Performance targets: <2s uploads, <1s notifications, verified in T050-T051
- Real-time subscriptions validated in T026, T043
- Permission enforcement comprehensive testing in T018

---

_56 tasks total, estimated 8-10 days for full implementation following TDD methodology_
