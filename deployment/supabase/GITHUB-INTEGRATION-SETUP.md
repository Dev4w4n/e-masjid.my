# Supabase GitHub Integration Setup Guide

Complete guide to set up automatic deployments for E-Masjid.My with separate Supabase projects for dev and production environments.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│          GitHub Repository              │
│         Dev4w4n/e-masjid.my            │
│                                         │
│  ┌──────────┐         ┌──────────┐    │
│  │   dev    │         │   main   │    │
│  │  branch  │         │  branch  │    │
│  └────┬─────┘         └────┬─────┘    │
└───────┼──────────────────┼─────────────┘
        │                   │
        │ Auto Deploy       │ Auto Deploy
        │                   │
        ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│  Supabase Dev   │  │ Supabase Prod   │
│                 │  │                 │
│  AWS Singapore  │  │  AWS Singapore  │
│  Micro Instance │  │  Micro Instance │
│                 │  │                 │
│  • Migrations   │  │  • Migrations   │
│  • Test Data    │  │  • Seed Data    │
│  • Development  │  │  • Production   │
└─────────────────┘  └─────────────────┘
```

## 📋 Prerequisites

- GitHub account with access to `Dev4w4n/e-masjid.my`
- Supabase account (free tier works)
- Two Supabase projects already created:
  - **e-masjid.my dev** (AWS ap-southeast-2)
  - **e-masjid.my production** (AWS ap-southeast-2)

## 🚀 Step-by-Step Setup

### Part 1: Configure Dev Environment

#### 1.1 Connect GitHub to Supabase Dev Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select **e-masjid.my dev** project
3. Navigate to **Project Settings** → **Integrations**
4. Find **GitHub Connections** section
5. Click **Connect to GitHub**
6. Select repository: `Dev4w4n/e-masjid.my`
7. Click **Install & Authorize**

#### 1.2 Configure Dev Branch Integration

1. After connection, you'll see **Branch configuration**
2. Set the following:
   - **Production branch**: `dev` (this is your dev environment)
   - **Directory path**: Leave empty or use `/supabase` if needed
   - **Enable automatic migrations**: ✅ Checked
3. Click **Save**

#### 1.3 Verify Dev Setup

```bash
# Check that migrations directory is properly structured
ls -la supabase/migrations/

# Expected: Numbered migration files like 001_*.sql, 002_*.sql, etc.
```

### Part 2: Configure Production Environment

#### 2.1 Connect GitHub to Supabase Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select **e-masjid.my production** project
3. Navigate to **Project Settings** → **Integrations**
4. Find **GitHub Connections** section
5. Click **Connect to GitHub**
6. Select repository: `Dev4w4n/e-masjid.my`
7. Click **Install & Authorize**

#### 2.2 Configure Production Branch Integration

1. After connection, you'll see **Branch configuration**
2. Set the following:
   - **Production branch**: `main`
   - **Directory path**: Leave empty or use `/supabase` if needed
   - **Enable automatic migrations**: ✅ Checked
3. Click **Save**

#### 2.3 Verify Production Setup

Both projects should now show:

- ✅ GitHub connection active
- ✅ Auto-deploy enabled
- ✅ Correct branch linked

## 🔄 Deployment Workflow

### Development Flow

```bash
# 1. Work on feature branch
git checkout -b feature/new-feature
# Make changes to code and migrations

# 2. Push to dev for testing
git checkout dev
git merge feature/new-feature
git push origin dev

# ✨ Supabase Dev automatically:
# - Detects new migrations
# - Runs migrations in order
# - Updates database schema
```

### Production Flow

```bash
# 1. Test thoroughly on dev
# 2. Create pull request: dev → main
# 3. Review and approve PR
# 4. Merge to main

git checkout main
git merge dev
git push origin main

# ✨ Supabase Production automatically:
# - Detects new migrations
# - Runs migrations in order
# - Updates database schema
```

## 📁 Project Structure Requirements

Ensure your project structure follows Supabase conventions:

```
supabase/
├── config.toml              # Local development config
├── seed.sql                 # Optional: Cloud seed data
├── migrations/              # REQUIRED: Migration files
│   ├── 001_create_users.sql
│   ├── 002_create_profiles.sql
│   ├── 003_create_masjids.sql
│   └── ...                  # Numbered sequentially
└── README.md
```

### Migration File Naming Convention

- Use timestamps or sequential numbers
- Format: `NNN_description.sql` or `YYYYMMDDHHMMSS_description.sql`
- Example: `001_create_users.sql`, `20240101120000_add_qr_codes.sql`

## 🎯 Environment Variables Setup

Each environment needs separate environment variables.

### Development Environment (.env.development)

```bash
# Supabase Dev Project
VITE_SUPABASE_URL=https://[dev-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]

# Other dev-specific settings
NODE_ENV=development
```

### Production Environment (.env.production)

```bash
# Supabase Production Project
VITE_SUPABASE_URL=https://[prod-project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[prod-anon-key]

# Other prod-specific settings
NODE_ENV=production
```

### Finding Your Project Keys

1. Go to Supabase Dashboard
2. Select your project (dev or production)
3. Navigate to **Project Settings** → **API**
4. Copy:
   - Project URL
   - `anon` `public` key

## 🔐 Initial Data Setup

### Dev Environment

```sql
-- Run this in Supabase Dev SQL Editor after first deployment

-- 1. Create super admin user in Authentication UI first
-- Email: dev-admin@e-masjid.my
-- Password: [secure-password]

-- 2. Then run this SQL to set role:
UPDATE users
SET role = 'super_admin'
WHERE email = 'dev-admin@e-masjid.my';

-- 3. Verify
SELECT id, email, role FROM users WHERE role = 'super_admin';
```

### Production Environment

```sql
-- Run this in Supabase Production SQL Editor after first deployment

-- 1. Create super admin user in Authentication UI first
-- Email: admin@e-masjid.my
-- Password: [secure-password]

-- 2. Then run this SQL to set role:
UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@e-masjid.my';

-- 3. Verify
SELECT id, email, role FROM users WHERE role = 'super_admin';
```

## 🧪 Testing the Integration

### Test Dev Deployment

```bash
# 1. Create a test migration
cd supabase/migrations
cat > 999_test_integration.sql << 'EOF'
-- Test migration for GitHub integration
CREATE TABLE IF NOT EXISTS test_integration (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO test_integration (message) VALUES ('GitHub integration working!');
EOF

# 2. Commit and push to dev
git add supabase/migrations/999_test_integration.sql
git commit -m "test: verify GitHub integration"
git push origin dev

# 3. Check Supabase Dev Dashboard
# - Go to Database → Migrations
# - Verify 999_test_integration is listed
# - Go to Table Editor → test_integration
# - Should see the test row

# 4. Clean up
rm supabase/migrations/999_test_integration.sql
git add supabase/migrations/999_test_integration.sql
git commit -m "test: remove test migration"
git push origin dev
```

### Test Production Deployment

```bash
# After testing on dev, merge to main
git checkout main
git merge dev
git push origin main

# Check Supabase Production Dashboard
# Same verification steps as dev
```

## 🚨 Important Notes

### Migration Best Practices

1. **Never delete migrations** - Supabase tracks which migrations have run
2. **Always test on dev first** - Catch errors before production
3. **Use transactions** - Wrap migrations in `BEGIN;` and `COMMIT;`
4. **Include rollback plan** - Comment how to revert if needed
5. **Sequential numbering** - Keep migrations in order

### Troubleshooting

#### Migrations not running

1. Check GitHub connection status in Supabase Dashboard
2. Verify branch configuration is correct
3. Check migration file names follow convention
4. Look at Supabase logs: Project Settings → Logs

#### Migration failed

1. Go to Database → Migrations in Supabase Dashboard
2. Find the failed migration
3. Read error message
4. Fix the SQL
5. Create a new migration to fix (don't modify old ones)

#### Different schemas between dev and prod

1. This shouldn't happen with proper workflow
2. Check migration history in both projects
3. Identify missing migrations
4. Create fix migration to sync schemas

## 📊 Monitoring

### Check Migration Status

**In Supabase Dashboard:**

1. Go to **Database** → **Migrations**
2. See list of applied migrations with timestamps
3. Check for any failed migrations

**In SQL Editor:**

```sql
-- View migration history
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

### Verify GitHub Integration

1. Go to **Project Settings** → **Integrations**
2. GitHub connection should show:
   - ✅ Connected
   - Branch: dev (for dev project) or main (for prod project)
   - Last sync: [recent timestamp]

## 🔄 Migration Rollback

If you need to rollback a migration:

```sql
-- Example: Rollback creating a table
-- Create a new migration file: XXX_rollback_feature.sql

BEGIN;

-- Undo the changes
DROP TABLE IF EXISTS new_feature_table;

-- Or modify back
ALTER TABLE users DROP COLUMN IF EXISTS new_column;

COMMIT;
```

Then commit and push:

```bash
git add supabase/migrations/XXX_rollback_feature.sql
git commit -m "fix: rollback problematic migration"
git push origin dev  # Test first
git push origin main # Then production
```

## 📞 Support Resources

- [Supabase GitHub Integration Docs](https://supabase.com/docs/guides/cli/github-integration)
- [Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase Discord](https://discord.supabase.com)
- Project Repository: [Dev4w4n/e-masjid.my](https://github.com/Dev4w4n/e-masjid.my)

## ✅ Checklist

After completing setup, verify:

- [ ] Dev project connected to GitHub
- [ ] Dev project watching `dev` branch
- [ ] Production project connected to GitHub
- [ ] Production project watching `main` branch
- [ ] Test migration deployed successfully to dev
- [ ] Test migration deployed successfully to production
- [ ] Super admin created in dev environment
- [ ] Super admin created in production environment
- [ ] Environment variables configured for both environments
- [ ] Team members understand deployment workflow

---

**Last Updated**: December 5, 2025
**Project**: E-Masjid.My
**Repository**: Dev4w4n/e-masjid.my
