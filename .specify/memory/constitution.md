# <!--

# SYNC IMPACT REPORT

Version Change: 1.0.0 → 1.0.1 (PATCH: Clarification of migration naming)
Modified Principles:

- III. Database-First Development: Added strict migration naming convention
- Database Change Protocol: Added timestamp format and setup script requirement
  Added Sections: N/A
  Removed Sections: N/A
  Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check updated with migration naming
  ✅ spec-template.md - Checklist updated with migration format
  ✅ tasks-template.md - Database tasks updated with proper naming
  Follow-up TODOs: None - all placeholders filled
  ============================================================================
  -->

# Open E Masjid Constitution

## Core Principles

### I. Package-First Architecture (NON-NEGOTIABLE)

ALL business logic MUST reside in `packages/`, never directly in `apps/`. Applications consume packages only. Before implementing any feature in an app:

- Create or extend appropriate package in `packages/` directory
- Packages MUST be self-contained, independently testable, and documented
- Clear purpose required - no organizational-only packages
- Package structure: `auth/`, `content-management/`, `supabase-client/`, `shared-types/`, `ui-components/`, `ui-theme/`

**Rationale**: Enforces separation of concerns, enables code reuse across multiple apps (hub, papan-info, tv-display), and maintains clean architecture in a monorepo. Prevents duplication and ensures testability.

### II. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all features:

- Tests MUST be written FIRST, they MUST fail initially
- Red-Green-Refactor cycle strictly enforced
- Mock data MUST be synced with Supabase schema
- End-to-end tests MUST retrieve real IDs from database
- Use Vitest for unit tests, Playwright for E2E tests, React Testing Library for component tests

**Rationale**: TDD ensures code quality, prevents regressions, and validates that features work as specified. Given the multi-tenant nature with RLS policies, comprehensive testing is critical for security and data isolation.

### III. Database-First Development

All database operations MUST reference `./supabase/` directory and follow strict migration practices:

- Database schema changes MUST use Supabase migration files with strict naming: `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql` (e.g., `20251211000001_add_black_screen_schedule.sql`)
- Migration files ensure synchronization across local, staging, and production environments
- Never modify database schema directly - always create new migration
- `scripts/setup-supabase.sh` MUST be updated when database changes affect initial setup or seed data
- Row Level Security (RLS) policies MUST enforce multi-tenant security
- Use real-time subscriptions for notifications and live updates
- All data operations use existing Supabase functions (e.g., `get_user_admin_masjids()`)

**Rationale**: Ensures data consistency across all environments (local, staging, production). Strict naming convention prevents migration conflicts and maintains chronological order. Migration files provide audit trail and enable rollback. RLS policies are critical for multi-tenant data security.

### IV. Monorepo Discipline

Strict adherence to monorepo architecture and tooling:

- Use `pnpm` ONLY (never npm or yarn)
- Turborepo for build orchestration
- Workspace dependencies properly configured in `pnpm-workspace.yaml`
- After `pnpm clean && pnpm install`, ALWAYS use `pnpm run build:clean` (not `pnpm build`)
- TypeScript composite projects build in correct dependency order
- `shared-types` MUST build first before other packages can import

**Rationale**: Ensures consistent dependency resolution, proper build ordering, and prevents subtle TypeScript compilation issues. Build discipline prevents CI/CD failures.

### V. Environment-Based Deployment

Three-tier environment strategy with automated deployment:

- **Local**: Development with local Supabase instance
- **Staging**: Cloudflare deployment from `dev` branch (automatic)
- **Production**: Cloudflare deployment from `main` branch (automatic)
- Environment-specific configurations MUST be managed through `.env` files
- Never commit secrets or API keys to repository
- Staging MUST be validated before merging to main

**Rationale**: Provides safe testing environment before production. Automated deployments reduce human error. Cloudflare provides global CDN and edge computing capabilities.

### VI. Multilingual Support

Application MUST support Bahasa Malaysia as primary language with English fallback:

- All UI text MUST be internationalized using i18n package
- Database content MUST support language fields where applicable
- Documentation MUST be maintained in both languages
- Error messages and user feedback MUST be localized

**Rationale**: Serves Malaysian mosques where Bahasa Malaysia is primary language. Accessibility to non-technical users requires native language support.

### VII. Observability & Documentation

Transparency and traceability in development:

- All features MUST be documented in `/docs` directory
- Significant changes MUST have summary documents
- Real-time operations MUST have structured logging
- Performance metrics tracked for upload (<2s), notifications (<1s)
- Document all architectural decisions and patterns

**Rationale**: Enables knowledge transfer, troubleshooting, and onboarding. Critical for open-source community project where contributors may change.

## Technology Constraints

**Frontend Stack** (MANDATORY):

- React 18+ with TypeScript 5.2+
- Material-UI v6 components (consistent design system)
- Vite build system
- React Router v6
- Zustand for state management

**Backend & Data** (MANDATORY):

- Supabase (PostgreSQL, Auth, Storage, Real-time)
- Row Level Security (RLS) policies for multi-tenant security
- Supabase Edge Functions for server-side logic
- Real-time subscriptions for live updates

**Testing & Quality** (MANDATORY):

- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library (component tests)
- Schema-synced mock data
- TDD approach enforced

**Build & Development** (MANDATORY):

- Turborepo monorepo orchestration
- pnpm package manager (version >=8.0.0)
- ESLint + Prettier for code quality
- TypeScript strict mode enabled
- Node.js >=18.0.0

**Compliance**:

- WCAG 2.1 AA accessibility standards
- MIT License (open source)

## Development Workflow

### Branch Strategy

- `main` branch: Production-ready code (auto-deploys to production)
- `dev` branch: Development integration (auto-deploys to staging)
- Feature branches: `###-feature-name` format (e.g., `003-content-management`)

### Feature Development Process

1. **Specification Phase**:
   - Create feature spec in `/specs/###-feature-name/spec.md`
   - Define user stories with priorities (P1, P2, P3)
   - Identify required packages and database changes

2. **Planning Phase**:
   - Generate implementation plan in `/specs/###-feature-name/plan.md`
   - Validate against Constitution Check section
   - Review database migration requirements

3. **Implementation Phase**:
   - Create database migrations FIRST if needed
   - Develop packages BEFORE app integration
   - Write tests FIRST (TDD)
   - Implement features incrementally by user story priority

4. **Validation Phase**:
   - Run all tests: `pnpm test`
   - E2E tests: `pnpm test:e2e`
   - Type check: `pnpm type-check`
   - Lint: `pnpm lint`

5. **Deployment Phase**:
   - Merge to `dev` → auto-deploy to staging
   - Validate in staging environment
   - Merge to `main` → auto-deploy to production

### Database Change Protocol

1. Create migration file with strict naming: `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql`
   - Use current timestamp in format: `YYYYMMDDHHMMSS` (e.g., `20251211000001`)
   - Descriptive name in snake_case (e.g., `add_black_screen_schedule`)
2. Test migration locally: `pnpm supabase:reset`
3. Generate TypeScript types: `pnpm supabase:types`
4. Update `scripts/setup-supabase.sh` if changes affect initial setup or seed data
5. Update mock data if schema changed
6. Migration applies automatically on deployment

### Code Review Gates

- All PRs MUST pass constitution compliance check
- Tests MUST pass (no exceptions)
- TypeScript MUST compile without errors
- Linting MUST pass
- Package-first architecture validated
- Database migrations reviewed for data integrity

## Governance

This constitution supersedes all other development practices. Any deviation MUST be:

- Explicitly documented with justification
- Approved by project maintainers
- Include migration plan if affecting existing code

**Amendment Procedure**:

- Amendments require consensus from core maintainers
- Version increment follows semantic versioning:
  - MAJOR: Backward incompatible governance/principle removals
  - MINOR: New principle/section added
  - PATCH: Clarifications, wording fixes
- All amendments MUST update dependent templates and documentation

**Compliance Review**:

- All PRs/reviews MUST verify compliance with core principles
- Constitution Check section in plan-template.md enforces validation
- Complexity MUST be justified against simplicity principle
- Runtime development guidance available in `.github/copilot-instructions.md`

**Documentation Requirements**:

- All features MUST have documentation in `/docs`
- Migration guides MUST be provided for breaking changes
- Quick reference guides encouraged for complex features
- Visual guides recommended for UI changes

**Version**: 1.0.1 | **Ratified**: 2024-12-24 | **Last Amended**: 2024-12-24
