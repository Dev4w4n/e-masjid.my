# Tasks: Multi-Tenant SaaS with Tiered Pricing

**Branch**: `007-multi-tenant-saas`  
**Input**: Design documents from `/specs/007-multi-tenant-saas/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and package structure

- [x] T001 Create package structure `packages/subscription-management/` with subdirectories: `src/`, `tests/`, `src/services/`, `src/hooks/`, `src/types/`
- [x] T002 Create package structure `packages/tier-management/` with subdirectories: `src/`, `tests/`, `src/services/`, `src/hooks/`, `src/types/`
- [x] T003 [P] Configure `packages/subscription-management/package.json` with dependencies: `@supabase/supabase-js`, `date-fns`, exports for services/hooks
- [x] T004 [P] Configure `packages/tier-management/package.json` with dependencies: `@supabase/supabase-js`, exports for services/hooks
- [x] T005 [P] Setup TypeScript configuration `packages/subscription-management/tsconfig.json` extending monorepo base config
- [x] T006 [P] Setup TypeScript configuration `packages/tier-management/tsconfig.json` extending monorepo base config
- [x] T007 Add packages to pnpm workspace in `pnpm-workspace.yaml`
- [x] T008 Update Turborepo pipeline in `turbo.json` for subscription-management and tier-management build order
- [x] T009 Run `pnpm install && pnpm run build:clean` to verify package structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migrations

- [x] T010 Create migration `supabase/migrations/20251224000001_add_tier_and_subscription_tables.sql` extending masjids table with tier columns, creating subscriptions table, creating payment_transactions table
- [x] T011 Create migration `supabase/migrations/20251224000002_add_local_admin_and_roles.sql` creating local_admins table, creating user_roles table with role enum
- [x] T012 Create migration `supabase/migrations/20251224000003_add_tier_based_rls_policies.sql` implementing RLS policies for public access, super admin bypass, masjid admin restrictions, tier-based feature gates
- [x] T013 Create migration `supabase/migrations/20251224000004_add_tier_helper_functions.sql` implementing custom_access_token_hook for JWT role injection, get_user_tier, get_user_role, is_super_admin, check_local_admin_capacity functions
- [x] T014 Create migration `supabase/migrations/20251224000005_add_grace_period_cron.sql` creating pg_cron job with 15-minute check interval for daily grace period expiry checks and soft-lock triggers (system runs automated checks every 15 minutes per FR-064)
- [x] T015 Test migrations locally with `pnpm supabase:reset` to verify schema correctness
- [x] T016 Generate TypeScript types from schema: `pnpm supabase:types` and commit generated types
- [ ] T016a Create migration `supabase/migrations/20251225000007_add_multi_tenant_seed_data.sql` with sample masjids (3 tiers), users (super-admin, masjid-admins, local-admin), subscriptions (active, grace-period), local_admins with earnings, payment_transactions

### Seed Data

- [x] T017 ~~Update `supabase/seed.sql`~~ Seed data now in migration file T016a: sample masjids for each tier (Rakyat: Masjid Al-Falah, Pro: Masjid Ar-Rahman, Premium: Masjid An-Nur)
- [x] T018 ~~Update `supabase/seed.sql`~~ Seed data now in migration file T016a: sample subscriptions for each tier status (active: Rakyat/Pro, grace-period: Premium)
- [x] T019 ~~Update `supabase/seed.sql`~~ Seed data now in migration file T016a: sample user_roles (super-admin, masjid-admin users, local-admin)
- [x] T020 ~~Update `supabase/seed.sql`~~ Seed data now in migration file T016a: sample local_admins with earnings data (RM450 total, RM150/month)
- [x] T021 ~~Updated `scripts/setup-supabase.sh`~~ Seed data now properly migrated to T016a migration file per constitution requirement
- [x] T021b Created migration `20251225000006_fix_masjid_creator_role_function.sql` to update trigger function for new user_roles table

### TypeScript Type Definitions

- [x] T022 [P] Defined subscription types in `packages/subscription-management/src/types/Subscription.ts`: Tier, SubscriptionStatus, BillingCycle, Subscription, CreateSubscriptionRequest, CreateSubscriptionResponse, UpdateSubscriptionStatusRequest, SubscriptionWithMasjid (95 lines)
- [x] T023 [P] Defined payment types in `packages/subscription-management/src/types/Payment.ts`: PaymentMethod, PaymentStatus, TransferStatus, PaymentTransaction, SplitBillingDetails, ToyyibPayWebhook, CreateBillRequest, CreateBillResponse, ProcessWebhookRequest, ProcessWebhookResponse (132 lines)
- [x] T024 [P] Defined tier types in `packages/tier-management/src/types/index.ts`: Tier, TierFeatures, TierPricing, TierConfig, CheckFeatureAccessRequest, CheckFeatureAccessResponse, ChangeTierRequest, ChangeTierResponse, TierUsageStats (115 lines)
- [x] T025 [P] Defined local admin types in `packages/subscription-management/src/types/local-admin.ts`: LocalAdmin, EarningsSummary, AvailabilityStatus, MonthlyEarnings, CreateLocalAdminRequest, UpdateLocalAdminRequest, AssignLocalAdminRequest, LocalAdminWithAssignments, LocalAdminWithMasjids, EarningsReport (142 lines)
- [x] T026 [P] Extended auth types in `packages/auth/src/types.ts`: UserRoleAssignment, UserWithRoles, ROLE_HIERARCHY, HasRoleRequest, CheckPermissionRequest, PermissionCheckResponse, RoleCapabilities, ROLE_CAPABILITIES. Updated USER_ROLES constant and auth service methods to use new hyphenated role names (super-admin, masjid-admin, local-admin, public-user). Regenerated database.ts to capture new user_role enum.

### Supabase Client Extensions

- [x] T027 [P] Implemented Supabase client methods in `packages/supabase-client/src/services/subscriptions.ts`: getSubscription, createSubscription, updateSubscriptionStatus, triggerGracePeriod, triggerSoftLock, getAllSubscriptions, getSubscriptionsByTier, getSubscriptionsByStatus (241 lines)
- [x] T028 [P] Implemented Supabase client methods in `packages/supabase-client/src/services/payment-transactions.ts`: createPaymentTransaction, updatePaymentStatus, getPaymentHistory, recordSplitBilling, getPaymentTransaction, getPaymentByProviderId, getPendingPayments, getFailedPayments (254 lines)
- [x] T029 [P] Implemented Supabase client methods in `packages/supabase-client/src/services/local-admins.ts`: getLocalAdmin, createLocalAdmin, updateEarnings, getAvailableLocalAdmins, assignLocalAdmin, unassignLocalAdmin, getLocalAdminWithMasjids, updateLocalAdmin, getAllLocalAdmins (361 lines)
- [x] T030 [P] Implemented Supabase client methods in `packages/supabase-client/src/services/user-roles.ts`: getUserRole, getAllUserRoles, assignRole, removeRole, checkSuperAdmin, checkMasjidAdmin, checkLocalAdmin, getUsersByRole, getMasjidAdmins, getHighestRole, bulkAssignRoles (308 lines)

**Checkpoint**: Foundation complete - All database operations ready. Total: 1,164 lines of service code implemented.

---

## Phase 3: User Story 1 - Public User Discovery (Priority: P1) 🎯 MVP

**Goal**: Enable visitors to discover e-Masjid value proposition, understand pricing tiers, and access public displays without authentication

**Independent Test**: A visitor navigates hub landing page, views tier comparison (Rakyat/Pro/Premium), accesses any masjid's papan-info and TV display URLs, and reaches registration page—all without login prompts

### Implementation for User Story 1

- [x] T031 [P] [US1] Implement TierService.getTierFeatures in `packages/tier-management/src/services/TierService.ts` returning feature matrix for all tiers
- [x] T032 [P] [US1] Implement TierService.getTierComparison in `packages/tier-management/src/services/TierService.ts` with bilingual (BM/EN) feature descriptions
- [x] T033 [P] [US1] Create React hook useTierFeatures in `packages/tier-management/src/hooks/useTierFeatures.ts` for fetching tier data
- [x] T034 [P] [US1] Create TierComparisonTable component in `packages/ui-components/src/TierComparisonTable.tsx` with Material-UI table displaying feature matrix
- [x] T035 [US1] Design hub landing page layout in `apps/hub/src/pages/index.tsx`: hero section with value proposition, tier comparison section, call-to-action buttons
- [x] T036 [US1] Implement hero section in `apps/hub/src/pages/index.tsx` with headline "Transform Your Masjid Management", subtitle, and primary CTA "Register Now"
- [x] T037 [US1] Integrate TierComparisonTable component in hub landing page tier comparison section with Rakyat (Free Forever), Pro (RM30/mo), Premium (RM300-500/mo)
- [x] T038 [US1] Add bilingual language toggle in `apps/hub/src/components/LanguageToggle.tsx` with BM/EN switch persisting to sessionStorage
- [x] T039 [US1] Implement i18n keys in `apps/hub/src/i18n/` for landing page copy: tier names, feature descriptions, pricing, CTAs (both BM and EN)
- [x] T040 [US1] Style landing page with Material-UI theme in `apps/hub/src/pages/index.tsx` ensuring mobile responsiveness for 4G Malaysia
- [x] T041 [US1] Verify RLS policy allows public access to papan-info and TV display URLs without authentication (test with anon role)
- [ ] T041b [US1] Implement TV display automatic activation in `packages/tv-display/src/services/ActivationService.ts` - bypass approval workflow, set status='active' on creation per FR-015a, emit real-time activation notification
- [x] T042 [US1] Add "Please register/login to manage content" redirect in `apps/hub/src/pages/content/edit.tsx` when unauthenticated users attempt edit
- [x] T043 [US1] Add footer section with secondary CTAs and links to registration page in `apps/hub/src/components/Footer.tsx`
- [x] T044 [US1] Performance optimization: ensure landing page loads <3s on 4G with lazy loading for images, code splitting for tier table
- [x] T045 [US1] Create documentation in `docs/HUB-LANDING-PAGE-UX.md` explaining landing page sections, tier positioning, bilingual support

**Checkpoint**: User Story 1 complete - visitors can discover e-Masjid, view tiers, access public displays

---

## Phase 4: User Story 2 - Streamlined Registration (Priority: P1)

**Goal**: Enable new users to register with minimal friction, select pricing tier during signup, complete payment (if Pro/Premium), and access dashboard with activated features

**Independent Test**: A new user completes full registration flow (email → verification → masjid setup → tier selection → payment if needed) in <5 min (free) or <10 min (paid) and lands on functional dashboard

### Implementation for User Story 2

- [ ] T045a [Test] [US2] Write failing tests for SubscriptionService.createSubscription in `packages/subscription-management/tests/SubscriptionService.test.ts` covering Rakyat immediate activation, Pro/Premium pending_payment status, validation errors
- [ ] T046 [P] [US2] Implement SubscriptionService.createSubscription in `packages/subscription-management/src/services/SubscriptionService.ts` handling immediate Rakyat activation and Pro/Premium pending_payment status
- [ ] T046a [Test] [US2] Write failing tests for PaymentService.createBill in `packages/subscription-management/tests/PaymentService.test.ts` mocking ToyyibPay API responses, testing bill creation success/failure scenarios
- [ ] T047 [P] [US2] Implement PaymentService.createBill in `packages/subscription-management/src/services/PaymentService.ts` integrating ToyyibPay API for bill creation
- [ ] T048 [P] [US2] Create React hook useSubscription in `packages/subscription-management/src/hooks/useSubscription.ts` for subscription CRUD operations
- [ ] T049 [P] [US2] Create React hook usePayment in `packages/subscription-management/src/hooks/usePayment.ts` for payment bill creation and status checking
- [ ] T049a [Test] [US2] Write failing component tests for registration page in `apps/hub/tests/pages/register.test.tsx` testing form validation, email verification trigger, error handling using React Testing Library
- [ ] T050 [US2] Create registration page in `apps/hub/src/pages/register.tsx` with form fields: email, password, full name, email verification link trigger
- [ ] T051 [US2] Implement email verification flow in `apps/hub/src/pages/verify-email.tsx` with token validation and redirect to masjid setup
- [ ] T052 [US2] Create masjid setup page in `apps/hub/src/pages/onboarding/masjid-setup.tsx` with fields: masjid name, location (address, city, state, postcode), contact details
- [ ] T053 [US2] Implement tier selection interface in `apps/hub/src/pages/onboarding/tier-selection.tsx` with side-by-side tier cards (Rakyat, Pro, Premium) including feature highlights
- [ ] T054 [US2] Add tier selection logic: Rakyat → immediate activation and redirect to dashboard, Pro/Premium → redirect to payment gateway
- [ ] T055 [US2] Implement ToyyibPay payment redirect in `apps/hub/src/pages/onboarding/payment.tsx` with billPaymentUrl from createBill response
- [ ] T056 [US2] Create payment callback page in `apps/hub/src/pages/billing/callback.tsx` handling ToyyibPay return URL with payment status display
- [ ] T056a [Test] [US2] Write failing tests for PaymentService.handleWebhook in `packages/subscription-management/tests/PaymentService.test.ts` testing webhook signature validation, payment status updates, duplicate webhook handling, invalid payloads
- [ ] T057 [US2] Implement PaymentService.handleWebhook in `packages/subscription-management/src/services/PaymentService.ts` processing ToyyibPay webhook payload (refno, status, billcode) with security: verify ToyyibPay signature using billcode hash per FR-013, implement idempotency using payment_transactions.toyyibpay_refno uniqueness check, return 200 for duplicates, 400 for invalid signatures, handle retry with exponential backoff tracking
- [ ] T058 [US2] Create API endpoint `/api/payment/webhook` in `apps/hub/src/pages/api/payment/webhook.ts` for ToyyibPay webhook receiver
- [ ] T059 [US2] Implement webhook validation and subscription activation in webhook endpoint: update subscription status to active, set next_billing_date, activate tier features
- [ ] T060 [US2] Add polling fallback in `packages/subscription-management/src/services/PaymentService.ts` using ToyyibPay getBillTransactions API polling every 30 minutes for pending payments
- [ ] T061 [US2] Implement payment failure handling in `apps/hub/src/pages/billing/failed.tsx` with retry payment button and downgrade to Rakyat option
- [ ] T062 [P] [US2] Implement comprehensive email notification service in `packages/subscription-management/src/services/NotificationService.ts` with methods: sendPaymentSuccess (subscription details, next billing date), sendPaymentFailed (retry payment link), sendSplitBillingFailure (transaction details for super admin), sendGracePeriodStart (retry link, expiry date, support contact), sendGracePeriodReminder (Day 13 urgent reminder with "expires tomorrow"), sendPremiumActivation ("Local Admin will contact you within 24 hours"), sendLocalAdminIntro (name, WhatsApp number, email), sendSoftLockNotification (disabled features list, data preservation info, reactivation instructions - sent to masjid admin and Local Admin if Premium tier)
- [ ] T063 [US2] ~~Add email notification for failed payment~~ Consolidated into T062 NotificationService implementation
- [ ] T064 [US2] Implement feature activation logic in `packages/tier-management/src/services/TierService.ts`: activate tier-specific features immediately after payment confirmation
- [ ] T065 [US2] Create post-registration dashboard in `apps/hub/src/pages/dashboard.tsx` showing masjid name, active tier, tier features status, quick links to create TV display
- [ ] T066 [US2] Add validation and error handling for registration flow: email already exists, weak password, invalid masjid details, payment timeout (14 days - auto-cancel pending_payment subscriptions, send reminder emails on Day 7 and Day 12 using T062 NotificationService, automatically downgrade to Rakyat tier on Day 14)
- [ ] T067 [US2] Add i18n keys for registration flow in `apps/hub/src/i18n/`: form labels, validation errors, payment messages, success notifications (BM/EN)
- [ ] T068 [US2] Performance optimization: ensure registration form submission <2s, payment redirect <1s, feature activation <2min after payment
- [ ] T069 [US2] Create documentation in `docs/REGISTRATION-FLOW.md` explaining registration steps, tier selection logic, payment integration, webhook handling

**Checkpoint**: User Story 2 complete - users can register, select tier, complete payment, access dashboard

---

## Phase 5: User Story 3 - Super Admin Management (Priority: P1)

**Goal**: Provide super admin unrestricted access to all masjids, users, content, and billing data with comprehensive admin dashboard

**Independent Test**: Super admin logs in, views admin dashboard with system metrics, searches/filters masjid list, edits any masjid's data/content, manages user accounts, views billing history, and performs manual subscription overrides—all without permission restrictions

### Implementation for User Story 3

#### Backend Services

- [ ] T069a [Test] [US3] Write failing tests for admin subscription queries in `packages/subscription-management/tests/SubscriptionService.test.ts` testing listSubscriptions with various filter combinations, pagination, sorting
- [ ] T070 [P] [US3] Implement SubscriptionService.listSubscriptions in `packages/subscription-management/src/services/SubscriptionService.ts` for admin with filters: tier, status, masjid_name, date range
- [ ] T071 [P] [US3] Implement PaymentService.getPaymentHistory in `packages/subscription-management/src/services/PaymentService.ts` returning all transactions with ToyyibPay IDs and split billing details
- [ ] T072 [P] [US3] Implement SubscriptionService.manualOverride in `packages/subscription-management/src/services/SubscriptionService.ts` allowing super admin to: change tier, extend grace period, trigger/remove soft-lock with audit logging
- [ ] T073 [P] [US3] Create React hook useAdminSubscriptions in `packages/subscription-management/src/hooks/useAdminSubscriptions.ts` for admin subscription queries
- [ ] T074 [P] [US3] Create React hook useAdminPayments in `packages/subscription-management/src/hooks/useAdminPayments.ts` for admin payment queries
- [ ] T074a [Test] [US3] Write failing component tests for admin dashboard in `apps/hub/tests/pages/admin/index.test.tsx` testing navigation, metric display, role-based access control using React Testing Library

#### Admin Dashboard UI

- [ ] T075 [US3] Create admin dashboard layout in `apps/hub/src/pages/admin/index.tsx` with navigation sidebar: Overview, Masjids, Users, Billing, Settings
- [ ] T076 [US3] Implement admin overview page in `apps/hub/src/pages/admin/overview.tsx` displaying metrics cards: total masjids count, tier breakdown (Rakyat/Pro/Premium), active subscriptions, revenue summary (current month, total), system health indicators
- [ ] T077 [US3] Create masjids list page in `apps/hub/src/pages/admin/masjids/index.tsx` with Material-UI DataGrid showing: masjid name, tier, subscription status, registration date, last activity, actions (View/Edit)
- [ ] T077a [US3] Implement super admin tier change functionality in `apps/hub/src/pages/admin/subscriptions/[masjidId]/change-tier.tsx` with tier selector dropdown, validation (prevent Premium downgrade if local admin assigned, check for active subscription status), feature activation/deactivation using T064 TierService logic, send notification to masjid admin using T062 NotificationService, audit log using T089 AuditService per FR-032
- [ ] T078 [US3] Add search and filter controls in masjids list: text search by name, dropdown filters for tier and subscription status, date range picker for registration date
- [ ] T079 [US3] Implement masjid detail page in `apps/hub/src/pages/admin/masjids/[id].tsx` with tabs: Overview (masjid info), Subscription (tier, status, billing), Content (TV displays, papan-info), Users (masjid admins), Settings (branding, local admin)
- [ ] T080 [US3] Add inline editing in masjid detail page: update masjid name, location, contact details, branding settings, local admin assignment with save button
- [ ] T081 [US3] Implement content management tab in masjid detail page: list all TV displays and display_content, create/update/delete content with real-time preview
- [ ] T082 [US3] Create users list page in `apps/hub/src/pages/admin/users/index.tsx` with DataGrid showing: user name, email, role, associated masjid, registration date, actions
- [ ] T083 [US3] Add role filter in users list: dropdown for public, masjid-admin, local-admin, super-admin with search by email/name
- [ ] T084 [US3] Implement user detail page in `apps/hub/src/pages/admin/users/[id].tsx` with edit form: change role, assign/unassign masjid, reset password, deactivate account
- [ ] T085 [US3] Create billing dashboard in `apps/hub/src/pages/admin/billing/index.tsx` with payment transactions table: masjid name, tier, amount, ToyyibPay refno, payment date, status, split billing status
- [ ] T086 [US3] Add billing filters: tier dropdown, status dropdown (pending, success, failed), date range picker, search by ToyyibPay refno or masjid name
- [ ] T087 [US3] Implement payment detail modal showing full payment transaction: ToyyibPay billcode and refno, payment method, amount breakdown, split billing details (local_admin_share RM150, platform_share, transfer_status), retry attempts
- [ ] T088 [US3] Create subscription management modal in `apps/hub/src/pages/admin/masjids/[id].tsx` for manual overrides: change tier dropdown, extend grace period date picker, trigger soft-lock button, unlock button, cancel subscription with reason field
- [ ] T089 [US3] Implement audit trail logging in `packages/subscription-management/src/services/AuditService.ts` recording all super admin actions: timestamp, admin user ID, action type, entity affected, before/after values
- [ ] T090 [US3] Add audit log viewer in `apps/hub/src/pages/admin/audit-log.tsx` with filters: admin user, action type, entity type, date range with export to CSV button
- [ ] T091 [US3] Add tier indicator badges in masjid list and detail pages: color-coded badges for Rakyat (green), Pro (blue), Premium (gold) with subscription status icon (active/grace/soft-locked)
- [ ] T092 [US3] Implement grace period countdown display in admin dashboard: list masjids in grace period with days remaining, urgent badge for <3 days, bulk action to send reminder emails
- [ ] T093 [US3] Add soft-locked accounts view in `apps/hub/src/pages/admin/soft-locked.tsx` with list of soft-locked masjids, soft-lock date, reason, reactivation link

#### Security & Access Control

- [ ] T094 [US3] Add super admin role check in `packages/auth/src/middleware/requireSuperAdmin.ts` using is_super_admin() function from database, redirect to 403 if unauthorized
- [ ] T095 [US3] Apply super admin middleware to all admin routes in `apps/hub/src/pages/admin/**`

#### Testing & Documentation

- [ ] T096 [US3] Add i18n keys for admin dashboard in `apps/hub/src/i18n/`: page titles, metric labels, table headers, action buttons, modal content (BM/EN)
- [ ] T097 [US3] Performance optimization: paginate masjids list (50 per page), lazy load payment history (100 transactions), implement virtual scrolling for large datasets
- [ ] T098 [US3] Create documentation in `docs/SUPER-ADMIN-GUIDE.md` explaining admin dashboard features, manual override procedures, audit trail usage, billing management

**Checkpoint**: User Story 3 complete - super admin has full system access and management capabilities

---

## Phase 6: Tier-Specific Features Implementation (Priority: P2)

**Goal**: Implement tier-gated features (custom branding, smart scheduling, data export, private database, WhatsApp support, Local Admin service)

**Independent Test**: Each tier feature can be independently activated/deactivated based on subscription tier with proper access control checks

### Rakyat Tier Features

- [ ] T098a [Test] [US2] Write failing tests for BrandingOverlay component in `packages/ui-components/tests/BrandingOverlay.test.tsx` testing conditional rendering based on tier, SVG overlay positioning, removal on upgrade
- [ ] T099 [P] [US2] Implement "Powered by e-Masjid" branding overlay in `packages/ui-components/src/BrandingOverlay.tsx` as SVG watermark rendered on TV display
- [ ] T100 [P] [US2] Add branding enforcement in TV display render logic in `apps/tv-display/src/pages/[displayId].tsx`: show overlay if masjid tier is Rakyat
- [ ] T101 [P] [US2] Disable custom branding UI in `apps/hub/src/pages/settings/branding.tsx` for Rakyat tier with upgrade prompt to Pro

### Pro Tier Features

- [ ] T101a [Test] [US2] Write failing tests for TierService.checkFeatureAccess in `packages/tier-management/tests/TierService.test.ts` testing all tier/feature combinations, soft-lock restrictions, upgrade prompts
- [ ] T102 [P] [US2] Implement TierService.checkFeatureAccess in `packages/tier-management/src/services/TierService.ts` validating feature access based on current tier
- [ ] T103 [P] [US2] Create custom branding settings page in `apps/hub/src/pages/settings/branding.tsx` with logo upload (PNG/JPG, max 2MB), primary color picker, secondary color picker
- [ ] T104 [P] [US2] Implement branding settings persistence: upload logo to Supabase Storage in `packages/supabase-client/src/storage.ts` with image validation (PNG/JPG, max 2MB), save branding_settings JSONB (logo URL, primary color, secondary color) to masjids table in `packages/supabase-client/src/masjids.ts`
- [ ] T105 [P] [US2] ~~Save branding settings to masjids.branding_settings~~ Consolidated into T104 branding persistence implementation
- [ ] T106 [P] [US2] Remove "Powered by e-Masjid" overlay when custom branding is applied in TV display render logic
- [ ] T107 [P] [US2] Apply custom branding (logo, colors) to TV display in `apps/tv-display/src/pages/[displayId].tsx` using branding_settings from database
- [ ] T107a [Test] [US2] Write failing tests for SchedulingService in `packages/subscription-management/tests/SchedulingService.test.ts` testing schedule rule creation, recurrence patterns, activation/deactivation logic, timezone handling
- [ ] T108 [P] [US2] Implement smart scheduling service in `packages/subscription-management/src/services/SchedulingService.ts` with createScheduleRule, getActiveSchedules, activateScheduledContent, deactivateScheduledContent methods
- [ ] T109 [P] [US2] Create schedule rules UI in `apps/hub/src/pages/content/schedule.tsx` with form: rule name, trigger conditions (time, day of week, date range), content association, recurrence pattern (daily, weekly, custom)
- [ ] T110 [P] [US2] Implement recurrence pattern parser in `packages/subscription-management/src/utils/recurrenceParser.ts` supporting daily, weekly, monthly, custom cron-like patterns
- [ ] T111 [P] [US2] Create Supabase Edge Function `supabase/functions/activate-schedules/index.ts` with cron trigger (every 15 minutes per FR-064) checking schedule_rules and activating/deactivating content
- [ ] T112 [P] [US2] Implement data export service in `packages/subscription-management/src/services/ExportService.ts` with exportToPDF (using jsPDF library) and exportToExcel (using xlsx library) methods: generate report with display activity data (display name, content shown, timestamp, duration formatted for audit), upload to Supabase Storage, return download URL with 1-hour expiry, deliver within 30 seconds per FR-023
- [ ] T113 [P] [US2] Create data export UI in `apps/hub/src/pages/reports/export.tsx` with date range picker, display selection, format dropdown (PDF/Excel), generate button
- [ ] T114 [P] [US2] ~~Generate PDF report using jsPDF~~ Consolidated into T112 ExportService implementation
- [ ] T115 [P] [US2] ~~Generate Excel report using xlsx~~ Consolidated into T112 ExportService implementation
- [ ] T116 [P] [US2] ~~Deliver export files within 30 seconds~~ Consolidated into T112 ExportService implementation

### Premium Tier Features

- [ ] T117 [P] [US2] Document manual Supabase project provisioning workflow in `packages/subscription-management/docs/premium-provisioning.md`: super admin creates project via Supabase dashboard, configures auth, migrates schema, records URL in masjids.db_instance_url (FR-030 - manual provisioning within 1 hour)
- [ ] T117a [P] [US2] Implement Premium provisioning verification workflow in `apps/hub/src/pages/admin/premium/provision-complete.tsx`: super admin marks provisioning complete, system validates db_instance_url connectivity, sends notification to Premium masjid using T062 NotificationService ('Your private database is ready'), updates masjid provisioning status, logs completion time to verify 1-hour SLA per FR-030
- [ ] T118 [P] [US2] ~~Create Premium tier activation notification~~ Use T062 NotificationService.sendPremiumActivation method with "Local Admin will contact you within 24 hours" message (add method to T062)
- [ ] T119 [P] [US2] Add private database badge in `apps/hub/src/pages/settings/database.tsx` showing "Private Database" status and isolation indicator
- [ ] T120 [P] [US2] Implement WhatsApp support integration in `packages/subscription-management/src/services/WhatsAppService.ts` with sendMessage and acknowledgment within 15 minutes
- [ ] T121 [P] [US2] Create WhatsApp support widget in `apps/hub/src/components/WhatsAppSupport.tsx` floating button with business hours indicator (9 AM - 6 PM MYT)
- [ ] T122 [P] [US2] Implement Local Admin assignment workflow in `packages/subscription-management/src/services/LocalAdminService.ts` with checkAvailability, assignToMasjid, updateCapacity methods
- [ ] T123 [P] [US2] ~~Send email introduction with Local Admin details~~ Use T062 NotificationService.sendLocalAdminIntro method with name, WhatsApp number, email (add method to T062)
- [ ] T124 [P] [US2] Create Local Admin dashboard in `apps/hub/src/pages/local-admin/index.tsx` with assigned masjids list, pending content requests, earnings summary
- [ ] T125 [P] [US2] Implement content request workflow in Local Admin dashboard: masjid submits request → Local Admin receives notification → Local Admin uploads content → masjid approves
- [ ] T126 [P] [US2] Add Local Admin earnings viewer in `apps/hub/src/pages/local-admin/earnings.tsx` showing payment history: date, masjid name, RM150 split payment, transfer status, current month total

### Split Billing Implementation

- [ ] T126a [Test] [US2] Write failing tests for split billing in `packages/subscription-management/tests/PaymentService.test.ts` testing RM150 allocation, remainder calculation, retry logic with exponential backoff (1h, 6h, 17h), failure notifications
- [ ] T127 [P] [US2] Implement PaymentService.processSplitBilling in `packages/subscription-management/src/services/PaymentService.ts` with asynchronous split trigger initiated immediately after webhook success per FR-020: queue RM150 transfer to Local Admin (non-blocking), remainder to platform, webhook returns 200 within <5s, actual transfer processing happens asynchronously
- [ ] T128 [P] [US2] Record split billing details in payment_transactions.split_billing_details JSONB column with transfer_status, transferred_at, retry_attempts
- [ ] T129 [P] [US2] Implement retry mechanism for failed split billing transfers in `packages/subscription-management/src/services/PaymentService.ts`: exponential backoff with 3 retry attempts (1 hour, 6 hours, 17 hours) using queue system or setTimeout, storing retry_count and next_retry_at in payment_transactions.split_billing_details per FR-020b
- [ ] T130 [P] [US2] ~~Send super admin notification if all split billing retries fail~~ Use T062 NotificationService.sendSplitBillingFailure method with transaction details
- [ ] T131 [P] [US2] Update Local Admin earnings_summary JSONB in local_admins table after successful split payment transfer
- [ ] T132 [P] [US2] Create split billing status viewer for super admin in `apps/hub/src/pages/admin/billing/split-billing.tsx` with list of failed transfers and manual retry button

---

## Phase 7: Grace Period & Soft-Lock Implementation (Priority: P2)

**Goal**: Implement 14-day grace period workflow after payment failure, email notifications, persistent banner countdown, and soft-lock trigger at expiry

**Independent Test**: Payment failure automatically triggers grace period, notifications sent on Day 1 and Day 13, countdown banner displays, soft-lock activates on Day 15 with feature restrictions and data preservation

### Grace Period Implementation

- [ ] T132a [Test] [US2] Write failing tests for grace period workflow in `packages/subscription-management/tests/SubscriptionService.test.ts` testing 14-day calculation, countdown timer logic, Day 13 reminder trigger, cancellation on payment success
- [ ] T133 [P] [US2] Implement SubscriptionService.triggerGracePeriod in `packages/subscription-management/src/services/SubscriptionService.ts` setting grace_period_start (NOW() in UTC) and grace_period_end (NOW() + INTERVAL '14 days' in UTC, expires at 23:59:59 MYT on Day 14), updating status to 'grace-period'
- [ ] T134 [P] [US2] ~~Send immediate email notification on grace period start~~ Use T062 NotificationService.sendGracePeriodStart method with retry link, expiry date, support contact
- [ ] T135 [P] [US2] Create grace period banner component in `packages/ui-components/src/GracePeriodBanner.tsx` with countdown timer (days remaining), retry payment button, urgent styling (<3 days)
- [ ] T136 [P] [US2] Integrate grace period banner in hub app layout in `apps/hub/src/components/Layout.tsx` showing banner at top of all pages when subscription status is 'grace-period'
- [ ] T137 [P] [US2] Implement countdown timer logic in `packages/subscription-management/src/hooks/useGracePeriodCountdown.ts` calculating days remaining from grace_period_end
- [ ] T138 [P] [US2] ~~Send Day 13 urgent reminder email~~ Use T062 NotificationService.sendGracePeriodReminder method with subject "URGENT: Grace period expires tomorrow" and retry link
- [ ] T139 [P] [US2] Create Supabase Edge Function `supabase/functions/grace-period-reminders/index.ts` running cron job (every 15 minutes per FR-064) to send Day 13 reminders
- [ ] T140 [P] [US2] Implement payment retry flow in `apps/hub/src/pages/billing/retry-payment.tsx` with subscription_id parameter, regenerate ToyyibPay bill, redirect to payment URL
- [ ] T141 [P] [US2] Handle successful payment during grace period in `packages/subscription-management/src/services/SubscriptionService.ts`: cancel grace period immediately (clear grace_period_start and grace_period_end), update subscription status to 'active', recalculate next_billing_date from current date + billing cycle interval (30 days for monthly), use T062 NotificationService.sendPaymentSuccess

### Soft-Lock Implementation

- [ ] T141a [Test] [US2] Write failing tests for soft-lock in `packages/subscription-management/tests/SubscriptionService.test.ts` testing feature restrictions (branding, scheduling, exports), data preservation, Premium data retention on private database, reactivation logic
- [ ] T142 [P] [US2] Implement SubscriptionService.triggerSoftLock in `packages/subscription-management/src/services/SubscriptionService.ts` setting soft_locked_at (now), soft_lock_reason ("Grace period expired"), updating status to 'soft-locked'
- [ ] T143 [P] [US2] Create Supabase Edge Function `supabase/functions/trigger-soft-lock/index.ts` running cron job (every 15 minutes per FR-064) checking for expired grace periods (grace_period_end < now) and triggering soft-lock
- [ ] T144 [P] [US2] Implement soft-lock feature restrictions in TierService.checkFeatureAccess: disable custom_branding, smart_scheduling, data_export, whatsapp_support, local_admin_service
- [ ] T145 [P] [US2] Re-enable "Powered by e-Masjid" branding overlay for soft-locked Pro/Premium tiers in TV display render logic
- [ ] T146 [P] [US2] Stop smart scheduling for soft-locked tiers: deactivate all active schedule_rules in `packages/subscription-management/src/services/SchedulingService.ts`
- [ ] T147 [P] [US2] Disable data export for soft-locked tiers: show upgrade prompt in export UI
- [ ] T148 [P] [US2] Preserve all user data during soft-lock: display_content, tv_displays, branding_settings remain in database (read-only access)
- [ ] T148a [P] [US2] Implement soft-lock read-only enforcement: update RLS policies in `supabase/migrations/` to allow SELECT only for soft-locked masjids (status='soft-locked'), add service-level validation in TierService.checkFeatureAccess blocking INSERT/UPDATE/DELETE operations, allow viewing historical display_content and tv_displays but prevent modifications
- [ ] T149 [P] [US2] For Premium soft-lock: keep data on dedicated Supabase project indefinitely (no migration back to shared database per FR-054a), downgrade WhatsApp support to email-only, notify Local Admin of suspension
- [ ] T150 [P] [US2] ~~Send soft-lock notification email~~ Use T062 NotificationService.sendSoftLockNotification method explaining disabled features, data preservation, reactivation instructions (sent to masjid admin and Local Admin if Premium tier)
- [ ] T151 [P] [US2] Create soft-lock banner component in `packages/ui-components/src/SoftLockBanner.tsx` with "Account suspended" message, reactivate button, feature restrictions list
- [ ] T152 [P] [US2] Integrate soft-lock banner in hub app layout showing banner when subscription status is 'soft-locked'
- [ ] T153 [P] [US2] Implement SubscriptionService.reactivateSubscription in `packages/subscription-management/src/services/SubscriptionService.ts` for successful payment during soft-lock: remove soft_locked_at, update status to 'active', reactivate tier features
- [ ] T154 [P] [US2] Handle feature reactivation within 5 minutes after reactivation payment webhook received per FR-036: automatically triggered by T059 webhook handler upon successful payment, re-apply custom branding, reactivate schedule rules, restore full feature access using T064 TierService logic, log reactivation timestamp for 5-minute SLA monitoring

---

## Phase 8: Polish & Cross-Cutting Concerns (Priority: P3)

**Purpose**: Documentation, performance optimization, security hardening, and validation

- [ ] T155 [P] Create feature documentation in `docs/TIER-MANAGEMENT.md` explaining feature matrix, access control rules, tier comparison for each tier
- [ ] T156 [P] Create billing documentation in `docs/SUBSCRIPTION-BILLING.md` explaining ToyyibPay integration, webhook handling, split billing logic, grace period workflow, soft-lock behavior
- [ ] T157 [P] Create Local Admin guide in `docs/LOCAL-ADMIN-GUIDE.md` explaining role responsibilities, earnings breakdown, content request workflow, masjid capacity limits
- [ ] T158 [P] Update main README.md with links to new feature documentation
- [ ] T159 [P] Add environment variable documentation in `deployment/ENVIRONMENT-VARIABLES.md` for ToyyibPay credentials: TOYYIBPAY_SECRET_KEY, TOYYIBPAY_CATEGORY_CODE, TOYYIBPAY_SANDBOX_MODE
- [ ] T160 [P] Create deployment checklist in `deployment/checklists/007-multi-tenant-saas.md` with migration verification, seed data validation, ToyyibPay sandbox testing steps
- [ ] T161 [P] Performance optimization: implement Redis caching for tier features lookup in `packages/tier-management/src/services/TierService.ts` with 1-hour TTL
- [ ] T162 [P] Performance optimization: add database indexes for subscription queries in migration file (already in T010-T014)
- [ ] T163 [P] Security audit: validate ToyyibPay webhook signature (if available in API docs) in webhook endpoint
- [ ] T164 [P] Security audit: implement rate limiting for payment webhook endpoint to prevent abuse (max 10 requests/minute per IP)
- [ ] T165 [P] Security audit: sanitize user input in registration forms to prevent XSS attacks
- [ ] T166 [P] Accessibility audit: ensure WCAG 2.1 AA compliance for tier comparison table, registration forms, admin dashboard using axe-core
- [ ] T167 [P] Run quickstart.md validation: verify all setup steps work for new developers following guide
- [ ] T168 [P] Update `.github/agents/copilot-instructions.md` with multi-tenant SaaS feature context (already done in planning phase)
- [ ] T168a [Test] [P] Write failing E2E test for complete user journey in `tests/e2e/user-journey.spec.ts` testing landing page → registration → tier selection → dashboard access using Playwright with mobile viewport tests (375x667 iPhone SE, 390x844 iPhone 12) to verify FR-011 mobile responsiveness
- [ ] T168b [Test] [P] Write Playwright E2E tests for multi-tenant isolation in `tests/e2e/multi-tenant-isolation.spec.ts`: verify Masjid A admin cannot query Masjid B's display_content, tv_displays, or subscriptions per FR-002, verify super admin can access all masjids' data, test RLS policy enforcement across all tenant-specific tables
- [ ] T169 [P] Create E2E test for Rakyat registration flow in `tests/e2e/rakyat-registration.spec.ts` using Playwright
- [ ] T170 [P] Create E2E test for Pro payment flow in `tests/e2e/pro-payment-flow.spec.ts` simulating ToyyibPay payment success
- [ ] T171 [P] Create E2E test for grace period workflow in `tests/e2e/grace-period-flow.spec.ts` simulating payment failure, countdown, soft-lock trigger
- [ ] T172 [P] Create E2E test for super admin access in `tests/e2e/super-admin-access.spec.ts` verifying unrestricted access to all masjids and data
- [ ] T173 [P] Create integration test for split billing in `packages/subscription-management/tests/integration/split-billing.test.ts` mocking ToyyibPay API responses
- [ ] T174 [P] Create unit test for tier feature validation in `packages/tier-management/tests/TierService.test.ts` with all tier combinations
- [ ] T175 Run full test suite: `pnpm test` for unit tests, `pnpm test:e2e` for Playwright E2E tests, verify all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion, integrates with US1 landing page registration CTA
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion, uses subscription/payment data from US2
- **Tier Features (Phase 6)**: Depends on Foundational phase completion, extends US2 features
- **Grace Period & Soft-Lock (Phase 7)**: Depends on Foundational phase completion and US2 payment integration
- **Polish (Phase 8)**: Depends on US1, US2, US3 completion

### User Story Dependencies

- **User Story 1 (US1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (US2)**: Can start after Foundational (Phase 2) - Integrates with US1 landing page CTAs but independently testable
- **User Story 3 (US3)**: Can start after Foundational (Phase 2) - Views data from US2 subscriptions/payments but independently testable

### Within Each User Story

- **US1**: TierService → UI components → landing page integration → i18n → performance
- **US2**: SubscriptionService & PaymentService → hooks → registration UI → tier selection → payment integration → webhook → feature activation → documentation
- **US3**: Admin services → hooks → admin dashboard → masjids list → users list → billing dashboard → audit log → documentation

### Parallel Opportunities

**Setup Phase (Phase 1)**: T003, T004, T005, T006 can run in parallel (different packages)

**Foundational Phase (Phase 2)**:

- Migrations T010-T014 must run sequentially (dependencies)
- TypeScript types T022-T026 can run in parallel (different packages)
- Supabase client methods T027-T030 can run in parallel (different packages)
- Seed data T017-T021 can run in parallel with types and client methods

**User Stories** (After Foundational):

- US1 (Phase 3), US2 (Phase 4), US3 (Phase 5) can start in parallel IF team has capacity
- Within US1: T031-T034 can run in parallel (TierService + hook + component)
- Within US2: T046-T049 can run in parallel (services + hooks before UI)
- Within US3: T070-T074 can run in parallel (services + hooks before UI)

**Tier Features (Phase 6)**:

- Rakyat features T099-T101 can run in parallel
- Pro features T102-T116 can run partially in parallel (service first, then UI)
- Premium features T117-T126 can run partially in parallel
- Split billing T127-T132 can run in parallel (independent of other features)

**Grace Period & Soft-Lock (Phase 7)**: T133-T141 (grace period) and T142-T154 (soft-lock) can run in parallel

**Polish (Phase 8)**: T155-T175 all marked [P] can run in parallel

---

## Implementation Strategy

### MVP Scope (Week 1-2)

- **Phase 1**: Setup (T001-T009)
- **Phase 2**: Foundational (T010-T030)
- **Phase 3**: User Story 1 complete (T031-T045)
- **Phase 4**: User Story 2 Rakyat registration only (T046-T051, T052-T054, T065-T069)

### Iteration 2 (Week 3)

- **Phase 4**: User Story 2 Pro/Premium payment integration (T055-T064, T069)
- **Phase 6**: Rakyat tier features (T099-T101)
- **Phase 6**: Pro tier custom branding (T102-T107)

### Iteration 3 (Week 4)

- **Phase 5**: User Story 3 super admin (T070-T098)
- **Phase 6**: Pro tier scheduling and export (T108-T116)

### Iteration 4 (Week 5+)

- **Phase 6**: Premium tier features (T117-T126) and split billing (T127-T132)
- **Phase 7**: Grace period and soft-lock (T133-T154)
- **Phase 8**: Polish and testing (T155-T175)

---

## Task Summary

- **Total Tasks**: 175
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 21 tasks (BLOCKING)
- **User Story 1 (Public Discovery)**: 15 tasks
- **User Story 2 (Registration)**: 24 tasks
- **User Story 3 (Super Admin)**: 29 tasks
- **Tier Features**: 34 tasks
- **Grace Period & Soft-Lock**: 22 tasks
- **Polish & Testing**: 21 tasks

**Parallel Opportunities**: ~60 tasks marked [P] can run concurrently with proper team coordination

**Independent Test Criteria**:

- **US1**: Visitor can navigate landing page, view tiers, access public displays without login
- **US2**: User completes registration and payment in <10 min, lands on dashboard
- **US3**: Super admin has unrestricted access to all masjids, users, billing data

**Estimated Timeline**: 3-4 weeks for MVP (US1 + US2 Rakyat), 5-6 weeks for full implementation including Premium features and grace period workflows
