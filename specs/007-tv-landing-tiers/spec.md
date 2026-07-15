# Feature Specification: TV Landing Page with Tiered Package Marketing

**Feature Branch**: `007-tv-landing-tiers`  
**Created**: 2026-07-16  
**Status**: Draft  
**Input**: Marketing-driven landing page redesign with tier packages (Asas/Maju/Gemilang/Istimewa) and auto-populated JAKIM zone discovery

**Constitutional Requirements Checklist**:

- [ ] Package-first architecture (business logic in `packages/`)
- [ ] TDD approach (tests written first)
- [ ] Database migrations for auto-populating masjid data with JAKIM zones
- [ ] Multilingual support (Bahasa Malaysia/English)
- [ ] Documentation plan for `/docs`

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

**Independent Test**: Zone selection modal populates with all Malaysia JAKIM zones (Peninsular + Sabah/Sarawak). User can select a zone and see at least one pre-populated masjid for that zone. Selection routes to that masjid's display page.

**Acceptance Scenarios**:

1. **Given** a user clicks "Cari kawasan anda" CTA, **When** a zone modal opens, **Then** they see a dropdown or list of all Malaysia JAKIM zones (e.g., "Johor", "Kedah", "Negeri Sembilan", etc.)
2. **Given** they select a zone (e.g., "Terengganu"), **When** the modal confirms their selection, **Then** they are routed to `/display/[masjid-id]` where that zone's first auto-populated masjid is displayed
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

- **FR-001**: Landing page MUST prominently display 4 tier packages (Asas, Maju, Gemilang, Istimewa) with descriptions, key features, and pricing
- **FR-002**: Each tier MUST include a primary CTA (e.g., "Mulai Percuma", "Hubungi Kami", "Tukar Pelan")
- **FR-003**: Landing page MUST include a "Cari kawasan anda" (Find Your Zone) CTA that opens a zone selection modal
- **FR-004**: Zone selection modal MUST be pre-populated with all Malaysia JAKIM zones (refer hub app for zone codes)
- **FR-005**: Upon zone selection, user MUST be routed to `/display/[masjid-id]` for the first masjid in that zone
- **FR-006**: Landing page MUST include an FAQ section (minimum 6 questions) covering common topics such as tier differences, pricing, screens, support, trial period, and payment. Topics are determined by content team; exact questions flexible (not prescriptive)
- **FR-007**: All tier descriptions, CTAs, zone names, and FAQ content MUST be available in Bahasa Malaysia and English
- **FR-008**: Landing page MUST display at least one "Upgrade Plan" or "Tukar Pelan" CTA from any display page, allowing users to switch tiers

**Database & Data Population**:

- **FR-009**: System MUST auto-populate a list of free masjids (Tier: Asas) for each Malaysia JAKIM zone on first deployment (SQL migration required)
- **FR-010**: Each auto-populated masjid entry MUST include: name, JAKIM zone, prayer times source (JAKIM official), tier level (Asas), and a unique display ID
- **FR-011**: Prayer times for auto-populated masjids MUST be sourced from official JAKIM API (no manual updates required for free tier). Prayer times are cached for 24 hours until midnight, then refreshed when JAKIM publishes daily updates. Fresh times fetched on-demand from JAKIM API when user loads display page; cache serves immediately while refresh happens in background (stale-while-revalidate pattern)
- **FR-012**: System MUST ensure all Malaysia states and their JAKIM zones are covered in the auto-population (reference hub app implementation for JAKIM zone codes)
- **FR-013**: When a new JAKIM zone is added or prayer times are updated by JAKIM, auto-populated masjid data MUST refresh automatically (no manual intervention). Refresh strategy: prayer times fetched on-demand from JAKIM API each time user loads display page (fast path via daily 24h cache); new zones added to database via SQL migration or admin import tool

**UI/UX Requirements**:

- **FR-014**: Tier cards MUST be responsive and render correctly on mobile, tablet, and desktop devices
- **FR-015**: Tier comparison (if using a table) MUST be scannable and highlight key differences (e.g., customization, screens, login requirement, support level)
- **FR-016**: Zone selection modal MUST be accessible (keyboard navigation, screen reader support, WCAG 2.1 AA)
- **FR-017**: Landing page MUST load in under 2 seconds (excluding image/video assets)
- **FR-018**: All CTAs MUST be clearly distinguished (color, size, hover states) to encourage click-through

**Integration & Routing**:

- **FR-019**: From any display page, user MUST be able to return to landing page or switch zones without losing session state
- **FR-020**: Tier-specific features (admin dashboard, custom content, etc.) MUST NOT be exposed in the UI if user is on a lower tier (e.g., Asas users should not see admin button). Tier-gating enforced at package level (defense in depth): lower-tier code cannot import admin services at compile time; RLS policies prevent database access; UI components perform runtime tier checks as fast path
- **FR-021**: When a user upgrades tiers, their previous settings/content MUST be preserved, and new features MUST unlock immediately

---

### Key Entities _(include if feature involves data)_

- **Masjid**: Represents a mosque with auto-populated free listings. Attributes: name, zone (JAKIM code), tier (Asas for auto-pop), prayer_times_source (JAKIM API), display_id (unique identifier), created_at
- **Tier/Package**: Defines pricing and feature levels. Attributes: name (Asas/Maju/Gemilang/Istimewa), price (free/RM ~75/~150/custom), max_screens (1/1/unlimited/custom), requires_login (false/false/true/custom), support_level (basic/standard/priority/custom), customization_type (none/managed/self-service/custom)
- **JAKIM Zone**: Represents official prayer time zones in Malaysia. Attributes: zone_code (from JAKIM API), zone_name (Bahasa Malaysia), state, masjid_count (number of masjids in zone)
- **Display**: References the live display page for a masjid. Attributes: id, masjid_id, zone_code, tier, prayer_times (real-time feed from JAKIM), custom_content (null for Asas), status (active/inactive)

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Landing page loads in under 2 seconds (measured via Lighthouse/Core Web Vitals); 95%+ of page traffic completes load within this time
- **SC-002**: Zone dropdown is pre-populated with 100% of Malaysia JAKIM zones (min. 16 zones for Peninsular Malaysia, plus Sabah/Sarawak zones) with zero missing entries
- **SC-003**: Each JAKIM zone has at least 1 auto-populated masjid entry; 95%+ of zones have 3+ masjids available for user selection
- **SC-004**: User can reach their mosque's display within 3 clicks from landing page: (1) Click "Cari kawasan anda", (2) Select zone, (3) View display
- **SC-005**: 90%+ of users who click "Cari kawasan anda" successfully select a zone and reach a display page (no errors or dead ends)
- **SC-006**: Free tier (Asas) display is accessible without login/registration; 100% of anonymous users can view prayer times for their selected zone
- **SC-007**: Prayer times accuracy: 99%+ of auto-populated masjids display correct prayer times matching JAKIM official schedule for their zone
- **SC-008**: Tier comparison is scannable in under 30 seconds; 80%+ of users can identify key differences between tiers without additional help
- **SC-009**: FAQ section answers 80%+ of pre-defined common questions (min. 6 questions/answers in Bahasa Malaysia and English)
- **SC-010**: After FAQ section is added, support tickets related to "What tier should I choose?" or "How does free tier work?" decrease by 50% within 2 weeks
- **SC-011**: Tier-specific CTAs have at least 25% click-through rate from landing page (baseline conversion funnel metric)
- **SC-012**: Mobile users: Landing page renders correctly on devices 320px+ wide; touch targets for CTAs are 48px+ for easy tapping

---

## Assumptions

1. **JAKIM Zone Codes**: Hub app already implements JAKIM zone code fetching; this feature will reference the same zone list for consistency
2. **Prayer Times Data**: JAKIM API is reliable and updates daily; no manual prayer time input is required for free tier
3. **Auto-Population**: Initial SQL migration populates free masjids (1–3 per zone) based on official JAKIM masjid registry; new masjids can be manually added later
4. **Billing System**: Tier selection flows (Maju/Gemilang/Istimewa) route to external checkout or contact form; actual payment processing is out of scope for this feature
5. **Languages**: Bahasa Malaysia is the primary language; English is a secondary translation. All content is translated by product team before launch
6. **Mobile-First Design**: Landing page is designed mobile-first, with desktop as enhancement (not the reverse)
7. **Tier Access Control**: Tier-specific features (admin dashboard, custom content) are gated at the app/package level, not the landing page level
8. **Marketing Copy**: All tier descriptions and FAQs in Bahasa Malaysia and English are provided by stakeholders; Copilot fills in UI/UX structure only

---

## Dependencies & Constraints

- **Database**: New SQL migration required to auto-populate masjids table with JAKIM zone data
- **Hub App**: Must reference hub app's JAKIM zone code implementation for consistency
- **Supabase RLS**: Masjid entries must be accessible to anonymous users (no RLS required for free tier read access)
- **External APIs**: Relies on JAKIM API for prayer times; fallback or caching strategy needed if API is unavailable
- **Translations**: All tier descriptions, FAQs, and zone names must be translated before go-live
- **Design System**: Uses Material-UI v6 components and Tailwind CSS (per project constitution); custom styling must follow existing theme

---

## Clarifications

### Session 2026-07-16

- Q: How should new JAKIM zones and prayer times updates be refreshed? → A: On-demand fresh fetching from JAKIM API each time user loads display page
- Q: Where should tier access control be enforced? → A: Package-level gating (defense in depth): RLS policies as final enforcement layer, compile-time service restrictions for lower tiers
- Q: Should zone code formatting be explicitly documented? → A: Keep current ambiguity; developers use context to distinguish zone_code (lowercase DB) from zone_name_ms/zone_name_en (UI display)
- Q: Are FAQ topics prescribed or just a minimum count? → A: Minimum count only (6+ FAQs); topics can be any common questions relevant to landing page (tier differences, pricing, features, support, trial, customization)
- Q: How should prayer times be cached after fetching from JAKIM API? → A: Daily 24-hour cache until midnight; refresh at midnight when JAKIM publishes daily updates
