# Supabase Configuration

This directory contains database migrations and seed data for E-Masjid.My.

## 📁 Directory Structure

```
supabase/
├── config.toml              # Local Supabase configuration
├── seed.sql                 # Seed data for cloud deployment
├── migrations/              # Database schema migrations
│   ├── 001_*.sql
│   ├── 002_*.sql
│   └── ...
└── README.md               # This file
```

## 🎯 Two Setup Approaches

### 1. **Local Development** (Comprehensive Test Data)

Use the setup script for local development with full test data:

```bash
# From project root
./scripts/setup-supabase.sh           # Default setup with super admin
./scripts/setup-supabase.sh --test    # Full test setup with multiple users
```

**What it does:**

- Resets database and applies all migrations
- Creates auth users (super admin, masjid admins, regular users)
- Generates test masjids with proper relationships
- Creates TV display test data
- Sets up environment files automatically

**Use this for:**

- ✅ Local development
- ✅ Running unit tests
- ✅ Integration testing
- ✅ E2E testing

### 2. **Cloud Deployment** (Minimal Seed Data)

The `seed.sql` file runs automatically when Supabase deploys:

**What it does:**

- Runs after migrations complete
- Checks for existing super admin user
- Updates roles and profiles if user exists
- Provides instructions if user doesn't exist

**Manual steps required:**

1. Create super admin user via Supabase Dashboard → Authentication
   - Production: `admin@emasjid.my`
   - Staging: `staging-admin@emasjid.my`
2. Run SQL to set role:
   ```sql
   UPDATE users SET role = 'super_admin'
   WHERE email = 'your-admin-email@emasjid.my';
   ```

**Use this for:**

- ✅ Staging environment (preview branch)
- ✅ Production environment (main branch)
- ✅ Cloud-based deployments

## 🔄 Deployment Flow

### Local Development

```
Developer runs script → Setup creates users → Full test data loaded → Ready for development
```

### Cloud Deployment

```
Push to GitHub → Migrations run → seed.sql runs → Create admin manually → Update role via SQL → Ready
```

## 📝 Seed Data File

The `seed.sql` file is intentionally minimal because:

- **Cloud limitation**: Cannot create auth.users via SQL (requires Supabase Admin API)
- **Security**: Credentials shouldn't be in code/migrations
- **Flexibility**: Different environments need different admin emails

## 🚀 Quick Start

**For local development:**

```bash
# Reset and setup with test data
./scripts/setup-supabase.sh --test

# Start development
pnpm dev
```

**For cloud deployment:**

1. Push to GitHub (migrations run automatically)
2. Create super admin user in Supabase Dashboard
3. Run SQL to set super_admin role
4. Start using the application

## 🔒 Security Architecture

### Row Level Security (RLS) Policies

All tables use RLS policies to control data access:

**Public Read Access:**

- `display_content` - Active content visible to public
- `display_content_assignments` - Content assignments visible to public
- `tv_displays` - Display configuration accessible by display_id

**Admin Access:**

- Masjid admins can manage their own masjid's content
- Super admins have full access across all masjids

**Service Role Key Usage:**

- ⚠️ **Not used in client-facing apps** (Hub, Public, TV Display)
- Only used in setup scripts for initial database configuration
- All API routes use anon key with RLS policies for security

**Migration:** [20251205040832_add_public_read_display_assignments.sql](./migrations/20251205040832_add_public_read_display_assignments.sql) added public read policy to enable TV displays to fetch content without authentication.

## 🔧 Troubleshooting

**"No files matched pattern: supabase/supabase/seed.sql"**

- This is expected if the file path is incorrect in config
- The seed.sql is at `supabase/seed.sql` (not `supabase/supabase/seed.sql`)
- Supabase will find it automatically

**"No super admin user found"**

- Create user manually via Supabase Dashboard → Authentication
- Then run the UPDATE SQL command to set their role

**Local setup fails**

- Ensure Supabase CLI is installed: `brew install supabase/tap/supabase`
- Check if Supabase is running: `supabase status`
- Reset if needed: `supabase db reset`

## 📚 Additional Resources

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase Branching](https://supabase.com/docs/guides/platform/branching)
- [Deployment Guide](../deployment/supabase/README.md)
