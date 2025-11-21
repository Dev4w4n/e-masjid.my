# Environment Variables Configuration Guide

This document outlines environment variable management for secure deployment across development, staging, and production environments.

## 🔐 Security First Approach

### Critical Security Principles

1. **Never commit real secrets to git**
2. **Use placeholder values in all committed files**
3. **Configure actual secrets in platform dashboards**
4. **Rotate secrets regularly**
5. **Use least-privilege access patterns**

## 📊 Environment Matrix

| Variable                    | Development       | Staging             | Production       | Notes                       |
| --------------------------- | ----------------- | ------------------- | ---------------- | --------------------------- |
| `SUPABASE_URL`              | localhost:54321   | staging.supabase.co | prod.supabase.co | Auto-configured by Supabase |
| `SUPABASE_ANON_KEY`         | local-anon-key    | staging-anon-key    | prod-anon-key    | Public, safe to expose      |
| `SUPABASE_SERVICE_ROLE_KEY` | local-service-key | **SECRET**          | **SECRET**       | Server-side only            |
| `SUPER_ADMIN_EMAIL`         | dev@example.com   | **SECRET**          | **SECRET**       | Admin account               |
| `SUPER_ADMIN_PASSWORD`      | dev-password      | **SECRET**          | **SECRET**       | Strong password required    |

## 🎯 Application-Specific Variables

### Hub App (Vite React)

Uses `VITE_` prefix for client-side variables:

```bash
# ✅ Safe to expose (client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_APP_URL=https://hub.emasjid.my

# ✅ Development flags (disable in production)
VITE_ENABLE_DEV_TOOLS=false
VITE_SHOW_LOGGER=false
```

### Public App (Next.js)

Uses `NEXT_PUBLIC_` prefix for client-side variables:

```bash
# ✅ Safe to expose (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_BASE_URL=https://public.emasjid.my

# 🔒 Server-side only (no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### TV Display App (Next.js)

Uses `NEXT_PUBLIC_` for client-side, regular env vars for server-side:

```bash
# ✅ Safe to expose (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
NEXT_PUBLIC_APP_URL=https://tv.emasjid.my

# TV-specific configuration
NEXT_PUBLIC_AUTO_REFRESH=true
NEXT_PUBLIC_REFRESH_INTERVAL=3600000
NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL=300000
NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL=60000
```

## 🌍 Environment-Specific Configuration

### Development (.env.local)

```bash
# Local development with Supabase local instance
SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Local URLs
VITE_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_BASE_URL=http://localhost:3002

# Development flags enabled
VITE_ENABLE_DEV_TOOLS=true
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

### Staging

```bash
# Staging Supabase project
SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co

# Staging URLs
VITE_APP_URL=https://hub-staging.emasjid.my
NEXT_PUBLIC_APP_URL=https://tv-staging.emasjid.my
NEXT_PUBLIC_BASE_URL=https://public-staging.emasjid.my

# Development flags disabled
VITE_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
```

### Production

```bash
# Production Supabase project
SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co

# Production URLs
VITE_APP_URL=https://hub.emasjid.my
NEXT_PUBLIC_APP_URL=https://tv.emasjid.my
NEXT_PUBLIC_BASE_URL=https://public.emasjid.my

# All development flags disabled
VITE_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
VITE_SHOW_LOGGER=false
NEXT_PUBLIC_SHOW_LOGGER=false
```

## 🔧 Configuration Instructions

### 1. Cloudflare Pages Environment Variables

Set these in Cloudflare Pages dashboard for each project:

**Hub App Projects:**

- `hub-emasjid-production` (main branch)
- `hub-emasjid-staging` (dev branch)

**Environment Variables to Set:**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_APP_URL=https://your-domain.pages.dev
VITE_ENABLE_DEV_TOOLS=false
VITE_SHOW_LOGGER=false
```

### 2. Supabase Environment Variables

Set these in Supabase project settings:

**Project Environment Variables:**

```
SUPER_ADMIN_EMAIL=your-admin-email@domain.com
SUPER_ADMIN_PASSWORD=your-strong-password-here
SUPER_ADMIN_ID=generated-uuid-from-database
```

### 3. GitHub Repository Secrets

For CI/CD workflows (if needed):

```
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

## ⚡ Validation Script

Use this script to validate environment configuration:

```bash
# Run from project root
pnpm validate:env
```

This script checks:

- All required variables are present
- URLs are properly formatted
- No secrets are committed to git
- Environment-specific configurations are correct

## 🔍 Troubleshooting

### Common Issues

1. **Variables not updating**: Clear Cloudflare Pages cache
2. **CORS errors**: Check URL configuration and Supabase settings
3. **Authentication failing**: Verify Supabase keys and project URLs
4. **Build failures**: Check all required variables are set

### Debugging Steps

1. Check Cloudflare Pages build logs
2. Verify environment variables in dashboard
3. Test with staging environment first
4. Use browser developer tools to inspect network requests

---

**⚠️ Security Reminder**: Never commit actual secrets to this repository. Always use the platform-specific dashboards to configure sensitive environment variables.
