# Tasks: Masjid Suite Monorepo with Profile Management System

**Input**: Design documents from `/specs/001-build-a-monorepo/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Extract: Turborepo, pnpm, React 18, Vite, MUI v5, Supabase, TypeScript 5.2+
   → Structure: Monorepo with apps/, packages/, supabase/ folders
2. Load design documents ✓:
   → data-model.md: 6 entities (User, Profile, ProfileAddress, Masjid, MasjidAdmin, AdminApplication)
   → contracts/api-spec.yaml: 15+ endpoints across 5 API groups
   → quickstart.md: Super admin → Create masjid → User registration → Admin application workflow
3. Generate tasks by category ✓:
   → Setup: Turborepo config, pnpm workspace, Supabase setup
   → Tests: Contract tests for all endpoints, integration tests for user workflows
   → Core: Database migrations, shared packages, React app implementation
   → Integration: Authentication flows, role-based access, Malaysian validation
   → Polish: E2E tests, performance optimization, documentation
4. Apply task rules ✓:
   → Different packages/files = mark [P] for parallel
   → Database → types → components → app (sequential dependencies)
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓:
   → All API contracts have tests ✓
   → All entities have models and types ✓
   → All user workflows covered ✓
9. Return: SUCCESS (39 tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files/packages, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Monorepo structure**: `apps/profile-app/`, `packages/*/`, `supabase/`
- All paths relative to repository root
- Turborepo manages build dependencies across packages

## Phase 3.1: Infrastructure Setup
- [ ] T001 Initialize monorepo structure: create root package.json, turbo.json, pnpm-workspace.yaml
- [ ] T002 Configure Turborepo: set up build pipelines, caching, and parallel execution in turbo.json
- [ ] T003 [P] Create pnpm workspace config in pnpm-workspace.yaml with apps/* and packages/* patterns
- [ ] T004 [P] Configure root ESLint and TypeScript configs in packages/eslint-config/
- [ ] T005 [P] Initialize Supabase project: create supabase/config.toml and initial project structure

## Phase 3.2: Database & Types Foundation
- [ ] T006 Create database migration: users table with role enum in supabase/migrations/001_create_users.sql
- [ ] T007 Create database migration: profiles and profile_addresses tables in supabase/migrations/002_create_profiles.sql
- [ ] T008 Create database migration: masjids table with JSON address field in supabase/migrations/003_create_masjids.sql
- [ ] T009 Create database migration: masjid_admins many-to-many table in supabase/migrations/004_create_masjid_admins.sql
- [ ] T010 Create database migration: admin_applications workflow table in supabase/migrations/005_create_admin_applications.sql
- [ ] T011 Create Row Level Security policies for all tables in supabase/migrations/006_create_rls_policies.sql
- [ ] T012 Create database seed file with super admin and sample data in supabase/seed.sql
- [ ] T013 Generate TypeScript types from database schema in packages/shared-types/src/database.ts

## Phase 3.3: Shared Packages - Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T014 [P] Contract test for Supabase client initialization in packages/supabase-client/tests/client.test.ts
- [ ] T015 [P] Contract test for authentication hooks in packages/auth/tests/useAuth.test.ts
- [ ] T016 [P] Contract test for Malaysian phone validation in packages/shared-types/tests/validation.test.ts
- [ ] T017 [P] Contract test for address validation schemas in packages/shared-types/tests/address.test.ts
- [ ] T018 [P] Contract test for MUI theme configuration in packages/shared-ui/tests/theme.test.ts

## Phase 3.4: Shared Packages Implementation (ONLY after tests are failing)
- [ ] T019 [P] Implement Supabase client with auth config in packages/supabase-client/src/index.ts
- [ ] T020 [P] Implement authentication hooks (useAuth, useUser) in packages/auth/src/hooks/
- [ ] T021 [P] Implement Malaysian validation schemas (phone, postcode) in packages/shared-types/src/validation.ts
- [ ] T022 [P] Implement address validation with Malaysian states in packages/shared-types/src/address.ts
- [ ] T023 [P] Implement MUI theme with Malaysian design tokens in packages/shared-ui/src/theme/
- [ ] T024 [P] Create reusable MUI components (ProfileForm, AddressForm) in packages/shared-ui/src/components/

## Phase 3.5: API Contract Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.6
**CRITICAL: These API tests MUST be written and MUST FAIL before ANY app implementation**
- [ ] T025 [P] Contract test POST /auth/sign-up in apps/profile-app/tests/contract/auth-signup.test.ts
- [ ] T026 [P] Contract test POST /auth/sign-in in apps/profile-app/tests/contract/auth-signin.test.ts
- [ ] T027 [P] Contract test GET /profiles in apps/profile-app/tests/contract/profiles-get.test.ts
- [ ] T028 [P] Contract test POST /profiles in apps/profile-app/tests/contract/profiles-post.test.ts
- [ ] T029 [P] Contract test GET /masjids in apps/profile-app/tests/contract/masjids-get.test.ts
- [ ] T030 [P] Contract test POST /masjids in apps/profile-app/tests/contract/masjids-post.test.ts
- [ ] T031 [P] Contract test POST /admin-applications in apps/profile-app/tests/contract/admin-applications-post.test.ts

## Phase 3.6: Profile App Implementation
- [ ] T032 Initialize React Vite app with TypeScript and MUI in apps/profile-app/
- [ ] T033 Configure Vite build with shared package imports in apps/profile-app/vite.config.ts
- [ ] T034 Implement authentication pages (SignUp, SignIn) in apps/profile-app/src/pages/auth/
- [ ] T035 Implement profile management pages (ProfileForm, ProfileView) in apps/profile-app/src/pages/profile/
- [ ] T036 Implement masjid management pages (MasjidList, MasjidForm) in apps/profile-app/src/pages/masjid/
- [ ] T037 Implement admin application workflow in apps/profile-app/src/pages/admin/
- [ ] T038 Implement role-based routing and navigation in apps/profile-app/src/components/Layout/

## Phase 3.7: Integration & Polish
- [ ] T039 [P] Create Playwright E2E tests for complete user workflows in tests/e2e/user-workflows.spec.ts

## Dependencies
```
Infrastructure (T001-T005) → Database (T006-T013) → Shared Package Tests (T014-T018) → 
Shared Packages (T019-T024) → API Tests (T025-T031) → App Implementation (T032-T038) → 
E2E Tests (T039)

Within phases:
- T006-T012 must run sequentially (database migration order)
- T014-T018 can run in parallel (different packages)
- T019-T024 can run in parallel after their respective tests pass
- T025-T031 can run in parallel (different API endpoints)
- T032-T038 must run sequentially (app component dependencies)
```

## Parallel Execution Examples

### Phase 3.1 Parallel Setup:
```bash
# After T001-T002 complete, run these in parallel:
Task: "Create pnpm workspace config in pnpm-workspace.yaml"
Task: "Configure ESLint and TypeScript in packages/eslint-config/"
Task: "Initialize Supabase project structure"
```

### Phase 3.3 Parallel Contract Tests:
```bash
# All shared package tests can run together:
Task: "Contract test Supabase client in packages/supabase-client/tests/client.test.ts"
Task: "Contract test auth hooks in packages/auth/tests/useAuth.test.ts"
Task: "Contract test Malaysian phone validation in packages/shared-types/tests/validation.test.ts"
Task: "Contract test address validation in packages/shared-types/tests/address.test.ts"
Task: "Contract test MUI theme in packages/shared-ui/tests/theme.test.ts"
```

### Phase 3.4 Parallel Package Implementation:
```bash
# After respective tests pass, implement packages in parallel:
Task: "Implement Supabase client in packages/supabase-client/src/index.ts"
Task: "Implement auth hooks in packages/auth/src/hooks/"
Task: "Implement Malaysian validation in packages/shared-types/src/validation.ts"
Task: "Implement MUI theme in packages/shared-ui/src/theme/"
Task: "Create reusable components in packages/shared-ui/src/components/"
```

### Phase 3.5 Parallel API Contract Tests:
```bash
# All API contract tests can run together:
Task: "Contract test POST /auth/sign-up in apps/profile-app/tests/contract/auth-signup.test.ts"
Task: "Contract test POST /auth/sign-in in apps/profile-app/tests/contract/auth-signin.test.ts"
Task: "Contract test GET /profiles in apps/profile-app/tests/contract/profiles-get.test.ts"
Task: "Contract test POST /profiles in apps/profile-app/tests/contract/profiles-post.ts"
Task: "Contract test GET /masjids in apps/profile-app/tests/contract/masjids-get.test.ts"
Task: "Contract test POST /masjids in apps/profile-app/tests/contract/masjids-post.test.ts"
Task: "Contract test POST /admin-applications in apps/profile-app/tests/contract/admin-applications-post.test.ts"
```

## Key Features Coverage

### User Roles Implementation:
- **Super Admin**: T036 (masjid creation), T037 (admin approval)
- **Masjid Admin**: T037 (admin dashboard), T038 (role-based routing)
- **Registered User**: T034-T035 (profile management), T037 (admin application)
- **Public User**: T036 (public masjid browsing), T038 (access control)

### Malaysian Localization:
- **Phone Validation**: T016, T021 (regex: `^(\+60|0)[1-9][0-9]{7,9}$`)
- **Address Format**: T017, T022 (Malaysian states, 5-digit postcode)
- **Cultural Names**: T035 (Unicode support, flexible name fields)

### Technology Stack Integration:
- **Turborepo**: T002 (build orchestration and caching)
- **pnpm**: T003 (workspace management)
- **Supabase**: T005-T013 (database, auth, real-time)
- **React Vite**: T032-T033 (modern dev experience)
- **MUI**: T018, T023-T024, T034-T038 (consistent UI)

## Validation Checklist
*GATE: Checked before execution*

- [x] All API contracts have corresponding tests (T025-T031)
- [x] All entities have migration and type tasks (T006-T013)
- [x] All tests come before implementation (TDD enforced)
- [x] Parallel tasks truly independent (different packages/files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Monorepo structure matches plan.md specification
- [x] All user workflows from quickstart.md covered
- [x] Malaysian format requirements addressed
- [x] Role-based access control implemented

## Notes
- **[P] tasks**: Different packages/files, no dependencies
- **TDD enforced**: All tests must fail before implementation
- **Turborepo optimization**: Parallel builds and intelligent caching
- **Commit after each task**: Enable incremental progress tracking
- **Supabase local**: Development uses local Supabase server
- **Type safety**: Generated types from database schema ensure consistency
