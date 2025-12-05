# TV Display API 404 Fix - Cloudflare Pages Staging

## Problem

API routes returning 404 on `tv-emasjid-staging.pages.dev`:

- `/api/displays/[id]/config`
- `/api/displays/[id]/prayer-times`
- `/api/displays/[id]/content`

## Root Cause

Cloudflare Pages needs specific configuration for Next.js API routes to work with `@cloudflare/next-on-pages` adapter.

## Fix Steps (Do in Cloudflare Dashboard)

### 1. Add Compatibility Settings

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Select **tv-emasjid-staging** project
3. Go to **Settings** → **Functions**
4. Under **Compatibility flags**, add:
   - Flag: `nodejs_compat`
5. Under **Compatibility date**, set:
   - Date: `2024-01-01`
6. Click **Save**

### 2. Verify/Add Environment Variables

Go to **Settings** → **Environment variables** and ensure these exist:

**For Production (main branch):**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=https://tv-emasjid-staging.pages.dev
NEXT_PUBLIC_APP_ENV=staging
NODE_ENV=production
```

**IMPORTANT:** Do NOT add `SUPABASE_SERVICE_ROLE_KEY` - it's not needed and poses a security risk.

### 3. Verify Build Settings

Go to **Settings** → **Builds & deployments**:

**Build command:**

```bash
pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
```

**Build output directory:**

```
apps/tv-display/.vercel/output/static
```

**Root directory:**

```
/
```

### 4. Trigger Redeploy

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Retry deployment**
4. Wait for build to complete

### 5. Verify Fix

After deployment completes, test in browser console:

```javascript
// Replace with your actual display ID
const displayId = "7cfff1bb-46a2-4022-a326-69e9d5f6c9a1";

// Test config endpoint
fetch(`https://tv-emasjid-staging.pages.dev/api/displays/${displayId}/config`)
  .then((r) => r.json())
  .then(console.log);

// Test content endpoint
fetch(
  `https://tv-emasjid-staging.pages.dev/api/displays/${displayId}/content?status=active`
)
  .then((r) => r.json())
  .then(console.log);

// Test prayer times endpoint
fetch(
  `https://tv-emasjid-staging.pages.dev/api/displays/${displayId}/prayer-times`
)
  .then((r) => r.json())
  .then(console.log);
```

All three should return JSON responses (not 404).

## Why This Works

1. **`nodejs_compat` flag:** Enables Node.js APIs that Supabase client requires
2. **`@cloudflare/next-on-pages`:** Converts Next.js API routes to Cloudflare Workers
3. **Edge runtime:** API routes have `export const runtime = 'edge'` for Cloudflare compatibility
4. **RLS policies:** Database access controlled by Row Level Security, not service role key

## If Still Not Working

1. **Check build logs:** Look for errors during `@cloudflare/next-on-pages` step
2. **Verify wrangler.toml:** Should exist in `apps/tv-display/` with compatibility flags
3. **Check Functions logs:** Cloudflare Pages → Deployments → View logs
4. **Database connection:** Verify Supabase URL and anon key are correct

## Apply Same Fix to Production

Repeat all steps above for **tv-emasjid-production** project (uses `main` branch instead of `dev`).

---

**Related Documentation:**

- [Cloudflare Pages Configuration](../deployment/cloudflare/README.md)
- [Environment Variables Guide](../deployment/ENVIRONMENT-VARIABLES.md)
- [Supabase RLS Policies](../supabase/README.md#security-architecture)
