# Implementation Tasks: TV Landing Page with Tiered Package Marketing

**Feature**: `007-tv-landing-tiers`  
**Branch**: `007-tv-landing-tiers`  
**Created**: 2026-07-16  
**Spec**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)  
**Data Model**: [data-model.md](data-model.md)  
**Contracts**: [contracts/](contracts/)

---

## Overview

This document contains all actionable implementation tasks for the TV landing page feature, organized by user story and dependency. Each task is independently testable and includes clear file paths for implementation.

**Total Tasks**: 45 (organized across 6 phases)  
**Test Tasks**: Included where critical (E2E, contract tests)  
**MVP Scope**: Phase 1 (Database) + Phase 2 (Packages) + Phase 3 (US1) = Free tier discovery + zone selection

---

## Phase 0: Setup & Infrastructure

### Setup Tasks (No dependencies)

- [ ] T001 Initialize feature branch and verify Turborepo build order in `/Users/rohaizan/Codes/ai-gen/e-masjid.my`
  - [ ] Verify `pnpm run build:clean` resolves dependency order (shared-types → supabase-client → ui-components → tv-display)
  - [ ] Check all workspace packages listed in pnpm-workspace.yaml

- [ ] T002 Create documentation file `docs/TV-LANDING-PAGE-TIERS.md` covering setup, zone management, tier upgrade flow, and FAQ maintenance

- [ ] T003 [P] Create i18n locale directories for tiers and FAQs in `apps/tv-display/src/i18n/locales/`
  - [ ] Create `ms/` and `en/` subdirectories for Bahasa Malaysia and English translations

---

## Phase 1: Database Setup & Seed Data

### Database Migration Tasks (Blocking prerequisite for all user stories)

- [ ] T004 Create Supabase migration file `supabase/migrations/0XX_auto_populate_jakim_zones.sql`
  - [ ] Define `jakim_zones` table with columns: zone_code (PK), zone_name, state, region, masjid_count, is_active, created_at, updated_at
  - [ ] Define `masjids` table with columns: id (UUID PK), name, zone_code (FK), tier, display_id (UUID unique), prayer_times_source, is_auto_populated, owner_id, status, created_at, updated_at
  - [ ] Insert all 18 Malaysia JAKIM zones (16 Peninsular + 2 East Malaysia) into jakim_zones table
  - [ ] Insert 1-3 representative mosques per zone into masjids table (50-100 total entries)
  - [ ] Reference hub app JAKIM zone codes for consistency (e.g., "johor", "selangor", "kedah")

- [ ] T005 [P] Add RLS policies to `supabase/migrations/0XX_auto_populate_jakim_zones.sql`
  - [ ] Policy: Allow anonymous SELECT on masjids WHERE tier='asas' (free tier discovery)
  - [ ] Policy: Allow authenticated users with owner_id UPDATE/DELETE on their own masjid records

- [ ] T006 Create contract test for database seed in `supabase/tests/0XX_auto_populate_jakim_zones.test.sql`
  - [ ] Test: Verify all 18 JAKIM zones exist in jakim_zones table
  - [ ] Test: Verify masjid_count column is accurate for each zone
  - [ ] Test: Verify all auto_populated masjids have tier='asas'
  - [ ] Test: Verify RLS policy allows anonymous read for asas tier

- [ ] T007 Run migration locally and verify seed data integrity with `supabase db push`

---

## Phase 2: Package Development & Types

### Shared Types Package

- [ ] T008 [P] Create `packages/shared-types/src/types/tier.ts` with all tier and zone type definitions
  - [ ] Define `TierId` enum: 'asas' | 'maju' | 'gemilang' | 'istimewa'
  - [ ] Define `TierPackage` interface with id, name_ms, name_en, description_ms, description_en, price_ms, price_en, max_screens, requires_login, customization_type, support_level, features[]
  - [ ] Define `JAKIMZone` interface with zone_code, zone_name_ms, zone_name_en, state_ms, state_en, region, masjid_count, is_active
  - [ ] Define `Masjid` interface with id, name, zone_code, tier, display_id, is_auto_populated, owner_id, status
  - [ ] Define `Display` interface with id, masjid_id, zone_code, tier, prayer_times (JSON), custom_content (JSON), status
  - [ ] Export all types for use by other packages

- [ ] T009 Update `packages/shared-types/package.json` to export tier types and verify build

### Supabase Client Package Extensions

- [ ] T010 [P] Create `packages/supabase-client/src/services/zone-service.ts` implementing IZoneSelectionService
  - [ ] Implement `fetchAllZones()`: Query jakim_zones table, return all zones with region grouping
  - [ ] Implement `fetchZoneByCode(zone_code)`: Query jakim_zones WHERE zone_code, return single zone or null
  - [ ] Implement `fetchMasjidsByZone(zone_code)`: Query masjids WHERE zone_code AND tier='asas', return primary + additional mosques
  - [ ] Implement `searchZones(query, language)`: Filter zones by partial name match (case-insensitive)
  - [ ] Add error handling for ZONE_NOT_FOUND, NO_MOSQUES_IN_ZONE, SERVICE_UNAVAILABLE

- [ ] T011 Create unit tests for zone-service in `packages/supabase-client/src/services/zone-service.test.ts` (TDD: write tests first)
  - [ ] Test: fetchAllZones returns all 18 zones with correct region grouping
  - [ ] Test: fetchZoneByCode('johor') returns correct zone or null if not found
  - [ ] Test: fetchMasjidsByZone('johor') returns mosques with primary_display_id set
  - [ ] Test: searchZones('joh', 'ms') returns Johor zone
  - [ ] Test: Error handling for missing zones

- [ ] T012 [P] Create `packages/supabase-client/src/services/tier-service.ts` implementing ITierPackageService
  - [ ] Implement `fetchAllTiers()`: Return static tier data for all 4 tiers (Asas, Maju, Gemilang, Istimewa)
  - [ ] Implement `fetchTierById(tierId)`: Return single tier or null
  - [ ] Implement `fetchTiersForLanding()`: Return tiers sorted by display_order with featured flag
  - [ ] Load tier data from constants or i18n JSON (define source strategy)
  - [ ] Add error handling for TIER_NOT_FOUND, SERVICE_UNAVAILABLE

- [ ] T013 Create unit tests for tier-service in `packages/supabase-client/src/services/tier-service.test.ts` (TDD)
  - [ ] Test: fetchAllTiers returns array of 4 tiers
  - [ ] Test: fetchTierById('asas') returns Asas tier with correct price and features
  - [ ] Test: fetchTiersForLanding returns tiers in correct display order
  - [ ] Test: Error handling for missing tiers

- [ ] T014 Update `packages/supabase-client/package.json` to include zone-service and tier-service exports

---

## Phase 3: User Story 1 - Mosque Manager Discovers Free Tier (P1)

### Hero Section Component

- [ ] T015 [US1] Create `apps/tv-display/src/app/landing/HeroSection.tsx` with Marketing UI
  - [ ] Render hero image (lazy-loaded, webp format) with headline "Sahaja TV Masjid Percuma"
  - [ ] Render subheadline "Paparkan waktu solat JAKIM di TV anda dalam 2 minit"
  - [ ] Render "Mulai Percuma" (Start Free) primary CTA button (Material-UI Button, primary color)
  - [ ] Support bilingual content (pass language prop for ms/en)
  - [ ] Ensure responsive layout (hero image full-width on mobile, 50% desktop)

- [ ] T016 [P] [US1] Create i18n JSON files for hero section in `apps/tv-display/src/i18n/locales/`
  - [ ] Create `ms/hero.json` with Bahasa Malaysia hero text and CTA
  - [ ] Create `en/hero.json` with English hero text and CTA
  - [ ] Include translations: headline, subheadline, cta_text, hero_image_url

### Tier Section Component

- [ ] T017 [P] [US1] Create `apps/tv-display/src/app/landing/TierSection.tsx` with 4 Tier Cards
  - [ ] Use Material-UI Grid (xs=1 col, sm=2 cols, md=4 cols, lg=4 cols) for responsive layout
  - [ ] For each tier (Asas, Maju, Gemilang, Istimewa):
    - [ ] Render Material-UI Card component with CardContent
    - [ ] Display tier name (name_ms or name_en based on language)
    - [ ] Display pricing (e.g., "Percuma", "RM ~75")
    - [ ] Display marketing description (description_ms or description_en)
    - [ ] Render features list as Material-UI List with ListItem + checkmark icons
    - [ ] Render CTA button (text, color, onClick handler)
  - [ ] Highlight Asas and Gemilang as featured (badge or border styling)
  - [ ] Support bilingual content (pass language prop)

- [ ] T018 [P] [US1] Create i18n JSON files for tiers in `apps/tv-display/src/i18n/locales/`
  - [ ] Create `ms/tiers.json` with all 4 tiers in Bahasa Malaysia
  - [ ] Create `en/tiers.json` with all 4 tiers in English
  - [ ] Include: id, name, description, price, max_screens label, cta_text, features[] labels, display_order

- [ ] T019 [P] [US1] Create component test for TierSection in `apps/tv-display/src/app/landing/TierSection.test.tsx` (React Testing Library)
  - [ ] Test: All 4 tier cards render correctly
  - [ ] Test: Asas tier card is featured (has badge/styling)
  - [ ] Test: CTA buttons have correct text and onClick handlers
  - [ ] Test: Features list displays correctly for each tier
  - [ ] Test: Responsive grid changes column count based on breakpoint

### Landing Page Integration

- [ ] T020 [P] [US1] Update `apps/tv-display/src/app/page.tsx` to render landing page sections
  - [ ] Import HeroSection, TierSection components
  - [ ] Render sections in order: HeroSection → TierSection
  - [ ] Pass language prop based on user preference (from i18n context)
  - [ ] Add SEO meta tags (title, description, og:image)
  - [ ] Verify landing page load time <2s using Lighthouse target

- [ ] T021 [P] [US1] Create E2E test for free tier discovery in `apps/tv-display/tests/landing-page.spec.ts` (Playwright)
  - [ ] Test: Landing page loads in <2s (Core Web Vitals)
  - [ ] Test: Hero section displays with headline and "Mulai Percuma" CTA
  - [ ] Test: All 4 tier cards render with correct names and prices
  - [ ] Test: Asas tier is highlighted as featured
  - [ ] Test: "Mulai Percuma" button is visible and clickable
  - [ ] Test: Language toggle switches tier text between Bahasa Malaysia and English

---

## Phase 4: User Story 2 - Mosque Admin Compares Tier Features (P1)

### Tier Comparison Logic

- [ ] T022 [US2] Create comparison data structure in `apps/tv-display/src/lib/tier-comparison.ts`
  - [ ] Define `TierComparisonKey[]` with comparison dimensions (max_screens, requires_login, customization_type, support_level)
  - [ ] Create `compareTiers()` function that returns matrix of feature differences
  - [ ] Map each tier's attributes to comparison grid

- [ ] T023 [P] [US2] Create optional comparison table component `apps/tv-display/src/app/landing/TierComparisonTable.tsx` (if needed)
  - [ ] Use Material-UI Table component
  - [ ] Rows: comparison dimensions (Max Screens, Login Required, Customization, Support Level)
  - [ ] Columns: 4 tiers
  - [ ] Cell content: tier values with visual indicators (✓/✗, number, text)
  - [ ] Make table scrollable on mobile (<900px)
  - [ ] Support bilingual labels (ms/en)

- [ ] T024 [P] [US2] Add comparison toggle to TierSection in `apps/tv-display/src/app/landing/TierSection.tsx`
  - [ ] Add "Bandingkan Pelan" (Compare Plans) button/toggle
  - [ ] Show/hide comparison table on toggle
  - [ ] Ensure button is accessible (keyboard + screen reader)

- [ ] T025 [US2] Create component test for tier comparison in `apps/tv-display/src/app/landing/__tests__/TierComparison.test.tsx`
  - [ ] Test: compareTiers() returns correct matrix
  - [ ] Test: Comparison table renders with all 4 tiers as columns
  - [ ] Test: All comparison dimensions display correctly
  - [ ] Test: Responsive: table scrolls horizontally on mobile

- [ ] T026 [P] [US2] Create E2E test for tier comparison in `apps/tv-display/tests/landing-page.spec.ts`
  - [ ] Test: User can click "Bandingkan Pelan" to toggle comparison
  - [ ] Test: Comparison table shows all tiers and dimensions
  - [ ] Test: User can identify key differences (Asas = no login, Gemilang = unlimited screens)
  - [ ] Test: Table scrolls on mobile without cutting off content

---

## Phase 5: User Story 3 - User Finds Their Mosque by JAKIM Zone (P1)

### Zone Selection Modal Component

- [ ] T027 [P] [US3] Create `apps/tv-display/src/app/landing/ZoneModal.tsx` with Material-UI Modal + Autocomplete
  - [ ] Render Material-UI Modal with max-width=400px, centered
  - [ ] Header: "Cari kawasan anda" (Find Your Zone) + close button
  - [ ] Input: Material-UI Autocomplete component for zone selection
    - [ ] Options: All 18 zones from fetchAllZones()
    - [ ] Display: zone_name_ms (or zone_name_en based on language)
    - [ ] Secondary text: state_ms (or state_en)
    - [ ] Support search/filtering by partial name
  - [ ] CTA: "Pilih" (Select) button, disabled until zone selected
  - [ ] Loading state: Skeleton loader while zones fetch from API
  - [ ] Error state: "Kawasan tidak tersedia" message + contact support link
  - [ ] Keyboard navigation: Tab through zones, Enter to select

- [ ] T028 [P] [US3] Create zone client logic in `apps/tv-display/src/lib/zone-client.ts`
  - [ ] Implement `selectZone(zone_code)`: Fetch first masjid in zone, return display_id
  - [ ] Implement `routeToDisplay(display_id)`: Navigate to `/display/[display_id]`
  - [ ] Add error handling for zones with no mosques (show "Kawasan ini belum ada data")
  - [ ] Implement caching: Cache zone list (ttl=1h) to reduce API calls

- [ ] T029 [US3] Create component test for ZoneModal in `apps/tv-display/src/app/landing/__tests__/ZoneModal.test.tsx` (React Testing Library)
  - [ ] Test: Modal renders with Autocomplete input
  - [ ] Test: Zones load and display in dropdown
  - [ ] Test: User can type zone name to filter options
  - [ ] Test: "Pilih" button is disabled before selection
  - [ ] Test: After zone selection, "Pilih" button is enabled
  - [ ] Test: Keyboard navigation (Tab, Enter) works correctly
  - [ ] Test: Error handling for zones with no mosques

- [ ] T030 [P] [US3] Create "Cari kawasan anda" CTA in HeroSection and TierSection
  - [ ] Add button to HeroSection: "Cari kawasan anda" (secondary color, large size)
  - [ ] Add button to TierSection: "Cari kawasan anda" CTA per tier card
  - [ ] Both buttons open ZoneModal when clicked
  - [ ] Implement modal state management (Zustand or React Context)

### Zone Discovery API

- [ ] T031 [P] [US3] Create API endpoint `apps/tv-display/src/app/api/zones/route.ts`
  - [ ] GET `/api/zones`: Return all zones from fetchAllZones()
  - [ ] Implement caching (Cache-Control: public, max-age=3600)
  - [ ] Error handling: Return 500 if zone service unavailable

- [ ] T032 [P] [US3] Create API endpoint `apps/tv-display/src/app/api/zones/[zone_code]/route.ts`
  - [ ] GET `/api/zones/[zone_code]`: Return mosques for zone from fetchMasjidsByZone()
  - [ ] Return primary_display_id for zone
  - [ ] Error handling: Return 404 if zone not found, 204 if no mosques

### Display Routing

- [ ] T033 [P] [US3] Update existing `/display/[id]/page.tsx` to support zone routing
  - [ ] Load display via display_id (UUID)
  - [ ] Fetch prayer times from JAKIM API (via prayer-times package)
  - [ ] Render tier-specific UI (Asas = minimal, Gemilang = admin features)
  - [ ] Add "Switch Zone" button/menu for zone switching
  - [ ] Add "Upgrade" button for tier upgrade flow

- [ ] T034 [US3] Create contract test for zone routing in `apps/tv-display/tests/contract/jakim-zone.test.ts`
  - [ ] Test: fetchAllZones() returns 18 zones
  - [ ] Test: fetchMasjidsByZone('johor') returns mosques with primary_display_id
  - [ ] Test: No zones return empty array, not error
  - [ ] Test: Display routing resolves display_id to correct masjid

- [ ] T035 [P] [US3] Create E2E test for zone selection flow in `apps/tv-display/tests/zone-selection.spec.ts` (Playwright)
  - [ ] Test: User clicks "Cari kawasan anda" → ZoneModal opens
  - [ ] Test: Modal displays all 18 zones
  - [ ] Test: User types "joh" → zones filter to "Johor"
  - [ ] Test: User selects "Johor" → routed to `/display/[display_id]`
  - [ ] Test: Display page loads prayer times + default background
  - [ ] Test: No login required (anonymous access)
  - [ ] Test: "Switch Zone" button loads different zone's display

---

## Phase 6: User Story 4 - Mosque Upgrades from Free to Paid Tier (P2)

### Tier Upgrade UI

- [ ] T036 [US4] Add "Tukar Pelan" (Change Plan) button to display page in `apps/tv-display/src/app/display/[id]/page.tsx`
  - [ ] Button visible only for Asas tier users
  - [ ] Button text: "Tukar Pelan" or "Upgrade"
  - [ ] Clicking button opens tier upgrade modal

- [ ] T037 [P] [US4] Create `apps/tv-display/src/app/landing/UpgradeModal.tsx` for tier selection during upgrade
  - [ ] Render tier comparison with feature matrix
  - [ ] Highlight current tier (Asas)
  - [ ] Disable Asas tier option (already current)
  - [ ] CTA buttons per tier:
    - [ ] Maju: "Hubungi Kami" (Contact Us) → route to contact form or WhatsApp
    - [ ] Gemilang: "Daftar Sekarang" (Sign Up Now) → route to admin signup or checkout
    - [ ] Istimewa: "Hubungi Kami" → contact form or sales email

- [ ] T038 [P] [US4] Create upgrade flow logic in `apps/tv-display/src/lib/upgrade-client.ts`
  - [ ] Implement `initiateUpgrade(current_tier, target_tier)`: Validate tier upgrade path
  - [ ] Implement `getUpgradeAction(target_tier)`: Return action type (contact_sales, admin_signup)
  - [ ] Add error handling for invalid tier transitions

- [ ] T039 [US4] Create component test for upgrade flow in `apps/tv-display/src/app/landing/__tests__/UpgradeModal.test.tsx`
  - [ ] Test: UpgradeModal renders all available tiers for upgrade
  - [ ] Test: Asas tier is disabled (already current)
  - [ ] Test: CTA buttons have correct text and onClick handlers
  - [ ] Test: Tier selection correctly identifies action type

---

## Phase 7: User Story 5 - FAQ Answers Common Questions (P2)

### FAQ Section Component

- [ ] T040 [P] [US5] Create `apps/tv-display/src/app/landing/FAQSection.tsx` with Material-UI Accordion
  - [ ] Render Material-UI Accordion with 6+ FAQ items
  - [ ] Each AccordionSummary: FAQ question (question_ms or question_en)
  - [ ] Each AccordionDetails: FAQ answer (answer_ms or answer_en)
  - [ ] Support expandable/collapsible state for each FAQ
  - [ ] Make questions scannable (bold text for key terms)
  - [ ] Support bilingual content (toggle language to show all FAQs in ms/en)

- [ ] T041 [P] [US5] Create i18n JSON files for FAQs in `apps/tv-display/src/i18n/locales/`
  - [ ] Create `ms/faqs.json` with 6+ Bahasa Malaysia FAQs (from spec)
  - [ ] Create `en/faqs.json` with 6+ English FAQs
  - [ ] Include: id, question, answer, category (tiers/pricing/screens/support/trial/payment), display_order
  - [ ] FAQs:
    - [ ] "Apakah perbezaan antara Free/Asas dan Maju?" (tiers)
    - [ ] "Bolehkah saya menambah lebih dari satu skrin paparan?" (screens)
    - [ ] "Adakah harga dikira per skrin?" (pricing)
    - [ ] "Bagaimana cara pembayaran?" (payment)
    - [ ] "Apakah termasuk sokongan?" (support)
    - [ ] "Bolehkah saya mencuba terlebih dahulu?" (trial)

- [ ] T042 [P] [US5] Add optional FAQ search/filter in `apps/tv-display/src/app/landing/FAQSection.tsx`
  - [ ] Add search input above Accordion
  - [ ] Filter FAQs by keyword match (case-insensitive)
  - [ ] Show/hide FAQs dynamically based on search results
  - [ ] Support search in both languages

- [ ] T043 [US5] Create component test for FAQSection in `apps/tv-display/src/app/landing/__tests__/FAQSection.test.tsx`
  - [ ] Test: All 6+ FAQs render in Accordion
  - [ ] Test: User can expand/collapse FAQ items
  - [ ] Test: FAQ content displays correctly in Bahasa Malaysia and English
  - [ ] Test: Search filter works correctly (keyword matching)
  - [ ] Test: Language toggle switches all FAQs to en/ms

- [ ] T044 [P] [US5] Update landing page to include FAQSection in `apps/tv-display/src/app/page.tsx`
  - [ ] Add FAQSection below TierSection
  - [ ] Pass language prop based on user preference
  - [ ] Ensure FAQ section is accessible (ARIA labels, keyboard navigation)

---

## Phase 8: Multilingual Support & Polish

### i18n Integration

- [ ] T045 [P] Integrate i18n into landing page in `apps/tv-display/src/app/page.tsx`
  - [ ] Use i18n context/hook to get current language
  - [ ] Load all locale files (hero.json, tiers.json, faqs.json)
  - [ ] Pass language prop to all components (HeroSection, TierSection, ZoneModal, FAQSection)
  - [ ] Implement language toggle button (top-right corner)
  - [ ] Persist language preference (localStorage)

- [ ] T046 [P] Verify bilingual content renders correctly in `apps/tv-display/tests/landing-page.spec.ts`
  - [ ] Test: Landing page renders in Bahasa Malaysia by default
  - [ ] Test: User can toggle to English via language switcher
  - [ ] Test: All sections (hero, tiers, zones, FAQs) switch language dynamically
  - [ ] Test: Zone names display in selected language (zone_name_ms vs. zone_name_en)

### Performance & Accessibility

- [ ] T047 [P] Optimize landing page performance in `apps/tv-display/src/app/page.tsx`
  - [ ] Implement image lazy-loading (Next.js Image component, priority=false for hero)
  - [ ] Code-split ZoneModal (lazy-load only on CTA click)
  - [ ] Minify i18n JSON files
  - [ ] Enable gzip compression for API responses
  - [ ] Verify Lighthouse FCP <1.5s, LCP <2.5s, CLS <0.1

- [ ] T048 [P] Add accessibility compliance (WCAG 2.1 AA) to landing page
  - [ ] Verify semantic HTML (h1, h2, button, form elements)
  - [ ] Add ARIA labels to interactive components (modal, accordion, autocomplete)
  - [ ] Ensure keyboard navigation works (Tab, Enter, Escape)
  - [ ] Add skip-to-content link for screen readers
  - [ ] Verify color contrast (4.5:1 for text, 3:1 for graphics)
  - [ ] Test with screen reader (NVDA or JAWS)

### Feature Documentation

- [ ] T049 [P] Update `/docs/TV-LANDING-PAGE-TIERS.md` with implementation details
  - [ ] Zone discovery flow diagram
  - [ ] Tier upgrade flow diagram
  - [ ] Database seed migration explanation
  - [ ] i18n maintenance guide (how to add new languages/zones)
  - [ ] Troubleshooting section (common issues + solutions)

---

## Implementation Strategy

### Recommended Execution Order (MVP First)

**MVP Scope** (Phases 0-3 + critical from Phase 4):
1. Phase 0: Setup (T001-T003)
2. Phase 1: Database (T004-T007)
3. Phase 2: Packages (T008-T014)
4. Phase 3: US1 free tier (T015-T021)
5. Phase 4: US2 comparison (T022-T026)
6. Phase 5: US3 zone discovery (T027-T035)

**MVP Output**: Free tier landing page + zone discovery + tier comparison (ready for Asas users)

**Post-MVP** (Phases 4-8):
- Phase 6: US4 tier upgrade flow (T036-T039)
- Phase 7: US5 FAQ section (T040-T044)
- Phase 8: i18n + performance (T045-T049)

### Parallelization Opportunities

**Can execute in parallel** (independent files):
- T003 + T004 + T008 + T010 + T012 + T015 + T017 + T027 (different files, no dependencies)
- T011 + T013 + T019 + T023 + T029 + T039 + T043 (test files, parallel development)
- T009 + T014 + T024 + T032 + T045 (config/setup, no code dependencies)

**Should execute sequentially** (dependencies):
- T004 → T005 → T006 (database migration, policies, tests)
- T008 → T009 (types before exports)
- T010 → T011 (service before tests)
- T015 + T017 → T020 (components before page integration)
- T027 → T028 (component before client logic)
- T030 + T033 (buttons before routing integration)

### Testing Strategy (TDD)

**Tests written FIRST, code follows**:
- T011: zone-service tests → T010 implementation
- T013: tier-service tests → T012 implementation
- T019: TierSection tests → T017 implementation
- T029: ZoneModal tests → T027 implementation
- T043: FAQSection tests → T040 implementation

**E2E tests validate full flows**:
- T021: Free tier discovery (landing → zone → display)
- T026: Tier comparison (landing → compare → understand differences)
- T035: Zone selection (click CTA → modal → zone select → display)

---

## Task Dependencies

```
Phase 0 Setup (T001-T003)
    ↓
Phase 1 Database (T004-T007)
    ↓
Phase 2 Packages (T008-T014)
    ├→ T015-T021 (US1: Free Tier)
    │   ├→ T022-T026 (US2: Comparison)
    │   └→ T027-T035 (US3: Zone Discovery)
    │       ├→ T036-T039 (US4: Upgrade) [P2 priority, after US1-3 complete]
    │       └→ T040-T044 (US5: FAQ) [P2 priority, after US1-3 complete]
    └→ T045-T049 (Multilingual & Polish)
```

---

## Success Criteria Validation

| Success Criterion | Validation Task | Target |
|-------------------|-----------------|--------|
| SC-001: <2s load | T047 (Lighthouse) | FCP <1.5s, LCP <2.5s |
| SC-002: 100% zones | T006 (test) | All 18 zones in DB |
| SC-003: Zones have masjids | T006 (test) | 1-3 per zone (50-100 total) |
| SC-004: 3-click journey | T035 (E2E) | Landing → Zone → Display |
| SC-005: 90% success | T035 (E2E) | No dead ends, error handling |
| SC-006: Anon access | T021, T035 (E2E) | No login required |
| SC-007: 99% prayer times | T035 (E2E) | Verify accuracy vs. JAKIM |
| SC-008: Tier scannable | T026 (E2E) | User identifies differences <30s |
| SC-009: 6+ FAQs | T043 (test) | All 6 FAQs in JSON |
| SC-010: Support reduction | Monitoring post-launch | 50% decrease in support tickets |
| SC-011: 25% CTA CTR | Analytics post-launch | Click-through rate tracking |
| SC-012: Mobile responsive | T047, T048 (tests) | 320px+ devices, 48px+ touch targets |

---

**Total Implementation Tasks**: 49  
**Estimated Duration**: 2-3 weeks (with 2-3 developers, parallel execution)  
**Branch**: `007-tv-landing-tiers`  
**Ready for execution**: ✅ Yes - All prerequisites met
