# Staging Deployment Checklist

Generated on Tue Dec  2 17:17:28 +08 2025

## 🎯 Staging Environment Setup

### Supabase Branch Setup
- [ ] Ensure main Supabase project `e-masjid-my` exists
- [ ] Navigate to Database → Branches in Supabase dashboard
- [ ] Create preview branch: `staging`
- [ ] Connect branch to GitHub repository: `Dev4w4n/e-masjid.my`, branch: `dev`
- [ ] Wait for migrations and seed data to run automatically (check logs)
- [ ] Create super admin user via Authentication → Users (email: `staging-admin@emasjid.my`)
- [ ] Run SQL to set super admin role: `UPDATE users SET role = 'super_admin' WHERE email = 'staging-admin@emasjid.my';`
- [ ] Configure authentication settings (redirect URLs, providers)
- [ ] Set environment variables if needed (most config is in code)
- [ ] Note down staging branch URL and API keys (format: `project-id--staging.supabase.co`)

### Cloudflare Pages Setup

#### Hub App: `hub-emasjid-staging`
- [ ] Create Cloudflare Pages project
- [ ] Connect to GitHub: `Dev4w4n/e-masjid.my`
- [ ] Set production branch: `dev`
- [ ] Configure build command: `cd apps/hub && pnpm install --frozen-lockfile && pnpm build`
- [ ] Set build output: `apps/hub/dist`
- [ ] Add environment variables from template

#### Public App: `public-emasjid-staging`  
- [ ] Create Cloudflare Pages project
- [ ] Connect to GitHub: `Dev4w4n/e-masjid.my`
- [ ] Set production branch: `dev`
- [ ] Configure build command: `cd apps/public && pnpm install --frozen-lockfile && pnpm build`
- [ ] Set build output: `apps/public/.next`
- [ ] Add environment variables from template

#### TV Display App: `tv-emasjid-staging`
- [ ] Create Cloudflare Pages project  
- [ ] Connect to GitHub: `Dev4w4n/e-masjid.my`
- [ ] Set production branch: `dev`
- [ ] Configure build command: `cd apps/tv-display && pnpm install --frozen-lockfile && pnpm build`
- [ ] Set build output: `apps/tv-display/.next`
- [ ] Add environment variables from template

### Environment Variables
- [ ] Hub app variables configured in Cloudflare Pages
- [ ] Public app variables configured in Cloudflare Pages  
- [ ] TV Display variables configured in Cloudflare Pages
- [ ] Super admin credentials set in Supabase
- [ ] OAuth providers configured (if needed)

### Testing & Validation
- [ ] All applications deploy successfully
- [ ] Database connectivity verified
- [ ] Authentication flows tested
- [ ] Cross-app navigation works
- [ ] Real-time features functional
- [ ] File uploads working
- [ ] Performance acceptable

### Security Review
- [ ] No secrets committed to git
- [ ] RLS policies verified
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] SSL certificates active
- [ ] Security headers configured

## 🔗 Quick Links

- **Environment Variables**: `deployment/env-templates/staging.env`
- **Cloudflare Config**: `deployment/cloudflare/pages-config/`
- **Supabase Config**: `deployment/supabase/staging-config.toml`

## 📞 Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Supabase Docs](https://supabase.com/docs)
- [Deployment Guide](../README.md)
