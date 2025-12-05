# Quick Reference: Supabase GitHub Integration

Fast reference for the auto-deployment workflow with separate Supabase projects.

## 🔧 Project Configuration

| Environment | Project              | Branch  | URL                                    |
|------------|----------------------|---------|----------------------------------------|
| **Dev**    | e-masjid.my dev      | `dev`   | https://[dev-ref].supabase.co         |
| **Prod**   | e-masjid.my production| `main`  | https://[prod-ref].supabase.co        |

## 🚀 Deployment Commands

### Deploy to Dev
```bash
git checkout dev
git add .
git commit -m "feat: your changes"
git push origin dev
# ✨ Auto-deploys to Supabase Dev
```

### Deploy to Production
```bash
# After testing on dev
git checkout main
git merge dev
git push origin main
# ✨ Auto-deploys to Supabase Production
```

## 📁 Migration Files

**Location**: `/supabase/migrations/`

**Naming**: 
- `NNN_description.sql` (e.g., `030_add_feature.sql`)
- `YYYYMMDDHHMMSS_description.sql` (e.g., `20251205120000_add_feature.sql`)

**Rules**:
- ✅ Sequential numbering
- ✅ Always test on dev first
- ❌ Never delete migrations
- ❌ Never modify deployed migrations

## 🧪 Testing Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-thing
# Make changes, add migrations

# 2. Test locally
./scripts/setup-supabase.sh
pnpm dev

# 3. Merge to dev
git checkout dev
git merge feature/new-thing
git push origin dev
# Wait for Supabase to apply migrations

# 4. Test dev environment
# Visit https://hub-emasjid-dev.pages.dev (or your dev URL)

# 5. If all good, deploy to production
git checkout main
git merge dev
git push origin main
```

## 🔍 Verify Deployment

### In Supabase Dashboard

1. Select your project (dev or prod)
2. Go to **Database** → **Migrations**
3. Check latest migration is applied
4. Look for green checkmark ✅

### Via SQL
```sql
-- See applied migrations
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

## 🚨 Emergency Rollback

### Option 1: Revert Git Commit
```bash
# Revert the last commit
git revert HEAD
git push origin [branch-name]
# Supabase will apply the revert
```

### Option 2: Create Fix Migration
```bash
# Create new migration that undoes changes
cd supabase/migrations
cat > XXX_rollback_feature.sql << 'EOF'
-- Rollback: Remove feature that caused issues
BEGIN;
DROP TABLE IF EXISTS problematic_table;
-- Add other rollback statements
COMMIT;
EOF

git add .
git commit -m "fix: rollback problematic feature"
git push origin [branch-name]
```

## 🔑 Environment Variables

### Get from Supabase Dashboard

**For each project:**
1. Project Settings → API
2. Copy:
   - Project URL
   - `anon` `public` key

### Dev Environment (.env.development)
```bash
VITE_SUPABASE_URL=https://[dev-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]
```

### Production Environment (.env.production)
```bash
VITE_SUPABASE_URL=https://[prod-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[prod-anon-key]
```

## 📊 Check Integration Status

1. Go to Supabase Dashboard
2. Project Settings → Integrations
3. GitHub section should show:
   - ✅ Connected to Dev4w4n/e-masjid.my
   - Branch: `dev` (for dev) or `main` (for prod)
   - Auto-migrations: Enabled
   - Last sync: [timestamp]

## 🆘 Common Issues

### Migrations Not Running

**Check:**
- [ ] GitHub connection active in Supabase Dashboard
- [ ] Correct branch configured
- [ ] Migration files in `/supabase/migrations/`
- [ ] Proper file naming convention
- [ ] No SQL syntax errors

**Fix:**
```bash
# Verify migrations locally first
supabase db reset  # In local setup
# If works locally, re-push to GitHub
```

### Schema Drift

**Symptoms**: Dev and prod have different schemas

**Fix**:
```sql
-- In Supabase SQL Editor, check migration history
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- Compare dev vs prod
-- Create migration to sync if needed
```

### Failed Migration

1. Check error in Supabase Dashboard → Logs
2. Fix SQL in a NEW migration
3. Never modify failed migration
4. Test locally first

## 📞 Support

- **Full Guide**: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)
- **Supabase Docs**: https://supabase.com/docs/guides/cli/github-integration
- **Project Issues**: https://github.com/Dev4w4n/e-masjid.my/issues

---

**Last Updated**: December 5, 2025
