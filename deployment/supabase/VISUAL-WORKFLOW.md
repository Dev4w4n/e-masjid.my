# Supabase GitHub Integration: Visual Workflow

Visual guide to understand how automatic deployments work with separate Supabase projects.

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                        │
│                   Dev4w4n/e-masjid.my                       │
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │   Feature Branches   │    │                      │     │
│  │  • feature/new-ui    │───▶│    dev branch        │     │
│  │  • fix/bug-123       │    │  (Development)       │     │
│  │  • docs/update       │    │                      │     │
│  └──────────────────────┘    └──────────┬───────────┘     │
│                                          │                 │
│                                          │ PR & Merge      │
│                                          ▼                 │
│                               ┌──────────────────────┐     │
│                               │    main branch       │     │
│                               │   (Production)       │     │
│                               └──────────┬───────────┘     │
└──────────────────────────────────────────┼─────────────────┘
                                           │
        ┌──────────────────────────────────┴─────────┐
        │                                            │
        │ GitHub Webhook                             │ GitHub Webhook
        │ (on push)                                  │ (on push)
        ▼                                            ▼
┌───────────────────────┐              ┌───────────────────────┐
│   SUPABASE DEV        │              │  SUPABASE PRODUCTION  │
│   AWS Singapore       │              │   AWS Singapore       │
│                       │              │                       │
│  📊 Dev Database      │              │  📊 Prod Database     │
│  🔐 Dev Auth          │              │  🔐 Prod Auth         │
│  📦 Dev Storage       │              │  📦 Prod Storage      │
│  ⚡ Realtime          │              │  ⚡ Realtime          │
│                       │              │                       │
│  Auto-runs:           │              │  Auto-runs:           │
│  • Migrations         │              │  • Migrations         │
│  • Seed data          │              │  • Seed data          │
└───────────┬───────────┘              └──────────┬────────────┘
            │                                     │
            │ Provides credentials                │ Provides credentials
            ▼                                     ▼
┌───────────────────────┐              ┌───────────────────────┐
│  CLOUDFLARE PAGES     │              │  CLOUDFLARE PAGES     │
│  (Dev Environment)    │              │  (Prod Environment)   │
│                       │              │                       │
│  • hub-dev            │              │  • hub-prod           │
│  • public-dev         │              │  • public-prod        │
│  • tv-dev             │              │  • tv-prod            │
└───────────────────────┘              └───────────────────────┘
```

## 🔄 Development Workflow

### Step 1: Feature Development

```
Developer's Computer
├── Work on feature branch
├── Add/modify code
├── Create migrations if needed
└── Test locally with ./scripts/setup-supabase.sh
```

### Step 2: Deploy to Dev

```
┌─────────────────┐
│  git push       │
│  origin dev     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  GitHub detects push        │
│  Triggers webhook           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Supabase Dev receives      │
│  notification               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Supabase scans:            │
│  /supabase/migrations/      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Compares with applied      │
│  migrations in database     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Runs new migrations        │
│  in sequential order        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Runs seed.sql (if exists)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  ✅ Dev environment updated │
└─────────────────────────────┘
```

### Step 3: Test on Dev

```
Developer
├── Opens dev application URL
├── Tests new features
├── Verifies migrations worked
├── Checks for bugs
└── Confirms everything works
```

### Step 4: Deploy to Production

```
┌─────────────────┐
│  git checkout   │
│  main           │
│  git merge dev  │
│  git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Same process as dev,       │
│  but for production         │
│  Supabase project           │
└─────────────────────────────┘
```

## 📊 Data Flow

### Configuration Data

```
GitHub Repository
├── /supabase/migrations/
│   ├── 001_create_users.sql ──────┐
│   ├── 002_create_profiles.sql ───┤
│   └── 030_latest_feature.sql ────┤
│                                   │
│                                   │ Read by
│                                   │ Supabase
│                                   │
└───────────────────────────────────┘
                                    │
            ┌───────────────────────┴────────────────────┐
            │                                            │
            ▼                                            ▼
    Supabase Dev                              Supabase Production
    Applies migrations                        Applies migrations
    to dev database                           to prod database
```

### Environment Variables

```
Supabase Dashboard (Manual Config)
├── Dev Project
│   ├── Project URL: https://xxx-dev.supabase.co
│   └── Anon Key: eyJxxx...dev
│
└── Production Project
    ├── Project URL: https://xxx-prod.supabase.co
    └── Anon Key: eyJxxx...prod

These are configured in:
├── Local: .env.development / .env.production
└── Cloudflare: Project Settings → Environment Variables
```

## 🎬 Real Example: Adding a Feature

### Scenario: Add QR Code to Display Content

#### 1. Create Migration

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my
cd supabase/migrations

cat > 024_add_qr_code_to_display_content.sql << 'EOF'
-- Add QR code support to display content
ALTER TABLE display_content
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_position VARCHAR(20) DEFAULT 'bottom-right';
EOF
```

#### 2. Test Locally

```bash
# Reset local database to test migration
./scripts/setup-supabase.sh

# Verify migration applied
psql -h localhost -p 54322 -d postgres -U postgres -c \
  "SELECT column_name FROM information_schema.columns
   WHERE table_name = 'display_content';"

# Should show qr_code_url and qr_code_position
```

#### 3. Deploy to Dev

```bash
git add supabase/migrations/024_add_qr_code_to_display_content.sql
git commit -m "feat: add QR code support to display content"
git push origin dev
```

**What happens automatically:**

```
GitHub
  │
  │ Webhook triggered
  ▼
Supabase Dev
  │
  ├─ Detects new migration file
  ├─ Checks it hasn't been applied yet
  ├─ Executes SQL:
  │    ALTER TABLE display_content
  │    ADD COLUMN qr_code_url TEXT,
  │    ADD COLUMN qr_code_position VARCHAR(20) DEFAULT 'bottom-right';
  │
  └─ ✅ Migration 024 recorded as applied
```

#### 4. Verify on Dev

```bash
# Check Supabase Dev Dashboard
# Navigate to: Database → Migrations
# Should see: ✅ 024_add_qr_code_to_display_content

# Or check SQL Editor:
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '024';
```

#### 5. Test Application

```
Open: https://hub-dev.emasjid.my (or your dev URL)
Test: Create display content with QR code
Verify: QR code appears correctly
```

#### 6. Deploy to Production

```bash
# Everything looks good on dev
git checkout main
git merge dev
git push origin main
```

**Same automatic process happens on Production Supabase project**

## 🔍 Migration Tracking

### How Supabase Knows What to Run

```
Every Supabase project has a table:
supabase_migrations.schema_migrations

┌─────────┬──────────────────────────────┬─────────────────────┐
│ version │           name               │    executed_at      │
├─────────┼──────────────────────────────┼─────────────────────┤
│ 001     │ create_users                 │ 2024-01-01 10:00:00 │
│ 002     │ create_profiles              │ 2024-01-01 10:00:05 │
│ 003     │ create_masjids               │ 2024-01-01 10:00:10 │
│ ...     │ ...                          │ ...                 │
│ 024     │ add_qr_code_to_display...    │ 2024-12-05 14:30:00 │
└─────────┴──────────────────────────────┴─────────────────────┘

When GitHub webhook triggers:
1. Supabase reads all files in /supabase/migrations/
2. Compares file names with this table
3. Runs only the NEW ones
4. Records each successful migration
```

## 🚨 Error Handling

### If Migration Fails

```
Supabase Dev
  │
  ├─ Attempts to run migration
  ├─ ❌ SQL Error: column already exists
  │
  └─ Migration NOT recorded as applied
     (so it can be fixed and retried)

What you see:
├── Supabase Dashboard → Logs
│   └── Error: column "qr_code_url" already exists
│
└── Migration NOT in schema_migrations table
```

### How to Fix

```bash
# Option 1: Create a new migration that fixes it
cat > 025_fix_qr_code_migration.sql << 'EOF'
-- Fix: Check if column exists before adding
ALTER TABLE display_content
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
EOF

git add supabase/migrations/025_fix_qr_code_migration.sql
git commit -m "fix: handle existing qr_code_url column"
git push origin dev

# Option 2: Manually fix in SQL Editor, then re-push
# (Not recommended - prefer new migrations)
```

## 📈 Benefits of This Setup

| Feature        | Benefit                                 |
| -------------- | --------------------------------------- |
| **Automatic**  | No manual SQL running required          |
| **Tracked**    | Every migration recorded with timestamp |
| **Safe**       | Test on dev before production           |
| **Reversible** | Create rollback migrations if needed    |
| **Auditable**  | Git history shows who/when/why          |
| **Consistent** | Dev and prod schemas always match       |

## 🎯 Best Practices

### ✅ DO

- Always create migrations for schema changes
- Test on dev first
- Use sequential numbering (001, 002, 003...)
- Include descriptive names
- Add comments in SQL files
- Use transactions (BEGIN/COMMIT)
- Keep migrations small and focused

### ❌ DON'T

- Never modify deployed migrations
- Never delete migration files
- Never skip dev testing
- Never hardcode environment-specific values
- Never run manual SQL on production (use migrations)
- Never merge to main without testing on dev

---

**Last Updated**: December 5, 2025
**Project**: E-Masjid.My
