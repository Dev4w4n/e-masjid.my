# Quick Start: TV Landing Page with Tiered Package Marketing

**Phase**: 1 (Design & Contracts)  
**Created**: 2026-07-16  
**Feature**: [007-tv-landing-tiers](.)

## Overview

This quick start guide provides all the essential information needed to begin implementation of the TV landing page with tier packages and zone discovery.

## What You'll Build

A marketing-driven landing page for the TV Display app that:

1. **Showcases 4 tier packages** (Asas/Maju/Gemilang/Istimewa) with clear feature comparison
2. **Enables zone-based discovery** via a "Cari kawasan anda" modal that routes users to their local mosque display
3. **Provides self-service FAQs** covering pricing, screens, support, and trial information
4. **Seeds database** with 1-3 mosques per JAKIM zone for zero-friction onboarding
5. **Supports multiple languages** (Bahasa Malaysia + English) with dynamic switching

## Architecture at a Glance

```
packages/
├── shared-types/          ← Add TierPackage, JAKIMZone, Display types
├── supabase-client/       ← Add zone-service, tier-service
└── ui-components/         ← Reuse Material-UI components

apps/
└── tv-display/
    ├── src/app/landing/   ← NEW: TierSection, ZoneModal, FAQSection components
    ├── src/lib/           ← NEW: zone-client.ts (client logic)
    └── src/api/zones/     ← NEW: zone endpoint for discovery

supabase/
└── migrations/
    └── 0XX_auto_populate_jakim_zones.sql  ← NEW: Seed zones + mosques
```

## Key Design Decisions

| Decision                                  | Why                                               | Implementation                                    |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| **Tier data as static content**           | No real-time changes; marketing-controlled        | Define in shared-types + i18n JSON                |
| **Zone selection via Autocomplete modal** | Searchable, scalable to 50+ zones                 | Material-UI Autocomplete component                |
| **FAQs in i18n JSON**                     | Easy translation; content-driven; no code changes | i18n files + Accordion UI                         |
| **Anonymous access for Asas tier**        | Zero login friction                               | RLS policy allows anon read for tier='asas'       |
| **Prayer times from existing service**    | Reuse hub app's prayer-times package              | Import from packages/prayer-times                 |
| **Display ID as immutable UUID**          | Enables permanent bookmarking/sharing             | `/display/[display_id]` is the public URL         |
| **Database seed migration**               | Reproducible, auditable, off-deployable           | SQL migration (0XX_auto_populate_jakim_zones.sql) |

## Data Models

### Tier Package

```typescript
interface TierPackage {
  id: "asas" | "maju" | "gemilang" | "istimewa";
  name_ms: string;
  description_ms: string;
  price_ms: string | null;
  max_screens: number | null;
  requires_login: boolean;
  features: string[];
  cta_action: "start_free" | "contact_sales" | "admin_login";
}
```

### JAKIM Zone

```typescript
interface JAKIMZone {
  zone_code: string; // "johor", "selangor", etc.
  zone_name_ms: string; // "Johor", "Selangor", etc.
  region: "peninsular" | "sabah" | "sarawak";
  masjid_count: number;
}
```

### Masjid

```typescript
interface Masjid {
  id: UUID;
  name: string;
  zone_code: string;
  tier: TierId;
  display_id: UUID; // Public URL identifier
  is_auto_populated: boolean;
}
```

### Display

```typescript
interface Display {
  id: UUID; // Same as masjid.display_id
  masjid_id: UUID;
  zone_code: string;
  prayer_times: PrayerTimes;
  tier: TierId;
  custom_content: JSON; // For paid tiers
}
```

## API Contracts

### 1. Tier Package Service

**File**: [contracts/tier-package.contract.ts](contracts/tier-package.contract.ts)

```typescript
// Fetch all 4 tier packages
const tiers = await tierService.fetchAllTiers();
// Returns: { tiers: TierPackageDTO[] }

// Fetch single tier
const tier = await tierService.fetchTierById("gemilang");
// Returns: TierPackageDTO
```

### 2. Zone Selection Service

**File**: [contracts/jakim-zone.contract.ts](contracts/jakim-zone.contract.ts)

```typescript
// Fetch all zones
const zones = await zoneService.fetchAllZones();
// Returns: { zones: JAKIMZoneDTO[], regions: { peninsular: [], sabah: [], sarawak: [] } }

// Fetch mosques by zone
const mosques = await zoneService.fetchMasjidsByZone("johor");
// Returns: { zone_code: 'johor', masjids: MasjidDTO[], primary_display_id: UUID }

// Route to display
const result = await zoneService.routeToDisplay(display_id);
// Returns: { route: '/display/[display_id]', success: true }
```

### 3. Display Routing Service

**File**: [contracts/display-routing.contract.ts](contracts/display-routing.contract.ts)

```typescript
// Load landing page
const landing = await routingService.loadLandingPage("ms");
// Returns: { tiers, zones, faqs, page_metadata }

// Navigate to display
const display = await routingService.navigateToDisplay(display_id);
// Returns: { prayer_times, masjid_name, tier, can_upgrade, can_switch_zone }

// Initiate upgrade
const upgrade = await routingService.initiateUpgrade(display_id, "gemilang");
// Returns: { action: 'open_admin_signup', action_url: '...' }
```

## User Flows

### Flow 1: Discover Free Tier & View Local Mosque

```
1. User lands on /display
   ↓
2. Sees Asas (Free) tier prominently + "Mulai Percuma" CTA
   ↓
3. Clicks "Mulai Percuma" → Zone Modal opens
   ↓
4. Selects zone (e.g., "Johor") → Routed to `/display/[display_id]`
   ↓
5. Sees prayer times + default background (no login required)
```

### Flow 2: Compare Tiers & Upgrade

```
1. User on display page sees "Tukar Pelan" button
   ↓
2. Clicks → Tier comparison modal opens
   ↓
3. Reads differences (Asas vs. Maju vs. Gemilang)
   ↓
4. Selects "Gemilang" → Directed to admin signup or checkout
   ↓
5. Registers/pays → Tier unlocked, can now use admin dashboard
```

### Flow 3: Answer FAQ Without Support

```
1. User on landing page scrolls to FAQ section
   ↓
2. Asks "Bolehkah saya menambah lebih dari satu skrin paparan?"
   ↓
3. Reads answer: "Gemilang allows unlimited screens, Maju allows 1 only"
   ↓
4. Understands pricing model, makes purchasing decision
```

## Implementation Checklist

### Phase 1A: Database Setup

- [ ] Create Supabase migration: `0XX_auto_populate_jakim_zones.sql`
  - [ ] Create `jakim_zones` table with all 18+ zones
  - [ ] Create `masjids` table with 1-3 mosques per zone (50-100 total)
  - [ ] Add RLS policy for anonymous read access (asas tier)
  - [ ] Add RLS policy for owner write access (maju+ tiers)

### Phase 1B: Package Development

- [ ] Extend `packages/shared-types/src/types/tier.ts`:
  - [ ] Add TierId enum, TierPackage interface
  - [ ] Add JAKIMZone, Masjid, Display interfaces
- [ ] Create `packages/supabase-client/src/services/zone-service.ts`:
  - [ ] `fetchAllZones()` - query jakim_zones table
  - [ ] `fetchMasjidsByZone(zone_code)` - filter masjids by zone
  - [ ] `fetchDisplayById(display_id)` - get display + prayer times
- [ ] Create `packages/supabase-client/src/services/tier-service.ts`:
  - [ ] `fetchAllTiers()` - return static tier data from i18n/constants
  - [ ] `fetchTierById(id)` - return single tier

### Phase 1C: Landing Page Components (TV Display App)

- [ ] Create `apps/tv-display/src/app/landing/HeroSection.tsx`:
  - [ ] Hero image, headline, subheadline
  - [ ] "Mulai Percuma" primary CTA
- [ ] Create `apps/tv-display/src/app/landing/TierSection.tsx`:
  - [ ] 4 tier cards (Material-UI Card component)
  - [ ] Grid layout (4 cols desktop, 2 tablet, 1 mobile)
  - [ ] Feature list per tier (checkmark icons)
  - [ ] CTA buttons per tier
- [ ] Create `apps/tv-display/src/app/landing/ZoneModal.tsx`:
  - [ ] Material-UI Modal + Autocomplete
  - [ ] Fetch zones on mount
  - [ ] Search + filter zones
  - [ ] "Pilih" button routes to `/display/[display_id]`
- [ ] Create `apps/tv-display/src/app/landing/FAQSection.tsx`:
  - [ ] Material-UI Accordion
  - [ ] FAQ items from i18n JSON
  - [ ] Expand/collapse logic
- [ ] Create `apps/tv-display/src/app/page.tsx` (redesigned):
  - [ ] Compose Hero + Tier + Zone + FAQ sections
  - [ ] Load landing page data from routing service

### Phase 1D: Zone Discovery Logic

- [ ] Create `apps/tv-display/src/lib/zone-client.ts`:
  - [ ] `selectZone(zone_code)` - fetch first masjid in zone
  - [ ] `routeToDisplay(display_id)` - navigate to `/display/[display_id]`
- [ ] Create `apps/tv-display/src/api/zones/route.ts`:
  - [ ] GET `/api/zones` - return all zones (cached)
  - [ ] GET `/api/zones/[zone_code]` - return mosques in zone
- [ ] Update existing `/display/[id]/page.tsx`:
  - [ ] Add "Switch Zone" button/menu
  - [ ] Add "Upgrade" / "Tukar Pelan" button

### Phase 1E: Internationalization

- [ ] Create i18n files:
  - [ ] `i18n/locales/ms/tiers.json` - Bahasa Malaysia tier descriptions
  - [ ] `i18n/locales/en/tiers.json` - English tier descriptions
  - [ ] `i18n/locales/ms/faqs.json` - Bahasa Malaysia FAQ
  - [ ] `i18n/locales/en/faqs.json` - English FAQ
- [ ] Update i18n config to load new files
- [ ] Ensure language switcher exists on landing page

### Phase 1F: Testing (TDD)

- [ ] Unit tests for zone-service (filtering, searching)
- [ ] Unit tests for tier-service (data retrieval)
- [ ] Component tests for TierSection, ZoneModal, FAQSection
- [ ] E2E tests:
  - [ ] Landing page loads tiers + zones in <2s
  - [ ] User selects zone → routed to correct display
  - [ ] FAQ items expand/collapse correctly
  - [ ] Prayer times display accurately

## Database Seed Migration Example

```sql
-- 0XX_auto_populate_jakim_zones.sql
-- Seed all Malaysia JAKIM zones and representative mosques

BEGIN;

-- Insert JAKIM zones (Peninsular Malaysia)
INSERT INTO public.jakim_zones (zone_code, zone_name, state, region, is_active)
VALUES
  ('johor', 'Johor', 'Johor', 'peninsular', true),
  ('kedah', 'Kedah', 'Kedah', 'peninsular', true),
  ('kelantan', 'Kelantan', 'Kelantan', 'peninsular', true),
  -- ... (16+ zones total)
  ('sabah', 'Sabah', 'Sabah', 'sabah', true),
  ('sarawak', 'Sarawak', 'Sarawak', 'sarawak', true);

-- Insert representative mosques for Johor (example)
INSERT INTO public.masjids
  (name, zone_code, tier, prayer_times_source, is_auto_populated, status)
VALUES
  ('Masjid Al-Hana, Johor Bahru', 'johor', 'asas', 'jakim_api', true, 'active'),
  ('Surau Nur, Kota Tinggi', 'johor', 'asas', 'jakim_api', true, 'active'),
  ('Masjid Jame, Muar', 'johor', 'asas', 'jakim_api', true, 'active');

-- ... (repeat for all 16+ zones, 1-3 mosques each)

-- Update zone masjid counts (after all inserts)
UPDATE public.jakim_zones SET masjid_count = (
  SELECT COUNT(*) FROM public.masjids WHERE masjids.zone_code = jakim_zones.zone_code
);

COMMIT;
```

## Performance Targets

| Metric                      | Target              | Technique                                                  |
| --------------------------- | ------------------- | ---------------------------------------------------------- |
| Landing page load (FCP)     | <1.5s               | Image lazy-loading, code splitting, static tier data       |
| Zone modal open             | <500ms              | Zones fetched on landing load (cached) + lazy-loaded modal |
| Zone to display route       | <1s                 | Display ID lookup (UUID index) + prayer times cache (24h)  |
| FAQ search                  | <100ms              | In-memory search of JSON array                             |
| Mobile responsiveness       | 95%+ devices 320px+ | Material-UI responsive grid                                |
| Accessibility (WCAG 2.1 AA) | 100% compliance     | Semantic HTML, ARIA labels, keyboard navigation            |

## Dependencies

### External APIs

- **JAKIM Prayer Times API** (via existing `packages/prayer-times`)
- **Material-UI v6** (already in project)
- **Supabase PostgreSQL + RLS** (already in project)

### Internal Packages

- `packages/shared-types` (extend)
- `packages/supabase-client` (extend)
- `packages/ui-components` (reuse)
- `packages/ui-theme` (use for styling)
- `packages/i18n` (extend for tiers + FAQs)
- `packages/prayer-times` (consume for prayer time fetching)

## Common Questions

**Q: How do we ensure zone codes match JAKIM official list?**  
A: Reference hub app's prayer-times package; it already has the official zone codes. Seed migration uses the same codes.

**Q: What if a zone has no mosques?**  
A: Show error message "Kawasan ini belum ada data" with contact support link. This is handled in Edge Case testing.

**Q: Can users upgrade from Asas to Maju without logging in?**  
A: Yes. Tier upgrade flows (Maju/Gemilang) route to external checkout or contact form. No auth required for Asas view.

**Q: How is prayer times accuracy ensured?**  
A: JAKIM API is source of truth. Times cached for 24h. Before go-live, manually verify against JAKIM website.

**Q: Can we pre-render the landing page for speed?**  
A: Yes. Tier data + zones + FAQs are static. Use Next.js SSG with `revalidate: 3600` (refresh every hour).

---

**Ready to start implementation?** Proceed to Phase 2 with `/speckit.tasks` to generate task breakdown and start building!
