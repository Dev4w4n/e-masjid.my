# Cross-App URL Configuration Fix

## Problem

On staging and production, clicking "Lihat Butiran" in the Hub app and "Lihat Paparan" in the Public app was opening localhost URLs instead of the correct staging/production URLs.

## Root Cause

Missing environment variables for cross-app navigation:

- Hub app was missing `VITE_PUBLIC_APP_URL` and `VITE_TV_DISPLAY_BASE_URL`
- Public app configuration was correct but templates weren't updated
- `getPublicUrl()` function in shared-types didn't support Vite environments

## Solution

### 1. Updated Environment Templates

**Staging (`deployment/env-templates/staging.env`)**:

```bash
# Hub App - Added cross-app URLs
VITE_PUBLIC_APP_URL=https://public-emasjid-staging.pages.dev
VITE_TV_DISPLAY_BASE_URL=https://tv-emasjid-staging.pages.dev/display

# Papan Info App - Added cross-app URLs
NEXT_PUBLIC_HUB_URL=https://hub-emasjid-staging.pages.dev
NEXT_PUBLIC_TV_DISPLAY_URL=https://tv-emasjid-staging.pages.dev/display
```

**Production (`deployment/env-templates/production.env`)**:

```bash
# Hub App - Added cross-app URLs
VITE_PUBLIC_APP_URL=https://public-emasjid-production.pages.dev
VITE_TV_DISPLAY_BASE_URL=https://tv-emasjid-production.pages.dev/display

# Papan Info App - Added cross-app URLs
NEXT_PUBLIC_HUB_URL=https://hub-emasjid-production.pages.dev
NEXT_PUBLIC_TV_DISPLAY_URL=https://tv-emasjid-production.pages.dev/display
```

### 2. Created Hub App .env.example

Created `apps/hub/.env.example` with:

```bash
# Cross-App Navigation URLs
VITE_PUBLIC_APP_URL=http://localhost:3002
VITE_TV_DISPLAY_BASE_URL=http://localhost:3001/display
```

### 3. Updated shared-types/config.ts

Modified `getPublicUrl()` to support Vite environments:

```typescript
export function getPublicUrl(): string {
  // For browser environments
  if (typeof window !== "undefined") {
    // Vite app (hub) - uses VITE_ prefix
    const viteUrl = getViteEnv("VITE_PUBLIC_APP_URL");
    if (viteUrl) {
      return viteUrl;
    }

    // Next.js app (public/tv-display) - uses NEXT_PUBLIC_ prefix
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
  }

  // For server environments
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.VITE_PUBLIC_APP_URL) {
      return process.env.VITE_PUBLIC_APP_URL;
    }
  }

  return "http://localhost:3002";
}
```

### 4. Updated Hub App MasjidList.tsx

Changed from hardcoded environment variable to helper function:

```typescript
// Before
href={`${import.meta.env.VITE_PUBLIC_APP_URL || "http://localhost:3002"}/masjid/${masjid.id}`}

// After
import { getPublicUrl } from "@masjid-suite/shared-types";
href={`${getPublicUrl()}/masjid/${masjid.id}`}
```

## Deployment Checklist

### For Staging Deployment

1. **Cloudflare Pages - Hub App** (hub-emasjid-staging.pages.dev):

   ```bash
   VITE_PUBLIC_APP_URL=https://public-emasjid-staging.pages.dev
   VITE_TV_DISPLAY_BASE_URL=https://tv-emasjid-staging.pages.dev/display
   ```

2. **Cloudflare Pages - Papan Info App** (public-emasjid-staging.pages.dev):

   ```bash
   NEXT_PUBLIC_HUB_URL=https://hub-emasjid-staging.pages.dev
   NEXT_PUBLIC_TV_DISPLAY_URL=https://tv-emasjid-staging.pages.dev/display
   ```

3. **Cloudflare Pages - TV Display App** (tv-emasjid-staging.pages.dev):
   ```bash
   # No changes needed - TV app doesn't navigate to other apps
   ```

### For Production Deployment

1. **Cloudflare Pages - Hub App** (hub.emasjid.my):

   ```bash
   VITE_PUBLIC_APP_URL=https://emasjid.my
   VITE_TV_DISPLAY_BASE_URL=https://tv.emasjid.my/display
   ```

2. **Cloudflare Pages - Papan Info App** (emasjid.my):

   ```bash
   NEXT_PUBLIC_HUB_URL=https://hub.emasjid.my
   NEXT_PUBLIC_TV_DISPLAY_URL=https://tv.emasjid.my/display
   ```

3. **Cloudflare Pages - TV Display App** (tv.emasjid.my):
   ```bash
   # No changes needed - TV app doesn't navigate to other apps
   ```

## Testing Verification

### Hub App (localhost:3000 or hub-emasjid-staging.pages.dev)

1. Go to "Senarai Masjid" page
2. Click "Lihat Butiran" on any masjid card
3. Should open Papan Info App URL with correct domain (not localhost)

### Papan Info App (localhost:3002 or public-emasjid-staging.pages.dev)

1. Go to any masjid detail page `/masjid/[id]`
2. Scroll to "Paparan TV" section
3. Click "Lihat Paparan" link
4. Should open TV Display URL with correct domain (not localhost)

### TV Display App

No changes needed - this app doesn't navigate to other apps

## Files Modified

1. `/deployment/env-templates/staging.env` - Added cross-app URLs
2. `/deployment/env-templates/production.env` - Added cross-app URLs
3. `/apps/hub/.env.example` - Created with cross-app navigation variables
4. `/packages/shared-types/src/config.ts` - Updated `getPublicUrl()` for Vite support
5. `/apps/hub/src/pages/masjid/MasjidList.tsx` - Use helper function instead of direct env var

## Related Documentation

- See `/docs/TV-DISPLAY-URL-CONFIGURATION.md` for TV display URL configuration
- See `/deployment/ENVIRONMENT-VARIABLES.md` for full environment variable reference
