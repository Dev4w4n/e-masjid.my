# Data Model: TV Landing Page with Tiered Package Marketing

**Phase**: 1 (Design & Contracts)  
**Created**: 2026-07-16  
**Feature**: [007-tv-landing-tiers/spec.md](spec.md)  
**Research**: [research.md](research.md)

## Entity Definitions

### 1. JAKIMZone (Database Entity)

**Purpose**: Represents official prayer time zones in Malaysia per JAKIM standards

**Attributes**:

- `zone_code` (string, PK): Official JAKIM zone identifier (e.g., "johor", "kedah", "negeri_sembilan")
- `zone_name` (string): Display name in Bahasa Malaysia (e.g., "Johor", "Kedah")
- `state` (string): State name in Bahasa Malaysia (e.g., "Johor", "Sabah")
- `region` (enum): Geographic region ('peninsular' | 'sabah' | 'sarawak')
- `masjid_count` (integer): Count of mosques in this zone (denormalized for UI)
- `is_active` (boolean): Whether zone is currently accepting new mosques
- `created_at` (timestamp): Record creation time
- `updated_at` (timestamp): Last update time

**Relationships**:

- One JAKIMZone → Many Masjids (one-to-many via `masjid.zone_code`)

**Validation Rules**:

- `zone_code` must be unique, lowercase, no spaces
- `zone_name` and `state` must be non-empty Bahasa Malaysia strings
- `region` must be one of the enum values
- `masjid_count` >= 0

**State Transitions**:

- New zone created by admin (is_active = true)
- Zone deactivated if JAKIM announces closure (is_active = false)
- Masjid count auto-incremented/decremented when masjids are added/removed

---

### 2. TierPackage (Domain Model, not in database)

**Purpose**: Defines the 4 pricing tiers and their features (Asas/Maju/Gemilang/Istimewa)

**Attributes**:

- `id` (enum): 'asas' | 'maju' | 'gemilang' | 'istimewa'
- `name_ms` (string): Bahasa Malaysia name (e.g., "Asas (Percuma)")
- `name_en` (string): English name (e.g., "Asas (Free)")
- `description_ms` (string): Bahasa Malaysia description (marketing blurb)
- `description_en` (string): English description
- `price_bnd` (string | null): Price range in Bahasa Malaysia (e.g., "Percuma", "RM ~75", "Hubungi untuk sebut harga")
- `price_en` (string | null): Price range in English (e.g., "Free", "RM ~75", "Contact for quote")
- `max_screens` (integer | null): Maximum number of display screens (null = unlimited)
- `requires_login` (boolean): Whether staff login is required to access features
- `requires_admin_dashboard` (boolean): Whether tier includes admin dashboard access
- `customization_type` (enum): 'none' | 'managed_service' | 'self_service'
- `support_level` (enum): 'basic' | 'standard' | 'priority'
- `features` (array): List of feature keys (e.g., ["official_prayer_times", "default_background", "custom_messages_via_whatsapp"])

**Example Data** (Asas tier):

```json
{
  "id": "asas",
  "name_ms": "Asas (Percuma)",
  "name_en": "Asas (Free)",
  "description_ms": "Sahaja TV Masjid mudah dan percuma – paparkan waktu solat JAKIM di TV anda dalam 2 minit tanpa pendaftaran...",
  "description_en": "Simple, free Sahaja TV – display official JAKIM prayer times on your TV in 2 minutes without registration...",
  "price_bnd": "Percuma",
  "price_en": "Free",
  "max_screens": 1,
  "requires_login": false,
  "requires_admin_dashboard": false,
  "customization_type": "none",
  "support_level": "basic",
  "features": ["official_prayer_times", "default_background", "jakim_zones"]
}
```

**Relationships**:

- TierPackage → Many Masjids (logical; not direct FK; determined by masjid.tier field)

**Validation Rules**:

- `id` must be unique and one of enum values
- Descriptions must be non-empty
- `max_screens`: null (unlimited) or integer >= 1
- `customization_type` must be one of enum values
- `support_level` must be one of enum values

---

### 3. Masjid (Database Entity)

**Purpose**: Represents a mosque with its tier level, display configuration, and prayer time schedule

**Attributes**:

- `id` (UUID, PK): Unique identifier for this masjid record
- `name` (string): Name of the mosque in Bahasa Malaysia
- `zone_code` (string, FK): Reference to JAKIMZone.zone_code
- `tier` (enum): Current tier level ('asas' | 'maju' | 'gemilang' | 'istimewa')
- `display_id` (UUID, unique): Public-facing identifier for `/display/[display_id]` route
- `prayer_times_source` (enum): 'jakim_api' | 'custom' | 'imported'
- `custom_name_ms` (string, nullable): Custom mosque name (for paid tiers)
- `custom_name_en` (string, nullable): Custom mosque name in English
- `is_auto_populated` (boolean): Whether this was created by database seed migration (for filtering)
- `owner_id` (UUID, nullable, FK → auth.users): User who owns this masjid entry (null for auto-populated)
- `status` (enum): 'active' | 'inactive' | 'archived'
- `created_at` (timestamp): Record creation time
- `updated_at` (timestamp): Last update time

**Relationships**:

- Masjid.zone_code → JAKIMZone.zone_code (foreign key)
- Masjid.owner_id → auth.users.id (foreign key, optional)
- Masjid → Display (one-to-one via display_id)

**Validation Rules**:

- `id` and `display_id` must be unique UUIDs
- `name` must be non-empty
- `zone_code` must exist in JAKIMZone table
- `tier` must be one of enum values
- `prayer_times_source` must be one of enum values
- `status` must be one of enum values
- `is_auto_populated` = true for all seed-migrated entries

**State Transitions**:

- On creation: status = 'active' (unless manually archived)
- Tier upgrade: tier changes (e.g., 'asas' → 'maju'), features unlock
- Tier downgrade: tier changes, custom content may be archived

---

### 4. Display (Database Entity)

**Purpose**: Configuration and state for a live display on a TV screen

**Attributes**:

- `id` (UUID, PK): Same as masjid.display_id (one-to-one relationship)
- `masjid_id` (UUID, FK): Reference to Masjid.id
- `zone_code` (string, FK): Reference to JAKIMZone.zone_code (denormalized for query performance)
- `tier` (enum): Current tier (inherited from masjid.tier at display load)
- `prayer_times` (JSON): Cached prayer times for today (refreshed every 24h or on-demand)
  ```json
  {
    "date": "2026-07-16",
    "fajr": "05:32",
    "sunrise": "06:52",
    "zuhr": "12:54",
    "asr": "16:25",
    "maghrib": "18:54",
    "isha": "20:05"
  }
  ```
- `custom_content` (JSON, nullable): Custom background, messages, images (for paid tiers)
- `screen_orientation` (enum): 'portrait' | 'landscape' (for responsive rendering)
- `refresh_interval_seconds` (integer): How often to refresh prayer times (default 3600 = 1 hour)
- `status` (enum): 'active' | 'inactive' | 'error'
- `last_accessed_at` (timestamp): Last time display was viewed (for analytics)
- `last_prayer_times_refresh_at` (timestamp): Last time prayer times were fetched
- `created_at` (timestamp): Record creation time
- `updated_at` (timestamp): Last update time

**Relationships**:

- Display.masjid_id → Masjid.id (foreign key)
- Display.zone_code → JAKIMZone.zone_code (foreign key, denormalized)

**Validation Rules**:

- `id` must be unique UUID
- `masjid_id` must exist in Masjid table
- `zone_code` must exist in JAKIMZone table and match masjid.zone_code
- `prayer_times` is valid JSON with required prayer keys
- `custom_content` is valid JSON (if not null)
- `screen_orientation` must be one of enum values
- `refresh_interval_seconds` >= 300 (minimum 5 minutes)
- `status` must be one of enum values

---

## Database Schema Overview

```sql
-- JAKIMZone table
CREATE TABLE jakim_zones (
  zone_code VARCHAR(50) PRIMARY KEY,
  zone_name VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL CHECK (region IN ('peninsular', 'sabah', 'sarawak')),
  masjid_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Masjid table (extends existing display_content table or new masjids table)
CREATE TABLE masjids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  zone_code VARCHAR(50) NOT NULL REFERENCES jakim_zones(zone_code),
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('asas', 'maju', 'gemilang', 'istimewa')),
  display_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  prayer_times_source VARCHAR(50) NOT NULL,
  custom_name_ms VARCHAR(255),
  custom_name_en VARCHAR(255),
  is_auto_populated BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Display table
CREATE TABLE displays (
  id UUID PRIMARY KEY,
  masjid_id UUID NOT NULL REFERENCES masjids(id),
  zone_code VARCHAR(50) NOT NULL REFERENCES jakim_zones(zone_code),
  tier VARCHAR(50) NOT NULL,
  prayer_times JSONB,
  custom_content JSONB,
  screen_orientation VARCHAR(50) DEFAULT 'landscape',
  refresh_interval_seconds INT DEFAULT 3600,
  status VARCHAR(50) DEFAULT 'active',
  last_accessed_at TIMESTAMP,
  last_prayer_times_refresh_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES masjids(display_id)
);

-- RLS Policies
-- Anonymous users can read all Asas tier displays
ALTER TABLE displays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read for asas tier" ON displays
  FOR SELECT TO anon USING (tier = 'asas');
```

## Type Definitions (TypeScript)

```typescript
// packages/shared-types/src/tier.ts
export type TierId = "asas" | "maju" | "gemilang" | "istimewa";
export type CustomizationType = "none" | "managed_service" | "self_service";
export type SupportLevel = "basic" | "standard" | "priority";
export type Region = "peninsular" | "sabah" | "sarawak";

export interface TierPackage {
  id: TierId;
  name_ms: string;
  name_en: string;
  description_ms: string;
  description_en: string;
  price_bnd: string | null;
  price_en: string | null;
  max_screens: number | null;
  requires_login: boolean;
  requires_admin_dashboard: boolean;
  customization_type: CustomizationType;
  support_level: SupportLevel;
  features: string[];
}

export interface JAKIMZone {
  zone_code: string;
  zone_name: string;
  state: string;
  region: Region;
  masjid_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Masjid {
  id: string;
  name: string;
  zone_code: string;
  tier: TierId;
  display_id: string;
  prayer_times_source: string;
  custom_name_ms?: string;
  custom_name_en?: string;
  is_auto_populated: boolean;
  owner_id?: string;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
}

export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Display {
  id: string;
  masjid_id: string;
  zone_code: string;
  tier: TierId;
  prayer_times: PrayerTimes | null;
  custom_content: Record<string, any> | null;
  screen_orientation: "portrait" | "landscape";
  refresh_interval_seconds: number;
  status: "active" | "inactive" | "error";
  last_accessed_at: string | null;
  last_prayer_times_refresh_at: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Data Flow

### User Zone Selection Flow

```
User clicks "Cari kawasan anda"
  ↓
Zone selection modal opens + fetches JAKIMZone list
  ↓
User selects zone → UI queries Masjid table for first asas-tier entry in zone
  ↓
Masjid.display_id returned → UI routes to /display/[display_id]
  ↓
Display page fetches Display record + prayer times from JAKIM API
  ↓
Prayer times rendered with zone's background + layout
```

### Prayer Times Update Flow

```
Display page loads
  ↓
Check Display.last_prayer_times_refresh_at
  ↓
If > 24h old, fetch from prayer-times package (JAKIM API)
  ↓
Cache in Display.prayer_times (JSONB)
  ↓
Render to user
  ↓
(Real-time updates via Supabase Real-time subscription if available)
```

---

## Assumptions & Constraints

1. **JAKIM Zone Codes**: Assumed 16+ zones for Peninsular Malaysia, 2 for Sabah/Sarawak (18 total). Zone codes are stable and unlikely to change.
2. **Prayer Times Accuracy**: JAKIM API returns times in HH:MM format; no timezone conversion needed (all zones in Malaysia Standard Time).
3. **Masjid Naming**: Auto-populated mosques use Bahasa Malaysia names; custom names (for paid tiers) can be in either language.
4. **Display IDs**: UUIDs are immutable; `/display/[display_id]` is the public URL that never changes (important for bookmarking).
5. **RLS Policies**: All anonymous users can access Asas tier displays; no subscription/license checking required.
6. **Scaling**: Initial seed = 1-3 mosques per zone (50-100 total). If growth exceeds 10k mosques, consider partitioning or caching strategies.
