# Implementation Plan: Hub App Content Management and Approval System

**Branch**: `003-we-need-to` | **Date**: 24 September 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-we-need-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → Loaded successfully: Hub App Content Management and Approval System
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: web (frontend + backend with Supabase)
   → Structure Decision: Extends existing monorepo structure
3. Fill the Constitution Check section based on constitution document
   → Validating against React-First UI, Monorepo Architecture, Test-First Development
4. Evaluate Constitution Check section
   → Constitution compliant: React 18+, Supabase, packages-first architecture
   → Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   → Research current TV display app capabilities and Supabase schema
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
   → Design content management APIs and approval workflow
7. Re-evaluate Constitution Check section
   → Verify package-first development and testing requirements
   → Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Enable registered users to create content (images/YouTube videos) for masjid TV displays with masjid admin approval workflow. Technical approach: Extend existing hub app with React components for content creation, Supabase-backed approval system, and admin controls for display configuration, while maintaining TV display app as display-only.

## Technical Context

**Language/Version**: TypeScript with React 18+, Node.js for scripts  
**Primary Dependencies**: React 18+, Material-UI v6, Supabase Client, React Router v6, Vite  
**Storage**: Supabase PostgreSQL with RLS policies for content, approvals, and display settings  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library, schema-synced mock data  
**Target Platform**: Web application (hub app) extending existing monorepo structure
**Project Type**: web - extends existing hub app with new content management features  
**Performance Goals**: <2s content upload, <1s approval notifications, real-time status updates  
**Constraints**: Masjid-specific permissions, approval workflow mandatory, TV display read-only  
**Scale/Scope**: Multi-tenant (multiple masjids), content approval queue, admin dashboard

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Required Validations**:

- [x] **React-First UI**: All UI components use React 18+ with TypeScript - Content creation forms, approval dashboard, display settings will use React
- [x] **Monorepo Architecture**: Features developed as packages in ./packages, using pnpm only - Will create content-management package
- [x] **Test-First Development**: All UI flows have corresponding Playwright tests planned, mock data synced with schema - Content creation → approval → display workflow tests
- [x] **Supabase-First Data**: Database operations reference ./supabase, seed data in ./scripts/setup-supabase.sh - Content, approvals, masjid settings in Supabase
- [x] **Package-First Development**: Feature logic in packages, not directly in applications - Content management logic in ./packages/content-management/
- [x] **Directory Structure**: Follows mandatory ./packages and ./supabase structure - New package + schema migrations
- [x] **Testing Data Management**: Mock data generators planned, E2E ID retrieval strategy defined - Mock content/approvals, retrieve masjid IDs for E2E

## Project Structure

### Documentation (this feature)

```
specs/003-we-need-to/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```

```

# Extends existing monorepo structure

packages/
├── content-management/ # NEW: Core content management logic
│ ├── src/
│ │ ├── types/ # Content, Approval, DisplaySettings types
│ │ ├── services/ # Content CRUD, approval workflow, notifications
│ │ ├── hooks/ # React hooks for content management
│ │ └── utils/ # Content validation, file handling
│ └── tests/
│ ├── mocks/ # Schema-synced mock data
│ └── unit/ # Service and hook tests
├── ui-components/ # EXTEND: Add approval components, content forms
└── shared-types/ # EXTEND: Add content management types

apps/
└── hub/ # EXTEND: Add content management pages
├── src/
│ ├── pages/
│ │ ├── content/ # NEW: Content creation/management
│ │ └── admin/ # NEW: Approval dashboard
│ └── components/
│ ├── content/ # NEW: Content forms, approval UI
│ └── admin/ # NEW: Display settings, approval controls
└── tests/
└── e2e/ # NEW: Content workflow Playwright tests

supabase/
├── migrations/ # NEW: Content, approvals, display settings tables
└── seed.sql # EXTEND: Test masjids, admin users

```

**Structure Decision**: Extends existing monorepo with new content-management package and hub app extensions

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - Research current TV display app schema and capabilities
   - Investigate existing masjid admin permissions system
   - Study current Supabase RLS policies for multi-tenant patterns
   - Review existing notification systems in the hub app

2. **Generate and dispatch research agents**:

```

Task: "Research current TV display Supabase schema for content types and display settings"
Task: "Find best practices for approval workflow UI patterns with React and Material-UI"
Task: "Investigate existing masjid admin role permissions in current codebase"
Task: "Research file upload patterns for images and YouTube video embedding"

```

3. **Consolidate findings** in `research.md`:
- Current schema analysis and required extensions
- Approval workflow patterns and UI components needed
- File handling and content validation approaches
- Integration points with existing hub app structure

**Output**: research.md with TV display schema analysis and technical decisions

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
- Content (id, type, data, masjid_id, creator_id, status, created_at, updated_at)
- ContentApproval (id, content_id, masjid_id, admin_id, status, decision_reason, decided_at)
- DisplaySettings (id, masjid_id, rotation_seconds, schedule_config, updated_by, updated_at)
- Extend existing User and Masjid entities with new relationships

2. **Generate API contracts** from functional requirements:
- POST /api/content - Create content for approval
- GET /api/content?masjid_id - List content by masjid
- PATCH /api/content/:id/approve - Approve/reject content
- GET/PATCH /api/display-settings/:masjid_id - Manage display settings
- GET /api/approvals - List pending approvals for admin
- Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
- Content CRUD operations with proper permissions
- Approval workflow state transitions
- Display settings masjid-specific access
- Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
- User creates content → submits to masjid → admin approves → displays
- Admin configures display settings → settings apply to masjid TV
- User content rejected → notification → resubmission workflow

5. **Update .github/copilot-instructions.md incrementally**:
- Add content management, approval workflow to active technologies
- Update project structure with new packages
- Add content creation and admin dashboard to commands

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, updated copilot instructions

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate TDD tasks from Phase 1 design docs
- Database schema migrations before service layer
- Service layer tests before implementation
- React component tests before UI implementation
- E2E tests for complete approval workflow

**Ordering Strategy**:

- Phase 1: Database schema (content, approvals, display_settings tables)
- Phase 2: Service layer (content management, approval workflow) [P]
- Phase 3: React hooks and utilities [P]
- Phase 4: UI components (content forms, approval dashboard) [P]
- Phase 5: Integration with hub app pages
- Phase 6: E2E Playwright tests for user workflows

**Estimated Output**: 28-32 numbered, ordered tasks in tasks.md with proper TDD sequencing

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v1.2.0 - See `/memory/constitution.md`_
```
