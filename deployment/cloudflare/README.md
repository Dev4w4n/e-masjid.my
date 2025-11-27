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
4. Configure as shown in the tables below

### 2. Hub App Configuration

#### Production: `hub-emasjid-production`

```
Project Name: hub-emasjid-production
Production Branch: main
Build Settings:
  Framework Preset: None (Custom)
  Build Command: cd apps/hub && pnpm install --frozen-lockfile && pnpm build
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
  Build Command: cd apps/hub && pnpm install --frozen-lockfile && pnpm build
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
  Build Command: cd apps/public && pnpm install --frozen-lockfile && pnpm build
  Build Output Directory: apps/public/.next
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `public-emasjid-staging`

```
Project Name: public-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: Next.js
  Build Command: cd apps/public && pnpm install --frozen-lockfile && pnpm build
  Build Output Directory: apps/public/.next
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
  Build Command: cd apps/tv-display && pnpm install --frozen-lockfile && pnpm build
  Build Output Directory: apps/tv-display/.next
  Root Directory: /
Environment Variables: [See environment section below]
```

#### Staging: `tv-emasjid-staging`

```
Project Name: tv-emasjid-staging
Production Branch: dev
Build Settings:
  Framework Preset: Next.js
  Build Command: cd apps/tv-display && pnpm install --frozen-lockfile && pnpm build
  Build Output Directory: apps/tv-display/.next
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
