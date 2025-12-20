# Cloudflare Pages Deployment Configuration

This directory contains configuration files and guides for deploying E-Masjid.My applications to Cloudflare Pages.

## 🎯 Overview

We're deploying 3 applications × 2 environments = 6 Cloudflare Pages projects:

| Application | Production Project          | Staging Project          | Framework    |
| ----------- | --------------------------- | ------------------------ | ------------ |
| Hub App     | `hub-emasjid-production`    | `hub-emasjid-staging`    | Vite (React) |
| Papan Info App  | `papan-info-emasjid-production` | `papan-info-emasjid-staging` | Next.js      |
| TV Display  | `tv-emasjid-production`     | `tv-emasjid-staging`     | Next.js      |

## 🔧 Quick Setup Guide

### 1. Create Projects in Cloudflare Dashboard

For each application:

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your repository: `Dev4w4n/e-masjid.my`
4. **Select Framework Preset** (see table below)
5. Configure as shown in the detailed tables

#### Framework Preset Selection

Choose the correct framework preset during project creation:

| Application | Framework Preset | Why                                    |
| ----------- | ---------------- | -------------------------------------- |
| Hub App     | **None**         | Vite + React (custom build to `/dist`) |
| Papan Info App  | **Next.js**      | Next.js with SSR for SEO               |
| TV Display  | **Next.js**      | Next.js with real-time updates         |

> **Note**: For Hub app, if "None" isn't available, select "Create React App" then customize the build settings as shown below.

#### 🔥 Important: Monorepo Build Requirements

All build commands follow this pattern:

```bash
pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/<app-name> && pnpm build
```

**Why?** E-Masjid.My uses TypeScript composite projects in a monorepo. Packages must be built BEFORE apps, otherwise you'll see errors like:

```
error TS6305: Output file '/opt/buildhome/repo/packages/auth/dist/index.d.ts' has not been built
```

The `build:packages` script compiles all shared packages in the correct dependency order.

#### 🔥 Important: Next.js on Cloudflare Pages

**Public and TV Display apps use `@cloudflare/next-on-pages` adapter** because:

- Cloudflare Pages has a **25 MiB file size limit**
- Standard Next.js `.next` output includes large webpack cache files (27+ MiB)
- The adapter optimizes Next.js for Cloudflare's edge runtime
- Output directory changes from `.next` to `.vercel/output/static`

Without this adapter, deployments fail with: `Error: Pages only supports files up to 25 MiB in size`

### 2. Hub App Configuration

#### Production: `hub-emasjid-production`

```
Project Name: hub-emasjid-production
Production Branch: main
Build Settings:
  Framework Preset: None (Custom)
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/hub && pnpm build
  Build Output Directory: apps/hub/dist
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `hub-emasjid-staging`

```
Project Name: hub-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: None (Custom)
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/hub && pnpm build
  Build Output Directory: apps/hub/dist
  Root Directory: /
Environment Variables: [See environment section below]
```

### 3. Papan Info App Configuration

#### Production: `papan-info-emasjid-production`

```
Project Name: papan-info-emasjid-production
Production Branch: main
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/papan-info && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
  Build Output Directory: apps/papan-info/.vercel/output/static
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `papan-info-emasjid-staging`

```
Project Name: papan-info-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/papan-info && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
  Build Output Directory: apps/papan-info/.vercel/output/static
  Root Directory: /
Environment Variables: [See environment section below]
```

### 4. TV Display Configuration

#### Production: `tv-emasjid-production`

```
Project Name: tv-emasjid-production
Production Branch: main
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
  Build Output Directory: apps/tv-display/.vercel/output/static
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `tv-emasjid-staging`

```
Project Name: tv-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
  Build Output Directory: apps/tv-display/.vercel/output/static
  Root Directory: /
Environment Variables: [See environment section below]
```

## 🌍 Environment Variables Configuration

### Hub App Projects (Vite React)

**Both Production & Staging:**

```bash
NODE_ENV=production
VITE_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_APP_URL=https://YOUR_CLOUDFLARE_PAGES_DOMAIN
VITE_ENABLE_DEV_TOOLS=false
VITE_SHOW_LOGGER=false
```

### Papan Info App Projects (Next.js)

**Both Production & Staging:**

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_BASE_URL=https://YOUR_CLOUDFLARE_PAGES_DOMAIN
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### TV Display Projects (Next.js)

**Both Production & Staging:**

```bash
NODE_ENV=production
# Supabase configuration (anon key only - RLS policies control access)
SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
# App configuration
NEXT_PUBLIC_APP_URL=https://YOUR_CLOUDFLARE_PAGES_DOMAIN
NEXT_PUBLIC_AUTO_REFRESH=true
NEXT_PUBLIC_REFRESH_INTERVAL=3600000
NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL=300000
NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL=60000
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_SHOW_LOGGER=false
```

> 🔒 **Security Note:** TV Display does NOT use `SUPABASE_SERVICE_ROLE_KEY`. All API routes use the anon key with Row Level Security (RLS) policies for access control.

## 🔧 Build Configuration Files

### Build Command Explanation

Our monorepo structure requires specific build commands:

1. **Navigate to app directory**: `cd apps/{app-name}`
2. **Install dependencies**: `pnpm install --frozen-lockfile`
3. **Build the app**: `pnpm build`

### Why Not Root-Level Build?

- Each app has specific dependencies
- Monorepo workspace resolution works better from app directory
- Faster builds by avoiding unnecessary packages
- Better caching strategy

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Supabase projects created (production & staging)
- [ ] Environment variables documented (no secrets committed)
- [ ] GitHub repository accessible to Cloudflare
- [ ] Domain names planned (if using custom domains)

### Per Project Setup

- [ ] Create Cloudflare Pages project
- [ ] Configure Git integration
- [ ] Set correct branch (main/dev)
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Test initial deployment

### Post-Deployment

- [ ] Verify all apps are accessible
- [ ] Test authentication flows
- [ ] Test database connectivity
- [ ] Verify cross-app navigation
- [ ] Test real-time features
- [ ] Performance testing

## 🔍 Troubleshooting

### Common Build Issues

**1. "pnpm: command not found"**

- Cloudflare Pages might not have pnpm pre-installed
- Solution: Add pnpm installation to build command: `npm install -g pnpm && pnpm install && pnpm build`

**2. "Module not found" errors**

- Usually workspace dependency issues
- Solution: Ensure all workspace packages are built first

**3. Environment variable not found**

- Check variable names match exactly (case-sensitive)
- Verify they're set in Cloudflare dashboard
- Remember prefixes: VITE* for client-side, NEXT_PUBLIC* for Next.js client

### TV Display API Routes 404 Errors

**Problem:** API routes return 404 on Cloudflare Pages (e.g., `/api/displays/[id]/config`)

**Root Cause:** Cloudflare Pages requires additional configuration for Next.js API routes to work with `@cloudflare/next-on-pages`

**Solution Steps:**

1. **Add Compatibility Flag in Cloudflare Dashboard:**
   - Go to your TV Display project in Cloudflare Pages
   - Navigate to **Settings** → **Functions**
   - Add compatibility flag: `nodejs_compat`
   - Add compatibility date: `2024-01-01`

2. **Verify Environment Variables:**

   ```bash
   # Required for API routes
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Verify Build Command includes `@cloudflare/next-on-pages`:**

   ```bash
   pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && VERCEL_PROJECT_DIR=. pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
   ```

4. **Check Build Output Directory:**
   - Must be set to: `apps/tv-display/.vercel/output/static`

5. **Redeploy:**
   - Trigger a new deployment after making the above changes
   - Monitor build logs for any errors

**Why This Happens:**

- `@cloudflare/next-on-pages` converts Next.js API routes to Cloudflare Workers
- Without `nodejs_compat`, Node.js APIs used by Supabase client fail
- The API routes have `export const runtime = 'edge'` which requires proper edge runtime setup

**Verification:**
After deployment, test these endpoints:

- `https://tv-emasjid-staging.pages.dev/api/displays/[valid-id]/config`
- `https://tv-emasjid-staging.pages.dev/api/displays/[valid-id]/content`
- `https://tv-emasjid-staging.pages.dev/api/displays/[valid-id]/prayer-times`

### Build Command Alternatives

If the standard build fails, try these alternatives:

**Option 1: Build from root with turborepo**

```bash
npm install -g pnpm && pnpm install && pnpm build --filter=@masjid-suite/hub
```

**Option 2: Manual package building**

```bash
pnpm install && ./scripts/build-packages.sh && cd apps/hub && pnpm build
```

## 🔗 Useful Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Framework Guides](https://developers.cloudflare.com/pages/framework-guides/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)

## 🚨 Critical: Disable Cloudflare RUM

**IMPORTANT**: After deploying the Hub app, you MUST disable Cloudflare's Real User Monitoring (RUM) to prevent app hangs.

### Symptoms of RUM Issue:

- App hangs after clicking submit buttons or navigating
- Browser shows requests to `/cdn-cgi/rum?`
- Users must clear localStorage and re-login to continue
- Affects all pages after some time of use

### Fix Steps (Do This Immediately After Deployment):

1. **First, verify RUM is the issue**:
   - Open https://hub.e-masjid.my in browser
   - Open DevTools (F12) → Network tab
   - Navigate/submit forms
   - Look for `/cdn-cgi/rum?` requests
   - If present → RUM is active (continue to step 2)

2. **Login to Cloudflare Dashboard**: https://dash.cloudflare.com/

3. **Option A - Via Pages Project** (try this first):
   - Go to **Pages** → Select `hub-emasjid-production` or `hub-emasjid-staging`
   - Click **Analytics** tab
   - Look for **Web Analytics** or **RUM** toggle
   - If found, **Disable** it

4. **Option B - Via Account Analytics** (if not in Pages project):
   - From dashboard home → **Account** → **Analytics & Logs**
   - Click **Web Analytics**
   - Find your domain (`hub.e-masjid.my`)
   - Click settings ⚙️ → **Disable** or **Remove**

5. **Option C - Contact Support** (if you can't find the toggle):
   - Click **? Help** in dashboard
   - Request: "Disable Real User Monitoring for hub-emasjid-production"
6. **Verify the fix**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Check Network tab - no more `/cdn-cgi/rum?` requests ✅

### Projects That Need This Fix:

- ✅ **hub-emasjid-production** (REQUIRED)
- ✅ **hub-emasjid-staging** (REQUIRED)
- ℹ️ public/tv apps (optional - Next.js handles this better)

> 📖 **See**: `CLOUDFLARE-RUM-FIX.md` for detailed explanation and troubleshooting

## 📞 Support

For Cloudflare-specific deployment issues:

1. Check build logs in Cloudflare Pages dashboard
2. Verify environment variables are set correctly
3. Test build commands locally first
4. **If app hangs**: Check if RUM is disabled (see above)
5. Use Cloudflare community forums for platform-specific issues

---

**Next**: Configure your Supabase projects using the [Supabase configuration guide](../supabase/README.md).
