-- Migration: Add tier and subscription tables
-- Feature: 007-multi-tenant-saas
-- Phase: Foundational (Blocking Prerequisites)
-- Tasks: T010

-- ================================================
-- 1. EXTEND MASJIDS TABLE
-- ================================================
-- Add tier and subscription columns to existing masjids table
alter table public.masjids
  add column if not exists tier text not null default 'rakyat'
    check (tier in ('rakyat', 'pro', 'premium')),
  add column if not exists subscription_status text not null default 'active'
    check (subscription_status in ('active', 'grace-period', 'soft-locked', 'cancelled')),
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists location jsonb, -- { address, city, state, postcode }
  add column if not exists branding_settings jsonb, -- { logo_url, primary_color, secondary_color }
  add column if not exists db_instance_url text, -- Premium tier: dedicated Supabase project URL
  add column if not exists local_admin_id uuid, -- FK added later after local_admins table exists
  add column if not exists tier_activated_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- Add indexes for masjids extensions
create index if not exists idx_masjids_tier on public.masjids(tier);
create index if not exists idx_masjids_subscription_status on public.masjids(subscription_status);
create index if not exists idx_masjids_local_admin_id on public.masjids(local_admin_id);

-- ================================================
-- 2. CREATE SUBSCRIPTIONS TABLE
-- ================================================
create table if not exists public.subscriptions (
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

-- Add indexes for subscriptions
create index idx_subscriptions_masjid_id on public.subscriptions(masjid_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_next_billing_date on public.subscriptions(next_billing_date);
create index idx_subscriptions_grace_period_end on public.subscriptions(grace_period_end);

-- ================================================
-- 3. CREATE PAYMENT_TRANSACTIONS TABLE
-- ================================================
create table if not exists public.payment_transactions (
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

-- Add indexes for payment_transactions
create index idx_payment_transactions_subscription_id on public.payment_transactions(subscription_id);
create index idx_payment_transactions_masjid_id on public.payment_transactions(masjid_id);
create index idx_payment_transactions_status on public.payment_transactions(status);
create index idx_payment_transactions_toyyibpay_refno on public.payment_transactions(toyyibpay_refno);

-- ================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop and recreate trigger for masjids (handle existing trigger)
drop trigger if exists update_masjids_updated_at on public.masjids;
create trigger update_masjids_updated_at before update on public.masjids
  for each row execute function public.update_updated_at_column();

-- Apply updated_at trigger to subscriptions
drop trigger if exists update_subscriptions_updated_at on public.subscriptions;
create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

-- Apply updated_at trigger to payment_transactions
drop trigger if exists update_payment_transactions_updated_at on public.payment_transactions;
create trigger update_payment_transactions_updated_at before update on public.payment_transactions
  for each row execute function public.update_updated_at_column();

-- ================================================
-- 5. DATA VALIDATION CONSTRAINTS
-- ================================================
-- Trigger function to ensure tier consistency between masjids and subscriptions
create or replace function public.check_subscription_tier_consistency()
returns trigger as $$
declare
  masjid_tier text;
begin
  select tier into masjid_tier
  from public.masjids
  where id = new.masjid_id;

  if new.tier != masjid_tier then
    raise exception 'Subscription tier (%) must match masjid tier (%)', new.tier, masjid_tier;
  end if;

  return new;
end;
$$ language plpgsql;

-- Apply tier consistency trigger
drop trigger if exists check_tier_consistency_trigger on public.subscriptions;
create trigger check_tier_consistency_trigger
  before insert or update on public.subscriptions
  for each row execute function public.check_subscription_tier_consistency();

-- Validate grace period dates when status is grace-period
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
