-- Migration: Add tier-based RLS policies
-- Feature: 007-multi-tenant-saas
-- Phase: Foundational (Blocking Prerequisites)
-- Tasks: T012

-- ================================================
-- 1. EXTEND EXISTING TABLES
-- ================================================
-- Extend tv_displays with branding settings
alter table public.tv_displays
  add column if not exists branding_settings jsonb;
  -- { show_powered_by: true, custom_logo_url: null, primary_color: null }

-- Extend display_content with scheduling and creator tracking
alter table public.display_content
  add column if not exists scheduled_at timestamptz, -- Pro/Premium only
  add column if not exists created_by uuid references auth.users(id);

-- Add index for scheduled content queries
create index if not exists idx_display_content_scheduled_at
  on public.display_content(scheduled_at) where scheduled_at is not null;

-- ================================================
-- 2. CREATE SCHEDULE_RULES TABLE
-- ================================================
create table if not exists public.schedule_rules (
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

-- Add indexes for schedule_rules
create index idx_schedule_rules_masjid_id on public.schedule_rules(masjid_id);
create index idx_schedule_rules_content_id on public.schedule_rules(content_id);
create index idx_schedule_rules_is_active on public.schedule_rules(is_active);

-- Apply updated_at trigger to schedule_rules
create trigger update_schedule_rules_updated_at before update on public.schedule_rules
  for each row execute function public.update_updated_at_column();

-- ================================================
-- 3. TIER VALIDATION CONSTRAINTS
-- ================================================
-- Trigger function to validate branding settings by tier
create or replace function public.validate_branding_by_tier()
returns trigger as $$
declare
  masjid_tier text;
begin
  select tier into masjid_tier
  from public.masjids
  where id = new.masjid_id;

  -- Rakyat tier must show "Powered by e-Masjid" and cannot customize branding
  if masjid_tier = 'rakyat' and new.branding_settings is not null then
    if (new.branding_settings->>'show_powered_by')::boolean is distinct from false then
      -- This is OK for Rakyat
    else
      raise exception 'Rakyat tier must show "Powered by e-Masjid" branding';
    end if;

    if new.branding_settings->>'custom_logo_url' is not null then
      raise exception 'Rakyat tier cannot use custom logo';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

-- Apply branding validation trigger
drop trigger if exists validate_branding_by_tier_trigger on public.tv_displays;
create trigger validate_branding_by_tier_trigger
  before insert or update on public.tv_displays
  for each row execute function public.validate_branding_by_tier();

-- ================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ================================================
alter table public.masjids enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.local_admins enable row level security;
alter table public.user_roles enable row level security;
alter table public.tv_displays enable row level security;
alter table public.display_content enable row level security;
alter table public.schedule_rules enable row level security;

-- ================================================
-- 5. HELPER FUNCTIONS FOR RLS
-- ================================================
-- Note: Existing get_user_role() from migration 006 returns user_role enum type.
-- We need text type for JWT claims, so we'll use a different name to avoid conflicts.
-- The JWT-based function is more appropriate for multi-tenant SaaS.

-- Drop old user_role functions that depend on users table (deprecated)
drop function if exists public.get_user_role() cascade;

-- Get user role from JWT claims (no parameters - for RLS policies)
-- This replaces the old enum-based version with JWT-based version
create function public.get_user_role()
returns text as $$
  select coalesce((auth.jwt() ->> 'user_role')::text, 'public-user')
$$ language sql stable security definer;

-- Check if user is super admin (override existing to use JWT)
create or replace function public.is_super_admin()
returns boolean as $$
  select coalesce((auth.jwt() ->> 'user_role')::text, 'public-user') = 'super-admin'
$$ language sql stable security definer;

-- Get user's tier for their masjid (new function)
create or replace function public.get_user_tier()
returns text as $$
  select m.tier
  from public.masjids m
  join public.user_roles ur on ur.masjid_id = m.id
  where ur.user_id = auth.uid()
  limit 1
$$ language sql stable security definer;

-- ================================================
-- 6. PUBLIC ACCESS POLICIES
-- ================================================
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

-- ================================================
-- 7. SUPER ADMIN BYPASS POLICIES
-- ================================================
-- Super admin all access to masjids (FR-005)
create policy "Super admin all access to masjids"
  on public.masjids for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin all access to subscriptions (FR-007)
create policy "Super admin all access to subscriptions"
  on public.subscriptions for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin all access to payment_transactions (FR-007)
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

-- Super admin all access to tv_displays
create policy "Super admin all access to tv_displays"
  on public.tv_displays for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- Super admin all access to schedule_rules
create policy "Super admin all access to schedule_rules"
  on public.schedule_rules for all
  to authenticated
  using ((select is_super_admin()) = true)
  with check ((select is_super_admin()) = true);

-- ================================================
-- 8. MASJID ADMIN POLICIES
-- ================================================
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

-- Masjid admin manages schedule rules
create policy "Masjid admin manages own schedule_rules"
  on public.schedule_rules for all
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

-- ================================================
-- 9. TIER-BASED FEATURE GATES
-- ================================================
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

-- ================================================
-- 10. SOFT-LOCK POLICIES
-- ================================================
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

-- ================================================
-- 11. LOCAL ADMIN MULTI-MASJID POLICIES
-- ================================================
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

-- Local Admin manages schedule rules for assigned masjids
create policy "Local admin manages assigned schedule_rules"
  on public.schedule_rules for all
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
