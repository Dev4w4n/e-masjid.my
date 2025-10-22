# TV Display Configuration Architecture

## 🎯 Design Philosophy

The TV Display app follows a **database-first configuration approach**, where all display-specific settings are stored in and fetched from the database, not from environment variables.

## 🏗️ Architecture

### Configuration Source: Database (via display_id)

```
URL: http://localhost:3001/display/{display_id}
                                        ↓
                            API: /api/displays/{display_id}/config
                                        ↓
                            Database: tv_displays table
                                        ↓
                            Returns: Complete display configuration
```

### What Gets Fetched from Database

All display-specific configuration comes from the `tv_displays` table:

- **Masjid Information**: `masjid_id`, location, timezone
- **Display Settings**:
  - `carousel_interval` - Time between content items
  - `content_transition_type` - Fade, slide, zoom, etc.
  - `resolution`, `orientation`
  - `show_debug_info`
- **Prayer Times Configuration**:
  - `prayer_time_position` - Where to display
  - `prayer_time_font_size`, `prayer_time_color`
  - `prayer_time_layout`, `prayer_time_alignment`
  - `jakim_zone` (from related masjid)
- **Content Settings**:
  - `max_content_items`
  - `show_sponsorship_amounts`
  - `sponsorship_tier_colors`
- **And more...**

## 📁 Environment Variables (Infrastructure Only)

The `.env.local` file for TV Display contains **ONLY infrastructure configuration**:

```bash
# ✅ REQUIRED: API Connection
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# ✅ REQUIRED: App Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development

# ✅ OPTIONAL: Development Flags
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
NEXT_PUBLIC_SHOW_LOGGER=true
```

### ❌ What's NOT in Environment Variables

These are **dynamically fetched per display**:

```bash
# ❌ REMOVED - Gets from database
NEXT_PUBLIC_DISPLAY_NAME=...
NEXT_PUBLIC_MASJID_ID=...
NEXT_PUBLIC_PRAYER_LOCATION=...
NEXT_PUBLIC_PRAYER_ZONE=...
NEXT_PUBLIC_FULLSCREEN_MODE=...
NEXT_PUBLIC_KIOSK_MODE=...
NEXT_PUBLIC_CAROUSEL_INTERVAL=...
```

## 🔄 How It Works

### 1. TV Display Page Loads

```typescript
// apps/tv-display/src/app/display/[id]/page.tsx

// Extract display ID from URL
const displayId = params.id as string;

// Fetch configuration from database
const response = await fetch(`/api/displays/${displayId}/config`);
const config = await response.json();

// Use config to render the display
<ContentCarousel carouselInterval={config.carousel_interval} />
<PrayerTimesOverlay position={config.prayer_time_position} />
```

### 2. API Endpoint Returns Database Config

```typescript
// apps/tv-display/src/app/api/displays/[id]/config/route.ts

export async function GET(request: NextRequest, { params }) {
  const displayId = params.id;

  // Fetch from database
  const { data: display } = await supabase
    .from("tv_displays")
    .select(
      `
      *,
      masjids (
        id,
        name,
        jakim_zone,
        address
      )
    `
    )
    .eq("id", displayId)
    .single();

  return NextResponse.json({ data: display });
}
```

### 3. Real-Time Updates

When configuration changes in the Hub app:

```typescript
// Hub app updates database
await supabase
  .from("tv_displays")
  .update({ carousel_interval: 15 })
  .eq("id", displayId);

// ⚡ Real-time subscription triggers
// TV Display receives update via WebSocket
// Automatically refetches config from API
// UI updates within 1 second!
```

## 💡 Benefits of This Architecture

### 1. **Multi-Tenant Support**

- Each display has unique settings
- No hardcoded configuration
- Easy to manage hundreds of displays

### 2. **Real-Time Updates**

- Change settings in Hub app
- TV displays update instantly (<1 second)
- No need to restart or redeploy

### 3. **Centralized Management**

- All configuration in one place (database)
- Hub app provides UI for management
- No need to edit env files per display

### 4. **Flexibility**

- Different mosques can have different settings
- Test displays vs production displays
- Easy to clone/duplicate displays

### 5. **Scalability**

- Add new displays without code changes
- Configuration changes don't require deployment
- Works with any number of displays

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Don't Add Display Config to .env

```bash
# ❌ WRONG - This ties all displays to same config
NEXT_PUBLIC_MASJID_ID=abc-123
NEXT_PUBLIC_CAROUSEL_INTERVAL=10
```

### ❌ Don't Hardcode Display Settings

```typescript
// ❌ WRONG - Hardcoded values
const carouselInterval = 10; // seconds

// ✅ RIGHT - From database
const carouselInterval = config.carousel_interval;
```

### ❌ Don't Use Same Display ID for Multiple TVs

```typescript
// ❌ WRONG - All displays share same URL
http://localhost:3001/display/default

// ✅ RIGHT - Each display has unique ID
http://localhost:3001/display/abc-123
http://localhost:3001/display/xyz-789
```

## 🧪 Testing Different Configurations

### Scenario: Test Two Different Mosque Displays

```bash
# Display 1: Masjid A (English, 15s carousel)
http://localhost:3001/display/display-1-id

# Display 2: Masjid B (Malay, 10s carousel)
http://localhost:3001/display/display-2-id
```

Both displays share the same codebase but have different configurations from the database!

## 📊 Configuration Flow Diagram

```
Hub App (Admin)
       ↓
   Updates Database
       ↓
   tv_displays table
       ↓
   Real-time Broadcast (<1s)
       ↓
   TV Display App
       ↓
   Fetches via API
       ↓
   Renders with Config
```

## 🔧 Development Workflow

### Adding New Display in Hub App

1. Navigate to TV Display management
2. Click "Add New Display"
3. Fill in configuration (masjid, settings, etc.)
4. Save to database
5. Get generated `display_id`
6. Open URL: `http://localhost:3001/display/{display_id}`
7. TV Display renders with saved configuration!

### Updating Display Settings

1. Open Hub App
2. Edit display settings
3. Save changes
4. TV Display updates automatically (<1 second)
5. No restart or code changes needed!

## 📝 Migration from Env-Based Config

If you previously had env-based configuration:

### Before (❌ Old Way)

```bash
# .env.local
NEXT_PUBLIC_MASJID_ID=abc-123
NEXT_PUBLIC_CAROUSEL_INTERVAL=10
```

```typescript
// Code
const masjidId = process.env.NEXT_PUBLIC_MASJID_ID;
const interval = process.env.NEXT_PUBLIC_CAROUSEL_INTERVAL;
```

### After (✅ New Way)

```bash
# .env.local (only infrastructure)
NEXT_PUBLIC_SUPABASE_URL=http://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

```typescript
// Code
const displayId = params.id; // from URL
const config = await fetch(`/api/displays/${displayId}/config`);
const masjidId = config.masjid_id;
const interval = config.carousel_interval;
```

## 🎓 Key Takeaways

1. **Display ID in URL** → Determines all configuration
2. **Database is Source of Truth** → Not environment variables
3. **API Endpoint** → Fetches configuration on demand
4. **Real-Time Updates** → Changes propagate instantly
5. **Infrastructure Only in .env** → API URLs, keys, etc.

## 📚 Related Documentation

- **Real-Time Updates**: `docs/REALTIME-UPDATES-IMPLEMENTATION.md`
- **TV Display API**: `apps/tv-display/src/app/api/displays/[id]/config/route.ts`
- **Display Configuration**: `supabase/migrations/007_create_tv_display_tables.sql`

---

**Last Updated**: October 17, 2025  
**Architecture Status**: ✅ Implemented  
**Configuration Source**: Database (via display_id)
