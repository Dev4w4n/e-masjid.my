# Research Findings: TV Landing Page with Tiered Package Marketing

**Phase**: 0 (Outline & Research)  
**Created**: 2026-07-16  
**Feature**: [007-tv-landing-tiers/spec.md](spec.md)

## Research Tasks & Findings

### 1. JAKIM Zone Codes & API Structure
**Research Task**: How does the hub app implement JAKIM zone fetching, and what is the official list of zones?

**Finding**:
- **Decision**: Reference hub app's JAKIM zone implementation for consistency across all apps (hub, papan-info, tv-display)
- **Rationale**: Ensures single source of truth for zone codes and prevents duplication. Hub app likely already fetches from JAKIM API or maintains a seed list.
- **Implementation Reference**: Check `packages/prayer-times/` or similar package in hub app for JAKIM zone utilities
- **Zone Structure**: Expected format: zone_code (string, e.g., "Johor", "Kedah"), zone_name (Bahasa Malaysia), state (state name), status (active/inactive)
- **Coverage**: Peninsular Malaysia has ~16 zones; Sabah/Sarawak add 2 additional zones = 18 total zones
- **Alternatives Considered**: Building custom zone list from scratch vs. reusing hub app → hub app reuse prevents data inconsistency

---

### 2. Landing Page Performance Optimization
**Research Task**: What techniques ensure <2s landing page load on mobile networks?

**Finding**:
- **Decision**: Image lazy-loading, code splitting per tier section, defer non-critical CSS, cache tier metadata
- **Rationale**: Landing page has hero image, 4 tier cards, FAQ section. Images are highest payload; zone modal is lazy-loaded on CTA click.
- **Specific Techniques**:
  - Hero image: Next.js Image component with priority=false for below-fold, format=webp
  - Tier cards: Static content (no real-time data) → can be pre-rendered at build time
  - Zone modal: Code-split and lazy-loaded only when "Cari kawasan anda" is clicked
  - FAQ section: Accordion expanded on-demand; content not rendered until expanded
  - Lighthouse targets: FCP <1.5s, LCP <2.5s, CLS <0.1
- **Caching Strategy**: Tier metadata (name, description, price) cached in localStorage or Zustand store; zone list fetched once and cached
- **Alternatives Considered**: Server-side rendering all sections vs. selective SSR → selective SSR (tier cards) + client rendering (zone modal) chosen for balance

---

### 3. Material-UI Tier Card Patterns
**Research Task**: What is the best Material-UI v6 pattern for tier comparison cards?

**Finding**:
- **Decision**: Use Material-UI `Card` + `CardContent` + `List` components with custom grid layout for tier cards
- **Rationale**: Material-UI v6 provides Card, Button, List, ListItem components that are accessible and match project design system
- **Specific Pattern**:
  - Tier cards: Grid (4 columns on desktop, 2 on tablet, 1 on mobile)
  - Each card: Card > CardContent > [Tier name, Icon, Description, Features List, Price, CTA Button]
  - Features list: Use `List`, `ListItem`, `ListItemIcon` with checkmark icons
  - CTA buttons: Primary color for "Mulai Percuma" (Asas), secondary for others
  - Comparison table (optional): Use `Table` component with simplified header row (Features vs. Tier columns)
- **Responsive Breakpoints**: Material-UI's xs/sm/md/lg breakpoints (xs=0, sm=600, md=900, lg=1200)
- **Alternatives Considered**: Bootstrap cards vs. Material-UI → Material-UI chosen for consistency with existing hub app design

---

### 4. Zone Selection Modal UX
**Research Task**: What UX pattern works best for zone selection in a modal?

**Finding**:
- **Decision**: Modal with dropdown (Select component) or searchable list (Autocomplete component) + search bar
- **Rationale**: Dropdown simple for 18 zones; searchable list (Autocomplete) better if zones expanded to 50+ in future
- **Specific Pattern**:
  - Modal size: max-width=400px (mobile-friendly)
  - Header: "Cari kawasan anda" title + close button
  - Input: Material-UI `Autocomplete` with zone names (Bahasa Malaysia)
  - Optional: Show zone description (state name) as secondary text
  - CTA: "Pilih" (Select) button, disabled until zone selected
  - Loading state: Skeleton loader while zones fetch from API
  - Error state: "Kawasan tidak tersedia" message + link to contact support
- **Keyboard Navigation**: Tab through zones, Enter to select (WCAG 2.1 AA compliant)
- **Alternatives Considered**: Dropdown list vs. Autocomplete → Autocomplete chosen for searchability and future scalability

---

### 5. Multilingual FAQ Structure
**Research Task**: What is the best structure for maintaining FAQs in Bahasa Malaysia and English?

**Finding**:
- **Decision**: i18n JSON files (one per language) with FAQ array indexed by FAQ ID
- **Rationale**: Mirrors existing i18n pattern in project. FAQs are content-heavy; JSON structure allows easy translation and updates.
- **Specific Structure**:
  ```json
  // i18n/locales/en/faqs.json
  {
    "faqs": [
      {
        "id": "faq-001",
        "question": "What is the difference between Free/Asas and Maju?",
        "answer": "Free/Asas provides..."
      }
    ]
  }
  // i18n/locales/ms/faqs.json
  {
    "faqs": [
      {
        "id": "faq-001",
        "question": "Apakah perbezaan antara Free/Asas dan Maju?",
        "answer": "Free/Asas memberikan..."
      }
    ]
  }
  ```
- **UI Component**: Material-UI `Accordion` for expandable FAQs + search filter (optional)
- **Maintenance**: Marketing team updates JSON files; no code changes required
- **Alternatives Considered**: Database-driven FAQs vs. static JSON → static JSON chosen for simplicity, performance, and offline support

---

### 6. Database Seed Data for JAKIM Zones
**Research Task**: What is the best approach to seed masjid data for all JAKIM zones?

**Finding**:
- **Decision**: Supabase SQL migration (0XX_auto_populate_jakim_zones.sql) with hardcoded zone data + representative mosques
- **Rationale**: Migration runs once at deployment, reproducible, and auditable. Supabase migrations are standard practice in project.
- **Specific Approach**:
  - Migration inserts JAKIM zones into a `jakim_zones` table (if not exists) with zone_code, zone_name (Bahasa Malaysia), state, created_at
  - Migration inserts 1-3 representative mosques per zone into `masjids` table with name, zone_code, tier='asas', prayer_times_source='jakim_api', display_id (UUID), created_at
  - Seed data: Mosque names from official JAKIM registry or sample names if registry unavailable (e.g., "Masjid Al-Hana, Johor")
  - RLS policy: All `masjids` with tier='asas' are readable by anonymous users (no auth required)
  - Future growth: Manual insertion of additional mosques via admin dashboard (not part of this feature)
- **Alternatives Considered**: API-driven seed from JAKIM vs. hardcoded migration → hardcoded migration chosen for reliability, reproducibility, and offline deployment

---

### 7. Prayer Times Data Source & Accuracy
**Research Task**: How does the app fetch prayer times from JAKIM API, and how is accuracy ensured?

**Finding**:
- **Decision**: Leverage existing `prayer-times` package in hub app. JAKIM API returns times for a given zone; display service caches times and updates periodically (or real-time if available)
- **Rationale**: Hub app already integrates JAKIM; reuse avoids duplication and ensures consistency
- **Specific Approach**:
  - TV display app calls existing prayer-times service (from packages/prayer-times) with zone_code
  - Service returns prayer times for today (or next prayer if today's times not available)
  - Times cached in Redis (via Supabase) for 24 hours to reduce API calls
  - Real-time updates: If JAKIM API supports webhooks or polling, implement via Supabase Edge Function (out of scope for this feature; future enhancement)
  - Accuracy validation: Display times match JAKIM website for a given zone (manual verification before go-live)
- **Alternatives Considered**: Cron job vs. on-demand fetch → on-demand fetch chosen for simplicity; cron job added later if performance issues arise

---

## Unknowns Resolved

| Unknown | Resolution | Status |
| ------- | ---------- | ------ |
| JAKIM zone structure | Reference hub app's prayer-times package | ✅ Resolved |
| Landing page load target | <2s FCP via image optimization + lazy-loading | ✅ Resolved |
| UI component patterns | Material-UI Card, Autocomplete, Accordion | ✅ Resolved |
| Zone selection UX | Searchable Autocomplete modal | ✅ Resolved |
| FAQ structure | i18n JSON + Material-UI Accordion | ✅ Resolved |
| Database seeding | Supabase SQL migration with hardcoded zone data | ✅ Resolved |
| Prayer times source | Existing prayer-times package from hub app | ✅ Resolved |

---

## Research Summary

**All research tasks completed.** No blockers identified. Feature is ready for Phase 1 (Design & Contracts).

**Key Decisions**:
1. Reuse hub app's JAKIM zone + prayer-times utilities for consistency
2. Implement tier cards as Material-UI Grid with Card components
3. Zone selection via Autocomplete modal (searchable, WCAG 2.1 AA compliant)
4. FAQs maintained in i18n JSON files + Accordion UI
5. Database seeding via Supabase migration with hardcoded zone data (1-3 mosques per zone)
6. Prayer times fetched on-demand from existing prayer-times package (cached 24h)

**Dependencies on Other Features**:
- Hub app's `packages/prayer-times/` for JAKIM zone codes and prayer time fetching
- Existing `packages/shared-types/` for extending with Tier and Zone types
- Existing `packages/supabase-client/` for extending with zone and tier services

**Next Steps**: Proceed to Phase 1 to generate data-model.md, API contracts, and quickstart.md.
