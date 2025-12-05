# Migration Guide: Resetting Supabase GitHub Integration

Complete guide to disconnect your current setup and migrate to the new two-project configuration.

## 🎯 Current Setup vs New Setup

### What You Have Now
- Single Supabase project with preview branches OR
- Existing GitHub connection that needs reconfiguration

### What You're Moving To
- Two separate Supabase projects
- Dev project connected to `dev` branch
- Production project connected to `main` branch

## 🔄 Migration Steps

### Phase 1: Understand Your Current Setup (5 min)

First, let's check what you currently have:

#### 1.1 Check Current Supabase Projects

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. List all your projects
3. Note which project(s) you have:
   - [ ] Single project: `e-masjid.my` (or similar)
   - [ ] Multiple projects
   - [ ] Preview branches enabled

#### 1.2 Check Current GitHub Connections

For each Supabase project:

1. Go to **Project Settings** → **Integrations**
2. Look for **GitHub Connections** section
3. Note down:
   - [ ] Is GitHub connected? Yes/No
   - [ ] Which repository? (should be `Dev4w4n/e-masjid.my`)
   - [ ] Which branch? (main, dev, or both)
   - [ ] Are preview branches enabled?

### Phase 2: Backup Current Setup (10 min)

**⚠️ IMPORTANT: Do this before disconnecting anything!**

#### 2.1 Export Current Schema

```bash
# From your local workspace
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Make sure all migrations are committed
git status

# Your migrations are already in git, so you're backed up!
ls -l supabase/migrations/

# Optional: Create a backup branch
git checkout -b backup-before-migration-$(date +%Y%m%d)
git push origin backup-before-migration-$(date +%Y%m%d)
```

#### 2.2 Document Current Configuration

Create a note with:
- Current Supabase project name(s)
- Current project URL(s)
- Current API keys (you'll get new ones)
- Which environments are using which projects

### Phase 3: Disconnect Existing GitHub Integration (5 min)

For **EACH** Supabase project that has GitHub connected:

#### 3.1 Disconnect GitHub

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select the project
3. Navigate to **Project Settings** → **Integrations**
4. Find **GitHub Connections** section
5. Click **Disconnect** or **Remove** (button varies)
6. Confirm disconnection

#### 3.2 Verify Disconnection

1. Refresh the page
2. GitHub Connections should show "Not connected" or "Connect to GitHub"
3. ✅ GitHub integration is now disconnected

### Phase 4: Prepare Your Two Projects (15 min)

#### 4.1 Option A: You Have Two Projects Already

If you already have:
- `e-masjid.my dev` project
- `e-masjid.my production` project

Skip to Phase 5!

#### 4.2 Option B: You Have One Project

If you only have one project (e.g., `e-masjid.my`):

**Decide which will be Production:**
```
Option 1: Keep existing as Production, create new Dev
✅ Recommended if existing has real data

Option 2: Keep existing as Dev, create new Production
✅ Recommended if starting fresh
```

**Create the second project:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Configure:
   - **Name**: `e-masjid.my dev` or `e-masjid.my production`
   - **Database Password**: Strong password (save it!)
   - **Region**: `Southeast Asia (Singapore)` - ap-southeast-2
   - **Pricing Plan**: Free (or match existing)
4. Click **Create new project**
5. Wait for provisioning (~2-3 minutes)

#### 4.3 Option C: You Have Preview Branches

If you're using Supabase preview branches:

1. **Keep main project as Production**
2. **Create new standalone Dev project** (follow 4.2)
3. **Delete preview branch** (after migration):
   - Database → Branches
   - Select preview branch
   - Delete branch

### Phase 5: Apply Migrations to Both Projects (10 min)

Both projects need the same schema before connecting GitHub.

#### 5.1 Prepare Migration SQL

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Concatenate all migrations into one file for manual application
cat supabase/migrations/*.sql > /tmp/all_migrations.sql

# Review the file
head -50 /tmp/all_migrations.sql
```

#### 5.2 Apply to Dev Project

1. Go to Supabase Dashboard
2. Select **Dev project**
3. Go to **SQL Editor**
4. Create new query
5. Copy content from `/tmp/all_migrations.sql`
6. Paste and **Run**
7. Check for errors
8. If errors occur:
   - Some migrations might already be applied
   - Comment out completed migrations
   - Re-run

**OR use Supabase CLI** (faster):

```bash
# Link to dev project
supabase link --project-ref [dev-project-ref]

# Get project ref from: Project Settings → General → Reference ID

# Push all migrations
supabase db push

# This applies all migrations in correct order
```

#### 5.3 Apply to Production Project

Repeat the same process for Production project.

**⚠️ Important Notes:**
- If production already has data, migrations might already be applied
- Only apply missing migrations
- Test on dev first before production

### Phase 6: Connect GitHub Integration (10 min)

Now follow the main setup guide for both projects.

#### 6.1 Connect Dev Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select **e-masjid.my dev** project
3. Navigate to **Project Settings** → **Integrations**
4. Find **GitHub Connections** section
5. Click **Connect to GitHub**
6. Select repository: `Dev4w4n/e-masjid.my`
7. Click **Install & Authorize**
8. Configure:
   - **Production branch**: `dev` ⚠️ Yes, set to "dev"
   - **Directory path**: `/supabase` (or leave empty)
   - **Enable automatic migrations**: ✅ Check this
9. Click **Save**

#### 6.2 Connect Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select **e-masjid.my production** project
3. Navigate to **Project Settings** → **Integrations**
4. Find **GitHub Connections** section
5. Click **Connect to GitHub**
6. Select repository: `Dev4w4n/e-masjid.my`
7. Click **Install & Authorize**
8. Configure:
   - **Production branch**: `main`
   - **Directory path**: `/supabase` (or leave empty)
   - **Enable automatic migrations**: ✅ Check this
9. Click **Save**

### Phase 7: Update Environment Variables (10 min)

You now have new project URLs and API keys.

#### 7.1 Get New Credentials

**For Dev Project:**
1. Supabase Dashboard → Select Dev project
2. Project Settings → API
3. Copy:
   - Project URL: `https://[dev-ref].supabase.co`
   - `anon` `public` key

**For Production Project:**
1. Supabase Dashboard → Select Production project
2. Project Settings → API
3. Copy:
   - Project URL: `https://[prod-ref].supabase.co`
   - `anon` `public` key

#### 7.2 Update Local Environment Files

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Update .env.development (if exists)
cat > .env.development << 'EOF'
VITE_SUPABASE_URL=https://[dev-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]
NODE_ENV=development
EOF

# Update .env.production (if exists)
cat > .env.production << 'EOF'
VITE_SUPABASE_URL=https://[prod-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[prod-anon-key]
NODE_ENV=production
EOF
```

#### 7.3 Update Cloudflare Pages

If you're using Cloudflare Pages:

**Dev Environment:**
1. Cloudflare Dashboard → Pages
2. Select your dev projects (hub-dev, tv-dev, etc.)
3. Settings → Environment variables
4. Update:
   - `VITE_SUPABASE_URL` → new dev URL
   - `VITE_SUPABASE_ANON_KEY` → new dev key
5. Save and redeploy

**Production Environment:**
1. Same process for production projects
2. Use production credentials

### Phase 8: Test the Integration (10 min)

#### 8.1 Create Test Migration

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Create test migration
cat > supabase/migrations/999_test_github_integration.sql << 'EOF'
-- Test GitHub Integration
-- This will be removed after testing

CREATE TABLE IF NOT EXISTS github_integration_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text DEFAULT 'GitHub Integration Working!',
  environment text,
  created_at timestamptz DEFAULT now()
);

-- Insert test data
INSERT INTO github_integration_test (environment, message) 
VALUES ('test', 'If you see this, integration is working!');
EOF
```

#### 8.2 Test Dev Deployment

```bash
# Commit and push to dev
git add supabase/migrations/999_test_github_integration.sql
git commit -m "test: verify GitHub integration"
git push origin dev
```

**Verify:**
1. Wait 1-2 minutes
2. Go to Supabase Dev Dashboard
3. Navigate to Database → Migrations
4. Look for ✅ `999_test_github_integration`
5. Go to Table Editor
6. Check for `github_integration_test` table
7. Should see test data

#### 8.3 Test Production Deployment

```bash
# Merge to main
git checkout main
git merge dev
git push origin main
```

**Verify:**
1. Wait 1-2 minutes
2. Go to Supabase Production Dashboard
3. Same verification as dev

#### 8.4 Clean Up Test Migration

```bash
# Remove test migration
git checkout dev
rm supabase/migrations/999_test_github_integration.sql
git add supabase/migrations/999_test_github_integration.sql
git commit -m "test: remove GitHub integration test"
git push origin dev

# Merge to main
git checkout main
git merge dev
git push origin main
```

### Phase 9: Verify Everything Works (5 min)

#### 9.1 Checklist

**Dev Environment:**
- [ ] GitHub connected in Supabase Dashboard
- [ ] Branch set to `dev`
- [ ] Auto-migrations enabled
- [ ] Test migration deployed successfully
- [ ] Environment variables updated
- [ ] Local development works with new credentials
- [ ] Super admin user exists and can login

**Production Environment:**
- [ ] GitHub connected in Supabase Dashboard
- [ ] Branch set to `main`
- [ ] Auto-migrations enabled
- [ ] Test migration deployed successfully
- [ ] Environment variables updated in Cloudflare
- [ ] Production apps work with new credentials
- [ ] Super admin user exists and can login

#### 9.2 Check Migration History

In each project's SQL Editor:

```sql
-- Check all applied migrations
SELECT version, name, executed_at 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 20;

-- Should see all your migrations including the test one
```

### Phase 10: Update Documentation (5 min)

```bash
# Update your local notes
cat >> /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my/deployment/.env.local << 'EOF'
# Updated: [Today's Date]
# New Supabase Configuration

# Dev Project
DEV_SUPABASE_URL=https://[dev-ref].supabase.co
DEV_SUPABASE_ANON_KEY=[dev-anon-key]

# Production Project  
PROD_SUPABASE_URL=https://[prod-ref].supabase.co
PROD_SUPABASE_ANON_KEY=[prod-anon-key]

# Migration completed: [Today's Date]
EOF
```

## ✅ Migration Complete!

You now have:
- ✅ Two separate Supabase projects
- ✅ Dev project auto-deploys from `dev` branch
- ✅ Production project auto-deploys from `main` branch
- ✅ All migrations applied and tracked
- ✅ Environment variables updated
- ✅ Integration tested and verified

## 🎯 What Changed

| Before | After |
|--------|-------|
| Single project (maybe with preview branch) | Two separate projects |
| Manual disconnection needed | Clean GitHub integration |
| Old credentials | New credentials for each environment |
| Mixed environments | Complete isolation |

## 🔄 New Daily Workflow

```bash
# Work on feature
git checkout -b feature/new-thing
# Make changes

# Deploy to dev
git checkout dev
git merge feature/new-thing
git push origin dev
# ✨ Auto-deploys to Dev

# Test thoroughly

# Deploy to production
git checkout main
git merge dev
git push origin main
# ✨ Auto-deploys to Production
```

## 🆘 Troubleshooting Migration Issues

### Issue: "GitHub already connected to another project"

**Solution:**
1. Make sure you disconnected from ALL projects
2. In GitHub: Settings → Applications → Supabase
3. Revoke access completely
4. Reconnect from Supabase Dashboard

### Issue: "Migrations already applied" errors

**Solution:**
```sql
-- Check which migrations are recorded
SELECT * FROM supabase_migrations.schema_migrations;

-- If a migration failed but is recorded, you might need to:
-- 1. Fix the issue in a NEW migration
-- 2. Don't try to re-run failed migrations
```

### Issue: Environment variables not working

**Solution:**
1. Clear browser cache
2. Restart local dev server
3. Verify in Supabase Dashboard the keys are correct
4. Check for typos in URLs (easy to miss)
5. Ensure you're using the right environment

### Issue: Can't see migrations in Supabase

**Solution:**
1. Check GitHub connection status
2. Verify branch name is exactly `dev` or `main`
3. Check repository path includes `/supabase`
4. Look at Supabase logs: Project Settings → Logs
5. Try manual trigger: make a small change and push again

## 📞 Need Help?

1. **Check main guide**: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)
2. **Daily commands**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **Visual guide**: [VISUAL-WORKFLOW.md](./VISUAL-WORKFLOW.md)

## 📋 Quick Reference Post-Migration

```bash
# Check current branch
git branch

# Deploy to dev
git push origin dev

# Deploy to production  
git checkout main
git merge dev
git push origin main

# Check migration status
# Go to: Supabase Dashboard → Database → Migrations
```

---

**Migration Date**: _______________ (Fill this in)  
**Performed By**: _______________  
**Status**: [ ] Complete [ ] In Progress

**Last Updated**: December 5, 2025  
**Project**: E-Masjid.My
