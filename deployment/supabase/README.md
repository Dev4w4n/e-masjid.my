# Supabase Configuration Guide

This directory contains configuration and setup guides for deploying E-Masjid.My with Supabase as the backend database and authentication provider.

## 🎯 Overview

We use Supabase's **branch feature** to manage deployment environments:

| Environment    | Supabase Setup      | GitHub Branch | Database        |
| -------------- | ------------------- | ------------- | --------------- |
| **Production** | Main project branch | `main`        | Production data |
| **Staging**    | Preview branch      | `dev`         | Test data       |

**Why use branches instead of separate projects?**

- Single project management and billing
- Shared configuration with isolated database instances
- Easy data migration between environments
- Simplified API key and credential management

## 🚀 Quick Setup Guide

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create one project: `e-masjid-my`
3. Note down the production project URL and API keys

### 2. Link GitHub Repository

1. Go to project settings → Integrations
2. Connect to GitHub repository: `Dev4w4n/e-masjid.my`
3. Set production branch: `main`

### 3. Create Staging Branch

1. In the same project, navigate to **Database** → **Branches**
2. Click **Create preview branch**
3. Configure the branch:
   - Branch name: `staging`
   - Connect to GitHub branch: `dev`
   - Enable automatic migrations from repository
4. Note down the staging branch URL and API keys (different from production)

### 3. Database Schema Setup

Our database schema is managed through migrations in the `/supabase/migrations/` directory.

**Migrations and seeding happen automatically** when you push to GitHub:

- Migrations from `/supabase/migrations/` are applied automatically
- Seed data from `/supabase/seed.sql` is run after migrations complete

**Post-deployment setup:**

1. ✅ Migrations run automatically (no action needed)
2. ✅ RLS policies applied automatically (no action needed)
3. ⚠️ **Create super admin user manually:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add user" → Email
   - For production: `admin@emasjid.my`
   - For staging: `staging-admin@emasjid.my`
   - Set a strong password
4. ⚠️ **Set super admin role:**
   - Go to SQL Editor in Supabase Dashboard
   - Run:
     ```sql
     UPDATE users SET role = 'super_admin'
     WHERE email = 'admin@emasjid.my'; -- or staging email
     ```

**Local Development:**

- Use `scripts/setup-supabase.sh` for comprehensive test data
- Creates users, masjids, and TV display test data automatically
- Run: `./scripts/setup-supabase.sh` (default) or `./scripts/setup-supabase.sh --test`

### 4. Authentication Configuration

Configure authentication providers and settings for each environment.

## 📊 Environment Configuration

### Production Supabase Project

```toml
# Production configuration
project_id = "e-masjid-production"

[api]
enabled = true
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
site_url = "https://hub.emasjid.my"
additional_redirect_urls = [
  "https://hub.emasjid.my",
  "https://public.emasjid.my",
  "https://tv.emasjid.my"
]
jwt_expiry = 3600
enable_refresh_token_rotation = true
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
enable_confirmations = true

[storage]
file_size_limit = "50MiB"
```

### Staging Supabase Project

```toml
# Staging configuration
project_id = "e-masjid-staging"

[api]
enabled = true
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
site_url = "https://hub-emasjid-staging.pages.dev"
additional_redirect_urls = [
  "https://hub-emasjid-staging.pages.dev",
  "https://public-emasjid-staging.pages.dev",
  "https://tv-emasjid-staging.pages.dev",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002"
]
jwt_expiry = 3600
enable_refresh_token_rotation = true
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
enable_confirmations = false  # Easier testing in staging
```

## 🔐 Environment Variables

### Variables to Configure in Supabase

Set these in each Supabase project's environment variables:

**Production:**

```bash
SUPER_ADMIN_EMAIL=admin@emasjid.my
SUPER_ADMIN_PASSWORD=GENERATE_STRONG_PASSWORD
SUPER_ADMIN_ID=WILL_BE_GENERATED_AFTER_CREATION
```

**Staging:**

```bash
SUPER_ADMIN_EMAIL=staging-admin@emasjid.my
SUPER_ADMIN_PASSWORD=GENERATE_STRONG_PASSWORD
SUPER_ADMIN_ID=WILL_BE_GENERATED_AFTER_CREATION
```

### Variables for Cloudflare Pages

These will be used in your Cloudflare Pages deployments:

**From Production Supabase:**

- `SUPABASE_URL`: `https://your-production-project.supabase.co`
- `SUPABASE_ANON_KEY`: Found in project settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: Found in project settings → API (keep secret!)

**From Staging Supabase:**

- `SUPABASE_URL`: `https://your-staging-project.supabase.co`
- `SUPABASE_ANON_KEY`: Found in project settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: Found in project settings → API (keep secret!)

## 🗃️ Database Schema Management

### Migration Strategy

1. **Development**: Test migrations locally with Supabase local development
2. **Staging**: Deploy and test migrations on staging database
3. **Production**: Deploy tested migrations to production

### Migration Files

All schema changes are in `/supabase/migrations/`:

- Migration files are numbered sequentially
- Each environment will run the same migrations
- Migrations are idempotent and safe to re-run

### Seeding Data

**Staging Environment:**

- Use full seed data from `/supabase/seed.sql`
- Includes test masjids, users, and content
- Useful for testing and development

**Production Environment:**

- Use minimal seed data (basic configuration only)
- Add real data through the application
- No test/dummy data

## 🔒 Security Configuration

### Row Level Security (RLS)

All tables have RLS policies configured:

- Multi-tenant security (masjid-based isolation)
- Role-based access (super_admin, masjid_admin, user)
- API security for all CRUD operations

### Authentication Providers

Configure these providers in Supabase Auth settings:

**Google OAuth (Optional):**

- Configure in both environments if needed
- Use different OAuth apps for staging/production
- Set correct redirect URLs for each environment

### API Security

- Anon key: Safe for client-side use
- Service role key: Server-side only, never expose to clients
- Configure CORS settings for your domains
- Enable API rate limiting

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Two Supabase projects created
- [ ] GitHub integration configured
- [ ] Branch-specific deployment rules set
- [ ] Authentication providers configured

### Database Setup

- [ ] All migrations applied successfully
- [ ] RLS policies verified and tested
- [ ] Seed data loaded (staging only)
- [ ] Super admin user created
- [ ] API keys copied securely

### Integration Testing

- [ ] Test database connectivity from local dev
- [ ] Verify authentication flows
- [ ] Test RLS policies with different user roles
- [ ] Verify real-time subscriptions work
- [ ] Test file uploads to Supabase Storage

### Production Checklist

- [ ] Backup strategy configured
- [ ] Monitoring and alerting set up
- [ ] Database performance optimized
- [ ] Security settings reviewed

## 🔧 Useful SQL Queries

### Create Super Admin User

```sql
-- Run this after user signs up through the app
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'your-admin-email@domain.com';

-- Update the profile
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-admin-email@domain.com';
```

### Verify RLS Policies

```sql
-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;

-- Should return no rows if all tables have RLS enabled
```

### Monitor Database Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

## 🔗 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Integration](https://supabase.com/docs/guides/integrations/github)

## 📞 Support

For Supabase-specific issues:

1. Check Supabase project logs
2. Verify RLS policies and permissions
3. Use Supabase community Discord for help
4. Check migration history for issues

---

**Next**: Configure your Cloudflare Pages projects using the [Cloudflare configuration guide](../cloudflare/README.md).
