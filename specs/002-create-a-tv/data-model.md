# Data Model: Masjid Digital Display TV App

**Date**: September 18, 2025  
**Feature**: TV Display App  
**Integration**: Extends existing Supabase schema

## Core Entities

### 1. Display Content Item

**Purpose**: Individual content pieces for the carousel display  
**Storage**: New `masjid_display_content` table

```typescript
interface DisplayContentItem {
  id: string; // UUID primary key
  masjid_id: string; // FK to masjids table
  title: string; // Content title (Bahasa Malaysia)
  content_type: "youtube" | "image";
  content_url: string; // YouTube URL or image URL
  sponsorship_amount: number; // Malaysian Ringgit (RM)
  display_duration?: number; // Seconds (for images only)
  status: "active" | "inactive" | "pending_approval";
  approved_by?: string; // FK to users table
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;

  // Computed fields
  ranking_score: number; // Based on sponsorship_amount
  is_visible: boolean; // Top 10 ranking check
}
```

**Validation Rules**:

- `content_url` must be valid YouTube URL or image URL
- `sponsorship_amount` must be positive number
- `display_duration` required for image content, null for YouTube
- Only approved content can be displayed
- Maximum 10 items displayed per masjid (top ranking)

**Relationships**:

- Belongs to one Masjid (existing table)
- Approved by one User (existing table)

### 2. Display Settings

**Purpose**: Masjid-specific display configuration  
**Storage**: New `masjid_display_settings` table

```typescript
interface DisplaySettings {
  id: string; // UUID primary key
  masjid_id: string; // FK to masjids table (unique)
  prayer_times_position: "top" | "bottom" | "left" | "right" | "center";
  prayer_times_visible: boolean;
  carousel_transition_duration: number; // Seconds between items
  default_image_duration: number; // Seconds for image display
  offline_message: string; // Bahasa Malaysia
  created_at: Date;
  updated_at: Date;
}
```

**Default Values**:

- `prayer_times_position`: 'bottom'
- `prayer_times_visible`: true
- `carousel_transition_duration`: 10 seconds
- `default_image_duration`: 8 seconds
- `offline_message`: 'Menunggu sambungan internet...'

**Validation Rules**:

- One setting record per masjid
- Transition duration between 5-60 seconds
- Image duration between 3-30 seconds

### 3. Prayer Time Schedule

**Purpose**: Cached prayer times from JAKIM API  
**Storage**: New `prayer_times_cache` table

```typescript
interface PrayerTimeSchedule {
  id: string; // UUID primary key
  zone_code: string; // Malaysian prayer time zone
  prayer_date: Date; // Date for these prayer times
  subuh: string; // Time in HH:MM format
  syuruk: string; // Time in HH:MM format
  zohor: string; // Time in HH:MM format
  asar: string; // Time in HH:MM format
  maghrib: string; // Time in HH:MM format
  isyak: string; // Time in HH:MM format
  hijri_date: string; // Hijri calendar date
  cached_at: Date; // When data was cached
  expires_at: Date; // Cache expiration
}
```

**Validation Rules**:

- Times must be in valid HH:MM format
- `prayer_date` must be current or future date
- Cache expires after 24 hours
- Zone code must be valid Malaysian zone

**Indexes**:

- Unique index on (zone_code, prayer_date)
- Index on expires_at for cleanup

### 4. Masjid Extensions

**Purpose**: Add prayer time zone to existing masjid table  
**Storage**: Extend existing `masjids` table

```sql
-- Add new column to existing masjids table
ALTER TABLE masjids ADD COLUMN prayer_zone_code VARCHAR(10);
```

```typescript
// Extended Masjid interface
interface MasjidWithDisplayData extends Masjid {
  prayer_zone_code?: string; // Malaysian prayer time zone code
  display_settings?: DisplaySettings;
  display_content?: DisplayContentItem[];
}
```

**Zone Code Examples**:

- 'JHR01' - Johor Bahru, Kota Tinggi, Mersing
- 'KUL01' - Kuala Lumpur, Putrajaya
- 'SGR01' - Selangor (Gombak, Petaling, etc.)

## Database Schema Changes

### New Tables

```sql
-- Display content items
CREATE TABLE masjid_display_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    masjid_id UUID NOT NULL REFERENCES masjids(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('youtube', 'image')),
    content_url TEXT NOT NULL,
    sponsorship_amount DECIMAL(10,2) NOT NULL CHECK (sponsorship_amount >= 0),
    display_duration INTEGER CHECK (display_duration > 0),
    status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Display settings per masjid
CREATE TABLE masjid_display_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    masjid_id UUID NOT NULL UNIQUE REFERENCES masjids(id) ON DELETE CASCADE,
    prayer_times_position VARCHAR(10) DEFAULT 'bottom' CHECK (prayer_times_position IN ('top', 'bottom', 'left', 'right', 'center')),
    prayer_times_visible BOOLEAN DEFAULT true,
    carousel_transition_duration INTEGER DEFAULT 10 CHECK (carousel_transition_duration BETWEEN 5 AND 60),
    default_image_duration INTEGER DEFAULT 8 CHECK (default_image_duration BETWEEN 3 AND 30),
    offline_message TEXT DEFAULT 'Menunggu sambungan internet...',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer times cache
CREATE TABLE prayer_times_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_code VARCHAR(10) NOT NULL,
    prayer_date DATE NOT NULL,
    subuh TIME NOT NULL,
    syuruk TIME NOT NULL,
    zohor TIME NOT NULL,
    asar TIME NOT NULL,
    maghrib TIME NOT NULL,
    isyak TIME NOT NULL,
    hijri_date VARCHAR(50),
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(zone_code, prayer_date)
);

-- Add prayer zone to existing masjids table
ALTER TABLE masjids ADD COLUMN prayer_zone_code VARCHAR(10);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_display_content_masjid ON masjid_display_content(masjid_id);
CREATE INDEX idx_display_content_ranking ON masjid_display_content(masjid_id, sponsorship_amount DESC, status);
CREATE INDEX idx_prayer_cache_zone_date ON prayer_times_cache(zone_code, prayer_date);
CREATE INDEX idx_prayer_cache_expires ON prayer_times_cache(expires_at);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on new tables
ALTER TABLE masjid_display_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE masjid_display_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times_cache ENABLE ROW LEVEL SECURITY;

-- Policies for display content
CREATE POLICY "Display content visible to masjid admins" ON masjid_display_content
    FOR ALL USING (
        masjid_id IN (
            SELECT masjid_id FROM masjid_admins
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Policies for display settings
CREATE POLICY "Display settings accessible to masjid admins" ON masjid_display_settings
    FOR ALL USING (
        masjid_id IN (
            SELECT masjid_id FROM masjid_admins
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Prayer times cache is public (read-only for TV app)
CREATE POLICY "Prayer times cache public read" ON prayer_times_cache
    FOR SELECT USING (true);
```

## API Contract Requirements

### Content Ranking Query

```sql
-- Get top 10 content items by sponsorship for TV display
SELECT
    id, title, content_type, content_url,
    display_duration, sponsorship_amount
FROM masjid_display_content
WHERE masjid_id = $1
    AND status = 'active'
ORDER BY sponsorship_amount DESC, created_at ASC
LIMIT 10;
```

### Prayer Times Query

```sql
-- Get today's prayer times for a zone
SELECT
    subuh, syuruk, zohor, asar, maghrib, isyak, hijri_date
FROM prayer_times_cache
WHERE zone_code = $1
    AND prayer_date = CURRENT_DATE
    AND expires_at > NOW();
```

## Data Relationships

```
Masjid (existing)
├── prayer_zone_code (new field)
├── DisplaySettings (1:1, new table)
└── DisplayContent[] (1:many, new table)
    └── approved_by → User (existing)

PrayerTimesCache (new table)
└── zone_code → Masjid.prayer_zone_code (reference)
```

## Migration Strategy

1. **Phase 1**: Add new tables and prayer_zone_code column
2. **Phase 2**: Populate default display settings for existing masjids
3. **Phase 3**: Set prayer zone codes based on masjid addresses
4. **Phase 4**: Enable RLS policies and test permissions
5. **Phase 5**: Implement prayer times caching background job

## Performance Considerations

- **Content Ranking**: Indexed by (masjid_id, sponsorship_amount DESC)
- **Prayer Times**: Cached for 24 hours, indexed by zone and date
- **Real-time Updates**: Supabase subscription on content table changes
- **Cleanup Job**: Remove expired prayer times cache daily
