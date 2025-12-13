# ⚡ Quick Reference: Database Migrations

## 🎯 Golden Rule

**ALWAYS use Supabase CLI to create migrations. NEVER create them manually.**

## ✅ Correct Way

```bash
# Step 1: Create migration with CLI
supabase migration new describe_your_change

# Example outputs:
# Created new migration at supabase/migrations/20251206063702_describe_your_change.sql

# Step 2: Edit the generated file with your SQL
# supabase/migrations/20251206XXXXXX_describe_your_change.sql

# Step 3: Test locally
supabase db reset

# Step 4: Commit and push
git add supabase/migrations/
git commit -m "feat: add describe_your_change migration"
git push origin dev
```

## ❌ Wrong Way

```bash
# DON'T DO THIS!
touch supabase/migrations/030_my_feature.sql
# This won't be picked up by Supabase GitHub integration!
```

## 📋 Migration Naming Format

### ✅ Correct: Timestamp Format

```
YYYYMMDDHHMMSS_description.sql
20251206063702_add_user_content_edit_policies.sql
```

### ❌ Wrong: Manual Sequential Numbers

```
030_add_user_content_edit_policies.sql
031_my_new_feature.sql
```

## 🔍 Why Timestamp Format?

1. **GitHub Integration**: Only timestamp format is auto-deployed
2. **No Conflicts**: Multiple developers can work simultaneously
3. **Clear Ordering**: Natural sort order by creation time
4. **Official Standard**: Matches Supabase CLI behavior

## 🧪 Testing Checklist

After creating migration:

- [ ] Run `supabase db reset` locally
- [ ] Verify migration applied without errors
- [ ] Test affected features in app
- [ ] Commit with descriptive message
- [ ] Push to dev branch
- [ ] Check Supabase Dashboard → Database → Migrations
- [ ] Verify migration shows in dashboard with timestamp
- [ ] Test in dev environment

## 📊 Quick Verification

```bash
# List all migrations (sorted)
ls -1 supabase/migrations/ | sort

# Check if timestamp format is used
ls supabase/migrations/ | grep -E '^[0-9]{14}_'

# Verify in database after push
psql $DATABASE_URL -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;"
```

## 🚨 Common Mistakes

| ❌ Mistake                  | ✅ Solution                       |
| --------------------------- | --------------------------------- |
| Manual numbering (030\_)    | Use CLI: `supabase migration new` |
| Editing deployed migrations | Create new migration to fix       |
| Skipping local testing      | Always run `supabase db reset`    |
| Not checking dashboard      | Verify in Supabase after push     |

## 📚 Project Context

Open E Masjid uses mixed naming:

- **001-104**: Legacy migrations (pre-GitHub integration)
- **2025\***: New migrations (correct timestamp format)

**For new migrations**: Always use timestamp format via CLI.

## 🔗 Related Documentation

- `/docs/MIGRATION-NAMING-CONVENTION.md` - Detailed explanation
- `/deployment/supabase/QUICK-REFERENCE.md` - Deployment workflow
- `/deployment/supabase/GITHUB-INTEGRATION-SETUP.md` - CI/CD setup

---

**Last Updated**: 2025-12-06
**Applies To**: All new database migrations going forward
