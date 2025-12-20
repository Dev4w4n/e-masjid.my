# Open E Masjid Deployment Guide

This guide covers deploying Open E Masjid to production and staging environments using Cloudflare Pages and Supabase.

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
        │ (migrations)      │ (migrations)
        │                   │
        ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│  Supabase Dev   │  │ Supabase Prod   │
│  AWS Singapore  │  │  AWS Singapore  │
└─────────────────┘  └─────────────────┘
        │                   │
        │ Env Vars          │ Env Vars
        │                   │
        ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ Cloudflare Dev  │  │ Cloudflare Prod │
│  ┌───────────┐  │  │  ┌───────────┐  │
│  │ hub-dev   │  │  │  │ hub-prod  │  │
│  │ public-dev│  │  │  │public-prod│  │
│  │ tv-dev    │  │  │  │ tv-prod   │  │
│  └───────────┘  │  │  └───────────┘  │
└─────────────────┘  └─────────────────┘
```

## 🚀 Applications to Deploy

1. **Hub App** (`apps/hub`) - Main management interface (Vite React app)
2. **Papan Info App** (`apps/papan-info`) - SEO-friendly public content (Next.js app)
3. **TV Display App** (`apps/tv-display`) - Kiosk display interface (Next.js app)

## 📁 Directory Structure

```
deployment/
├── README.md                              # This file (overview)
├── QUICK-START.md                         # Quick deployment guide
├── cloudflare/
│   ├── pages-config/
│   │   ├── hub-production.toml            # Hub app production config
│   │   ├── hub-staging.toml               # Hub app staging config
│   │   ├── public-production.toml
│   │   ├── public-staging.toml
│   │   ├── tv-production.toml
│   │   └── tv-staging.toml
│   └── wrangler-configs/                  # Wrangler CLI configs (if needed)
├── supabase/
│   ├── README.md                          # Supabase overview
│   ├── GITHUB-INTEGRATION-SETUP.md        # 🌟 Main setup guide
│   ├── QUICK-REFERENCE.md                 # Quick commands reference
│   └── SETUP-CHECKLIST.md                 # Step-by-step checklist
└── scripts/
    ├── deploy-cloudflare.sh               # Deployment automation
    └── setup-environments.sh              # Environment setup
```

## 🔐 Security & Environment Variables

### ⚠️ CRITICAL SECURITY NOTES

1. **NEVER commit actual secrets to this repository**
2. All environment variables with sensitive data use placeholders
3. Configure actual values in Cloudflare Pages dashboard
4. Use Supabase project settings for database secrets
5. Enable branch protection rules on main/dev branches

### Environment Variable Strategy

- **Development**: `.env.local` files (git-ignored)
- **Staging/Production**: Cloudflare Pages environment variables
- **Database**: Supabase project-specific environment variables

## ⚡ Quick Start

### 🎯 Recommended: GitHub Integration Setup

**For automatic deployments (production-ready), use Supabase GitHub Integration:**

1. **[Supabase GitHub Integration Setup Guide](./supabase/GITHUB-INTEGRATION-SETUP.md)** - Complete setup (30 min)
2. **[Setup Checklist](./supabase/SETUP-CHECKLIST.md)** - Step-by-step verification
3. **[Quick Reference](./supabase/QUICK-REFERENCE.md)** - Daily commands

**What you get:**

- ✅ Push to `dev` branch → Auto-deploys to Supabase Dev
- ✅ Merge to `main` branch → Auto-deploys to Supabase Production
- ✅ Persistent dev and production environments
- ✅ Zero manual migration management

### Alternative: Manual Setup

```bash
# Generate all deployment configurations
./deployment/scripts/setup-environments.sh both

# Validate your setup
./deployment/scripts/deploy-cloudflare.sh staging all validate
```

## 📋 Deployment Workflow

### Development Cycle

```bash
# 1. Work on feature
git checkout -b feature/new-thing
# Make changes, add migrations if needed

# 2. Push to dev for testing
git checkout dev
git merge feature/new-thing
git push origin dev
# ✨ Automatically deploys to Supabase Dev

# 3. Test on dev environment
# Visit your dev URLs and test thoroughly

# 4. Deploy to production
git checkout main
git merge dev
git push origin main
# ✨ Automatically deploys to Supabase Production
```

### Migration Management

All migrations in `/supabase/migrations/` are automatically applied when you push:

- Sequential numbered files: `001_*.sql`, `002_*.sql`, etc.
- Never delete or modify deployed migrations
- Always test on dev before production

## 📚 Documentation Guide

| Document                                                              | Purpose                | When to Use       |
| --------------------------------------------------------------------- | ---------------------- | ----------------- |
| [GITHUB-INTEGRATION-SETUP.md](./supabase/GITHUB-INTEGRATION-SETUP.md) | Complete setup guide   | Initial setup     |
| [SETUP-CHECKLIST.md](./supabase/SETUP-CHECKLIST.md)                   | Verification checklist | During setup      |
| [QUICK-REFERENCE.md](./supabase/QUICK-REFERENCE.md)                   | Daily commands         | Daily development |
| [Supabase README](./supabase/README.md)                               | Overview & config      | Reference         |
| [Environment Variables](./ENVIRONMENT-VARIABLES.md)                   | Env var guide          | Configuration     |

## 🛠️ Maintenance

- Monitor deployment logs in Cloudflare Pages dashboard
- Monitor database performance in Supabase dashboard
- Regular security updates via dependabot
- Backup strategies for production data

## 📞 Support

For deployment issues:

1. Check deployment logs in Cloudflare Pages
2. Check Supabase logs for database issues
3. Refer to troubleshooting guides in each subdirectory

---

**Next Steps**: Follow the detailed guides in each subdirectory to complete your deployment setup.
