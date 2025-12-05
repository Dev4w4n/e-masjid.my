# Quick Steps: Reset Your Existing Supabase-GitHub Connection

You mentioned you already have Supabase linked to GitHub. Here's the fastest way to reset and reconfigure for the new two-project setup.

## ⚡ Super Quick Version (15 minutes)

### Step 1: Disconnect Current Setup (2 min)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. For EACH project with GitHub connected:
   - Project Settings → Integrations
   - GitHub Connections → **Disconnect**
   - Confirm

### Step 2: Reconnect to Two Projects (10 min)

**Dev Project:**

1. Supabase Dashboard → Select "e-masjid.my dev" project
2. Project Settings → Integrations → Connect to GitHub
3. Repository: `Dev4w4n/e-masjid.my`
4. **Production branch**: `dev` (yes, set to dev!)
5. Enable automatic migrations: ✅
6. Save

**Production Project:**

1. Supabase Dashboard → Select "e-masjid.my production" project
2. Project Settings → Integrations → Connect to GitHub
3. Repository: `Dev4w4n/e-masjid.my`
4. **Production branch**: `main`
5. Enable automatic migrations: ✅
6. Save

### Step 3: Test It (3 min)

```bash
cd /Users/rohaizan/Codes/ai-gen/agent-1-emasjid-my

# Create tiny test file
echo "-- Test" > supabase/migrations/999_test.sql

# Push to dev
git add supabase/migrations/999_test.sql
git commit -m "test: integration"
git push origin dev

# Wait 1 minute, check Supabase Dev Dashboard → Database → Migrations
# Should see 999_test applied ✅

# Clean up
rm supabase/migrations/999_test.sql
git add supabase/migrations/999_test.sql
git commit -m "test: cleanup"
git push origin dev
```

Done! ✅

## 📖 Need More Detail?

**Full guide with screenshots and explanations:**
👉 [MIGRATION-FROM-OLD-SETUP.md](./MIGRATION-FROM-OLD-SETUP.md)

## 🚨 Common Issue: "GitHub Already Connected"

If you see this error:

1. Make sure you disconnected from ALL Supabase projects
2. Go to GitHub: Settings → Applications → Supabase
3. Click on Supabase integration
4. Click "Revoke" or "Uninstall"
5. Go back to Supabase and reconnect

## ⚠️ Important Notes

### You Need Two Supabase Projects

**Check what you have:**

- Go to [Supabase Dashboard](https://app.supabase.com)
- Do you see two projects?
  - ✅ Yes → Great! Proceed with reset
  - ❌ No → Create second project first

**If you only have one project:**

Option 1: Create new Dev project

```
1. Supabase Dashboard → New Project
2. Name: e-masjid.my dev
3. Region: Southeast Asia (Singapore)
4. Create
```

Option 2: Create new Production project

```
1. Supabase Dashboard → New Project
2. Name: e-masjid.my production
3. Region: Southeast Asia (Singapore)
4. Create
```

### Both Projects Need Same Schema

Before connecting GitHub, ensure both have the same migrations applied.

**Quick way using Supabase CLI:**

```bash
# Connect to dev project
supabase link --project-ref [dev-ref]
supabase db push

# Connect to prod project
supabase link --project-ref [prod-ref]
supabase db push
```

Get project ref from: Project Settings → General → Reference ID

## 🎯 What You're Achieving

### Before

```
Maybe: Single project with preview branch
Or: One project connected to main only
```

### After

```
✅ Two separate projects
✅ Dev auto-deploys from dev branch
✅ Production auto-deploys from main branch
✅ Complete isolation
```

## 🔄 Your New Workflow

```bash
# Work on feature
git checkout -b feature/new-thing

# Push to dev (triggers deploy)
git checkout dev
git merge feature/new-thing
git push origin dev
# ✨ Migrations run on Dev automatically

# Test on dev, then deploy to prod
git checkout main
git merge dev
git push origin main
# ✨ Migrations run on Production automatically
```

## ✅ Verification Checklist

After reset:

- [ ] Dev project shows GitHub connected to `dev` branch
- [ ] Production project shows GitHub connected to `main` branch
- [ ] Both show "Auto-migrations: Enabled"
- [ ] Test push to dev triggered migration
- [ ] Environment variables updated (if needed)

## 📞 Quick Links

- **Full Migration Guide**: [MIGRATION-FROM-OLD-SETUP.md](./MIGRATION-FROM-OLD-SETUP.md)
- **Setup Guide**: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)
- **Daily Commands**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

---

**Quick Reset Time**: ~15 minutes  
**Full Migration Time**: ~60 minutes (if you need schema sync, etc.)

Choose based on your situation!
