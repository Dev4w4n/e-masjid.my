# Feature Specification: TV Landing Page with Tiered Package Marketing

**Feature Branch**: `007-tv-landing-tiers`  
**Created**: 2026-07-16  
**Status**: Ready for Implementation  
**Input**: Marketing-driven landing page redesign with tier packages (Asas/Maju/Gemilang/Istimewa) and auto-populated JAKIM zone discovery

**Constitutional Requirements Checklist**:

- [x] Package-first architecture (business logic in `packages/`)
- [x] TDD approach (tests written first)
- [x] Database migrations for auto-populating masjid data with JAKIM zones
- [x] Multilingual support (Bahasa Malaysia/English)
- [x] Documentation plan for `/docs`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Mosque Manager Discovers Free Tier (Priority: P1)

A small mosque manager (limited tech skills, no budget) visits the landing page and immediately understands what the app offers and that they can try it for free without registration.

**Why this priority**: The free tier is the acquisition funnel; if users don't understand they can use it immediately without barriers, we lose them.

**Independent Test**: Landing page displays clearly, Asas tier is prominently featured, and user can click a CTA to access the free app without login/registration.

**Acceptance Scenarios**:

1. **Given** a visitor arrives at `/display` landing page, **When** the page loads, **Then** the Asas (Free) package is visible above the fold with clear "Mulai Percuma" (Start Free) CTA
2. **Given** a visitor reads the Asas description, **When** they understand "tiada pendaftaran, tiada bayaran", **Then** they feel confident trying the free option
3. **Given** a visitor clicks "Mulai Percuma", **When** the zone selection modal opens, **Then** they see all Malaysia JAKIM zones pre-populated and ready to select
4. **Given** a visitor selects their JAKIM zone (e.g., "Selangor FT"), **When** they confirm, **Then** they are routed to the pre-populated display for that zone's first masjid
5. **Given** the free display loads, **When** they see prayer times and default background, **Then** they experience the live feature immediately without signing in

---

### User Story 2 - Mosque Admin Compares Tier Features (Priority: P1)

A mosque admin (AJK treasurer) visits to understand what features fit their mosque's needs (budget, customization, effort). They can compare all 4 tiers side-by-side and understand the trade-offs.

**Why this priority**: Clear feature comparison is essential for conversion from free → paid. If users can't understand the differences, they won't upgrade.

**Independent Test**: All 4 tiers are displayed with key features (customization, screens, login, support, price) clearly differentiated. A user can read each and understand why they would choose one over another.

**Acceptance Scenarios**:

1. **Given** a visitor views the landing page, **When** they scroll down, **Then** all 4 tiers (Asas, Maju, Gemilang, Istimewa) are displayed in a comparison layout
2. **Given** they see Asas vs. Maju, **When** they read the descriptions, **Then** they understand Asas = fixed background, Maju = custom via WhatsApp (managed service)
3. **Given** they see Maju vs. Gemilang, **When** they compare features, **Then** they understand Gemilang = self-service admin dashboard, multiple screens, no login required for staff
4. **Given** they see Gemilang vs. Istimewa, **When** they review the Enterprise option, **Then** they understand Istimewa = custom integration, multi-branch, API support
5. **Given** they want to learn more, **When** they expand a tier's details or FAQ, **Then** they see real-world examples or use cases (e.g., "Gemilang: ideal untuk masjid sederhana hingga besar")

---

### User Story 3 - User Finds Their Mosque by JAKIM Zone (Priority: P1)

A user (mosque staff or visitor) knows their mosque's JAKIM zone but may not know the exact name. They use the "Cari kawasan anda" (Find Your Zone) CTA to navigate to their local display quickly.

**Why this priority**: Discoverability is core; if users can't find their mosque, the app fails. This is the primary conversion path from landing to live display.

**Independent Test**: Zone selection modal populates with all Malaysia JAKIM zones (Peninsular + Sabah/Sarawak). User can select a zone using localized display labels while the system resolves and submits canonical `zone_code`, then see at least one pre-populated masjid for that zone. Selection routes to that masjid's display page.

**Acceptance Scenarios**:

1. **Given** a user clicks "Cari kawasan anda" CTA, **When** a zone modal opens, **Then** they see a dropdown or list of all Malaysia JAKIM zones with localized labels (e.g., state/zone names) mapped to canonical `zone_code`
2. **Given** they select a zone label (e.g., Terengganu zone label), **When** the modal confirms their selection, **Then** the submitted lookup key is canonical `zone_code` and they are routed to `/display/[display-id]` where that zone's first auto-populated masjid is displayed
3. **Given** the display page loads, **When** the zone's prayer times are shown, **Then** the times match the JAKIM official schedule for that zone
4. **Given** they want to explore other masjids, **When** they return to the landing page, **Then** they can select a different zone and repeat the flow
5. **Given** they are on the display page, **When** they want to compare with another zone, **Then** a "switch zone" option is available (e.g., via floating button or menu)

---

### User Story 4 - Mosque Upgrades from Free to Paid Tier (Priority: P2)

A mosque using the free Asas tier wants more customization. They upgrade to Maju or Gemilang from within the display interface.

**Why this priority**: Monetization path; once users are in the free tier, upgrade paths must be frictionless. Secondary because free-to-paid conversion is lower priority than initial acquisition.

**Independent Test**: From any display page (Asas tier), a user sees an "Upgrade" button or menu. They can navigate to a tier selection page, choose a new tier, and initiate checkout/contact flow.

**Acceptance Scenarios**:

1. **Given** a user is viewing an Asas (free) display, **When** they notice a "Tukar Pelan" (Change Plan) or "Upgrade" button, **Then** a tier selection modal or page opens
2. **Given** they review the tiers again, **When** they select Maju, **Then** they see a "Hubungi kami" (Contact Us) CTA with WhatsApp link or form
3. **Given** they select Gemilang, **When** they confirm, **Then** they are prompted to sign up for the admin dashboard or directed to checkout
4. **Given** they complete checkout/registration, **When** their tier is updated, **Then** new features (custom backgrounds, admin access, etc.) unlock immediately
5. **Given** they are on the new tier, **When** they return to the display, **Then** they see updated UI elements reflecting their tier level

---

### User Story 5 - FAQ Answers Common Questions (Priority: P2)

A visitor has questions about pricing, screens, support, or free trial. They find answers in the FAQ section without needing to contact support.

**Why this priority**: Self-serve FAQs reduce support load and increase confidence in decision-making. Secondary because this is a retention/support feature, not acquisition.

**Independent Test**: Landing page includes FAQ section (Bahasa Malaysia + English). Each Q is answered clearly. User can search or browse FAQs and find answers to common questions about tiers, pricing, screens, trial period, and support.

**Acceptance Scenarios**:

1. **Given** a user scrolls to the FAQ section, **When** they see questions like "Apakah perbezaan antara Free/Asas dan Maju?", **Then** they find a clear answer about managed service vs. self-service
2. **Given** they ask "Bolehkah saya menambah lebih dari satu skrin paparan?", **When** they read the answer, **Then** they understand Gemilang allows multiple screens, Maju allows only one
3. **Given** they ask "Adakah harga dikira per skrin?", **When** they read the answer, **Then** they understand pricing is per-masjid, not per-screen, and Gemilang includes unlimited screens
4. **Given** they ask "Bagaimana cara pembayaran?" or "Apakah termasuk sokongan?", **When** they read the answers, **Then** they know payment methods (card/FPX), billing frequency (monthly), and support channels for each tier
5. **Given** they ask "Bolehkah saya mencuba terlebih dahulu?", **When** they read the answer, **Then** they are reassured that Asas is free, with no credit card required

---

### Edge Cases

- What happens if a user selects a JAKIM zone with no pre-populated masjids yet? **Expected**: Display a message "Kawasan ini belum ada data" (This zone has no data yet) with a CTA to contact support or request manual setup.
- How does the system handle a user switching between Bahasa Malaysia and English? **Expected**: All tier descriptions, zone names, FAQs, and CTAs switch language dynamically. Landing page layout remains consistent.
- What if the JAKIM zone list is updated (new zones added)? **Expected**: Auto-populated masjid list updates automatically to reflect the new zone. No manual landing page update needed.
- What happens if a user's device doesn't support displaying the tier comparison table (e.g., very small mobile screen)? **Expected**: Tier cards stack vertically and remain fully readable. Comparison table can be toggled or scrolled horizontally.

## Requirements _(mandatory)_

### Functional Requirements

**Landing Page & Marketing**:

- **FR-001**: Landing page MUST display all 4 tier packages (Asas, Maju, Gemilang, Istimewa) in the main tier section, and each package MUST show its description, key features, and pricing without requiring horizontal scrolling
- **FR-002**: Each tier MUST include a primary CTA (e.g., "Mulai Percuma", "Hubungi Kami", "Tukar Pelan")
- **FR-003**: Landing page MUST include a "Cari kawasan anda" (Find Your Zone) CTA that opens a zone selection modal
- **FR-004**: Zone selection modal MUST display all entries from the system's canonical active JAKIM zone registry (58 zones at current baseline), showing localized labels mapped to canonical `zone_code` values for selection
- **FR-005**: Upon zone selection, user MUST be routed to `/display/[display-id]` for the first masjid in that zone
- **FR-006**: Landing page MUST include an FAQ section (minimum 6 questions) covering common topics such as tier differences, pricing, screens, support, trial period, and payment. Topics are determined by content team; exact questions flexible (not prescriptive)
- **FR-007**: All tier descriptions, CTAs, zone names, and FAQ content MUST be available in Bahasa Malaysia and English
- **FR-008**: From any display page, the user MUST be able to access at least one visible "Upgrade Plan" or "Tukar Pelan" CTA that opens a tier-switching flow

**Database & Data Population**:

- **FR-009**: System MUST auto-populate a list of free masjids (Tier: Asas) for each Malaysia JAKIM zone on first deployment (SQL migration required)
- **FR-010**: Each auto-populated masjid entry MUST include: name, JAKIM zone, prayer times source (JAKIM official), tier level (Asas), and a unique display ID
- **FR-011**: Prayer times for auto-populated masjids MUST be sourced from the official JAKIM API (no manual updates required for free tier). On each display load, the system MUST serve cached prayer times immediately and refresh in the background (stale-while-revalidate), with cache rollover at Asia/Kuala_Lumpur midnight each day.
- **FR-012**: Auto-population coverage MUST include every zone in the authoritative canonical active set defined by `packages/prayer-times/src/jakim-api.ts` `MALAYSIAN_ZONES` (58 zones at current baseline), using official JAKIM zone-code format (e.g., JHR01, KDH01) and not locale strings
- **FR-012.1**: `zone_code` MUST be the canonical identifier for all routing, API queries, and lookups. `zone_name_ms` and `zone_name_en` are display-only fields and MUST NOT be used as primary keys.
- **FR-013**: Canonical-set drift MUST be reconciled automatically without manual intervention: when JAKIM adds a new zone or changes zone metadata in the canonical set, the system MUST synchronize and backfill auto-populated masjid coverage via scheduled sync and migration/admin import paths. Prayer-times refresh behavior for existing zones is governed by FR-011.

**UI/UX Requirements**:

- **FR-014**: Tier cards MUST render without functional or visual breakage at viewport widths 320, 375, 768, 1024, and 1280 pixels. At each width: no horizontal page overflow, all tier names and primary CTAs remain visible, and CTA touch target height is >=48px.
- **FR-015**: Tier comparison MUST expose and label these 8 dimensions: `customization_type`, `max_screens`, `requires_login`, `support_level`, `prayer_times_display`, `prayer_times_sync`, `content_scheduling`, and `analytics`. On viewports <=768px, the comparison MUST remain readable via horizontal scroll or stacked layout without truncating labels or values.
- **FR-016**: Zone selection modal MUST satisfy WCAG 2.1 AA with explicit acceptance checks: full keyboard-only flow (open, navigate options, select, close) without keyboard trap; logical focus order with visible focus indicator; Escape closes modal and returns focus to trigger; semantic dialog roles/labels (`role="dialog"`, `aria-modal="true"`, labelled title, described instructions); screen readers announce open/close state and selected option. Validation MUST pass automated accessibility scan (axe) with zero critical violations and manual keyboard/screen-reader checklist in QA evidence.
- **FR-017**: Landing page performance MUST meet p95 LCP <= 2.0s per environment (local baseline and staging) using Lighthouse CI mobile profile over >=30 successful runs each. Measurement protocol: cold-cache runs, fixed network/CPU profile, report median and p95; failures or invalid runs are excluded only when an execution error is recorded in logs. A run report artifact (raw JSON + summary table) MUST be stored in docs evidence before release approval.
- **FR-018**: All CTAs MUST be clearly distinguished (color, size, hover/focus states) to encourage click-through. Minimum acceptance: CTA text/background contrast >= 4.5:1, visible hover/focus state change, and minimum touch target height of 48px

**Integration & Routing**:

- **FR-019**: From any display page, user MUST be able to return to landing page and switch zones without losing session state. For this feature, session state is defined as: selected language (Bahasa Malaysia/English), last selected `zone_code`, and landing comparison context (last viewed tier section). On return-to-landing, these values MUST be restored in the same browser session; on switch-zone, selected language and landing comparison context MUST persist while `zone_code` updates to the newly selected zone
- **FR-020**: Tier-specific features (admin dashboard, custom content, etc.) MUST NOT be exposed in the UI if user is on a lower tier (e.g., Asas users should not see admin button). Tier-gating enforced at package level (defense in depth): lower-tier code cannot import admin services at compile time; RLS policies prevent database access; UI components perform runtime tier checks as fast path
- **FR-021**: When a user upgrades tiers, their previous settings/content MUST be preserved, and new features MUST unlock immediately

**Observability & Measurement**:

- **FR-022**: The system MUST record standardized landing/display interaction events so SC-010 and SC-011 can be measured consistently. Required event types are: `landing_cta_click`, `zone_selection_success`, `faq_item_expand`, and `upgrade_intent`. Every event MUST include: `event_name`, `event_time` (UTC ISO-8601), `session_id`, `actor_id` (anonymous or authenticated), `page_path`, and `locale` (ms/en). Event-specific required fields are: `landing_cta_click` -> `cta_id`, `cta_label`, `tier_context`; `zone_selection_success` -> `selected_zone_code`, `target_display_id`; `faq_item_expand` -> `faq_id`; `upgrade_intent` -> `from_tier`, `target_tier`. Governance requirements: authoritative analytics sink is `public.analytics_events` via Supabase Edge Function ingestion; event idempotency key is mandatory; minimum retention is 180 days; SC-010/SC-011 reporting queries in `docs/TV-LANDING-PAGE-TIERS.md` require Product Manager and Support Lead sign-off.

---

### Key Entities _(include if feature involves data)_

- **Masjid**: Represents a mosque with auto-populated free listings. Attributes: name, zone (JAKIM code), tier (Asas for auto-pop), prayer_times_source (JAKIM API), display_id (unique identifier), created_at
- **Tier/Package**: Defines pricing and feature levels. Attributes: name (Asas/Maju/Gemilang/Istimewa), price (free/RM ~75/~150/custom), max_screens (1/1/unlimited/custom), requires_login (false/false/true/custom), support_level (basic/standard/priority/custom), customization_type (none/managed/self-service/custom)
- **JAKIM Zone**: Represents official prayer time zones in Malaysia. Attributes: zone_code (from JAKIM API), zone_name (Bahasa Malaysia), state, masjid_count (number of masjids in zone)
- **Display**: References the live display page for a masjid. Attributes: id, masjid_id, zone_code, tier, prayer_times (real-time feed from JAKIM), custom_content (null for Asas), status (active/inactive). Display id is the canonical routing identifier for display pages.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Landing page loads in under 2 seconds. Validation protocol: Lighthouse CI mobile profile with >=30 runs per environment (local baseline and staging) MUST show p95 LCP <= 2.0s, and post-release web-vitals telemetry MUST show >=95% of landing sessions with LCP <= 2.0s
- **SC-002**: Zone dropdown is pre-populated with 100% of Malaysia JAKIM zones (all 58 canonical active zones, using official zone codes from `jakim-api.ts` MALAYSIAN_ZONES active set) with zero missing entries
- **SC-003**: Each JAKIM zone has exactly 1 auto-populated masjid entry (58 total, 1:1 zone-to-masjid mapping for Asas tier free discovery); all masjids are active, properly indexed by zone_code, and queryable for zone selection
- **SC-004**: User can reach their mosque's display within 3 clicks from landing page: (1) Click "Cari kawasan anda", (2) Select zone, (3) View display
- **SC-005**: Zone-discovery completion rate MUST be >=90% over the first 28 days after release, where numerator = unique sessions with `zone_selection_success` and denominator = unique sessions with a `landing_cta_click` for "Cari kawasan anda". Exclusions: bot traffic and sessions with client-side telemetry disabled. Report cadence: weekly roll-up in docs evidence.
- **SC-006**: Free tier (Asas) display is accessible without login/registration; 100% of anonymous users can view prayer times for their selected zone
- **SC-007**: Prayer times accuracy MUST be >=99% when comparing rendered display prayer times against official JAKIM schedule for the same `zone_code` and prayer date. Sampling protocol: all 58 auto-populated Asas masjids, daily at 06:00 Asia/Kuala_Lumpur for 14 consecutive days post-release. A sample is pass when all six prayer fields match `HH:MM` after configured adjustments; overall pass rate = passed samples / total samples.
- **SC-008**: Tier-comparison comprehension MUST reach >=80% in moderated usability validation: minimum 20 representative participants complete a timed task (<=30 seconds) to correctly identify differences for three prompts (Asas vs Maju, Maju vs Gemilang, Gemilang vs Istimewa) without facilitator hints. Score = participants passing all three prompts within time limit / total participants.
- **SC-009**: FAQ coverage MUST be >=80% against a pre-defined corpus of at least 10 common support questions maintained in `/specs/007-tv-landing-tiers/plan.md` (SC-009 Canonical FAQ Corpus). Validation protocol: map each corpus question to a published FAQ answer (ms/en), mark "covered" only if answer is complete and actionable, and compute coverage = covered questions / total corpus questions. Minimum content requirement remains >=6 published FAQ entries in both languages. Release evidence is recorded in `/docs/TV-LANDING-PAGE-TIERS.md`.
- **SC-010**: Within the first 14 days after release, support tickets about tier selection or free-tier understanding MUST decrease by >=50% versus baseline. Baseline is the average weekly count from the 4 full weeks before release, sourced from the official support ticket system using the same ticket tagging/filter rules. Attribution includes tickets tagged to tier-selection/free-tier confusion from users who accessed the landing flow within the prior 7 days
- **SC-011**: Tier CTA click-through rate (CTR) from landing page MUST be >=25% during the first 28 days after release, where numerator = unique landing sessions with >=1 tier CTA click (`Mulai Percuma`, `Hubungi Kami`, or `Tukar Pelan`) and denominator = unique landing sessions in the same window
- **SC-012**: Mobile users: Landing page renders correctly on devices 320px+ wide; touch targets for CTAs are 48px+ for easy tapping

---

## Assumptions

1. **JAKIM Zone Codes**: Hub app already implements JAKIM zone code fetching; this feature will reference the same zone list for consistency
2. **Prayer Times Data**: JAKIM API is reliable and updates daily; no manual prayer time input is required for free tier
3. **Auto-Population**: Initial SQL migration populates exactly 1 free Asas masjid per JAKIM zone for MVP (58 total, 1:1 zone-to-masjid mapping); additional masjids per zone can be added in a separate post-MVP feature
4. **Billing System**: Tier selection flows (Maju/Gemilang/Istimewa) route to external checkout or contact form; actual payment processing is out of scope for this feature
5. **Languages**: Bahasa Malaysia is the primary language; English is a secondary translation. All content is translated by product team before launch
6. **Mobile-First Design**: Landing page is designed mobile-first, with desktop as enhancement (not the reverse)
7. **Tier Access Control**: Tier-specific features (admin dashboard, custom content) are enforced with package-first ownership and defense in depth: business logic resides in `packages/`, with RLS and runtime checks at app boundaries
8. **Marketing Copy**: All tier descriptions and FAQs in Bahasa Malaysia and English are provided by stakeholders; Copilot fills in UI/UX structure only
9. **Support Attribution Rule**: For SC-010, support tickets are considered attributable only when they are tagged to tier-selection/free-tier confusion using the agreed support taxonomy and linked to a landing-flow visit within 7 days

---

## Dependencies & Constraints

- **Database**: New SQL migration required to auto-populate masjids table with JAKIM zone data
- **Hub App**: Must reference hub app's JAKIM zone code implementation for consistency
- **Supabase RLS**: Masjid entries must be accessible to anonymous users through explicit read-only RLS policies for Asas discovery paths; RLS remains mandatory and enforced for all operations.
- **External APIs**: Relies on JAKIM API for prayer times; fallback or caching strategy needed if API is unavailable
- **Translations**: All tier descriptions, FAQs, and zone names must be translated before go-live
- **Design System**: Uses Material-UI v6 components and Tailwind CSS (per project constitution); custom styling must follow existing theme
- **Frontend Shell**: tv-display uses Vite + React Router v6 to match the constitution's mandatory frontend stack

---

## Clarifications

### Session 2026-07-16

- Q: How should new JAKIM zones and prayer times updates be refreshed? → A: Prayer times use cache-first stale-while-revalidate on each display load with Asia/Kuala_Lumpur midnight rollover; new zones are synchronized via scheduled sync and can be backfilled via migration/admin import.
- Q: Where should tier access control be enforced? → A: Package-level gating (defense in depth): RLS policies as final enforcement layer, compile-time service restrictions for lower tiers
- Q: Should zone code formatting be explicitly documented? → A: Yes. `zone_code` is the canonical key for routing/lookups; `zone_name_ms`/`zone_name_en` are display-only fields.
- Q: Are FAQ topics prescribed or just a minimum count? → A: Minimum count only (6+ FAQs); topics can be any common questions relevant to landing page (tier differences, pricing, features, support, trial, customization)
- Q: How should prayer times be cached after fetching from JAKIM API? → A: Daily 24-hour cache until midnight; refresh at midnight when JAKIM publishes daily updates
- Q: How many auto-populated Asas masjids per zone should MVP use? → A: Exactly 1 per zone (58 total), expand later in a separate feature
- Q: Where should zone selection business logic live? → A: Package-first only (`packages/`); app layer handles presentation/state and calls package exports
