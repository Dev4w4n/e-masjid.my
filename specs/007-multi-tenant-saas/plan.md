# Implementation Plan: Multi-Tenant SaaS with Tiered Pricing

**Branch**: `007-multi-tenant-saas` | **Date**: 25 December 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-multi-tenant-saas/spec.md`

**Status**: ✅ Planning Complete | All clarifications resolved | Ready for implementation

## Summary

Transform Open E Masjid from single-tenant to multi-tenant SaaS with three pricing tiers: Rakyat (free with branding), Pro (RM30/month with custom branding and smart scheduling), and Premium (RM300-500/month with dedicated database, WhatsApp support, and Local Admin service). Core architecture uses Supabase RLS policies for data isolation, ToyyibPay for payments with split billing, and implements grace period + soft-lock for payment failures. Manual Supabase project provisioning for Premium tier provides true database isolation.

**Key Technical Decisions**:

- RLS-based multi-tenancy for Rakyat/Pro tiers (shared database)
- Manual Supabase project provisioning for Premium tier (separate databases)
- 15-minute automated check interval for all Edge Functions
- Exponential backoff retry for split billing (1h, 6h, 17h)
- No proration for mid-month upgrades (simplifies billing)

## Technical Context

**Language/Version**: TypeScript 5.2+, React 18+, Node.js >=18.0.0
**Primary Dependencies**: Material-UI v6, React Router v6, Zustand, Vite
**Storage**: Supabase (PostgreSQL + Auth + Storage + Real-time)
**Testing**: Vitest (unit), Playwright (E2E), React Testing Library (components)
**Target Platform**: Web (Cloudflare deployment for staging/production)
**Project Type**: Monorepo (Turborepo + pnpm)
**Performance Goals**: Content upload <2s, notifications <1s, UI response <200ms, database provisioning <1 hour, grace period notifications <5 minutes
**Constraints**: WCAG 2.1 AA compliance, multilingual (Bahasa Malaysia/English), RLS multi-tenant security
**Scale/Scope**: MVP targets 100 mosques (80 Rakyat, 15 Pro, 5 Premium), 500 concurrent users, 99.5% uptime SLA

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Package-First Architecture**: ✅ Business logic in `packages/subscription-management/`, `packages/tier-management/`, `packages/billing/`
- [x] **Test-First Development**: ✅ TDD approach in tasks.md (T022-T035 type tests, T093-T098 service tests)
- [x] **Database-First Development**: ✅ Supabase migrations T010-T014 with proper naming (`20251224000001_name.sql` format), comprehensive RLS policies in data-model.md, setup script updates in T021
- [x] **Monorepo Discipline**: ✅ pnpm workspace configuration in tasks.md T036-T042, build:clean order documented
- [x] **Environment Strategy**: ✅ Local/staging/production with ToyyibPay sandbox/production configs, manual Premium provisioning workflow documented
- [x] **Multilingual Support**: ✅ Bahasa Malaysia/English support in FR-061-063, notification templates in T051-T054
- [x] **Documentation**: ✅ Feature docs planned in T175, Premium provisioning manual in T117

**Post-Design Re-check**: ✅ All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/007-multi-tenant-saas/
├── plan.md                    # This file (implementation roadmap)
├── spec.md                    # Feature specification (64 FRs, COMPLETE + CLARIFIED)
├── research.md                # Phase 0 technical feasibility (COMPLETE)
├── data-model.md              # Phase 1 database schema (8 tables, 20+ RLS policies, COMPLETE)
├── quickstart.md              # Phase 1 developer guide (COMPLETE)
├── tasks.md                   # Phase 2 task breakdown (175 tasks, COMPLETE)
├── contracts/                 # Phase 1 API contracts (COMPLETE)
│   ├── subscription-service.yaml
│   ├── tier-service.yaml
│   └── billing-service.yaml
└── checklists/
    └── requirements.md        # Quality validation (ALL ISSUES RESOLVED ✅)
```

### Source Code (repository root)

```text
# Monorepo structure for Multi-Tenant SaaS feature
packages/
├── subscription-management/      # NEW: Subscription & billing logic
│   ├── src/
│   │   ├── services/
│   │   │   ├── SubscriptionService.ts      # CRUD, grace period, soft-lock (T065-T074)
│   │   │   ├── NotificationService.ts      # Email notifications (T051-T054)
│   │   │   └── DatabaseProvisioningService.ts  # Premium manual provisioning docs (T117)
│   │   ├── types/
│   │   │   ├── Subscription.ts             # Subscription types (T022-T026)
│   │   │   └── Payment.ts                  # Payment types (T027-T029)
│   │   └── hooks/
│   │       └── useGracePeriodCountdown.ts  # Grace period timer (T137)
│   ├── docs/
│   │   └── premium-provisioning.md         # Manual Supabase project setup guide
│   └── tests/                              # Service tests (T093-T095)
│
├── tier-management/              # NEW: Tier features & access control
│   ├── src/
│   │   ├── services/
│   │   │   ├── TierService.ts              # Feature access checks (T075-T080)
│   │   │   └── SchedulingService.ts        # Smart scheduling (T107-T111)
│   │   ├── types/
│   │   │   └── Tier.ts                     # Tier types (T030-T032)
│   │   └── utils/
│   │       └── tierHelpers.ts              # Tier utility functions (T081-T084)
│   └── tests/                              # Service tests (T096-T098)
│
├── billing/                      # NEW: Payment & split billing
│   ├── src/
│   │   ├── services/
│   │   │   ├── ToyyibPayService.ts         # Payment gateway integration (T127-T129)
│   │   │   └── SplitBillingService.ts      # Premium split payment (T130-T132)
│   │   └── types/
│   │       └── Payment.ts                  # Payment transaction types (T033-T035)
│   └── tests/                              # Integration tests (T165-T167)
│
├── shared-types/                 # EXTEND: Add tier and subscription types
│   └── src/
│       ├── tier.ts                         # Tier enums and interfaces
│       └── subscription.ts                 # Subscription interfaces
│
├── supabase-client/              # EXTEND: Add tier-aware queries
│   └── src/
│       ├── tierQueries.ts                  # Tier-specific data access
│       └── subscriptionQueries.ts          # Subscription CRUD operations
│
└── ui-components/                # EXTEND: Add tier-related components
    └── src/
        ├── TierBadge.tsx                   # Tier display badge (T085-T088)
        ├── GracePeriodBanner.tsx           # Grace period countdown (T135-T136)
        └── SoftLockBanner.tsx              # Soft-lock notification (T151-T152)

apps/
├── hub/                          # EXTEND: Add tier management UI
│   └── src/
│       ├── pages/
│       │   ├── registration/
│       │   │   ├── register.tsx            # Public registration (T043-T050)
│       │   │   └── verify-email.tsx        # Email verification (T055-T057)
│       │   ├── billing/
│       │   │   ├── subscription.tsx        # Subscription management (T089-T092)
│       │   │   └── retry-payment.tsx       # Payment retry (T140)
│       │   ├── super-admin/
│       │   │   ├── dashboard.tsx           # Super admin dashboard (T058-T064)
│       │   │   ├── approvals.tsx           # User approvals (T099-T103)
│       │   │   └── soft-locked.tsx         # Soft-lock management (T154)
│       │   └── landing/
│       │       └── index.tsx               # Hub landing page (T155-T161)
│       └── components/
│           └── Layout.tsx                  # Integrate tier banners (T136, T152)
│
├── papan-info/                   # NO CHANGES: Public displays unaffected
└── tv-display/                   # EXTEND: Tier-based branding (T104-T106)
    └── src/
        └── components/
            └── BrandingOverlay.tsx         # Conditional "Powered by e-Masjid"

supabase/
├── migrations/
│   ├── 20251224000001_add_tier_and_subscription_tables.sql     # T010
│   ├── 20251224000002_add_subscription_payment_tables.sql      # T011
│   ├── 20251224000003_add_tier_based_rls_policies.sql          # T012
│   ├── 20251224000004_add_tier_helper_functions.sql            # T013
│   └── 20251224000005_add_grace_period_cron.sql                # T014 (15-min interval)
├── functions/
│   ├── activate-schedules/                 # Edge Function (T111, 15-min interval)
│   ├── grace-period-reminders/             # Edge Function (T139, 15-min interval)
│   └── trigger-soft-lock/                  # Edge Function (T143, 15-min interval)
└── seed.sql                                # EXTEND: Add tier test data (T017-T020)

docs/
└── MULTI-TENANT-SAAS.md                    # Feature documentation (T175)

scripts/
└── setup-supabase.sh                       # EXTEND: Add seed verification (T021)
```

**Structure Decisions**:

- **3 new packages**: `subscription-management`, `tier-management`, `billing` for core business logic
- **Hub app extensions**: Registration, billing, admin pages consume packages only
- **5 database migrations**: Sequential schema evolution with proper RLS policies
- **3 Edge Functions**: Scheduled automation for content activation, grace periods, soft-locks (all 15-min interval)
- **Manual Premium provisioning**: Documented workflow in package docs (no automation code)

## Complexity Tracking

**No constitutional violations** - all principles satisfied:

✅ **Package-First**: 3 new packages contain all business logic (subscription-management, tier-management, billing)  
✅ **Database-First**: 5 sequential migrations with comprehensive RLS policies for multi-tenant isolation  
✅ **Test-First**: 175 tasks include test creation before implementation (T022-T035 types, T093-T098 services)  
✅ **Monorepo Discipline**: pnpm workspace, proper build order, package dependencies documented  
✅ **Multilingual**: BM/EN support in landing page (FR-061-063) and all notifications  
✅ **Documentation**: Feature docs (T175), Premium provisioning manual (T117)

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Artifacts**: [research.md](./research.md)
**Key Findings**:

- Supabase supports multi-tenant RLS but NO programmatic database creation → Manual Premium provisioning
- ToyyibPay supports split payments via sequential transfers
- pg_cron + Edge Functions sufficient for 15-minute automation interval
- Manual data migration acceptable for Premium tier (low volume)

### Phase 1: Design ✅ COMPLETE

**Artifacts**: [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)
**Key Outputs**:

- 8-table schema: masjids (extended), subscriptions, payments, local_admins, user_roles, subscription_tiers, payment_transactions, schedule_rules
- 20+ RLS policies for tenant isolation + role-based access
- 3 API contracts: SubscriptionService, TierService, BillingService
- Custom Auth Hook for JWT role injection
- Developer quickstart guide

### Phase 2: Task Breakdown ✅ COMPLETE

**Artifacts**: [tasks.md](./tasks.md)
**Scope**: 175 tasks across 8 phases (Setup, Registration, Subscriptions, Tiers, Pro Features, Premium Features, Grace Period, Polish)
**Critical Path**: Database migrations (T010-T014) → Type definitions (T022-T035) → Core services (T065-T084)

### Post-Planning: Clarification ✅ COMPLETE

**Artifacts**: [checklists/requirements.md](./checklists/requirements.md)
**Issues Resolved**: 8/8 critical and high-priority ambiguities clarified

- Database provisioning: Manual Supabase projects for Premium
- Automation interval: 15 minutes for all Edge Functions
- Retry strategy: Exponential backoff (1h, 6h, 17h)
- Mid-month upgrades: No proration, full month charge
- WhatsApp support: 1-hour human response (no 15-min acknowledgment)
- Super admin FRs: Merged into comprehensive requirements

## Next Steps

**Status**: ✅ ALL PLANNING PHASES COMPLETE | READY FOR IMPLEMENTATION

**Recommended Command**: `/speckit.implement` or begin manual implementation following [tasks.md](./tasks.md)

**Critical Pre-Implementation Checklist**:

- [ ] Review [data-model.md](./data-model.md) database schema
- [ ] Review [contracts/](./contracts/) API definitions
- [ ] Set up ToyyibPay sandbox credentials
- [ ] Prepare Premium provisioning workflow documentation
- [ ] Review [tasks.md](./tasks.md) Phase 1 (Setup) dependencies

**Implementation Priority**: Start with Phase 1 (Database Setup, T010-T021) → Phase 2 (Registration, T043-T064) → Phase 3 (Core Services, T065-T098)

---

**Plan Complete**: 25 December 2025  
**Total Planning Time**: ~4 hours (spec → research → design → tasks → clarifications)  
**Specification Quality**: ✅ 95% FR coverage, 100% critical issues resolved, constitution compliant
