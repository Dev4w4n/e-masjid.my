<!--
Sync Impact Report - Constitution v1.3.0
Version change: 1.2.0 → 1.3.0 (MINOR: Added TypeScript Build Protocol for monorepo clean operations)
Modified principles:
- II. Monorepo Architecture: Enhanced with TypeScript Build Protocol for clean builds
- Technology Standards: Added Clean Build Protocol requirement
Added sections:
- TypeScript Build Protocol: Mandatory use of build:clean after clean operations
- Clean Build Requirements: Systematic build process for TypeScript composite projects
Removed sections: N/A
Templates requiring updates:
- .specify/templates/plan-template.md (should validate build protocol compliance)
- .specify/templates/tasks-template.md (should include clean build tasks)
Follow-up TODOs: Update build documentation in all packages
-->

# E-Masjid.My Constitution

## Core Principles

### I. React-First UI Development

All user interfaces MUST be built using React 18+ with TypeScript for type safety and modern development practices.
Components MUST be reusable, well-documented, and follow functional programming patterns with hooks.
State management MUST use React's built-in state management or proven libraries (Zustand/Redux Toolkit).
UI components MUST be accessible, responsive, and optimized for both desktop and mobile experiences.
All UI interactions MUST be validated with Playwright end-to-end tests before production deployment.

**Rationale**: React 18 provides the latest features for optimal user experience and developer productivity in the modern web ecosystem.

### II. Monorepo Architecture (NON-NEGOTIABLE)

Every feature MUST be developed within the established Turborepo monorepo structure using pnpm workspaces.
All package management MUST use pnpm exclusively - no npm or yarn commands permitted.
Build orchestration MUST use Turborepo for caching, parallelization, and dependency management.
Packages MUST be self-contained with clear boundaries and minimal cross-dependencies.
Shared code MUST be extracted into dedicated packages under ./packages directory.
New applications MUST follow the apps/\* structure and integrate with existing workspace configuration.

**TypeScript Build Protocol**:
After clean operations (`pnpm clean && pnpm install`), projects MUST use the systematic build process:

- Use `pnpm run build:clean` or `./scripts/build-packages.sh` for clean builds
- NEVER use `pnpm build` immediately after clean operations
- TypeScript composite projects require dependency-ordered compilation
- Declaration files (.d.ts) MUST be generated in correct sequence: shared-types → dependents

**Rationale**: pnpm and Turborepo provide superior performance, disk efficiency, and build caching for large monorepo development. TypeScript composite projects with incremental compilation require proper build sequencing to generate declaration files correctly.

### III. Test-First Development (NON-NEGOTIABLE)

TDD mandatory: Tests written → User approved → Tests fail → Then implement.
Unit tests MUST cover all business logic with minimum 80% coverage using Vitest.
Integration tests MUST validate API contracts and database operations.
All UI components and user flows MUST be validated with Playwright end-to-end tests.
Red-Green-Refactor cycle strictly enforced for all feature development.
No UI feature is considered complete without corresponding Playwright test coverage.

**Mock Data Requirements**:
All unit tests MUST use mock data that is synchronized with the current Supabase schema.
Mock data MUST be generated from actual database schema definitions and kept in sync.
Mock data MUST include realistic relationships, constraints, and data types matching production.
Mock data generators MUST be updated whenever database migrations change schema.

**E2E Testing Protocol**:
E2E tests MUST retrieve required IDs from live Supabase database before each test execution.
Test setup MUST use ./scripts/setup-supabase.sh to ensure consistent test data state.
E2E tests MUST NOT rely on hardcoded IDs unless they are guaranteed stable test fixtures.
Test cleanup MUST be performed after each E2E test to maintain database state integrity.

**Rationale**: Testing ensures reliability and maintainability of Islamic community management features where data integrity is critical. Playwright validation prevents UI regressions. Schema-synced mock data prevents test brittleness while E2E ID retrieval ensures test accuracy against live data.

### IV. Supabase-First Data Strategy

All data persistence MUST use Supabase with Row Level Security (RLS) policies.
Database schemas MUST be managed through Supabase migrations stored in ./supabase directory.
All database operations MUST reference ./supabase for configuration, migrations, and seed data.
Real-time features MUST leverage Supabase subscriptions where applicable.
Authentication MUST use Supabase Auth with role-based access control.
TypeScript types MUST be auto-generated from database schema using supabase gen types.
Seed data MUST be managed through ./scripts/setup-supabase.sh for consistent development environments.

**Test Data Management Protocol**:
Production seed data MUST be maintained in ./supabase/seed.sql for static reference data.
Development test data MUST be generated via ./scripts/setup-supabase.sh for dynamic relationships.
Mock data for unit tests MUST be generated from current schema and stored in ./packages/\*/tests/mocks/.
Schema changes MUST trigger mock data regeneration to maintain synchronization.
E2E test setup MUST query live Supabase for current IDs and entities before test execution.

**Rationale**: Supabase provides comprehensive backend-as-a-service aligned with open-source values and rapid development needs. Centralized ./supabase management ensures consistency. Proper test data management prevents flaky tests and maintains schema accuracy.

### V. Community-Centric Design

User experience MUST prioritize non-technical users (mosque administrators, community members).
Interface text MUST support Bahasa Malaysia as primary language with English fallback.
Features MUST serve the Islamic community without commercial exploitation.
Design MUST respect Islamic values and cultural sensitivities.
Accessibility MUST comply with WCAG 2.1 AA standards for inclusive access.

**Rationale**: The system serves diverse Islamic communities and must be accessible regardless of technical expertise or physical abilities.

### VI. Package-First Feature Development (NON-NEGOTIABLE)

All new features MUST be developed as packages in the ./packages directory first.
Features MUST be library-first: create reusable packages before application integration.
Cross-cutting concerns (auth, types, UI components) MUST reside in dedicated packages.
Applications in ./apps MUST consume functionality through workspace packages only.
No direct feature implementation in applications - all logic MUST go through packages.

**Rationale**: Package-first development ensures modularity, reusability, and maintains clear separation of concerns across the monorepo.

## Mandatory Directory Structure

**Database Management**: All database-related operations MUST reference ./supabase directory

- Migrations: ./supabase/migrations/
- Seed scripts: ./supabase/seed.sql
- Configuration: ./supabase/config.toml
- Setup automation: ./scripts/setup-supabase.sh

**Package Organization**: All features MUST be developed in ./packages

- Feature packages: ./packages/feature-name/
- Shared utilities: ./packages/shared-\*/
- UI components: ./packages/ui-\*/

**Application Structure**: Consumer applications in ./apps

- Web apps: ./apps/app-name/
- Applications consume packages, never implement core logic

## Testing Data Management Protocol

**Mock Data Generation**:

- Mock data MUST be generated programmatically from Supabase schema definitions
- Mock generators MUST be located in ./packages/shared-types/src/test-fixtures/
- Mock data MUST include all required fields, relationships, and realistic constraints
- Mock data MUST be regenerated automatically when schema changes via migration hooks

**E2E Test Data Strategy**:

- E2E tests MUST use beforeEach hooks to retrieve current IDs from live Supabase database
- Test setup MUST query actual entities rather than assume hardcoded IDs exist
- Test teardown MUST clean up any created entities to maintain database state
- Flaky tests due to missing IDs indicate violation of this protocol

**Unit vs Integration Test Data**:

- Unit tests: Use generated mock data that matches schema but doesn't touch database
- Integration tests: Use ./scripts/setup-supabase.sh to establish known test state
- E2E tests: Query live database for IDs and entities, clean up after execution
- Contract tests: Use schema-generated fixtures with realistic data relationships

## Database Management Protocol

**Seed Data Management**:

- All seed data creation MUST update ./scripts/setup-supabase.sh
- Development environment setup MUST be reproducible through this script
- Database resets MUST include seed data regeneration

**Migration Discipline**:

- Schema changes MUST go through ./supabase/migrations/
- No direct database modifications outside migration system
- TypeScript types MUST be regenerated after schema changes

**Test Data Synchronization**:

- Mock data generators MUST be updated when migrations change schema
- E2E test fixtures MUST be refreshed when reference data changes
- Test database state MUST be reset via ./scripts/setup-supabase.sh --test before test suites

## Technology Standards

**Package Management**: pnpm exclusively (no npm/yarn commands)
**Build System**: Turborepo with pnpm workspaces
**Clean Build Protocol**: Use `pnpm run build:clean` after clean operations, never `pnpm build`
**Frontend Stack**: React 18+, TypeScript, Vite, Material-UI v6, React Router v6
**Backend Stack**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
**Testing Stack**: Vitest (unit), Playwright (E2E), React Testing Library
**Code Quality**: ESLint, Prettier, TypeScript strict mode
**Performance**: Web Vitals compliance, progressive enhancement

All applications MUST use the approved technology stack for consistency and maintainability.
Deviations require constitutional amendment through the governance process.
All UI features MUST have corresponding Playwright test validation.

## Security & Compliance

**Data Protection**: All user data MUST be protected with appropriate RLS policies and encryption.
**Authentication**: Multi-factor authentication SHOULD be available for administrative roles.
**API Security**: All API endpoints MUST validate permissions and sanitize inputs.
**Privacy**: Data collection MUST be minimal and transparent with clear consent mechanisms.
**Audit Trail**: Administrative actions MUST be logged for accountability.

## Governance

This constitution supersedes all other development practices and guidelines.
All pull requests MUST verify compliance with these principles during code review.
Complexity MUST be justified against business value and community benefit.

**Amendment Process**:

- Proposed changes MUST be documented with rationale and impact analysis
- Breaking changes require migration plan and backward compatibility strategy
- Version increments follow semantic versioning (MAJOR.MINOR.PATCH)

**Compliance Review**:

- Weekly architecture reviews ensure adherence to principles
- Quarterly retrospectives evaluate principle effectiveness
- Annual constitutional review for major updates

**Version**: 1.3.0 | **Ratified**: 2025-09-22 | **Last Amended**: 2025-09-26
