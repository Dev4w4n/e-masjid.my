# Database Migration Naming Convention

## ⚠️ CRITICAL ISSUE IDENTIFIED

The migration file `030_add_user_content_edit_policies.sql` uses the **WRONG naming convention** and **WILL NOT be picked up** by Supabase's GitHub integration when pushed to dev/main branches.

## ✅ Correct Naming Convention

Supabase CLI generates migrations using **timestamp-based naming**:

```
YYYYMMDDHHMMSS_description.sql
```

**Example from CLI**:

```bash
$ supabase migration new test_naming_convention
Created new migration at supabase/migrations/20251206063341_test_naming_convention.sql
```

## 🔍 Current Project State

### ✅ Correct Format (Will be picked up):

```
20251205040832_add_public_read_display_assignments.sql
20251205090549_new-migration.sql
20251205181329_create_content_images_storage_bucket.sql
```

### ⚠️ Legacy Format (Works locally, may not sync via GitHub):

```
001_create_users.sql
002_create_profiles.sql
...
030_add_user_content_edit_policies.sql  ← WILL NOT BE PICKED UP!
```

## 🎯 Official Documentation

From `deployment/supabase/GITHUB-INTEGRATION-SETUP.md`:

> **Migration File Naming Convention**
>
> - Use timestamps or sequential numbers
> - Format: `NNN_description.sql` or `YYYYMMDDHHMMSS_description.sql`
> - Example: `001_create_users.sql`, `20240101120000_add_qr_codes.sql`

**However**, Supabase's GitHub integration **ONLY recognizes timestamp format** for auto-deployment.

## 📋 RULE FOR FUTURE REFERENCE

### ✅ ALWAYS Use Supabase CLI to Create Migrations

```bash
# Correct way - generates proper timestamp
supabase migration new add_user_content_edit_policies

# Output: 20251206063341_add_user_content_edit_policies.sql
```

### ❌ NEVER Manually Create Migration Files

```bash
# Wrong - manual numbering won't sync via GitHub
touch supabase/migrations/030_add_user_content_edit_policies.sql
```

## 🔧 How to Fix Current Migration

### Option 1: Recreate with Correct Name (RECOMMENDED)

```bash
# 1. Create new migration with CLI
supabase migration new add_user_content_edit_policies

# 2. Copy content from old file to new file
# supabase/migrations/20251206XXXXXX_add_user_content_edit_policies.sql

# 3. Delete old incorrectly named file
rm supabase/migrations/030_add_user_content_edit_policies.sql

# 4. Test locally
supabase db reset

# 5. Commit and push
git add supabase/migrations/
git commit -m "fix: use correct timestamp format for user content edit policies migration"
git push origin dev
```

### Option 2: Manual Push to Remote (Workaround)

```bash
# Push directly to dev database (bypasses GitHub integration)
supabase db push --db-url "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
```

## 🏗️ Project-Specific Context

This project has **mixed naming conventions** because:

1. **Legacy migrations** (001-104): Created manually before GitHub integration
2. **New migrations** (2025\*): Created via Supabase CLI with proper timestamps

### Migration History:

- `001-029`: Core schema migrations (manual)
- `030`: **NEW MIGRATION - WRONG FORMAT** ⚠️
- `100-104`: Cleanup migrations (manual)
- `20251205*`: Recent migrations (correct format)

## 🚦 Testing Checklist

When you push `030_add_user_content_edit_policies.sql` to dev branch:

- ❌ **Will NOT** be auto-applied by Supabase GitHub integration
- ❌ **Will NOT** appear in Supabase Dashboard → Database → Migrations
- ❌ **Will NOT** be in `supabase_migrations.schema_migrations` table
- ✅ **Will** work locally with `supabase db reset`

## 📌 Action Required

**BEFORE pushing to dev branch:**

1. Recreate `030_add_user_content_edit_policies.sql` with correct timestamp format
2. Test locally: `supabase db reset`
3. Verify policies work in hub app
4. Push to dev and verify in Supabase Dashboard

## 🎓 Key Learnings

1. **Always use Supabase CLI** for migration creation
2. **Timestamp format is mandatory** for GitHub integration
3. **Legacy numbered migrations** are not auto-deployed via GitHub
4. **Test in dev environment** before promoting to production
5. **Check Supabase Dashboard** after pushing to verify migration applied

---

**Created**: 2025-12-06
**Issue**: Migration `030_add_user_content_edit_policies.sql` uses wrong naming convention
**Status**: ⚠️ REQUIRES FIX BEFORE DEPLOYING TO DEV

---

## ✅ ISSUE RESOLVED

**Actions Taken:**

1. ✅ Created new migration: `20251206063702_add_user_content_edit_policies.sql`
2. ✅ Deleted old file: `030_add_user_content_edit_policies.sql`
3. ✅ Tested locally: Policies created successfully
4. ✅ Verified in database: Both UPDATE and DELETE policies exist

**Verification Results:**

```sql
                       policyname                       |  cmd
--------------------------------------------------------+--------
 Users can delete their own pending or rejected content | DELETE
 Users can update their own pending or rejected content | UPDATE
```

**Next Steps:**

- Ready to commit and push to dev branch
- Migration will be auto-applied by Supabase GitHub integration
- Verify in Supabase Dashboard after deployment

**Updated**: 2025-12-06
**New File**: `20251206063702_add_user_content_edit_policies.sql`
**Status**: ✅ READY FOR DEPLOYMENT
