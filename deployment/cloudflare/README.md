# Cloudflare Pages Deployment Configuration

This directory contains configuration files and guides for deploying E-Masjid.My applications to Cloudflare Pages.

## 🎯 Overview

We're deploying 3 applications × 2 environments = 6 Cloudflare Pages projects:

| Application | Production Project          | Staging Project          | Framework    |
| ----------- | --------------------------- | ------------------------ | ------------ |
| Hub App     | `hub-emasjid-production`    | `hub-emasjid-staging`    | Vite (React) |
| Public App  | `public-emasjid-production` | `public-emasjid-staging` | Next.js      |
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
| Public App  | **Next.js**      | Next.js with SSR for SEO               |
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

### 3. Public App Configuration

#### Production: `public-emasjid-production`

```
Project Name: public-emasjid-production
Production Branch: main
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/public && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/public
  Build Output Directory: apps/public/.vercel/output/static
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `public-emasjid-staging`

```
Project Name: public-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: Next.js
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/public && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/public
  Build Output Directory: apps/public/.vercel/output/static
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
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/tv-display
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
  Build Command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/tv-display
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

### Public App Projects (Next.js)

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
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://YOUR_CLOUDFLARE_PAGES_DOMAIN
NEXT_PUBLIC_AUTO_REFRESH=true
NEXT_PUBLIC_REFRESH_INTERVAL=3600000
NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL=300000
NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL=60000
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_SHOW_LOGGER=false
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

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

## 📞 Support

For Cloudflare-specific deployment issues:

1. Check build logs in Cloudflare Pages dashboard
2. Verify environment variables are set correctly
3. Test build commands locally first
4. Use Cloudflare community forums for platform-specific issues

---

**Next**: Configure your Supabase projects using the [Supabase configuration guide](../supabase/README.md).
