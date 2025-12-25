-- Migration: Add tier helper functions
-- Feature: 007-multi-tenant-saas
-- Phase: Foundational (Blocking Prerequisites)
-- Tasks: T013

-- ================================================
-- 1. USER ROLE HELPER FUNCTIONS
-- ================================================
-- Get user's role for a specific masjid
create or replace function public.get_user_role(p_user_id uuid, p_masjid_id uuid)
returns text as $$
  select role::text
  from public.user_roles
  where user_id = p_user_id
    and (masjid_id = p_masjid_id or masjid_id is null)
  order by
    case role
      when 'super-admin' then 1
      when 'masjid-admin' then 2
      when 'local-admin' then 3
      else 4
    end
  limit 1
$$ language sql stable security definer;

-- Check if user has any admin role
create or replace function public.is_admin(p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = p_user_id
      and role in ('super-admin', 'masjid-admin', 'local-admin')
  )
$$ language sql stable security definer;

-- Get all masjids user has access to
create or replace function public.get_user_masjids(p_user_id uuid)
returns table(masjid_id uuid, role_type text) as $$
  -- Super admin sees all masjids
  select m.id as masjid_id, 'super-admin'::text as role_type
  from public.masjids m
  where exists (
    select 1 from public.user_roles
    where user_id = p_user_id and role = 'super-admin'
  )
  
  union all
  
  -- Masjid admin sees their assigned masjid
  select ur.masjid_id, 'masjid-admin'::text as role_type
  from public.user_roles ur
  where ur.user_id = p_user_id
    and ur.role = 'masjid-admin'
    and ur.masjid_id is not null
  
  union all
  
  -- Local admin sees assigned Premium masjids
  select m.id as masjid_id, 'local-admin'::text as role_type
  from public.masjids m
  join public.local_admins la on la.id = m.local_admin_id
  where la.user_id = p_user_id
$$ language sql stable security definer;

-- ================================================
-- 2. TIER ACCESS HELPER FUNCTIONS
-- ================================================
-- Check if masjid has access to specific tier feature
create or replace function public.check_tier_feature_access(
  p_masjid_id uuid,
  p_feature text
)
returns boolean as $$
declare
  masjid_tier text;
  subscription_active boolean;
begin
  -- Get masjid tier and subscription status
  select
    m.tier,
    s.status in ('active', 'grace-period')
  into masjid_tier, subscription_active
  from public.masjids m
  left join public.subscriptions s on s.masjid_id = m.id
  where m.id = p_masjid_id;

  -- If subscription is soft-locked, deny all tier features
  if not subscription_active then
    return false;
  end if;

  -- Feature gate logic
  case p_feature
    -- Rakyat tier features (always allowed)
    when 'basic_display' then
      return true;
    when 'public_qr_access' then
      return true;

    -- Pro tier features (Pro + Premium)
    when 'custom_branding' then
      return masjid_tier in ('pro', 'premium');
    when 'advanced_scheduling' then
      return masjid_tier in ('pro', 'premium');
    when 'unlimited_displays' then
      return masjid_tier in ('pro', 'premium');

    -- Premium tier features (Premium only)
    when 'private_database' then
      return masjid_tier = 'premium';
    when 'local_admin_support' then
      return masjid_tier = 'premium';
    when 'data_export' then
      return masjid_tier = 'premium';

    else
      return false;
  end case;
end;
$$ language plpgsql stable security definer;

-- Get masjid subscription details
create or replace function public.get_masjid_subscription(p_masjid_id uuid)
returns jsonb as $$
  select jsonb_build_object(
    'tier', m.tier,
    'status', s.status,
    'price', s.price,
    'next_billing_date', s.next_billing_date,
    'grace_period_end', s.grace_period_end,
    'soft_locked_at', s.soft_locked_at,
    'features', jsonb_build_object(
      'custom_branding', m.tier in ('pro', 'premium'),
      'advanced_scheduling', m.tier in ('pro', 'premium'),
      'unlimited_displays', m.tier in ('pro', 'premium'),
      'private_database', m.tier = 'premium',
      'local_admin_support', m.tier = 'premium',
      'data_export', m.tier = 'premium'
    )
  )
  from public.masjids m
  left join public.subscriptions s on s.masjid_id = m.id
  where m.id = p_masjid_id
$$ language sql stable security definer;

-- ================================================
-- 3. LOCAL ADMIN HELPER FUNCTIONS
-- ================================================
-- Check Local Admin capacity before assignment
create or replace function public.check_local_admin_capacity(p_local_admin_id uuid)
returns jsonb as $$
  select jsonb_build_object(
    'local_admin_id', la.id,
    'full_name', la.full_name,
    'max_capacity', la.max_capacity,
    'assigned_count', count(m.id),
    'remaining_capacity', la.max_capacity - count(m.id),
    'availability_status', la.availability_status,
    'can_accept_new', (la.max_capacity - count(m.id)) > 0 and la.availability_status = 'available'
  )
  from public.local_admins la
  left join public.masjids m on m.local_admin_id = la.id
  where la.id = p_local_admin_id
  group by la.id, la.full_name, la.max_capacity, la.availability_status
$$ language sql stable security definer;

-- Get available Local Admins with capacity
create or replace function public.get_available_local_admins()
returns table(
  local_admin_id uuid,
  full_name text,
  email text,
  whatsapp_number text,
  max_capacity int,
  assigned_count bigint,
  remaining_capacity int
) as $$
  select
    la.id as local_admin_id,
    la.full_name,
    la.email,
    la.whatsapp_number,
    la.max_capacity,
    count(m.id) as assigned_count,
    (la.max_capacity - count(m.id))::int as remaining_capacity
  from public.local_admins la
  left join public.masjids m on m.local_admin_id = la.id
  where la.availability_status = 'available'
  group by la.id, la.full_name, la.email, la.whatsapp_number, la.max_capacity
  having (la.max_capacity - count(m.id)) > 0
  order by remaining_capacity desc, la.full_name
$$ language sql stable security definer;

-- ================================================
-- 4. GRACE PERIOD AND SOFT-LOCK HELPERS
-- ================================================
-- Check if subscription is in grace period
create or replace function public.is_in_grace_period(p_masjid_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.subscriptions
    where masjid_id = p_masjid_id
      and status = 'grace-period'
      and grace_period_end > now()
  )
$$ language sql stable security definer;

-- Check if subscription is soft-locked
create or replace function public.is_soft_locked(p_masjid_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.subscriptions
    where masjid_id = p_masjid_id
      and status = 'soft-locked'
  )
$$ language sql stable security definer;

-- Get grace period remaining days
create or replace function public.get_grace_period_days_remaining(p_masjid_id uuid)
returns int as $$
  select
    case
      when s.status = 'grace-period' and s.grace_period_end > now() then
        extract(days from (s.grace_period_end - now()))::int
      else 0
    end
  from public.subscriptions s
  where s.masjid_id = p_masjid_id
$$ language sql stable security definer;

-- ================================================
-- 5. PAYMENT TRACKING HELPERS
-- ================================================
-- Get payment history for masjid
create or replace function public.get_payment_history(
  p_masjid_id uuid,
  p_limit int default 10
)
returns table(
  transaction_id uuid,
  amount numeric,
  status text,
  paid_at timestamptz,
  toyyibpay_refno text,
  split_billing jsonb
) as $$
  select
    id as transaction_id,
    amount,
    status,
    paid_at,
    toyyibpay_refno,
    split_billing_details as split_billing
  from public.payment_transactions
  where masjid_id = p_masjid_id
  order by created_at desc
  limit p_limit
$$ language sql stable security definer;

-- Get Local Admin earnings summary
create or replace function public.get_local_admin_earnings(p_local_admin_id uuid)
returns jsonb as $$
  select
    jsonb_build_object(
      'local_admin_id', la.id,
      'full_name', la.full_name,
      'total_earnings', coalesce(
        sum((pt.split_billing_details->>'local_admin_share')::numeric), 0
      ),
      'pending_transfers', coalesce(
        sum(
          case
            when pt.split_billing_details->>'transfer_status' = 'pending'
            then (pt.split_billing_details->>'local_admin_share')::numeric
            else 0
          end
        ), 0
      ),
      'transferred_amount', coalesce(
        sum(
          case
            when pt.split_billing_details->>'transfer_status' = 'transferred'
            then (pt.split_billing_details->>'local_admin_share')::numeric
            else 0
          end
        ), 0
      ),
      'transaction_count', count(pt.id)
    )
  from public.local_admins la
  left join public.masjids m on m.local_admin_id = la.id
  left join public.payment_transactions pt on pt.masjid_id = m.id
    and pt.status = 'success'
    and pt.split_billing_details is not null
  where la.id = p_local_admin_id
  group by la.id, la.full_name
$$ language sql stable security definer;

-- ================================================
-- 6. GRANT PERMISSIONS
-- ================================================
-- Grant execute permissions to authenticated users
grant execute on function public.get_user_role(uuid, uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.get_user_masjids(uuid) to authenticated;
grant execute on function public.check_tier_feature_access(uuid, text) to authenticated;
grant execute on function public.get_masjid_subscription(uuid) to authenticated;
grant execute on function public.check_local_admin_capacity(uuid) to authenticated;
grant execute on function public.get_available_local_admins() to authenticated;
grant execute on function public.is_in_grace_period(uuid) to authenticated;
grant execute on function public.is_soft_locked(uuid) to authenticated;
grant execute on function public.get_grace_period_days_remaining(uuid) to authenticated;
grant execute on function public.get_payment_history(uuid, int) to authenticated;
grant execute on function public.get_local_admin_earnings(uuid) to authenticated;
