# Getting Started: 5-Minute Guide

The absolute quickest way to understand the Supabase GitHub Integration setup.

## 🎯 What You're Setting Up

**Goal**: Automatic database deployments when you push code to GitHub

**Result**:
- Push to `dev` → Database updates in Supabase Dev
- Push to `main` → Database updates in Supabase Production

## ⚡ Quick Overview (2 minutes)

### Current State
```
You manually run SQL in Supabase Dashboard
❌ Manual work
❌ Easy to forget
❌ No history
```

### After Setup
```
You push code to GitHub
✅ Automatic database updates
✅ Tracked in git
✅ Safe testing on dev first
```

## 🚀 What to Do Now

### If You Already Have Supabase Connected to GitHub

**👉 Go to: [MIGRATION-FROM-OLD-SETUP.md](./MIGRATION-FROM-OLD-SETUP.md)**

**Time needed**: 60 minutes  
**What it does**: Safely disconnect old setup and migrate to new two-project configuration

### If You're Setting Up (First Time)

**👉 Go to: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)**

**Time needed**: 30 minutes  
**Checklist**: [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)

### If You're a Developer (Daily Use)

**👉 Go to: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)**

**Common commands**:
```bash
# Deploy to dev
git push origin dev

# Deploy to production
git push origin main
```

### If You Want to Understand How It Works

**👉 Go to: [VISUAL-WORKFLOW.md](./VISUAL-WORKFLOW.md)**

**Shows**:
- Diagrams
- Examples
- Data flow
- Step-by-step process

## 📚 All Documents

| Document | For | Read Time |
|----------|-----|-----------|
| [SETUP-SUMMARY.md](./SETUP-SUMMARY.md) | Overview | 5 min |
| [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md) | Setup | 10 min |
| [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | Setup | 30 min |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Daily dev | 2 min |
| [VISUAL-WORKFLOW.md](./VISUAL-WORKFLOW.md) | Learning | 10 min |

## 🎬 Simple Example

### Before (Manual Way)

```bash
# 1. Write SQL migration file locally
# 2. Push code to GitHub
# 3. Open Supabase Dashboard
# 4. Copy SQL from migration file
# 5. Paste into SQL Editor
# 6. Run manually
# 7. Repeat for dev and production
```

### After (Automatic Way)

```bash
# 1. Write SQL migration file locally
# 2. Push code to GitHub
# Done! ✨ Supabase runs it automatically
```

## 🔑 Key Concepts

### Two Separate Projects

```
Supabase Dev Project
├── Connected to: dev branch
├── URL: https://xxx-dev.supabase.co
└── Auto-deploys: When you push to dev

Supabase Production Project
├── Connected to: main branch
├── URL: https://xxx-prod.supabase.co
└── Auto-deploys: When you push to main
```

### Migration Files

```
supabase/migrations/
├── 001_create_users.sql       ← Run first
├── 002_create_profiles.sql    ← Run second
├── 003_create_masjids.sql     ← Run third
└── ...                         ← Run in order
```

**Rules**:
- Sequential numbering
- Never delete files
- Never modify deployed files
- Always test on dev first

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Push to dev and see migrations run automatically
- [ ] Push to main and see migrations run automatically
- [ ] Check migration status in Supabase Dashboard
- [ ] Know where to find daily commands
- [ ] Know where to get help

## 🆘 Need Help?

### During Setup

Problem: "I'm stuck during setup"  
→ Check: [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) for detailed steps

### Daily Development

Problem: "How do I deploy my changes?"  
→ Check: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) for commands

### Understanding System

Problem: "I don't understand how it works"  
→ Check: [VISUAL-WORKFLOW.md](./VISUAL-WORKFLOW.md) for diagrams

### Everything Else

Problem: "I need complete information"  
→ Check: [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md) for full guide

## 🎯 Next Action

**Choose one**:

1. **I need to set this up** → [GITHUB-INTEGRATION-SETUP.md](./GITHUB-INTEGRATION-SETUP.md)
2. **I just want commands** → [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **I want to learn more** → [SETUP-SUMMARY.md](./SETUP-SUMMARY.md)

---

**Last Updated**: December 5, 2025  
**Reading Time**: 5 minutes  
**Project**: E-Masjid.My
