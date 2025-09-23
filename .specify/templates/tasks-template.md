# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Package Structure**: Features in `./packages/feature-name/`, shared code in `./packages/shared-*/`
- **Applications**: Consumer apps in `./apps/`, consuming packages only
- **Database**: All database operations reference `./supabase/`, seed data in `./scripts/setup-supabase.sh`
- **Package Manager**: Use `pnpm` exclusively (no npm/yarn)

## Phase 3.1: Setup

- [ ] T001 Create package structure in ./packages/[feature-name] with proper package.json
- [ ] T002 Initialize package dependencies using pnpm workspace configuration
- [ ] T003 [P] Configure ESLint, Prettier, and TypeScript in package
- [ ] T004 Update ./scripts/setup-supabase.sh with any required seed data
- [ ] T005 Setup Supabase migrations in ./supabase/migrations/ if database changes needed
- [ ] T006 [P] Generate mock data fixtures in ./packages/shared-types/src/test-fixtures/ synced with schema

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T007 [P] Setup E2E test data retrieval hooks in tests/setup/database-setup.ts
- [ ] T008 [P] Playwright E2E test for main user flow with beforeEach ID retrieval in tests/e2e/feature-flow.spec.ts
- [ ] T009 [P] Contract test POST /api/users using schema-synced fixtures in tests/contract/test_users_post.ts
- [ ] T010 [P] Contract test GET /api/users/{id} using schema-synced fixtures in tests/contract/test_users_get.ts
- [ ] T011 [P] Package unit tests using generated mock data in ./packages/[feature]/tests/
- [ ] T012 [P] Integration test user registration with database cleanup in tests/integration/test_registration.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T013 [P] Package models in ./packages/[feature]/src/models/
- [ ] T014 [P] Package services in ./packages/[feature]/src/services/
- [ ] T015 [P] React components in ./packages/[feature]/src/components/
- [ ] T016 Supabase integration with RLS policies
- [ ] T017 API endpoints using Supabase client
- [ ] T018 Input validation and error handling
- [ ] T019 Application integration in ./apps/[app]/src/

## Phase 3.4: Integration

- [ ] T020 Connect UserService to DB
- [ ] T021 Auth middleware
- [ ] T022 Request/response logging
- [ ] T023 CORS and security headers

## Phase 3.5: Polish

- [ ] T024 [P] Unit tests for validation using mock data in tests/unit/test_validation.py
- [ ] T025 Performance tests (<200ms)
- [ ] T026 [P] Update docs/api.md
- [ ] T027 Remove duplication
- [ ] T028 Run manual-testing.md
- [ ] T029 [P] Validate mock data generators still match schema

## Dependencies

- Tests (T007-T012) before implementation (T013-T019)
- T006 (Mock data) before T007-T012 (Tests using mock data)
- T013 blocks T014, T020
- T021 blocks T023
- Implementation before polish (T024-T029)

## Parallel Example

```
# Launch T007-T012 together:
Task: "Setup E2E test data retrieval hooks in tests/setup/database-setup.ts"
Task: "Contract test POST /api/users using schema-synced fixtures in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} using schema-synced fixtures in tests/contract/test_users_get.py"
Task: "Integration test registration with cleanup in tests/integration/test_registration.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Mock Data → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution
   - Mock data generation before all tests
   - E2E setup hooks before E2E tests

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests using mock data
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Mock data generation tasks precede test tasks
- [ ] E2E tests include database ID retrieval setup
