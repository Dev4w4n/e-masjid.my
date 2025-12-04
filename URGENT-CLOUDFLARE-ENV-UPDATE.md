# Urgent: Cloudflare Environment Variables Update

## Problem

Staging and production apps are opening localhost URLs when navigating between apps.

## Required Actions

### 🔴 STAGING - Immediate Action Required

Go to Cloudflare Pages dashboard and add these environment variables:

#### 1. Hub App (hub-emasjid-staging.pages.dev)

```
VITE_PUBLIC_APP_URL=https://public-emasjid-staging.pages.dev
VITE_TV_DISPLAY_BASE_URL=https://tv-emasjid-staging.pages.dev/display
```

#### 2. Public App (public-emasjid-staging.pages.dev)

```
NEXT_PUBLIC_HUB_URL=https://hub-emasjid-staging.pages.dev
NEXT_PUBLIC_TV_DISPLAY_URL=https://tv-emasjid-staging.pages.dev/display
```

### 🟡 PRODUCTION - Plan Before Launch

When ready for production deployment:

#### 1. Hub App (hub.emasjid.my or hub-emasjid-production.pages.dev)

```
VITE_PUBLIC_APP_URL=https://emasjid.my
VITE_TV_DISPLAY_BASE_URL=https://tv.emasjid.my/display
```

#### 2. Public App (emasjid.my or public-emasjid-production.pages.dev)

```
NEXT_PUBLIC_HUB_URL=https://hub.emasjid.my
NEXT_PUBLIC_TV_DISPLAY_URL=https://tv.emasjid.my/display
```

## Steps in Cloudflare Dashboard

1. Go to Cloudflare Pages dashboard
2. Select the project (e.g., "hub-emasjid-staging")
3. Go to "Settings" → "Environment variables"
4. Click "Add variable"
5. Add each variable with the exact name and value
6. Click "Save"
7. **Important**: Redeploy the app for changes to take effect
   - Go to "Deployments"
   - Click "..." on latest deployment
   - Click "Retry deployment"

## Verification After Update

### Test Hub App

1. Visit hub-emasjid-staging.pages.dev
2. Go to "Senarai Masjid"
3. Click "Lihat Butiran" on any masjid
4. ✅ Should open: `https://public-emasjid-staging.pages.dev/masjid/[id]`
5. ❌ Should NOT open: `http://localhost:3002/masjid/[id]`

### Test Public App

1. Visit public-emasjid-staging.pages.dev/masjid/[any-id]
2. Scroll to "Paparan TV" section
3. Click "Lihat Paparan"
4. ✅ Should open: `https://tv-emasjid-staging.pages.dev/display/[id]`
5. ❌ Should NOT open: `http://localhost:3001/display/[id]`

## Why This Happened

The environment templates were missing cross-app navigation URLs. The code was falling back to localhost defaults when these variables weren't set.

## What Was Fixed in Code

1. ✅ Added missing variables to `/deployment/env-templates/staging.env`
2. ✅ Added missing variables to `/deployment/env-templates/production.env`
3. ✅ Created `/apps/hub/.env.example` with proper documentation
4. ✅ Updated `getPublicUrl()` in shared-types to support Vite apps
5. ✅ Updated `MasjidList.tsx` to use helper function

## Next Build Will Include

The next deployment will automatically use these environment variables once they're set in Cloudflare. No code changes needed after setting the variables.
