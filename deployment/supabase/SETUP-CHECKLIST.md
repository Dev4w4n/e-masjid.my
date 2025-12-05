# Supabase GitHub Integration Setup Checklist

Use this checklist to ensure proper setup of automatic deployments for both dev and production environments.

## 📋 Pre-Setup Requirements

- [ ] GitHub account with access to `Dev4w4n/e-masjid.my`
- [ ] Supabase account (free tier works)
- [ ] Two branches exist: `dev` and `main`
- [ ] Admin access to both Supabase projects

## 🔧 Dev Environment Setup

### GitHub Integration
- [ ] Logged into Supabase Dashboard
- [ ] Selected "e-masjid.my dev" project
- [ ] Navigated to Project Settings → Integrations
- [ ] Clicked "Connect to GitHub"
- [ ] Authorized repository: `Dev4w4n/e-masjid.my`
- [ ] Set production branch to: `dev`
- [ ] Enabled "Automatic migrations"
- [ ] Saved configuration

### Verification
- [ ] GitHub connection shows as "Connected"
- [ ] Branch shows as: `dev`
- [ ] Auto-migrations enabled: ✅
- [ ] Test migration deployed successfully

### Environment Variables
- [ ] Copied Project URL from Project Settings → API
- [ ] Copied `anon` `public` key from Project Settings → API
- [ ] Created/Updated `.env.development`:
  ```
  VITE_SUPABASE_URL=https://[dev-ref].supabase.co
  VITE_SUPABASE_ANON_KEY=[dev-anon-key]
  ```
- [ ] Tested local connection with dev credentials

### Initial Data
- [ ] Created super admin user via Authentication UI
  - Email: `dev-admin@emasjid.my`
  - Password: [secure password saved in password manager]
- [ ] Ran SQL to set super admin role:
  ```sql
  UPDATE users SET role = 'super_admin' 
  WHERE email = 'dev-admin@emasjid.my';
  ```
- [ ] Verified super admin can log in
- [ ] Verified super admin has correct permissions

## 🚀 Production Environment Setup

### GitHub Integration
- [ ] Logged into Supabase Dashboard
- [ ] Selected "e-masjid.my production" project
- [ ] Navigated to Project Settings → Integrations
- [ ] Clicked "Connect to GitHub"
- [ ] Authorized repository: `Dev4w4n/e-masjid.my`
- [ ] Set production branch to: `main`
- [ ] Enabled "Automatic migrations"
- [ ] Saved configuration

### Verification
- [ ] GitHub connection shows as "Connected"
- [ ] Branch shows as: `main`
- [ ] Auto-migrations enabled: ✅
- [ ] Test migration deployed successfully

### Environment Variables
- [ ] Copied Project URL from Project Settings → API
- [ ] Copied `anon` `public` key from Project Settings → API
- [ ] Created/Updated `.env.production`:
  ```
  VITE_SUPABASE_URL=https://[prod-ref].supabase.co
  VITE_SUPABASE_ANON_KEY=[prod-anon-key]
  ```
- [ ] Configured Cloudflare Pages with production env vars

### Initial Data
- [ ] Created super admin user via Authentication UI
  - Email: `admin@emasjid.my`
  - Password: [secure password saved in password manager]
- [ ] Ran SQL to set super admin role:
  ```sql
  UPDATE users SET role = 'super_admin' 
  WHERE email = 'admin@emasjid.my';
  ```
- [ ] Verified super admin can log in
- [ ] Verified super admin has correct permissions

## 🧪 Integration Testing

### Dev Environment Test
- [ ] Created test branch: `git checkout -b test/integration`
- [ ] Created test migration:
  ```bash
  cat > supabase/migrations/999_test_dev.sql << 'EOF'
  CREATE TABLE IF NOT EXISTS test_dev_integration (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    message text DEFAULT 'Dev integration working!',
    created_at timestamptz DEFAULT now()
  );
  EOF
  ```
- [ ] Committed and pushed to dev:
  ```bash
  git add supabase/migrations/999_test_dev.sql
  git commit -m "test: dev integration"
  git checkout dev
  git merge test/integration
  git push origin dev
  ```
- [ ] Waited 1-2 minutes for deployment
- [ ] Checked Supabase Dev Dashboard → Database → Migrations
- [ ] Verified `999_test_dev` migration applied ✅
- [ ] Checked Table Editor for `test_dev_integration` table
- [ ] Cleaned up test migration:
  ```bash
  rm supabase/migrations/999_test_dev.sql
  git add supabase/migrations/999_test_dev.sql
  git commit -m "test: remove dev test migration"
  git push origin dev
  ```

### Production Environment Test
- [ ] Created test migration:
  ```bash
  cat > supabase/migrations/999_test_prod.sql << 'EOF'
  CREATE TABLE IF NOT EXISTS test_prod_integration (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    message text DEFAULT 'Prod integration working!',
    created_at timestamptz DEFAULT now()
  );
  EOF
  ```
- [ ] Committed to dev first (always test on dev):
  ```bash
  git add supabase/migrations/999_test_prod.sql
  git commit -m "test: prod integration"
  git push origin dev
  ```
- [ ] Verified on dev environment
- [ ] Merged to main:
  ```bash
  git checkout main
  git merge dev
  git push origin main
  ```
- [ ] Waited 1-2 minutes for deployment
- [ ] Checked Supabase Prod Dashboard → Database → Migrations
- [ ] Verified `999_test_prod` migration applied ✅
- [ ] Checked Table Editor for `test_prod_integration` table
- [ ] Cleaned up test migration:
  ```bash
  git checkout dev
  rm supabase/migrations/999_test_prod.sql
  git add supabase/migrations/999_test_prod.sql
  git commit -m "test: remove prod test migration"
  git push origin dev
  git checkout main
  git merge dev
  git push origin main
  ```

## 📊 Post-Setup Verification

### Both Environments
- [ ] All existing migrations applied successfully
- [ ] No failed migrations in migration history
- [ ] RLS policies working correctly
- [ ] Authentication working
- [ ] Storage buckets created
- [ ] Realtime subscriptions enabled

### Team Access
- [ ] Team members added to Supabase projects
- [ ] Team members understand deployment workflow
- [ ] Team members have access to environment variables
- [ ] Team members know emergency rollback procedures

## 📚 Documentation

- [ ] Team briefed on new deployment workflow
- [ ] Environment variable documentation updated
- [ ] Deployment guide reviewed
- [ ] Quick reference guide bookmarked
- [ ] Emergency contacts documented

## 🔒 Security

- [ ] Production credentials secured (not in git)
- [ ] Development credentials documented separately
- [ ] RLS policies reviewed and tested
- [ ] API keys rotated if previously exposed
- [ ] Authentication redirect URLs configured:
  - [ ] Dev: Development URLs added
  - [ ] Prod: Production URLs only

### Dev Authentication URLs
```
https://hub-emasjid-dev.pages.dev
http://localhost:5173
http://localhost:3000
```

### Production Authentication URLs
```
https://hub.emasjid.my
https://public.emasjid.my
https://tv.emasjid.my
```

## 🎯 Next Steps

- [ ] Remove old deployment scripts (if any)
- [ ] Update CI/CD documentation
- [ ] Train team on new workflow
- [ ] Schedule first production deployment
- [ ] Set up monitoring/alerting
- [ ] Document rollback procedures
- [ ] Create incident response plan

## 📞 Support Contacts

- **Supabase Dashboard**: https://app.supabase.com
- **Documentation**: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)
- **Quick Reference**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- **Repository**: https://github.com/Dev4w4n/e-masjid.my

---

**Setup Date**: _______________
**Setup By**: _______________
**Verified By**: _______________

**Last Updated**: December 5, 2025
