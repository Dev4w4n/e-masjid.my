# 🚀 Quick Start Deployment Guide

Get E-Masjid.My deployed to Cloudflare Pages and Supabase in production and staging environments.

## 📋 Prerequisites

- [x] GitHub repository: `Dev4w4n/e-masjid.my`
- [x] Two branches: `main` (production) and `dev` (staging)
- [x] Cloudflare account with Pages access
- [x] Supabase account

## ⚡ Step 1: Generate Deployment Configuration (5 minutes)

Run the automated setup script:

```bash
cd /path/to/e-masjid.my
./deployment/scripts/setup-environments.sh both
```

This creates:

- Environment variable templates
- Deployment checklists
- Configuration files

## ⚡ Step 2: Create Supabase Project with Branches (10 minutes)

### Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create project: `e-masjid-my`
3. Note down: Project URL and API keys
4. Go to Settings → Integrations → GitHub
5. Connect repository: `Dev4w4n/e-masjid.my`
6. Set production branch: `main`

### Create Staging Branch

1. In the same project, go to **Database** → **Branches**
2. Click **Create preview branch**
3. Name it: `staging`
4. Connect to GitHub branch: `dev`
5. Note down: Staging branch URL and API keys (different from production)

**Benefits of using branches:**

- Single project management
- Shared configuration with isolated data
- Lower cost (no separate project)
- Easy migration path from staging to production

### Configure Project

1. Run database migrations (auto-deployed from repo to both branches)
2. Set environment variables in project settings for **production**:
   ```
   SUPER_ADMIN_EMAIL=admin@yourdomain.com
   SUPER_ADMIN_PASSWORD=your-strong-password
   ```
3. Set environment variables for **staging branch** (can use different values)
4. Configure auth settings (redirect URLs for both production and staging)

## ⚡ Step 3: Create Cloudflare Pages Projects (15 minutes)

Create 6 projects total (3 apps × 2 environments):

### Hub App Projects

#### Production: `hub-emasjid-production`

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Create project → Connect Git
3. Repository: `Dev4w4n/e-masjid.my`
4. Production branch: `main`
5. Framework preset: **None** (or select "Create React App" then customize)
6. Build settings:
   ```
   Build command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/hub && pnpm build
   Build output: apps/hub/dist
   ```
   > **Note**: Hub app uses Vite + React. Select "None" preset for full control over build settings. The `build:packages` step is required to compile shared TypeScript packages first.
6. Environment variables:
   ```
   VITE_SUPABASE_URL=https://your-production-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   VITE_APP_URL=https://hub-emasjid-production.pages.dev
   VITE_ENABLE_DEV_TOOLS=false
   ```

#### Staging: `hub-emasjid-staging`

Same steps but:

- Production branch: `dev`
- Environment variables use staging Supabase project
- `VITE_ENABLE_DEV_TOOLS=true`

### Public App Projects

#### Production: `public-emasjid-production`

1. Create project → Connect Git
2. Repository: `Dev4w4n/e-masjid.my`
3. Production branch: `main`
4. Framework preset: **Next.js**
5. Build settings:
   ```
   Build command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/public && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/public
   Build output: apps/public/.vercel/output/static
   ```
   > **Note**: Public app uses Next.js for SEO-friendly server-side rendering. The `build:packages` step compiles shared packages, then `@cloudflare/next-on-pages` adapts Next.js for Cloudflare Pages (avoiding 25 MiB file size limits). Must run adapter from repo root.
5. Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   NEXT_PUBLIC_BASE_URL=https://public-emasjid-production.pages.dev
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   ```

#### Staging: `public-emasjid-staging`

Same steps but use `dev` branch and staging environment variables.

### TV Display Projects

#### Production: `tv-emasjid-production`

1. Create project → Connect Git
2. Repository: `Dev4w4n/e-masjid.my`
3. Production branch: `main`
4. Framework preset: **Next.js**
5. Build settings:
   ```
   Build command: pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && cd ../.. && npx @cloudflare/next-on-pages --experimental-minify apps/tv-display
   Build output: apps/tv-display/.vercel/output/static
   ```
   > **Note**: TV Display app uses Next.js for real-time content updates and SSR. The `build:packages` step compiles shared packages, then `@cloudflare/next-on-pages` adapts Next.js for Cloudflare Pages. Must run adapter from repo root.
5. Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   NEXT_PUBLIC_APP_URL=https://tv-emasjid-production.pages.dev
   NEXT_PUBLIC_AUTO_REFRESH=true
   NEXT_PUBLIC_REFRESH_INTERVAL=3600000
   SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
   ```

#### Staging: `tv-emasjid-staging`

Same steps but use `dev` branch and staging environment variables.

## ⚡ Step 4: Validate Deployment (10 minutes)

Use the validation script:

```bash
# Validate all staging apps
./deployment/scripts/deploy-cloudflare.sh staging all validate

# Validate all production apps
./deployment/scripts/deploy-cloudflare.sh production all validate
```

## ⚡ Step 5: Test Everything (15 minutes)

### Test Staging Environment

1. Visit all 3 staging apps
2. Test user registration and login
3. Test masjid creation and management
4. Test content upload and approval
5. Test TV display functionality

### Test Production Environment

1. Visit all 3 production apps
2. Create super admin user
3. Create initial masjid
4. Test core workflows
5. Monitor for any errors

## 🎯 Your Deployed URLs

After completion, you'll have:

### Production URLs

- **Hub**: `https://hub-emasjid-production.pages.dev`
- **Public**: `https://public-emasjid-production.pages.dev`
- **TV Display**: `https://tv-emasjid-production.pages.dev`

### Staging URLs

- **Hub**: `https://hub-emasjid-staging.pages.dev`
- **Public**: `https://public-emasjid-staging.pages.dev`
- **TV Display**: `https://tv-emasjid-staging.pages.dev`

## 🔧 Custom Domains (Optional)

To use your own domains:

1. In Cloudflare Pages, go to project → Custom domains
2. Add your domain (e.g., `hub.emasjid.my`)
3. Update environment variables with new URLs
4. Update Supabase auth redirect URLs

## 🚨 Security Reminders

- ✅ All secrets configured in dashboards (not git)
- ✅ Different Supabase projects for prod/staging
- ✅ Strong passwords for admin accounts
- ✅ SSL certificates active
- ✅ Rate limiting enabled

## 📞 Need Help?

### Common Issues

1. **Build failures**: Check pnpm installation and dependencies
2. **Environment variable errors**: Verify all required vars are set
3. **Database connection issues**: Check Supabase URLs and keys
4. **Authentication problems**: Verify redirect URLs in Supabase

### Resources

- **Full Documentation**: `deployment/README.md`
- **Security Guide**: `deployment/SECURITY.md`
- **Environment Variables**: `deployment/ENVIRONMENT-VARIABLES.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Supabase Docs**: https://supabase.com/docs

### Support Channels

- Check deployment logs in Cloudflare Pages dashboard
- Review Supabase project logs
- Use generated checklists in `deployment/checklists/`

---

**🎉 Congratulations!** You now have E-Masjid.My deployed in both staging and production environments with proper security practices.
