# Phase 1: Data Model Design

**Feature**: Multi-Tenant SaaS with Tiered Pricing  
**Branch**: `007-multi-tenant-saas`  
**Date**: 24 December 2025

This document defines the database schema, entities, relationships, and Row Level Security (RLS) policies for the multi-tenant SaaS system.

---

## 1. Database Schema Overview

### 1.1 Core Entities

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│     masjids     │       │  subscriptions   │       │ payment_transactions │
├─────────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (PK)         │◄──────┤ masjid_id (FK)   │◄──────┤ subscription_id (FK) │
│ name            │       │ id (PK)          │       │ id (PK)              │
│ tier            │       │ tier             │       │ amount               │
│ contact_email   │       │ status           │       │ toyyibpay_billcode   │
│ location        │       │ price            │       │ split_billing_json   │
│ branding_json   │       │ grace_start      │       │ status               │
│ db_instance_url │       │ grace_end        │       │ paid_at              │
│ local_admin_id  │◄──┐   └──────────────────┘       └──────────────────────┘
└─────────────────┘   │
                      │   ┌──────────────────┐
                      │   │   local_admins   │
                      │   ├──────────────────┤
                      └───┤ id (PK)          │
                          │ user_id (FK)     │
                          │ earnings_json    │
                          │ max_capacity     │
                          │ availability     │
                          └──────────────────┘

┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   auth.users    │       │   user_roles     │       │  tv_displays     │
├─────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)         │◄──────┤ user_id (FK)     │       │ id (PK)          │
│ email           │       │ id (PK)          │       │ masjid_id (FK)   │
│ email_confirmed │       │ role             │       │ display_name     │
│ created_at      │       │ masjid_id (FK)   │       │ unique_url       │
└─────────────────┘       └──────────────────┘       │ branding_json    │
                                                      │ is_active        │
                                                      └──────────────────┘

┌──────────────────┐       ┌─────────────────────┐
│ display_content  │       │  schedule_rules     │
├──────────────────┤       ├─────────────────────┤
│ id (PK)          │       │ id (PK)             │
│ masjid_id (FK)   │       │ masjid_id (FK)      │
│ display_id (FK)  │       │ content_id (FK)     │
│ content_data     │       │ recurrence_pattern  │
│ created_by (FK)  │       │ trigger_conditions  │
│ scheduled_at     │       │ is_active           │
└──────────────────┘       └─────────────────────┘
```

---

## 2. Table Definitions

### 2.1 `masjids` (extends existing table)

Stores mosque organization data with tier and subscription information.

**Migration**: `20251224000001_add_tier_and_subscription_tables.sql`

```sql
-- Extend existing masjids table (DO NOT recreate)
alter table public.masjids
  add column if not exists tier text not null default 'rakyat'
    check (tier in ('rakyat', 'pro', 'premium')),
  add column if not exists subscription_status text not null default 'active'
    check (subscription_status in ('active', 'grace-period', 'soft-locked', 'cancelled')),
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists location jsonb, -- { address, city, state, postcode }
  add column if not exists branding_settings jsonb, -- { logo_url, primary_color, secondary_color }
  add column if not exists db_instance_url text, -- For Premium tier: URL of manually provisioned separate Supabase project providing true database isolation (FR-030). Super admin creates dedicated Supabase project for each Premium customer.
  add column if not exists local_admin_id uuid references public.local_admins(id),
  add column if not exists tier_activated_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- Add indexes
create index if not exists idx_masjids_tier on public.masjids(tier);
create index if not exists idx_masjids_subscription_status on public.masjids(subscription_status);
create index if not exists idx_masjids_local_admin_id on public.masjids(local_admin_id);

-- Add updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_masjids_updated_at before update on public.masjids
  for each row execute function public.update_updated_at_column();
```

**Columns**:

- `id` (uuid, PK): Unique masjid identifier
- `name` (text): Masjid name (existing)
- `tier` (text): Pricing tier (rakyat, pro, premium) - DEFAULT 'rakyat'
- `subscription_status` (text): Current status (active, grace-period, soft-locked, cancelled)
- `contact_email` (text): Primary contact email
- `contact_phone` (text): Contact phone number
- `location` (jsonb): Address details `{ address, city, state, postcode }`
- `branding_settings` (jsonb): Custom branding `{ logo_url, primary_color, secondary_color }`
- `db_instance_url` (text, nullable): Premium tier private database URL
- `local_admin_id` (uuid, FK): Assigned Local Admin for Premium tier
- `tier_activated_at` (timestamptz): When current tier was activated
- `created_at` (timestamptz): Registration date (existing)
- `updated_at` (timestamptz): Last modification timestamp

**Validation Rules**:

- `tier` MUST be one of: 'rakyat', 'pro', 'premium'
- `subscription_status` MUST be one of: 'active', 'grace-period', 'soft-locked', 'cancelled'
- `branding_settings` MUST be null for Rakyat tier (enforced via CHECK constraint)
- `db_instance_url` MUST be null for Rakyat and Pro tiers
- `local_admin_id` MUST be null for Rakyat and Pro tiers

---

### 2.2 `subscriptions` (new table)

Tracks billing relationship between masjid and pricing tier.

**Migration**: `20251224000001_add_tier_and_subscription_tables.sql`

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid not null references public.masjids(id) on delete cascade,
  tier text not null check (tier in ('rakyat', 'pro', 'premium')),
  status text not null check (status in ('active', 'grace-period', 'soft-locked', 'cancelled')),
  price numeric(10, 2) not null, -- RM0.00 for Rakyat, RM30.00 for Pro, RM300-500 for Premium
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),

  -- Grace period tracking
  grace_period_start timestamptz,
  grace_period_end timestamptz,
  failed_payment_attempts int default 0,
  last_failed_at timestamptz,

  -- Soft-lock tracking
  soft_locked_at timestamptz,
  soft_lock_reason text,

  -- Billing dates
  next_billing_date date,
  current_period_start date,
  current_period_end date,

  -- Payment method
  toyyibpay_category_code text,
  billing_contact_name text,
  billing_email text,
  billing_phone text,

  -- Audit
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Constraints
  unique (masjid_id) -- One active subscription per masjid
);

-- Indexes
create index idx_subscriptions_masjid_id on public.subscriptions(masjid_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_next_billing_date on public.subscriptions(next_billing_date);
create index idx_subscriptions_grace_period_end on public.subscriptions(grace_period_end);

-- Updated_at trigger
create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at_column();
```

**Columns**:

- `id` (uuid, PK): Unique subscription identifier
- `masjid_id` (uuid, FK): Reference to masjids table (UNIQUE - one subscription per masjid)
- `tier` (text): Current tier (rakyat, pro, premium)
- `status` (text): Subscription state (active, grace-period, soft-locked, cancelled)
- `price` (numeric): Monthly price in MYR (0.00, 30.00, 300.00-500.00)
- `billing_cycle` (text): Payment frequency (monthly, yearly) - DEFAULT 'monthly'
- `grace_period_start` (timestamptz): When grace period began (nullable)
- `grace_period_end` (timestamptz): Grace period expiry (nullable)
- `failed_payment_attempts` (int): Count of payment failures (DEFAULT 0)
- `last_failed_at` (timestamptz): Timestamp of last failed payment
- `soft_locked_at` (timestamptz): When soft-lock was triggered
- `soft_lock_reason` (text): Explanation for soft-lock (e.g., "Grace period expired")
- `next_billing_date` (date): Next scheduled payment date
- `current_period_start` (date): Current billing period start
- `current_period_end` (date): Current billing period end
- `toyyibpay_category_code` (text): ToyyibPay billing category
- `billing_contact_name` (text): Payment contact person
- `billing_email` (text): Payment notification email
- `billing_phone` (text): Payment contact phone
- `created_at` (timestamptz): Subscription creation date
- `updated_at` (timestamptz): Last modification timestamp

**State Transitions**:

```
active ──(payment fails)──> grace-period ──(14 days expire)──> soft-locked
  ▲                              │                                │
  │                              │                                │
  └──────────(successful payment)────────────────────────────────┘

soft-locked ──(super admin)──> cancelled ──(user deletes account)──> deleted
```

**Business Rules**:

- Rakyat tier: price = 0.00, status always 'active' (no grace period or soft-lock)
- Pro tier: price = 30.00, grace period = 14 days after payment failure
- Premium tier: price = 300.00-500.00, grace period = 14 days, soft-lock retains private DB
- Grace period notifications: Day 1 (immediate), Day 13 (urgent reminder)

---

### 2.3 `payment_transactions` (new table)

Records all ToyyibPay payment events including split billing for Premium tier.

**Migration**: `20251224000001_add_tier_and_subscription_tables.sql`

```sql
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  masjid_id uuid not null references public.masjids(id) on delete cascade,

  -- Payment details
  amount numeric(10, 2) not null, -- Total amount received
  payment_method text not null default 'toyyibpay' check (payment_method in ('toyyibpay', 'manual')),
  status text not null check (status in ('pending', 'success', 'failed', 'refunded')),

  -- ToyyibPay integration
  toyyibpay_billcode text, -- Bill identifier
  toyyibpay_refno text, -- Payment reference number (unique per transaction)
  toyyibpay_transaction_time timestamptz,

  -- Split billing (Premium tier only)
  split_billing_details jsonb,
  -- {
  --   "local_admin_share": 150.00,
  --   "platform_share": 150.00,
  --   "local_admin_id": "uuid",
  --   "transfer_status": "pending|transferred|failed",
  --   "transferred_at": "2025-12-24T10:00:00Z",
  --   "retry_attempts": 0
  -- }

  -- Failure tracking
  failure_reason text,
  retry_attempts int default 0,
  last_retry_at timestamptz,

  -- Audit
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Constraints
  unique (toyyibpay_refno) -- Prevent duplicate processing
);

-- Indexes
create index idx_payment_transactions_subscription_id on public.payment_transactions(subscription_id);
create index idx_payment_transactions_masjid_id on public.payment_transactions(masjid_id);
create index idx_payment_transactions_status on public.payment_transactions(status);
create index idx_payment_transactions_toyyibpay_refno on public.payment_transactions(toyyibpay_refno);

-- Updated_at trigger
create trigger update_payment_transactions_updated_at before update on public.payment_transactions
  for each row execute function public.update_updated_at_column();
```

**Columns**:

- `id` (uuid, PK): Unique transaction identifier
- `subscription_id` (uuid, FK): Associated subscription
- `masjid_id` (uuid, FK): Associated masjid (denormalized for queries)
- `amount` (numeric): Total payment amount in MYR
- `payment_method` (text): Payment source (toyyibpay, manual)
- `status` (text): Transaction state (pending, success, failed, refunded)
- `toyyibpay_billcode` (text): ToyyibPay bill identifier
- `toyyibpay_refno` (text): Payment reference number (UNIQUE)
- `toyyibpay_transaction_time` (timestamptz): When payment was made
- `split_billing_details` (jsonb): Premium tier split payment metadata
- `failure_reason` (text): Error message if payment failed
- `retry_attempts` (int): Number of webhook/polling retries
- `last_retry_at` (timestamptz): Last retry timestamp
- `paid_at` (timestamptz): Payment success timestamp
- `created_at` (timestamptz): Transaction record creation
- `updated_at` (timestamptz): Last modification timestamp

**Split Billing JSONB Schema** (Premium tier only):

```json
{
  "local_admin_share": 150.0,
  "platform_share": 150.0,
  "local_admin_id": "uuid-of-local-admin",
  "transfer_status": "pending|transferred|failed",
  "transferred_at": "2025-12-24T10:00:00Z",
  "retry_attempts": 0,
  "last_retry_at": "2025-12-24T11:00:00Z"
}
```

---

### 2.4 `local_admins` (new table)

Dedicated support staff assigned to Premium tier masjids.

**Migration**: `20251224000002_add_local_admin_and_roles.sql`

```sql
create table public.local_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,

  -- Contact details
  full_name text not null,
  whatsapp_number text not null,
  email text not null,

  -- Capacity management
  max_capacity int not null default 10, -- Max Premium masjids assignable
  availability_status text not null default 'available'
    check (availability_status in ('available', 'at-capacity', 'on-leave', 'inactive')),

  -- Earnings tracking
  earnings_summary jsonb,
  -- {
  --   "total_earnings": 1500.00,
  --   "current_month": 450.00,
  --   "pending_transfers": 150.00,
  --   "last_payment_date": "2025-12-24"
  -- }

  -- Audit
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_local_admins_user_id on public.local_admins(user_id);
create index idx_local_admins_availability on public.local_admins(availability_status);

-- Updated_at trigger
create trigger update_local_admins_updated_at before update on public.local_admins
  for each row execute function public.update_updated_at_column();

-- View: Assigned masjids count
create view public.local_admin_assignments as
select
  la.id as local_admin_id,
  la.full_name,
  la.max_capacity,
  count(m.id) as assigned_count,
  la.max_capacity - count(m.id) as remaining_capacity
from public.local_admins la
left join public.masjids m on m.local_admin_id = la.id
group by la.id, la.full_name, la.max_capacity;
```

**Columns**:

- `id` (uuid, PK): Unique Local Admin identifier
- `user_id` (uuid, FK): Reference to auth.users (UNIQUE)
- `full_name` (text): Local Admin full name
- `whatsapp_number` (text): WhatsApp contact (for Premium support)
- `email` (text): Email contact
- `max_capacity` (int): Maximum Premium masjids assignable (DEFAULT 10)
- `availability_status` (text): Current availability (available, at-capacity, on-leave, inactive)
- `earnings_summary` (jsonb): Financial tracking metadata
- `created_at` (timestamptz): Record creation date
- `updated_at` (timestamptz): Last modification timestamp

**Earnings Summary JSONB Schema**:

```json
{
  "total_earnings": 1500.0,
  "current_month": 450.0,
  "pending_transfers": 150.0,
  "last_payment_date": "2025-12-24",
  "monthly_breakdown": [
    { "month": "2025-12", "amount": 450.0 },
    { "month": "2025-11", "amount": 600.0 }
  ]
}
```

---

### 2.5 `user_roles` (new table)

Role-based access control with JWT injection via Auth Hook.

**Migration**: `20251224000002_add_local_admin_and_roles.sql`

```sql
-- Enum for user roles
create type public.user_role as enum (
  'super-admin',
  'masjid-admin',
  'local-admin',
  'public-user'
);

-- User roles table
create table public.user_roles (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  masjid_id uuid references public.masjids(id) on delete cascade, -- null for super-admin
  created_at timestamptz default now(),
  unique (user_id, role, masjid_id) -- User can have role per masjid
);

-- Indexes
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);
create index idx_user_roles_masjid_id on public.user_roles(masjid_id);
```

**Role Hierarchy**:

1. **super-admin**: Unrestricted access to all masjids and admin functions (masjid_id = null)
2. **masjid-admin**: Full access to assigned masjid content and settings
3. **local-admin**: Multi-masjid access for Premium tier support (can have multiple masjid_id entries)
4. **public-user**: Default role, read-only access to public displays (no content creation)

**Auth Hook for JWT Injection**:

```sql
-- Migration: 20251224000002_add_local_admin_and_roles.sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  user_role text;
begin
  -- Fetch highest privilege role
  select role::text into user_role
  from public.user_roles
  where user_id = (event->>'user_id')::uuid
  order by
    case role
      when 'super-admin' then 1
      when 'masjid-admin' then 2
      when 'local-admin' then 3
      else 4
    end
  limit 1;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{user_role}', '"public-user"');
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grant permissions for Auth Hook
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant all on table public.user_roles to supabase_auth_admin;
grant all on table public.masjids to supabase_auth_admin;

-- Helper function for RLS policies
create function public.get_user_role()
returns text as $$
  select (auth.jwt() ->> 'user_role')::text
$$ language sql stable security definer;

create function public.is_super_admin()
returns boolean as $$
  select (auth.jwt() ->> 'user_role')::text = 'super-admin'
$$ language sql stable security definer;
```

---

### 2.6 `tv_displays` (extends existing table)

Individual display screens with tier-specific branding settings.

**Migration**: `20251224000003_add_tier_based_rls_policies.sql`

```sql
-- Extend existing tv_displays table (DO NOT recreate)
alter table public.tv_displays
  add column if not exists branding_settings jsonb;
  -- { show_powered_by: true, custom_logo_url: null, primary_color: null }

-- Add check constraint for tier-based branding
alter table public.tv_displays
  add constraint check_branding_settings_by_tier
  check (
    case
      when (select tier from public.masjids where id = masjid_id) = 'rakyat' then
        (branding_settings->>'show_powered_by')::boolean = true
        and branding_settings->>'custom_logo_url' is null
      else true
    end
  );
```

**Branding Settings JSONB Schema**:

```json
{
  "show_powered_by": true, // Required true for Rakyat, false for Pro/Premium
  "custom_logo_url": "https://storage.supabase.co/logos/masjid-logo.png", // null for Rakyat
  "primary_color": "#1a73e8", // null for Rakyat
  "secondary_color": "#34a853" // null for Rakyat
}
```

---

### 2.7 `display_content` (extends existing table)

Content items with tier-based scheduling capability.

**Migration**: `20251224000003_add_tier_based_rls_policies.sql`

```sql
-- Extend existing display_content table (DO NOT recreate)
alter table public.display_content
  add column if not exists scheduled_at timestamptz, -- Pro/Premium only
  add column if not exists created_by uuid references auth.users(id); -- Track creator

-- Index for scheduled content queries
create index if not exists idx_display_content_scheduled_at
  on public.display_content(scheduled_at) where scheduled_at is not null;
```

---

### 2.8 `schedule_rules` (new table)

Time-based scheduling rules for Pro and Premium tiers.

**Migration**: `20251224000003_add_tier_based_rls_policies.sql`

```sql
create table public.schedule_rules (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid not null references public.masjids(id) on delete cascade,
  content_id uuid not null references public.display_content(id) on delete cascade,

  -- Schedule configuration
  recurrence_pattern jsonb not null,
  -- {
  --   "type": "daily|weekly|monthly|once",
  --   "days_of_week": [1, 2, 3, 4, 5], // 1=Monday, 7=Sunday
  --   "time_ranges": [{"start": "09:00", "end": "17:00"}],
  --   "start_date": "2025-12-24",
  --   "end_date": "2026-12-24" // Optional
  -- }

  trigger_conditions jsonb,
  -- {
  --   "prayer_times": ["fajr", "dhuhr", "asr", "maghrib", "isha"],
  --   "special_events": ["friday_prayer", "ramadan", "eid"]
  -- }

  is_active boolean default true,
  priority int default 0, -- Higher priority content shown first

  -- Audit
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_schedule_rules_masjid_id on public.schedule_rules(masjid_id);
create index idx_schedule_rules_content_id on public.schedule_rules(content_id);
create index idx_schedule_rules_is_active on public.schedule_rules(is_active);

-- Updated_at trigger
create trigger update_schedule_rules_updated_at before update on public.schedule_rules
  for each row execute function public.update_updated_at_column();
```

**Recurrence Pattern JSONB Schema**:

```json
{
  "type": "weekly",
  "days_of_week": [1, 2, 3, 4, 5], // Monday to Friday
  "time_ranges": [
    { "start": "09:00", "end": "12:00" },
    { "start": "14:00", "end": "17:00" }
  ],
  "start_date": "2025-12-24",
  "end_date": "2026-12-24" // Optional
}
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 Public Access Policies

Allow unauthenticated users to view displays but not modify content.

**Migration**: `20251224000003_add_tier_based_rls_policies.sql`

```sql
-- Enable RLS on all tables
alter table public.masjids enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.local_admins enable row level security;
alter table public.user_roles enable row level security;
alter table public.tv_displays enable row level security;
alter table public.display_content enable row level security;
alter table public.schedule_rules enable row level security;

-- Public users can view TV displays (FR-002, FR-003)
create policy "Public users can view tv_displays"
  on public.tv_displays for select
  to anon, authenticated
  using (is_active = true);

-- Public users can view display content
create policy "Public users can view display_content"
  on public.display_content for select
  to anon, authenticated
  using (true);

-- Public users can view masjid basic info (name, location)
create policy "Public users can view masjid info"
  on public.masjids for select
  to anon, authenticated
  using (true);
```

---

### 3.2 Super Admin Bypass Policies

Super admins have unrestricted access to all data.

```sql
-- Super admin sees and modifies all masjids (FR-005)
create policy "Super admin all access to masjids"
  on public.masjids for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin sees all subscriptions (FR-007)
create policy "Super admin all access to subscriptions"
  on public.subscriptions for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin sees all payment transactions (FR-007)
create policy "Super admin all access to payment_transactions"
  on public.payment_transactions for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin manages Local Admins (FR-006)
create policy "Super admin all access to local_admins"
  on public.local_admins for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin manages user roles (FR-006)
create policy "Super admin all access to user_roles"
  on public.user_roles for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin edits any content (FR-005)
create policy "Super admin all access to display_content"
  on public.display_content for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);
```

---

### 3.3 Masjid Admin Policies

Masjid admins access only their assigned masjid data.

```sql
-- Masjid admin views their masjid
create policy "Masjid admin views own masjid"
  on public.masjids for select
  to authenticated
  using (
    id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role in ('masjid-admin', 'local-admin')
    )
  );

-- Masjid admin updates their masjid settings (branding, contact)
create policy "Masjid admin updates own masjid"
  on public.masjids for update
  to authenticated
  using (
    id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  );

-- Masjid admin views their subscription
create policy "Masjid admin views own subscription"
  on public.subscriptions for select
  to authenticated
  using (
    masjid_id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  );

-- Masjid admin manages their TV displays (FR-017)
create policy "Masjid admin manages own tv_displays"
  on public.tv_displays for all
  to authenticated
  using (
    masjid_id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  )
  with check (
    masjid_id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  );

-- Masjid admin manages their content
create policy "Masjid admin manages own content"
  on public.display_content for all
  to authenticated
  using (
    masjid_id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  )
  with check (
    masjid_id in (
      select masjid_id from public.user_roles
      where user_id = auth.uid()
      and role = 'masjid-admin'
    )
  );
```

---

### 3.4 Tier-Based Feature Gates

Enforce tier restrictions at database level.

```sql
-- Pro tier can schedule content (FR-027, FR-028)
create policy "Pro tier can schedule content"
  on public.display_content for insert
  to authenticated
  with check (
    case
      when scheduled_at is not null then
        (
          select tier in ('pro', 'premium')
          from public.masjids
          where id = masjid_id
        )
      else true
    end
  );

-- Pro tier can create schedule rules
create policy "Pro tier can create schedule rules"
  on public.schedule_rules for insert
  to authenticated
  with check (
    (
      select tier in ('pro', 'premium')
      from public.masjids
      where id = masjid_id
    )
  );

-- Rakyat tier cannot customize branding (FR-020)
create policy "Rakyat tier cannot customize branding"
  on public.tv_displays for update
  to authenticated
  using (
    case
      when branding_settings->>'show_powered_by' = 'false' then
        (
          select tier in ('pro', 'premium')
          from public.masjids
          where id = masjid_id
        )
      else true
    end
  );
```

---

### 3.5 Soft-Lock Policies

During soft-lock state, restrict tier features but preserve data access.

```sql
-- Grace period read-only content access (FR-056)
create policy "Grace period read-only access"
  on public.display_content for select
  to authenticated
  using (
    masjid_id in (
      select m.id from public.masjids m
      join public.subscriptions s on s.masjid_id = m.id
      join public.user_roles ur on ur.masjid_id = m.id
      where ur.user_id = auth.uid()
      and s.status in ('active', 'grace-period', 'soft-locked')
    )
  );

-- Soft-lock disables content creation (FR-055)
create policy "Soft-lock prevents content creation"
  on public.display_content for insert
  to authenticated
  with check (
    (
      select s.status in ('active', 'grace-period')
      from public.subscriptions s
      where s.masjid_id = masjid_id
    )
  );

-- Soft-lock disables scheduling (FR-055)
create policy "Soft-lock prevents scheduling"
  on public.schedule_rules for insert
  to authenticated
  with check (
    (
      select s.status in ('active', 'grace-period')
      from public.subscriptions s
      where s.masjid_id = masjid_id
    )
  );
```

---

### 3.6 Local Admin Multi-Masjid Policies

Local Admins access multiple Premium tier masjids.

```sql
-- Local Admin views assigned masjids (FR-039, FR-048)
create policy "Local admin views assigned masjids"
  on public.masjids for select
  to authenticated
  using (
    local_admin_id = (
      select id from public.local_admins
      where user_id = auth.uid()
    )
  );

-- Local Admin manages content for assigned masjids (FR-039)
create policy "Local admin manages assigned content"
  on public.display_content for all
  to authenticated
  using (
    masjid_id in (
      select id from public.masjids
      where local_admin_id = (
        select id from public.local_admins
        where user_id = auth.uid()
      )
    )
  )
  with check (
    masjid_id in (
      select id from public.masjids
      where local_admin_id = (
        select id from public.local_admins
        where user_id = auth.uid()
      )
    )
  );

-- Local Admin views own earnings (FR-047)
create policy "Local admin views own earnings"
  on public.local_admins for select
  to authenticated
  using (user_id = auth.uid());
```

---

## 4. Data Validation and Constraints

### 4.1 Tier Consistency

Ensure tier alignment between `masjids` and `subscriptions` tables.

```sql
-- Migration: 20251224000003_add_tier_based_rls_policies.sql
alter table public.subscriptions
  add constraint check_tier_matches_masjid
  check (
    tier = (select tier from public.masjids where id = masjid_id)
  );
```

---

### 4.2 Grace Period Logic

Grace period dates must be valid when status is 'grace-period'.

```sql
alter table public.subscriptions
  add constraint check_grace_period_dates
  check (
    case
      when status = 'grace-period' then
        grace_period_start is not null
        and grace_period_end is not null
        and grace_period_end > grace_period_start
      else true
    end
  );
```

---

### 4.3 Local Admin Capacity

Local Admins cannot exceed max_capacity assignments.

```sql
-- Trigger to prevent over-assignment
create or replace function public.check_local_admin_capacity()
returns trigger as $$
declare
  current_count int;
  max_cap int;
begin
  if new.local_admin_id is not null then
    select count(*), la.max_capacity into current_count, max_cap
    from public.masjids m
    join public.local_admins la on la.id = new.local_admin_id
    where m.local_admin_id = new.local_admin_id
    group by la.max_capacity;

    if current_count >= max_cap then
      raise exception 'Local Admin at maximum capacity (%)', max_cap;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger check_local_admin_capacity_trigger
  before insert or update on public.masjids
  for each row execute function public.check_local_admin_capacity();
```

---

## 5. Summary

**Total New Tables**: 5 (subscriptions, payment_transactions, local_admins, user_roles, schedule_rules)  
**Extended Tables**: 3 (masjids, tv_displays, display_content)  
**RLS Policies**: 20+ (public access, super admin bypass, tier gates, soft-lock restrictions)  
**Database Functions**: 6 (Auth Hook, role helpers, capacity check, updated_at trigger)

**Next Phase**: Phase 1 contracts/ → Define API endpoints and TypeScript interfaces for payment processing, subscription management, and tier validation.
