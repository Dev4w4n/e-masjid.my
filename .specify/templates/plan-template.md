# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  Open E Masjid project defaults - customize only where feature diverges
-->

**Language/Version**: TypeScript 5.2+, React 18+, Node.js >=18.0.0
**Primary Dependencies**: Material-UI v6, React Router v6, Zustand, Vite
**Storage**: Supabase (PostgreSQL + Auth + Storage + Real-time)
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (components)
**Target Platform**: Web (Cloudflare deployment for staging/production)
**Project Type**: Monorepo (Turborepo + pnpm)
**Performance Goals**: Content upload <2s, notifications <1s, UI response <200ms
**Constraints**: WCAG 2.1 AA compliance, multilingual (Bahasa Malaysia/English), RLS multi-tenant security
**Scale/Scope**: [Feature-specific: e.g., "100 mosques, 10k users" or NEEDS CLARIFICATION]

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [ ] **Package-First Architecture**: Is business logic in `packages/`, not `apps/`?
- [ ] **Test-First Development**: Is TDD approach planned (tests written first)?
- [ ] **Database-First Development**: Are Supabase migrations planned? Are RLS policies considered?
- [ ] **Monorepo Discipline**: Are pnpm and proper build order (`build:clean`) documented?
- [ ] **Environment Strategy**: Are local/staging/production environments considered?
- [ ] **Multilingual Support**: Is Bahasa Malaysia/English support planned?
- [ ] **Documentation**: Is `/docs` documentation planned for this feature?

_Any violations MUST be justified in Complexity Tracking section below_

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/hub, packages/content-management).

  IMPORTANT: Follow Package-First Architecture - business logic MUST be in packages/
-->

```text
# Monorepo structure (Open E Masjid)
packages/
├── [feature-package]/      # NEW: Business logic package for this feature
│   ├── src/
│   │   ├── services/       # Service layer
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utilities
│   └── tests/              # Package tests
├── shared-types/           # Shared TypeScript definitions (extends if needed)
├── supabase-client/        # Database operations (extends if needed)
└── ui-components/          # React components (extends if needed)

apps/
├── hub/                    # Main application integration
│   └── src/
│       ├── pages/          # React pages consuming packages
│       └── components/     # App-specific UI only
├── papan-info/            # Public display app (if relevant)
└── tv-display/            # Display app (if relevant)

supabase/
└── migrations/
    └── 0XX_feature_name.sql  # Database migrations (if needed)

docs/
└── FEATURE-NAME.md        # Feature documentation
```

**Structure Decision**: [Document which packages are created/extended, which apps
are affected, and reference real directories above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
