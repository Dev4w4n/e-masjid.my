# TV Landing Page with Tiered Package Marketing - Implementation Guide

**Feature**: `007-tv-landing-tiers`  
**Status**: Implementation  
**Last Updated**: 2026-07-16

## Overview

This document covers setup, configuration, and maintenance for the TV Landing Page feature which includes 4 tier packages (Asas/Maju/Gemilang/Istimewa), zone-based discovery via JAKIM zones, and auto-populated mosque listings.

## Quick Start

### 1. Database Setup

Run the Supabase migration to initialize JAKIM zones and auto-populated mosques:

```bash
# Local development
supabase db push

# Production (via Supabase CLI)
supabase db push --linked
```

This creates:

- `jakim_zones` table: All 18 Malaysia JAKIM zones (16 Peninsular + 2 East Malaysia)
- `masjids` table: Auto-populated entries (1-3 per zone, ~50-100 total)
- RLS policies: Allow anonymous read for Asas tier masjids

### 2. Install Dependencies

```bash
# Install workspace dependencies
pnpm install

# Build all packages
pnpm run build:clean
```

### 3. Run Development Server

```bash
# Start TV Display app
cd apps/tv-display
pnpm dev

# Landing page available at: http://localhost:3000
```

## Feature Architecture

### Database Schema

#### `jakim_zones` Table

```sql
- zone_code (VARCHAR PK): "johor", "selangor", "kedah", etc. (lowercase, no spaces)
- zone_name_ms (VARCHAR): "Johor", "Selangor", "Kedah" (title case, UI display)
- zone_name_en (VARCHAR): "Johor", "Selangor", "Kedah" (English name)
- state_ms (VARCHAR): "Negeri Johor", "Selangor Darul Ehsan"
- state_en (VARCHAR): State name in English
- region (VARCHAR): "peninsular", "sabah", "sarawak"
- masjid_count (INT): Number of mosques in zone
- is_active (BOOLEAN): Zone is available for selection
- created_at (TIMESTAMP): Record creation time
- updated_at (TIMESTAMP): Last update time
```

#### `masjids` Table

```sql
- id (UUID PK): Unique mosque identifier
- name (VARCHAR): Mosque name (e.g., "Masjid Negara")
- zone_code (VARCHAR FK): References jakim_zones.zone_code
- tier (VARCHAR): "asas", "maju", "gemilang", "istimewa"
- display_id (UUID UNIQUE): Reference to display page for this mosque
- prayer_times_source (VARCHAR): "jakim_api" (source of prayer times)
- is_auto_populated (BOOLEAN): true if auto-seeded, false if manually added
- owner_id (UUID FK): Owner user ID (null for Asas tier, required for paid tiers)
- status (VARCHAR): "active", "inactive", "pending_approval"
- created_at (TIMESTAMP): Record creation time
- updated_at (TIMESTAMP): Last update time
```

### UI Components

#### Landing Page Sections

1. **HeroSection** (`apps/tv-display/src/app/landing/HeroSection.tsx`)
   - Headline: "Sahaja TV Masjid Percuma"
   - Subheadline: "Paparkan waktu solat JAKIM di TV anda dalam 2 minit"
   - "Mulai Percuma" CTA button
   - Responsive hero image (lazy-loaded)

2. **TierSection** (`apps/tv-display/src/app/landing/TierSection.tsx`)
   - 4 tier cards (Asas, Maju, Gemilang, Istimewa)
   - Material-UI Grid responsive layout (1/2/4 columns based on breakpoint)
   - Feature comparison (max_screens, customization, support level)
   - "Bandingkan Pelan" toggle for comparison table
   - Tier-specific CTAs

3. **ZoneModal** (`apps/tv-display/src/app/landing/ZoneModal.tsx`)
   - "Cari kawasan anda" (Find Your Zone) modal
   - Material-UI Autocomplete for zone selection
   - All 18 zones pre-populated, searchable
   - "Pilih" button routes to display page for selected zone

4. **FAQSection** (`apps/tv-display/src/app/landing/FAQSection.tsx`)
   - Material-UI Accordion with 6+ FAQ items
   - Expandable/collapsible questions and answers
   - Optional search/filter by keyword
   - Bilingual (Bahasa Malaysia / English)

### Services

#### Zone Service (`packages/supabase-client/src/services/zone-service.ts`)

```typescript
fetchAllZones(): Promise<JAKIMZone[]>
  // Return all 18 zones with region grouping

fetchZoneByCode(zone_code: string): Promise<JAKIMZone | null>
  // Return single zone or null

fetchMasjidsByZone(zone_code: string): Promise<Masjid[]>
  // Return mosques for zone (Asas tier only, 1-3 per zone)

searchZones(query: string, language: 'ms' | 'en'): Promise<JAKIMZone[]>
  // Filter zones by partial name match
```

#### Tier Service (`packages/supabase-client/src/services/tier-service.ts`)

```typescript
fetchAllTiers(): Promise<TierPackage[]>
  // Return all 4 tiers (Asas, Maju, Gemilang, Istimewa)

fetchTierById(tierId: string): Promise<TierPackage | null>
  // Return single tier or null

fetchTiersForLanding(): Promise<TierPackage[]>
  // Return tiers sorted by display_order for landing page
```

## Zone Management

### Adding a New Zone

1. **Update Database** (if zone is new to JAKIM):

   ```sql
   INSERT INTO jakim_zones (zone_code, zone_name_ms, zone_name_en, state_ms, state_en, region, masjid_count, is_active)
   VALUES ('new_zone', 'New Zone MS', 'New Zone EN', 'State MS', 'State EN', 'peninsular', 0, true);
   ```

2. **Add Mosques**:

   ```sql
   INSERT INTO masjids (name, zone_code, tier, display_id, prayer_times_source, is_auto_populated, status)
   VALUES ('Mosque Name', 'new_zone', 'asas', uuid_generate_v4(), 'jakim_api', true, 'active');
   ```

3. **Verify Coverage**: Run test to confirm all 18 zones have ≥1 mosque

### Updating Prayer Times

Prayer times are cached for 24 hours until midnight UTC. Cache refresh happens:

1. **On-Demand**: Fresh fetch from JAKIM API when user loads display page
2. **Stale-While-Revalidate**: Serve cached times immediately while fetching fresh in background
3. **Fallback**: If JAKIM API unavailable, serve stale cache with age indicator

**Prayer Times Flow**:

```
User loads /display/[id]
  → fetchPrayerTimes(zone_code) calls zone-service
  → zone-service checks cache (TTL=24h until midnight)
  → If cache valid: return immediately
  → If cache expired or missing: fetch from JAKIM API async
  → If JAKIM API fails: return stale cache + error log
```

**Verify Prayer Times Accuracy**:

```bash
# Daily QA check (recommended: 1am after JAKIM update)
pnpm test:e2e -- prayer-times.spec.ts
# Confirms 99%+ accuracy vs. JAKIM official schedule
```

## Tier Upgrade Flow

### User Upgrade Path

1. **Initiate** (from Asas display):
   - User clicks "Tukar Pelan" button
   - UpgradeModal opens showing all 4 tiers

2. **Select Tier**:
   - Maju: Route to "Hubungi Kami" (contact form / WhatsApp)
   - Gemilang: Route to admin signup / checkout
   - Istimewa: Route to "Hubungi Kami" (sales)

3. **Validate** (backend):
   - Check tier upgrade path (only forward upgrades allowed)
   - Update tier in database
   - Unlock tier-specific features

### Tier Gating

Tier-specific features enforced at 3 layers (defense in depth):

1. **Package Level**: Lower-tier code cannot import admin services (compile-time safety)
2. **Database Level**: RLS policies prevent unauthorized table access (runtime safety)
3. **UI Level**: Components check tier before rendering features (UX safety)

```typescript
// Example: Tier-gating package export
// packages/supabase-client/src/services/admin-service.ts only imported by Gemilang/Istimewa tiers

// apps/tv-display/src/app/display/[id]/page.tsx
if (tier === "asas") {
  // Cannot import AdminDashboard - compile error
  // Cannot query admin tables - RLS policy blocks
  // Admin UI hidden - component skips render
}
```

## FAQ Maintenance

### FAQ Structure

FAQs are stored in i18n JSON files:

```json
// apps/tv-display/src/i18n/locales/ms/faqs.json
{
  "faqs": [
    {
      "id": "tier-diff-asas-maju",
      "question": "Apakah perbezaan antara Free/Asas dan Maju?",
      "answer": "Asas adalah percuma, tanpa pendaftaran. Maju adalah perkhidmatan terurus di mana kami mengendalikan pembaruan kandungan melalui WhatsApp.",
      "category": "tiers",
      "display_order": 1
    },
    ...
  ]
}
```

### Adding New FAQs

1. **Edit i18n JSON**: Add new FAQ object to ms/faqs.json and en/faqs.json
2. **Increment display_order**: Ensure FAQs sort correctly
3. **Test**: Run component test to verify FAQ renders
4. **Deploy**: FAQ updates go live immediately (no build required)

### Translation Guidelines

- **Bahasa Malaysia**: Primary language, natural colloquial phrasing
- **English**: Professional tone, consistent terminology
- **Consistency**: Use same terms for "tier", "screens", "support", etc. across all FAQs

## Performance Optimization

### Target Metrics

- **FCP** (First Contentful Paint): <1.5s
- **LCP** (Largest Contentful Paint): <2.5s
- **CLS** (Cumulative Layout Shift): <0.1
- **Zone Selection Modal**: <500ms open time
- **Prayer Times Fetch**: <200ms from cache, <1s on cold load

### Optimization Techniques

1. **Image Lazy-Loading**: Hero image uses Next.js Image component with priority=false
2. **Code Splitting**: ZoneModal lazy-loaded only on CTA click
3. **API Caching**: Zones cached for 1 hour (fetch once per session)
4. **Database Indexing**: zone_code and tier indexed for fast queries
5. **CSS-in-JS**: Material-UI components optimized for production builds

### Monitor Performance

```bash
# Run Lighthouse audit
pnpm run lighthouse

# Run E2E performance tests
pnpm test:e2e -- --grep="performance|load"

# View Core Web Vitals in production
# Cloudflare Analytics → Web Analytics → Core Web Vitals dashboard
```

## Debugging

### Common Issues

#### Zone Dropdown Shows No Zones

- **Cause**: Database migration not applied or zones not inserted
- **Fix**: Run `supabase db push` and verify jakim_zones table has 18 entries
- **Debug**:
  ```sql
  SELECT COUNT(*) FROM jakim_zones; -- Should be 18
  ```

#### Prayer Times Show Wrong Times

- **Cause**: Zone code mismatch or JAKIM API unavailable
- **Fix**: Verify zone_code lowercase (e.g., "johor" not "Johor")
- **Debug**:
  ```typescript
  const zones = await fetchAllZones();
  console.log(zones.map((z) => z.zone_code)); // Should all be lowercase
  ```

#### "Tier-specific feature unavailable" (Asas tier)

- **Cause**: User on Asas tier attempting to access admin features
- **Fix**: This is correct behavior (tier-gating working). User must upgrade.
- **Debug**: Check RLS policy audit logs in Supabase dashboard

#### Landing Page Load >2s

- **Cause**: Unoptimized images, missing code-splitting, or slow API calls
- **Fix**:
  - Enable image lazy-loading: `priority={false}` on hero Image
  - Code-split ZoneModal: `React.lazy(() => import('./ZoneModal'))`
  - Check Lighthouse audit: `pnpm run lighthouse`
- **Debug**: Chrome DevTools → Network tab → identify slow resources

## Testing

### Unit Tests

```bash
# Test zone service
pnpm test -- zone-service.test.ts

# Test tier service
pnpm test -- tier-service.test.ts
```

### Component Tests

```bash
# Test TierSection
pnpm test -- TierSection.test.tsx

# Test ZoneModal
pnpm test -- ZoneModal.test.tsx
```

### E2E Tests

```bash
# Full landing page flow
pnpm test:e2e -- landing-page.spec.ts

# Zone selection flow
pnpm test:e2e -- zone-selection.spec.ts

# Prayer times accuracy
pnpm test:e2e -- prayer-times.spec.ts
```

### Test Coverage

Run coverage report:

```bash
pnpm test -- --coverage

# Target: >80% coverage for services, >70% for components
```

## Deployment

### Staging (dev branch)

1. **Merge to dev branch** from feature branch
2. **Database**: Staging Supabase runs migrations automatically
3. **Deploy**: Cloudflare Pages builds and deploys on merge
4. **Test**: Run E2E tests against staging environment

```bash
# Test staging deployment
NEXT_PUBLIC_SUPABASE_URL=https://staging-db.supabase.co \
pnpm test:e2e -- --baseURL=https://tv-display-staging.pages.dev
```

### Production (main branch)

1. **Create pull request** from dev → main
2. **Code review**: All changes reviewed before merge
3. **Merge to main** branch
4. **Database**: Supabase CLI pushes migrations to production linked database
5. **Deploy**: Cloudflare Pages builds production build

```bash
# Verify production deployment
NEXT_PUBLIC_SUPABASE_URL=https://prod-db.supabase.co \
pnpm test:e2e -- --baseURL=https://tv-display.pages.dev
```

## Support

For issues or questions:

1. **Check this guide** first (Debugging section)
2. **Check spec.md** for feature requirements
3. **Check tasks.md** for implementation tasks
4. **Check conversation summary** in codebase for design decisions
5. **File an issue** on GitHub with steps to reproduce

---

**Last Updated**: 2026-07-16  
**Maintained By**: Development Team  
**Feature Branch**: `007-tv-landing-tiers`
