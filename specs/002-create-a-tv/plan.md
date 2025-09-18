# Implementation Plan: Masjid Digital Display TV App

**Branch**: `002-create-a-tv` | **Date**: September 18, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-create-a-tv/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → Feature spec loaded successfully with clarifications resolved
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detected Project Type: web application with performance focus
   → Set Structure Decision: Single-page React app with Supabase backend
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → No constitutional violations detected for TV display app
   → Update Progress Tracking: Initial Constitution Check ✓
5. Execute Phase 0 → research.md
   → All clarifications resolved in spec, ready for research
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, GitHub Copilot instructions
7. Re-evaluate Constitution Check section
   → No new violations after design phase
   → Update Progress Tracking: Post-Design Constitution Check ✓
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Create a fullscreen digital display TV app for masjids that shows a carousel of sponsored content (YouTube videos and images) with a floating prayer times overlay. The app will be in Bahasa Malaysia, display-only mode, with masjid-specific content ranked by sponsorship funds. Built with latest React.js for optimal performance.

## Technical Context

**Language/Version**: TypeScript/React 18+ with Vite for optimal performance  
**Primary Dependencies**: React 18, React Query, Framer Motion, YouTube API, Supabase client  
**Storage**: Supabase PostgreSQL (existing schema integration)  
**Testing**: Vitest, React Testing Library, Playwright for E2E  
**Target Platform**: Web browser (fullscreen kiosk mode on TV displays)  
**Project Type**: web - single-page application optimized for TV displays  
**Performance Goals**: 60fps smooth transitions, <200ms content loading, <50MB memory usage  
**Constraints**: Fullscreen TV display, unattended operation, offline graceful degradation  
**Scale/Scope**: Multiple masjids, up to 1000 content items per masjid, 24/7 operation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Constitution template is empty - no specific constitutional requirements to validate. Proceeding with standard development practices focusing on:

- Performance optimization for TV displays
- Clean component architecture
- Integration with existing Supabase schema
- Malaysian prayer times API integration

## Project Structure

### Documentation (this feature)

```
specs/002-create-a-tv/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
apps/tv-display/         # New TV app in existing monorepo
├── package.json
├── vite.config.ts       # Optimized for performance
├── index.html
├── src/
│   ├── components/      # TV display components
│   │   ├── Carousel/
│   │   ├── PrayerTimes/
│   │   ├── ContentItem/
│   │   └── Layout/
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities
│   └── main.tsx
└── tests/
    ├── contract/       # API contract tests
    ├── integration/    # Component integration tests
    └── e2e/           # End-to-end TV display tests
```

**Structure Decision**: Web application structure integrated with existing monorepo, new `apps/tv-display/` directory

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

_Prerequisites: research.md complete_

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

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

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
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
