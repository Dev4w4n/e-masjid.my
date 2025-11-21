# E-Masjid.My Deployment Guide

This guide covers deploying E-Masjid.My to production and staging environments using Cloudflare Pages and Supabase.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐
│     GitHub Repo     │    │     Supabase        │
│  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ main branch   │◄─┼────┼──┤ Production DB │  │
│  │ dev branch    │◄─┼────┼──┤ Staging DB    │  │
│  └───────────────┘  │    │  └───────────────┘  │
└─────────────────────┘    └─────────────────────┘
           │                          │
           ▼                          │
┌─────────────────────┐               │
│  Cloudflare Pages   │               │
│  ┌───────────────┐  │               │
│  │ hub-prod      │◄─┼───────────────┘
│  │ hub-dev       │  │
│  │ public-prod   │  │
│  │ public-dev    │  │
│  │ tv-prod       │  │
│  │ tv-dev        │  │
│  └───────────────┘  │
└─────────────────────┘
```

## 🚀 Applications to Deploy

1. **Hub App** (`apps/hub`) - Main management interface (Vite React app)
2. **Public App** (`apps/public`) - SEO-friendly public content (Next.js app)
3. **TV Display App** (`apps/tv-display`) - Kiosk display interface (Next.js app)

## 📁 Directory Structure

```
deployment/
├── README.md                     # This file
├── cloudflare/
│   ├── pages-config/
│   │   ├── hub-production.toml   # Hub app production config
│   │   ├── hub-staging.toml      # Hub app staging config
│   │   ├── public-production.toml
│   │   ├── public-staging.toml
│   │   ├── tv-production.toml
│   │   └── tv-staging.toml
│   └── wrangler-configs/         # Wrangler CLI configs (if needed)
├── supabase/
│   ├── production-config.toml    # Production Supabase config
│   └── staging-config.toml       # Staging Supabase config
└── scripts/
    ├── deploy-cloudflare.sh      # Deployment automation
    └── setup-environments.sh     # Environment setup
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

**For immediate deployment, follow the [Quick Start Guide](QUICK-START.md) (60 minutes total)**

Or use the automated setup:

```bash
# Generate all deployment configurations
./deployment/scripts/setup-environments.sh both

# Validate your setup
./deployment/scripts/deploy-cloudflare.sh staging all validate
```

## 📋 Deployment Checklist

### Phase 1: Supabase Setup

- [ ] Create production Supabase project
- [ ] Create staging Supabase project
- [ ] Link GitHub repository to both projects
- [ ] Configure branch-specific deployments
- [ ] Set up database migrations
- [ ] Configure RLS policies
- [ ] Set up authentication providers

### Phase 2: Cloudflare Pages Setup

- [ ] Create 6 Cloudflare Pages projects (3 apps × 2 environments)
- [ ] Configure GitHub integration for each project
- [ ] Set branch-specific deployment rules
- [ ] Configure build settings for each app type
- [ ] Set environment variables (without exposing secrets)
- [ ] Configure custom domains (optional)

### Phase 3: Testing & Validation

- [ ] Test staging deployments
- [ ] Validate environment variable propagation
- [ ] Test database connectivity
- [ ] Verify authentication flows
- [ ] Test cross-app integrations
- [ ] Performance testing

## 🔗 Quick Start Guide

1. [Supabase Configuration](./supabase/README.md)
2. [Cloudflare Pages Configuration](./cloudflare/README.md)
3. [Environment Variables Guide](./ENVIRONMENT-VARIABLES.md)
4. [Deployment Scripts](./scripts/README.md)

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
