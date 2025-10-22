# Implementation Plan: Public SEO-Friendly Content Display App

**Branch**: `006-create-a-new` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-create-a-new/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
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

Create a new public-facing Next.js application that displays all approved content from masjids nationwide without requiring user login. The app prioritizes SEO optimization through server-side rendering, semantic HTML, and structured data. Content is displayed in a responsive grid layout with category filtering, sorted by sponsorship amount. The design follows the Islamic-themed UI from masjidbro-mockup with green/gold color schemes and Arabic typography. Performance is optimized through 1-24 hour content caching targeting 100-1,000 concurrent users with 1,000-10,000 content items.

## Technical Context

**Language/Version**: TypeScript 5.2+, React 18+, Next.js 15+ (for SSR/SEO)  
**Primary Dependencies**: Next.js, React, @masjid-suite/supabase-client, @masjid-suite/shared-types, Tailwind CSS (for Islamic theme from masjidbro-mockup)  
**Storage**: Supabase PostgreSQL (read-only access to display_content, categories, masjids tables)  
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library  
**Target Platform**: Web (SSR-enabled for SEO), deployed via Vercel/CDN with edge caching
**Project Type**: Web application (new app in monorepo)  
**Performance Goals**: <2s page load on 3G, 100-1,000 concurrent users, Google Lighthouse SEO score 90+  
**Constraints**: Server-side rendering required for SEO, 1-24 hour cache acceptable, WCAG 2.1 AA accessibility  
**Scale/Scope**: 1,000-10,000 content items, nationwide content display, read-only public access

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. React-First UI Development ✅

- Using React 18+ with TypeScript for type safety
- Functional components with hooks for state management
- Components will be accessible, responsive (mobile/tablet/desktop)
- Playwright E2E tests required for all UI flows

### II. Monorepo Architecture ✅

- New app will be created in `apps/public/` following monorepo structure
- Using pnpm workspaces exclusively
- Consuming existing packages: @masjid-suite/supabase-client, @masjid-suite/shared-types, @masjid-suite/i18n
- TypeScript Build Protocol: Will use `pnpm run build:clean` after clean operations

### III. Test-First Development ✅

- TDD mandatory: Tests written first, then implementation
- Unit tests with Vitest (80%+ coverage target)
- E2E tests with Playwright for all user flows
- Contract tests for Supabase data fetching
- Mock data synchronized with current Supabase schema

### IV. Supabase-First Data Strategy ✅

- Read-only access to existing display_content, categories, masjids tables
- Using @masjid-suite/supabase-client package for data access
- Row Level Security respected (public read access)
- No new migrations required (using existing schema)
- Type generation from Supabase schema

### V. Community-Centric Design ✅

- Bahasa Malaysia primary, English fallback (using @masjid-suite/i18n)
- Islamic-themed design from masjidbro-mockup (green/gold, Arabic typography)
- WCAG 2.1 AA accessibility compliance
- Non-technical user focus (loginless, simple navigation)

### VI. Package-First Feature Development ⚠️ DEVIATION

**Deviation**: Creating new application `apps/public/` instead of package-first
**Justification**: This is a standalone public-facing application that:

- Consumes existing packages (@masjid-suite/supabase-client, @masjid-suite/shared-types, @masjid-suite/i18n)
- Has no reusable business logic to extract (pure display/UI layer)
- Requires Next.js App Router for SSR/SEO (framework-specific, not library code)
- Similar to existing `apps/hub/` and `apps/tv-display/` structure
  **Simpler Alternative Rejected**: Cannot be a package because it's a deployable Next.js application requiring framework-specific routing, SSR, and deployment configuration

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
apps/public/                          # New Next.js public app
├── src/
│   ├── app/                         # Next.js 15 App Router
│   │   ├── layout.tsx               # Root layout with SEO meta, Islamic theme
│   │   ├── page.tsx                 # Homepage (content listing)
│   │   ├── iklan/
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Content detail page (SSR)
│   │   ├── sitemap.xml/
│   │   │   └── route.ts             # Dynamic sitemap generation
│   │   └── robots.txt/
│   │       └── route.ts             # robots.txt handler
│   ├── components/                  # React components
│   │   ├── Header.tsx               # Islamic-themed header with "Tambah Iklan"
│   │   ├── Footer.tsx               # Footer with contact info
│   │   ├── ContentCard.tsx          # Content display card
│   │   ├── ContentGrid.tsx          # Grid layout with filtering
│   │   ├── CategoryFilter.tsx       # Category filter buttons
│   │   ├── PremiumBadge.tsx         # Premium content badge
│   │   └── LoadingSpinner.tsx       # Islamic-themed loading state
│   ├── services/                    # Data fetching services
│   │   ├── contentService.ts        # Fetch content from Supabase
│   │   └── categoryService.ts       # Fetch categories from Supabase
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client instance
│   │   ├── seo.ts                   # SEO utilities (meta, schema.org)
│   │   └── cache.ts                 # Cache configuration
│   └── styles/
│       ├── globals.css              # Tailwind + Islamic theme colors
│       └── islamic-theme.css        # Ported from masjidbro-mockup
├── tests/
│   ├── unit/                        # Vitest unit tests
│   │   ├── components/
│   │   └── services/
│   ├── contract/                    # Contract tests for Supabase
│   │   ├── contentService.test.ts
│   │   └── categoryService.test.ts
│   └── e2e/                         # Playwright E2E tests
│       ├── homepage.spec.ts
│       ├── content-detail.spec.ts
│       ├── category-filter.spec.ts
│       └── seo.spec.ts
├── public/                          # Static assets
│   ├── emasjid-500x500.png
│   └── islamic-patterns/
├── package.json                     # Dependencies, scripts
├── next.config.js                   # Next.js config (SSR, caching)
├── tailwind.config.js               # Islamic theme colors
└── tsconfig.json                    # TypeScript config

packages/                             # Existing packages (consumed)
├── supabase-client/                 # Database access
├── shared-types/                    # TypeScript types
└── i18n/                            # Internationalization
```

**Structure Decision**: Web application structure following Next.js 15 App Router conventions with SSR for SEO. New app created at `apps/public/` following existing monorepo pattern (similar to `apps/hub/` and `apps/tv-display/`). Consumes existing packages for data access and shared types.

## Phase 0: Outline & Research ✅ COMPLETE

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

**Output**: research.md with all NEEDS CLARIFICATION resolved ✅

**Completed Artifacts**:

- [research.md](./research.md) - 10 technical decisions documented

## Phase 1: Design & Contracts ✅ COMPLETE

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
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file ✅

**Completed Artifacts**:

- [data-model.md](./data-model.md) - Database schema and data access patterns
- [contracts/content-service.md](./contracts/content-service.md) - Content fetching API contract
- [contracts/category-service.md](./contracts/category-service.md) - Category fetching API contract
- [contracts/seo-service.md](./contracts/seo-service.md) - SEO metadata and structured data contract
- [quickstart.md](./quickstart.md) - End-to-end validation guide
- `.github/copilot-instructions.md` - Updated with Phase 1 context

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:
The /tasks command will generate implementation tasks following TDD principles:

1. **Contract Test Tasks** (from contracts/ directory):
   - contentService.test.ts - Test getAllActiveContent() and getContentBySlug() [P]
   - categoryService.test.ts - Test getAllCategories() [P]
   - seoService.test.ts - Test generateMetadata(), generateStructuredData(), generateSitemap() [P]
   - All tests written first and must fail (red phase)

2. **Component Test Tasks** (from Project Structure):
   - Header.test.tsx - Test "Tambah Iklan" link routing [P]
   - ContentCard.test.tsx - Test card rendering with all data fields [P]
   - ContentGrid.test.tsx - Test grid layout and sorting [P]
   - CategoryFilter.test.tsx - Test client-side filtering [P]
   - All component tests written before implementation

3. **Service Implementation Tasks** (to make tests pass):
   - Implement contentService.ts - getAllActiveContent() with Supabase query
   - Implement contentService.ts - getContentBySlug() with slug parsing
   - Implement categoryService.ts - getAllCategories() with active filter
   - Implement seoService.ts - generateMetadata() with meta tag logic
   - Implement seoService.ts - generateStructuredData() with JSON-LD schemas
   - Implement seoService.ts - generateSitemap() with XML generation

4. **Component Implementation Tasks** (to make tests pass):
   - Implement Header.tsx with Islamic theme and hub link
   - Implement ContentCard.tsx with premium badge logic
   - Implement ContentGrid.tsx with ISR and sorting
   - Implement CategoryFilter.tsx with client-side state

5. **Page Implementation Tasks** (Next.js App Router):
   - Implement app/page.tsx (homepage) with SSR content fetching
   - Implement app/iklan/[slug]/page.tsx with generateMetadata
   - Implement app/sitemap.xml/route.ts for dynamic sitemap
   - Implement app/robots.txt/route.ts for search engine directives

6. **Integration Test Tasks** (E2E with Playwright):
   - homepage.spec.ts - Test content display and category filtering
   - content-detail.spec.ts - Test detail page navigation and SSR
   - seo.spec.ts - Test meta tags, structured data, sitemap access
   - hub-redirect.spec.ts - Test "Tambah Iklan" redirect flow

7. **Configuration Tasks**:
   - Setup Next.js config with ISR revalidation (1-24 hour)
   - Configure Tailwind with Islamic theme colors from masjidbro-mockup
   - Setup package.json with dev/build/test scripts
   - Configure TypeScript for Next.js 15 App Router

**Ordering Strategy**:

- **Tests First**: All .test.ts/.spec.ts files before corresponding implementations
- **Bottom-Up**: Services → Components → Pages (dependencies before dependents)
- **Parallel Marks**: Independent tasks marked [P] for concurrent execution
- **Sequential Integration**: E2E tests only after all implementation complete

**Dependency Order**:

1. Configuration (Next.js, Tailwind, TypeScript) - Foundation
2. Contract tests (services) - [P] parallel
3. Service implementations - Sequential (test → implement → pass)
4. Component tests - [P] parallel (after services exist)
5. Component implementations - Sequential (test → implement → pass)
6. Page implementations - Sequential (depends on components + services)
7. E2E tests - Sequential (full system required)

**Estimated Task Count**:

- Contract tests: 3 tasks
- Component tests: 5 tasks
- Service implementations: 6 tasks
- Component implementations: 5 tasks
- Page implementations: 4 tasks
- E2E tests: 4 tasks
- Configuration: 4 tasks
  **Total: ~31 tasks**

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan. The above is a planning description only.

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

- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented ✅ (1 justified deviation: app vs package)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
