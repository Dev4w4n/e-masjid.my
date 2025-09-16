
# Implementation Plan: Masjid Suite Monorepo with Profile Management System

**Branch**: `001-build-a-monorepo` | **Date**: 17 September 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-build-a-monorepo/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Build a monorepo structure for the Masjid Suite using Turborepo and pnpm workspace management, starting with a Profile Management System as the foundational application. The system implements role-based authentication (super admin, masjid admin, registered user, public user) with comprehensive profile management, integrating with local Supabase server for data persistence. The frontend uses React Vite with Material-UI (MUI) components, structured to support future application additions by contributors.

## Technical Context
**Language/Version**: TypeScript 5.2+, Node.js 18+  
**Primary Dependencies**: Turborepo, pnpm, React 18, Vite 5, Material-UI (MUI) v5, Supabase JavaScript Client  
**Storage**: Supabase (PostgreSQL) - local development server  
**Testing**: Vitest, React Testing Library, Playwright (E2E)  
**Target Platform**: Web application (modern browsers), local development environment  
**Project Type**: web - monorepo with multiple frontend applications and shared packages  
**Performance Goals**: <2s initial load, <500ms navigation between apps, 60fps UI interactions  
**Constraints**: Local Supabase server dependency, Malaysian format validation requirements, unlimited scalability for users/masjids  
**Scale/Scope**: Multi-application monorepo, 4 user roles, extensible architecture for future apps  
**Arguments**: Turborepo for build orchestration, pnpm for efficient package management, separate Supabase folder for database-related configurations, React Vite with MUI for modern UI development

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Since the constitution file is a template with placeholder content, proceeding with standard software engineering principles:

- ✅ **Modularity**: Monorepo structure with clear separation of apps and shared packages
- ✅ **Testability**: Test-first approach with comprehensive testing strategy 
- ✅ **Scalability**: Architecture designed for unlimited users/masjids
- ✅ **Maintainability**: TypeScript for type safety, established patterns with React/MUI
- ✅ **Extensibility**: Clear documentation and patterns for adding new applications

## Project Structure

### Documentation (this feature)
```
specs/001-build-a-monorepo/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Turborepo + pnpm workspace structure
apps/
├── profile-app/         # Main Profile Management System (React Vite + MUI)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
└── [future-apps]/       # Space for additional applications

packages/
├── shared-ui/           # Shared MUI components and themes
├── shared-types/        # TypeScript type definitions
├── auth/               # Authentication utilities and hooks
├── supabase-client/    # Supabase client configuration
└── eslint-config/      # Shared ESLint configuration

supabase/               # Separate folder for Supabase-related files
├── migrations/         # Database migrations
├── seed.sql           # Initial data seeding
├── config.toml        # Supabase configuration
└── functions/         # Edge functions (if needed)

tools/
├── build-scripts/     # Custom build utilities
└── dev-scripts/       # Development utilities

tests/
├── e2e/              # End-to-end tests with Playwright
├── integration/      # Integration tests
└── utils/            # Test utilities

package.json           # Root workspace configuration
turbo.json            # Turborepo configuration
pnpm-workspace.yaml   # pnpm workspace configuration
```

**Structure Decision**: Web application monorepo structure optimized for Turborepo and pnpm workspaces

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Create foundational monorepo setup tasks first (Turborepo, pnpm workspace)
- Generate Supabase database schema and migration tasks
- Create shared package tasks (auth, types, ui components)
- Generate Profile App implementation tasks with TDD approach
- Each API endpoint → contract test task [P]
- Each entity → model creation and validation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Monorepo-Specific Tasks**:
1. **Infrastructure Setup** [P]:
   - Configure Turborepo with optimal caching
   - Set up pnpm workspace configuration
   - Create shared ESLint and TypeScript configs
   - Configure Vite build optimization

2. **Supabase Foundation** [P]:
   - Database schema migration files
   - Row Level Security policy implementation
   - Super admin user seeding scripts
   - API client configuration

3. **Shared Packages** [P]:
   - TypeScript type definitions from database schema
   - Authentication hooks and utilities
   - Reusable MUI components and theming
   - Form validation schemas with Malaysian formats

4. **Profile App Implementation**:
   - React application setup with MUI integration
   - User authentication flows (sign up/in/out)
   - Profile management UI components
   - Admin application workflow
   - Role-based routing and access control

**Ordering Strategy**:
- **Phase 1**: Monorepo infrastructure and tooling setup
- **Phase 2**: Supabase backend implementation with database schema
- **Phase 3**: Shared package development (types, auth, UI)
- **Phase 4**: Profile App frontend implementation
- **Phase 5**: Integration testing and E2E workflows
- TDD order: Contract tests → failing tests → implementation
- Dependency order: Database → types → auth → UI components → app integration
- Mark [P] for parallel execution (independent packages/components)

**Malaysian Localization Tasks**:
- Phone number validation with libphonenumber-js
- Address format validation with postal code lookup
- State/territory dropdown components
- Cultural name format support

**Testing Strategy Tasks**:
- Vitest configuration for monorepo packages
- React Testing Library setup for component testing
- Playwright E2E test configuration
- Database testing utilities with test data seeding
- Mock Supabase client for isolated testing

**Performance Optimization Tasks**:
- Turborepo build caching optimization
- Code splitting and lazy loading implementation
- Bundle size analysis and optimization
- Database query optimization with proper indexing

**Documentation Tasks**:
- API documentation generation from OpenAPI spec
- Component library documentation with Storybook
- Developer onboarding and contribution guidelines
- Specify system integration documentation

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md with clear dependencies and parallel execution opportunities

**Key Dependencies**:
1. Database schema → TypeScript types generation
2. Authentication setup → Role-based components
3. Shared UI components → Profile App implementation
4. Contract tests → API implementation
5. Integration tests → End-to-end validation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
