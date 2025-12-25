-- Migration: Add grace period automation with pg_cron
-- Feature: 007-multi-tenant-saas
-- Phase: Foundational (Blocking Prerequisites)
-- Tasks: T014

-- ================================================
-- 1. ENABLE PG_CRON EXTENSION
-- ================================================
-- Enable pg_cron for scheduled jobs (Supabase has this pre-enabled)
-- If not enabled, uncomment the line below:
-- create extension if not exists pg_cron;

-- ================================================
-- 2. GRACE PERIOD CHECKER FUNCTION
-- ================================================
-- Function to check and trigger grace periods for failed payments
create or replace function public.check_grace_periods()
returns void as $$
declare
  expired_subscription record;
begin
  -- Find subscriptions where grace period has expired
  for expired_subscription in
    select
      s.id as subscription_id,
      s.masjid_id,
      m.name as masjid_name,
      s.tier,
      s.grace_period_end
    from public.subscriptions s
    join public.masjids m on m.id = s.masjid_id
    where s.status = 'grace-period'
      and s.grace_period_end <= now()
      and s.tier in ('pro', 'premium') -- Rakyat tier doesn't have grace period
  loop
    -- Trigger soft-lock
    update public.subscriptions
    set
      status = 'soft-locked',
      soft_locked_at = now(),
      soft_lock_reason = 'Grace period expired on ' || expired_subscription.grace_period_end::text,
      updated_at = now()
    where id = expired_subscription.subscription_id;

    -- Update masjid subscription_status
    update public.masjids
    set
      subscription_status = 'soft-locked',
      updated_at = now()
    where id = expired_subscription.masjid_id;

    -- Log the soft-lock event (for debugging)
    raise notice 'Soft-locked masjid: % (ID: %), Tier: %, Grace period ended: %',
      expired_subscription.masjid_name,
      expired_subscription.masjid_id,
      expired_subscription.tier,
      expired_subscription.grace_period_end;
  end loop;
end;
$$ language plpgsql security definer;

-- ================================================
-- 3. GRACE PERIOD NOTIFICATION FUNCTION
-- ================================================
-- Function to identify subscriptions needing notifications
create or replace function public.get_grace_period_notifications()
returns table(
  subscription_id uuid,
  masjid_id uuid,
  masjid_name text,
  tier text,
  billing_email text,
  days_remaining int,
  notification_urgency text
) as $$
  select
    s.id as subscription_id,
    s.masjid_id,
    m.name as masjid_name,
    s.tier,
    s.billing_email,
    extract(days from (s.grace_period_end - now()))::int as days_remaining,
    case
      when extract(days from (s.grace_period_end - now())) <= 1 then 'urgent'
      when extract(days from (s.grace_period_end - now())) <= 3 then 'warning'
      else 'info'
    end as notification_urgency
  from public.subscriptions s
  join public.masjids m on m.id = s.masjid_id
  where s.status = 'grace-period'
    and s.grace_period_end > now()
    and s.tier in ('pro', 'premium')
  order by s.grace_period_end asc
$$ language sql stable security definer;

-- ================================================
-- 4. PAYMENT FAILURE TRIGGER FUNCTION
-- ================================================
-- Function to start grace period when payment fails
create or replace function public.trigger_grace_period(
  p_subscription_id uuid,
  p_failure_reason text default null
)
returns jsonb as $$
declare
  v_subscription record;
  v_grace_end timestamptz;
begin
  -- Get subscription details
  select
    s.*,
    m.tier
  into v_subscription
  from public.subscriptions s
  join public.masjids m on m.id = s.masjid_id
  where s.id = p_subscription_id
    and s.status = 'active'
    and s.tier in ('pro', 'premium'); -- Only Pro and Premium have grace periods

  -- If not found or invalid, return error
  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Subscription not found or not eligible for grace period'
    );
  end if;

  -- Calculate grace period end (14 days from now, per FR-051)
  v_grace_end := now() + interval '14 days';

  -- Update subscription to grace-period status
  update public.subscriptions
  set
    status = 'grace-period',
    grace_period_start = now(),
    grace_period_end = v_grace_end,
    failed_payment_attempts = failed_payment_attempts + 1,
    last_failed_at = now(),
    updated_at = now()
  where id = p_subscription_id;

  -- Update masjid subscription_status
  update public.masjids
  set subscription_status = 'grace-period'
  where id = v_subscription.masjid_id;

  -- Return success with grace period details
  return jsonb_build_object(
    'success', true,
    'subscription_id', p_subscription_id,
    'masjid_id', v_subscription.masjid_id,
    'grace_period_start', now(),
    'grace_period_end', v_grace_end,
    'days_until_soft_lock', 14,
    'failure_reason', p_failure_reason
  );
end;
$$ language plpgsql security definer;

-- ================================================
-- 5. PAYMENT SUCCESS RECOVERY FUNCTION
-- ================================================
-- Function to restore subscription from grace period when payment succeeds
create or replace function public.restore_from_grace_period(
  p_subscription_id uuid,
  p_payment_transaction_id uuid
)
returns jsonb as $$
declare
  v_subscription record;
begin
  -- Get subscription details
  select * into v_subscription
  from public.subscriptions
  where id = p_subscription_id
    and status in ('grace-period', 'soft-locked');

  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Subscription not found or not in recovery state'
    );
  end if;

  -- Restore subscription to active
  update public.subscriptions
  set
    status = 'active',
    grace_period_start = null,
    grace_period_end = null,
    failed_payment_attempts = 0,
    last_failed_at = null,
    soft_locked_at = null,
    soft_lock_reason = null,
    updated_at = now()
  where id = p_subscription_id;

  -- Update masjid subscription_status
  update public.masjids
  set subscription_status = 'active'
  where id = v_subscription.masjid_id;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'subscription_id', p_subscription_id,
    'masjid_id', v_subscription.masjid_id,
    'restored_from', v_subscription.status,
    'payment_transaction_id', p_payment_transaction_id
  );
end;
$$ language plpgsql security definer;

-- ================================================
-- 6. SCHEDULE CRON JOB FOR GRACE PERIOD CHECKS
-- ================================================
-- Schedule grace period checker to run every 15 minutes (per FR-064)
-- This will check for expired grace periods and trigger soft-locks

-- Note: pg_cron is available on Supabase Cloud but might not be available locally.
-- This migration will gracefully skip cron setup if pg_cron is not available.

do $$
declare
  cron_available boolean;
begin
  -- Check if cron schema exists (pg_cron extension)
  select exists (
    select 1 from information_schema.schemata where schema_name = 'cron'
  ) into cron_available;

  if cron_available then
    -- Schedule the job using dynamic SQL
    execute format(
      'select cron.schedule(%L, %L, %L)',
      'check-grace-periods',
      '*/15 * * * *',
      'select public.check_grace_periods();'
    );
    raise notice 'Grace period cron job scheduled successfully';
  else
    raise notice 'pg_cron extension not available (this is expected in local development). Grace period checks must be triggered manually or via external scheduler.';
  end if;
end
$$;

-- ================================================
-- 7. GRANT PERMISSIONS
-- ================================================
grant execute on function public.check_grace_periods() to postgres;
grant execute on function public.get_grace_period_notifications() to authenticated;
grant execute on function public.trigger_grace_period(uuid, text) to authenticated;
grant execute on function public.restore_from_grace_period(uuid, uuid) to authenticated;

-- ================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ================================================
comment on function public.check_grace_periods() is 
'Automated job (runs every 15 minutes) to check for expired grace periods and trigger soft-locks';

comment on function public.get_grace_period_notifications() is 
'Returns list of subscriptions in grace period that need email/SMS notifications';

comment on function public.trigger_grace_period(uuid, text) is 
'Manually trigger grace period for a subscription (called when payment fails)';

comment on function public.restore_from_grace_period(uuid, uuid) is 
'Restore subscription from grace-period or soft-locked status when payment succeeds';

-- ================================================
-- 9. VERIFY CRON JOB
-- ================================================
-- Query to verify cron job is scheduled (for debugging)
-- select * from cron.job where jobname = 'check-grace-periods';
