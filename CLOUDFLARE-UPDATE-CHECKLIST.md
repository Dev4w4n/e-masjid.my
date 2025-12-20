# Cloudflare Pages Update Checklist - Papan Info Build Fix

## Quick Action Steps

### For Staging Environment (papan-info-emasjid-staging)

1. **Login to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Navigate to: Pages → `papan-info-emasjid-staging`

2. **Update Build Configuration**
   - Go to: Settings → Builds & deployments
   - Click: Configure Production deployments → Edit configuration

3. **Set New Build Command**

   ```
   pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/papan-info && pnpm build && pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
   ```

4. **Verify Settings**
   - ✅ Framework preset: Next.js
   - ✅ Build output directory: `apps/papan-info/.vercel/output/static`
   - ✅ Root directory: `/` (workspace root)
   - ✅ Production branch: `dev`

5. **Save and Deploy**
   - Click: Save
   - Go to: Deployments tab
   - Click: Retry deployment (for latest failed build)
   - OR: Push new commit to `dev` branch to trigger automatic deployment

### For Production Environment (papan-info-emasjid-production)

1. **Login to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Navigate to: Pages → `papan-info-emasjid-production`

2. **Update Build Configuration**
   - Go to: Settings → Builds & deployments
   - Click: Configure Production deployments → Edit configuration

3. **Set New Build Command**

   ```
   pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/papan-info && pnpm build && pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
   ```

4. **Verify Settings**
   - ✅ Framework preset: Next.js
   - ✅ Build output directory: `apps/papan-info/.vercel/output/static`
   - ✅ Root directory: `/` (workspace root)
   - ✅ Production branch: `main`

5. **Save (Don't Deploy Yet)**
   - Click: Save
   - **WAIT**: Test staging first before deploying to production

## Other Apps to Update (Optional)

The same `cp -r .next` issue existed in the old "Public" app configs, but those have been removed since the app was rebranded to "Papan Info".

### TV Display Apps

If you encounter similar issues with TV Display apps, use the same fix pattern:

### TV Display - Staging

**Project**: `tv-emasjid-staging`

**New build command**:

```
pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
```

### TV Display - Production

**Project**: `tv-emasjid-production`

**New build command**:

```
pnpm install --frozen-lockfile && pnpm run build:packages && cd apps/tv-display && pnpm build && pnpm dlx @cloudflare/next-on-pages@1 --experimental-minify
```

## Verification Steps

### After Updating Staging

1. **Monitor Build Logs**
   - Go to: Deployments → Latest deployment → View build logs
   - Watch for:
     - ✅ `pnpm install` completes without errors
     - ✅ `pnpm run build:packages` compiles all packages
     - ✅ `next build` creates `.next` directory
     - ✅ `@cloudflare/next-on-pages` transforms successfully
     - ✅ **NO** `cp: cannot stat '.next'` error
     - ✅ Build completes with exit code 0

2. **Test Deployment**
   - Open: https://papan-info-emasjid-staging.pages.dev
   - Verify:
     - ✅ Page loads without errors
     - ✅ Content displays correctly
     - ✅ No console errors in browser DevTools
     - ✅ Functionality works as expected

3. **Check Cloudflare Analytics**
   - Go to: Analytics tab
   - Monitor for:
     - ✅ No spike in 500 errors
     - ✅ Page load times are normal
     - ✅ No unusual error patterns

### After Updating Production

**IMPORTANT**: Only update production AFTER staging is verified working!

1. Follow same verification steps as staging
2. Monitor production URLs
3. Be ready to rollback if issues occur

## Rollback Plan (If Needed)

If the new build fails or deployment has issues:

1. **Quick Rollback in Cloudflare**
   - Go to: Deployments tab
   - Find: Last successful deployment
   - Click: Rollback to this deployment

2. **Or Revert Build Command**
   - Go to: Settings → Builds & deployments
   - Restore old build command (with `cp -r` - will still fail, but gives time to debug)
   - Contact team for support

## Common Issues and Solutions

| Issue                        | Solution                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| "Build command not found"    | Ensure build command is set in Cloudflare dashboard, not just in config file |
| "Module not found" error     | Check all package dependencies are installed correctly                       |
| "Build timeout"              | Increase build timeout in Cloudflare settings (if available)                 |
| "Output directory not found" | Verify `apps/papan-info/.vercel/output/static` exists after build            |
| "Still getting cp error"     | Double-check build command doesn't contain `mkdir -p` or `cp -r`             |

## Environment Variables Check

Before deploying, verify these environment variables are set in Cloudflare dashboard:

### Required Variables

- ✅ `NODE_ENV`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_BASE_URL`

### Optional Variables

- `NEXT_PUBLIC_HUB_URL`
- `NEXT_PUBLIC_TV_DISPLAY_URL`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_ENABLE_DEV_TOOLS`
- `SUPABASE_SERVICE_ROLE_KEY` (sensitive - production only)

## Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **@cloudflare/next-on-pages**: https://github.com/cloudflare/next-on-pages
- **Project Documentation**: `/deployment/cloudflare/README.md`
- **Fix Details**: `/CLOUDFLARE-PAPAN-INFO-BUILD-FIX.md`

## Timeline Estimate

- **Staging update**: 5 minutes (configuration) + 5-10 minutes (build + verification)
- **Production update**: 5 minutes (configuration) + 5-10 minutes (build + verification)
- **Total time**: ~30 minutes for both environments

## Priority

🔴 **HIGH PRIORITY** - Blocking deployment

This fix is required before the papan-info app can be deployed to staging or production on Cloudflare Pages.

---

**Date**: 20 December 2025  
**Status**: Ready for Cloudflare dashboard configuration  
**Next Action**: Update Cloudflare Pages build settings per this checklist
