# Phase 0: Technical Research

**Feature**: Multi-Tenant SaaS with Tiered Pricing  
**Branch**: `007-multi-tenant-saas`  
**Date**: 24 December 2025

This document consolidates technical research for architectural decisions in the multi-tenant SaaS implementation.

---

## 1. ToyyibPay Payment Gateway Integration

### 1.1 Recurring Billing for Subscriptions

**Decision**: Manual monthly bill generation via ToyyibPay Create Bill API (no native recurring billing support).

**Rationale**:

- ToyyibPay API documentation confirms NO automated recurring payment capability
- Only one-time bill creation endpoints available
- Common practice in Malaysian payment gateways due to regulatory constraints

**Implementation Pattern**:

```typescript
// packages/subscription-management/src/services/PaymentService.ts
interface BillCreationRequest {
  userSecretKey: string;
  categoryCode: string;
  billName: string;
  billDescription: string;
  billPriceSetting: 0; // Fixed amount
  billAmount: number; // In cents (RM30.00 = 3000)
  billExternalReferenceNo: string; // subscription_id for tracking
  billTo: string; // Customer name
  billEmail: string;
  billPhone: string;
  billCallbackUrl: string; // Webhook endpoint
  billExpiryDays: number; // 14 days for payment window
}

// Cron job generates monthly bills
async function generateMonthlyBills() {
  const activeSubscriptions = await getSubscriptionsDueForRenewal();

  for (const subscription of activeSubscriptions) {
    const billData: BillCreationRequest = {
      userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
      categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
      billName: `Subscription - ${subscription.tier} Tier`,
      billDescription: `Monthly subscription for ${subscription.masjid.name}`,
      billPriceSetting: 0,
      billAmount: subscription.tier === "pro" ? 3000 : 30000, // RM30 or RM300
      billExternalReferenceNo: subscription.id,
      billTo: subscription.billing_contact_name,
      billEmail: subscription.billing_email,
      billPhone: subscription.billing_phone,
      billCallbackUrl: `${process.env.API_BASE_URL}/api/payment/webhook`,
      billExpiryDays: 14, // Grace period for payment
    };

    await createToyyibPayBill(billData);
    await sendPaymentReminderEmail(subscription);
  }
}

// Schedule via cron (first day of month, 9 AM MYT)
// Example: Run via Supabase Edge Function with pg_cron
```

**Alternatives Considered**:

- Stripe: Better recurring support but requires international bank account, higher fees in Malaysia
- Billplz: Similar limitations to ToyyibPay
- Manual bank transfers: Poor UX, no automation

---

### 1.2 Split Billing for Local Admin Earnings

**Decision**: Receive full payment to platform account, then programmatically transfer RM150 to Local Admin via internal credit system.

**Rationale**:

- ToyyibPay `billSplitPayment` feature is **ONLY available for FPX (online banking), NOT credit card**
- NOT available for dynamic bills (billPriceSetting = 0)
- Recipients must have existing ToyyibPay accounts (unrealistic for Local Admins)
- Split amount is fixed value, not percentage (inflexible for tiered pricing)

**Implementation Pattern**:

```typescript
// packages/subscription-management/src/services/SplitBillingService.ts
interface PaymentTransaction {
  id: string;
  subscription_id: string;
  amount_received: number; // Full RM300 or RM30
  local_admin_share: number; // RM150 for Premium tier
  platform_share: number; // Remainder after split
  split_status: "pending" | "transferred" | "failed";
  transferred_at?: Date;
}

async function processSplitBilling(paymentWebhookData: ToyyibPayWebhook) {
  const { order_id, amount, status } = paymentWebhookData;

  if (status !== "1") return; // Only process successful payments

  const subscription = await getSubscriptionById(order_id);

  if (subscription.tier === "premium" && subscription.local_admin_id) {
    const localAdminShare = 15000; // RM150 in cents
    const platformShare = amount - localAdminShare;

    // Record transaction
    const transaction = await createPaymentTransaction({
      subscription_id: subscription.id,
      amount_received: amount,
      local_admin_share: localAdminShare,
      platform_share: platformShare,
      split_status: "pending",
    });

    // Credit Local Admin internal wallet (NOT bank transfer)
    await creditLocalAdminEarnings(
      subscription.local_admin_id,
      localAdminShare,
      transaction.id
    );

    // Update transaction status
    await updatePaymentTransaction(transaction.id, {
      split_status: "transferred",
      transferred_at: new Date(),
    });

    // Send earnings notification
    await notifyLocalAdminEarnings(
      subscription.local_admin_id,
      localAdminShare
    );
  }
}

// Local Admin withdrawal handled separately (manual bank transfer request)
```

**Alternatives Considered**:

- Use `billSplitPayment` API directly: Rejected (credit card not supported, ToyyibPay account requirement)
- Create separate bill for Local Admin share: Rejected (poor UX, two payment flows)
- Real-time bank transfer via FPX API: Not available in ToyyibPay API

**Implications for FR-043**:

- FR-043 states "Real-time split payment processing" → Interpret as "immediate credit system update", NOT bank transfer
- Actual bank withdrawal by Local Admin is separate workflow (manual approval, batch transfers)

---

### 1.3 Webhook Integration and Reliability

**Decision**: Implement hybrid approach with webhook as primary mechanism + polling as fallback.

**Rationale**:

- ToyyibPay webhooks have NO signature verification documented (security concern)
- Webhooks may be delayed or lost in network failures
- Cannot receive callbacks on localhost (sandbox limitation)
- Polling ensures payment status is eventually captured

**Implementation Pattern**:

```typescript
// Webhook handler (primary mechanism)
// apps/hub/src/pages/api/payment/webhook.ts
export async function POST(request: Request) {
  const body = await request.formData();
  const webhookData = {
    refno: body.get("refno") as string,
    status: body.get("status") as string, // 1=success, 2=pending, 3=fail
    billcode: body.get("billcode") as string,
    order_id: body.get("order_id") as string, // Our subscription_id
    amount: parseInt(body.get("amount") as string),
    transaction_time: body.get("transaction_time") as string,
  };

  // Security: Verify billCode exists in our system
  const subscription = await getSubscriptionByExternalRef(webhookData.order_id);
  if (!subscription) {
    return new Response("Invalid order_id", { status: 400 });
  }

  // Verify billCode via ToyyibPay API (no signature verification available)
  const billDetails = await verifyBillCode(webhookData.billcode);
  if (billDetails.billExternalReferenceNo !== webhookData.order_id) {
    return new Response("Billcode mismatch", { status: 400 });
  }

  // Process payment
  if (webhookData.status === "1") {
    await activateSubscription(subscription.id);
    await processSplitBilling(webhookData);
  } else if (webhookData.status === "3") {
    await handleFailedPayment(subscription.id);
  }

  return new Response("OK", { status: 200 });
}

// Polling fallback (runs every 15 minutes via cron)
async function pollPendingPayments() {
  const pendingSubscriptions = await getSubscriptionsWithPendingPayment();

  for (const subscription of pendingSubscriptions) {
    // Use getBillTransactions API to check payment status
    const transactions = await getToyyibPayBillTransactions(
      subscription.bill_code
    );

    const paidTransaction = transactions.find(
      (t) => t.billpaymentStatus === "1"
    );
    if (paidTransaction) {
      // Webhook missed - process payment now
      await activateSubscription(subscription.id);
      await processSplitBilling({
        order_id: subscription.id,
        amount: paidTransaction.billpaymentAmount,
        status: "1",
        refno: paidTransaction.billpaymentInvoiceNo,
        billcode: subscription.bill_code,
        transaction_time: paidTransaction.billpaymentDate,
      });
    }
  }
}
```

**Security Considerations**:

- IP whitelisting: Add ToyyibPay server IPs to firewall allowlist (obtain from support)
- HTTPS only: Reject non-HTTPS webhook endpoints
- Double verification: Query `getBillTransactions` API before processing large payments
- Idempotency: Use `refno` (payment reference number) to prevent duplicate processing

**Alternatives Considered**:

- Webhook only: Rejected (reliability concerns, no signature verification)
- Polling only: Rejected (poor UX, delayed payment confirmation)

---

### 1.4 Sandbox Testing Strategy

**Decision**: Use ToyyibPay sandbox environment (dev.toyyibpay.com) with separate credentials for staging deployment.

**Implementation Pattern**:

```bash
# Environment variables (deployment/env-templates/.env.staging)
TOYYIBPAY_ENV=sandbox
TOYYIBPAY_API_URL=https://dev.toyyibpay.com/index.php/api
TOYYIBPAY_SECRET_KEY=sandbox-xxx-xxx-xxx
TOYYIBPAY_CATEGORY_CODE=sandbox-category-xxx
TOYYIBPAY_WEBHOOK_URL=https://staging.emasjid.my/api/payment/webhook

# Environment variables (deployment/env-templates/.env.production)
TOYYIBPAY_ENV=production
TOYYIBPAY_API_URL=https://toyyibpay.com/index.php/api
TOYYIBPAY_SECRET_KEY=prod-xxx-xxx-xxx
TOYYIBPAY_CATEGORY_CODE=prod-category-xxx
TOYYIBPAY_WEBHOOK_URL=https://emasjid.my/api/payment/webhook
```

**Testing Checklist**:

- [x] Create sandbox ToyyibPay account at dev.toyyibpay.com
- [x] Generate sandbox secret key and category code
- [x] Test bill creation with fixed amount (RM30, RM300)
- [x] Test FPX payment flow via "Bank Simulator"
- [x] Verify webhook callback delivery to staging endpoint
- [x] Test payment failure scenario (expired bill)
- [x] Validate polling fallback by disabling webhook temporarily

**Alternatives Considered**:

- Mock ToyyibPay API: Rejected (cannot test FPX integration, webhook delivery)
- Direct production testing: Rejected (risky, real money involved)

---

## 2. Supabase Multi-Tenant Architecture

### 2.1 Row Level Security (RLS) for Tier-Based Access Control

**Decision**: Use RLS policies with JWT claims (`auth.jwt()`) to enforce tier-based feature gates at database level.

**Rationale**:

- RLS executes on every query, preventing client-side bypass
- JWT claims are server-controlled (app_metadata), read-only for users
- Performance optimized with indexed columns and security definer functions

**Implementation Pattern**:

```sql
-- Migration: 20251224000004_add_tier_helper_functions.sql
create or replace function public.get_user_tier()
returns text as $$
  select tier from masjids
  where id = (
    select masjid_id from user_masjid_access
    where user_id = auth.uid()
    limit 1
  )
$$ language sql stable security definer;

-- Pro tier scheduling feature gate
create policy "Pro tier can schedule content"
on display_content for insert
to authenticated
with check (
  (select get_user_tier()) in ('pro', 'premium')
  and scheduled_at is not null
);

-- Soft-lock policy (grace-period status)
create policy "Grace period read-only access"
on display_content for all
to authenticated
using (
  case
    when (
      select status from subscriptions s
      join masjids m on s.masjid_id = m.id
      join user_masjid_access uma on uma.masjid_id = m.id
      where uma.user_id = auth.uid()
      limit 1
    ) = 'grace-period' then
      -- Read only, no writes
      auth.uid() = created_by and current_setting('request.method') = 'GET'
    else true
  end
);

-- Performance optimization: Wrap auth.uid() in select
create policy "Optimized user content access"
on display_content for all
to authenticated
using (
  (select auth.uid()) = created_by -- Cached per statement (99.9% faster)
);

-- Add indexes for RLS performance
create index idx_display_content_created_by on display_content(created_by);
create index idx_user_masjid_access_user_id on user_masjid_access(user_id);
create index idx_subscriptions_status on subscriptions(status);
```

**Performance Best Practices** (from Supabase docs):

- ✅ Wrap `auth.uid()` in `(select auth.uid())` to cache result per statement
- ✅ Add indexes on columns used in `using` and `with check` clauses
- ✅ Use `security definer` functions for complex tier lookups
- ✅ Specify roles with `TO authenticated` to skip anon user evaluation
- ✅ Add explicit filters to queries even if duplicated in policy (helps query planner)

**Alternatives Considered**:

- Application-level checks: Rejected (can be bypassed via service role key)
- Separate tables per tier: Rejected (schema bloat, migration complexity)

---

### 2.2 Premium Tier Data Isolation

**Decision**: Use RLS-enforced tenant isolation within single database (NO separate Supabase instances per Premium customer).

**Rationale**:

- Supabase does NOT support programmatic database instance creation via API
- Each Supabase project = one Postgres instance (cannot be automated mid-runtime)
- RLS provides strong tenant isolation when properly configured
- Manual Premium migration approach (per clarification session) already documented in FR-033 series

**Implementation Pattern**:

```sql
-- Migration: 20251224000001_add_tier_and_subscription_tables.sql
create table masjids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null check (tier in ('rakyat', 'pro', 'premium')),
  created_at timestamptz default now()
);

-- All data tables reference masjid_id for tenant isolation
create table display_content (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid references masjids(id) on delete cascade not null,
  content_data jsonb,
  created_at timestamptz default now()
);

-- RLS policy: Strict tenant isolation
create policy "Users access only their masjid data"
on display_content for all
to authenticated
using (
  masjid_id in (
    select masjid_id from user_masjid_access
    where user_id = auth.uid()
  )
);

-- Super admin bypass for cross-tenant access
create policy "Super admin sees all masjids"
on display_content for all
to authenticated
using (
  (select is_super_admin()) = true
);

create function public.is_super_admin()
returns boolean as $$
  select (auth.jwt() ->> 'user_role')::text = 'super-admin'
$$ language sql stable security definer;
```

**Premium Tier Considerations**:

- Data encryption: Use pgcrypto extension for sensitive Premium fields (optional)
- Backup isolation: Implement per-masjid backup export feature (CSV/JSON)
- Query isolation: Ensure RLS policies never JOIN across tenants unintentionally

**Implications for FR-033 Series**:

- FR-033a: Manual database migration remains valid (export from existing system, import to Open E Masjid)
- FR-033b: Local Admin or super admin performs migration via admin interface (NOT automated)
- FR-033c: Migration documentation updated in `/docs/PREMIUM-MIGRATION-GUIDE.md`

**Alternatives Considered**:

- Separate Supabase projects per Premium customer: Rejected (no API automation, cost ~RM60/month per project)
- Postgres schemas per tenant: Limited benefit, RLS still required
- Foreign Data Wrappers (FDW): Complex, not officially supported for multi-tenancy

---

### 2.3 Real-time Subscriptions for Grace Period Countdown

**Decision**: Use `postgres_changes` with filtered subscriptions on `subscriptions` table + client-side countdown timer.

**Rationale**:

- Real-time updates fire when subscription status changes (active → grace-period → soft-locked)
- Filters reduce unnecessary messages (`filter: 'masjid_id=eq.X'`)
- Client calculates remaining time locally to avoid excessive DB queries
- Supabase Realtime scales to 1,000+ concurrent connections with proper filtering

**Implementation Pattern**:

```typescript
// packages/subscription-management/src/hooks/useGracePeriod.ts
import { useEffect, useState } from "react";
import { createClient } from "@/packages/supabase-client";

export function useGracePeriod(masjidId: string) {
  const [gracePeriodEnd, setGracePeriodEnd] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Fetch current grace period status
    async function fetchGracePeriod() {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, grace_period_end")
        .eq("masjid_id", masjidId)
        .single();

      if (data?.status === "grace-period" && data.grace_period_end) {
        setGracePeriodEnd(new Date(data.grace_period_end));
      }
    }
    fetchGracePeriod();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`subscription-${masjidId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "subscriptions",
          filter: `masjid_id=eq.${masjidId}`, // Filter to this masjid only
        },
        (payload) => {
          if (payload.new.status === "grace-period") {
            setGracePeriodEnd(new Date(payload.new.grace_period_end));
          } else if (payload.new.status === "active") {
            setGracePeriodEnd(null); // Payment received, clear countdown
          } else if (payload.new.status === "soft-locked") {
            setGracePeriodEnd(null); // Grace period expired
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [masjidId]);

  // Client-side countdown (updates every hour, not every second)
  useEffect(() => {
    if (!gracePeriodEnd) {
      setDaysRemaining(null);
      return;
    }

    function calculateDaysRemaining() {
      const now = new Date();
      const diff = gracePeriodEnd.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(days > 0 ? days : 0);
    }

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 60 * 60 * 1000); // Update hourly

    return () => clearInterval(interval);
  }, [gracePeriodEnd]);

  return { daysRemaining, isGracePeriod: daysRemaining !== null };
}
```

**Server-side Grace Period Expiry Check**:

```sql
-- Migration: 20251224000005_add_grace_period_cron.sql
-- Requires pg_cron extension (enabled by default in Supabase)
select cron.schedule(
  'check-expired-grace-periods',
  '0 0 * * *', -- Daily at midnight UTC
  $$
    update subscriptions
    set status = 'soft-locked',
        soft_locked_at = now()
    where status = 'grace-period'
    and grace_period_end < now();
  $$
);

-- Email notifications for Day 1 and Day 13
select cron.schedule(
  'send-grace-period-notifications',
  '0 9 * * *', -- Daily at 9 AM MYT (1 AM UTC)
  $$
    select send_grace_period_email(s.id)
    from subscriptions s
    where s.status = 'grace-period'
    and (
      date_trunc('day', s.grace_period_start) = current_date - interval '1 day'
      or date_trunc('day', s.grace_period_end) = current_date + interval '1 day'
    );
  $$
);
```

**Realtime Scaling Considerations**:

- Free tier: 200 concurrent connections (sufficient for MVP)
- Pro tier: 500+ concurrent connections
- Connection multiplexing: One channel per masjid, multiple users share
- Filters reduce message throughput (~99% of updates ignored for other tenants)

**Alternatives Considered**:

- Polling every minute: Higher DB load, not real-time
- Server-sent events (SSE): Reinventing Supabase Realtime
- Broadcast channel: Less suitable for database state changes

---

### 2.4 Authentication with Custom Roles

**Decision**: Use **Custom Access Token Auth Hook** to inject roles into JWT + store roles in `user_roles` table.

**Rationale**:

- Auth Hook runs before token issuance, modifying JWT claims
- RLS policies can read `auth.jwt() ->> 'user_role'` directly without additional queries
- Separate `user_roles` table provides audit trail and flexibility
- Highest privilege role wins (super-admin > masjid-admin > local-admin > public-user)

**Implementation Pattern**:

```sql
-- Migration: 20251224000002_add_local_admin_and_roles.sql
create type public.user_role as enum (
  'super-admin',
  'masjid-admin',
  'local-admin',
  'public-user'
);

create table public.user_roles (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  role user_role not null,
  masjid_id uuid references masjids(id), -- null for super-admin
  created_at timestamptz default now(),
  unique (user_id, role, masjid_id)
);

-- Auth Hook to inject role into JWT (Supabase Dashboard → Authentication → Hooks)
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

-- Grant permissions (REQUIRED for Auth Hook)
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant all on table public.user_roles to supabase_auth_admin;
grant all on table public.masjids to supabase_auth_admin;

-- RLS helper function
create function public.get_user_role()
returns text as $$
  select (auth.jwt() ->> 'user_role')::text
$$ language sql stable security definer;
```

**RLS Policy Patterns**:

```sql
-- Super-admin bypass
create policy "Super admin sees all data"
on display_content for all
to authenticated
using ((select get_user_role()) = 'super-admin');

-- Local-admin multi-masjid access
create policy "Local admin multi-masjid access"
on display_content for select
to authenticated
using (
  masjid_id in (
    select masjid_id from user_roles
    where user_id = auth.uid()
    and role in ('local-admin', 'masjid-admin')
  )
);
```

**Role Assignment Workflow**:

```typescript
// packages/auth/src/services/RoleService.ts
async function assignRole(userId: string, role: UserRole, masjidId?: string) {
  // Only super-admin can assign roles
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentRole = await getUserRole(user.id);

  if (currentRole !== "super-admin") {
    throw new Error("Unauthorized: Only super-admin can assign roles");
  }

  // Insert role
  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role,
    masjid_id: role === "super-admin" ? null : masjidId,
  });

  if (error) throw error;

  // Trigger JWT refresh (user must re-login or refresh token)
  await supabase.auth.refreshSession();
}
```

**Alternatives Considered**:

- Store role in `auth.users.raw_user_meta_data`: Rejected (user can modify via `supabase.auth.update()`)
- Store role in `auth.users.raw_app_meta_data`: Rejected (requires Admin API, cannot query in RLS)
- Middleware role checks: Rejected (database still accessible via service role key)

---

### 2.5 Database Migration Naming Convention

**Decision**: Use Supabase CLI default format `YYYYMMDDHHMMSS_description.sql`.

**Rationale**:

- Matches project constitution requirement for timestamp-based naming
- Chronological ordering prevents team conflicts
- Supabase CLI auto-generates this format
- Industry standard (Rails, Django, Laravel, Flyway)

**Implementation Pattern**:

```bash
# Generate migration (Supabase CLI)
supabase migration new add_tier_and_subscription_tables
# Creates: supabase/migrations/20241224000001_add_tier_and_subscription_tables.sql

# Manual creation (if needed)
touch supabase/migrations/20241224000002_add_local_admin_and_roles.sql
```

**Enum Extension Pattern** (IMPORTANT):

```sql
-- Migration: 20241224000002_add_local_admin_and_roles.sql
-- SAFE: Add new enum values at end
alter type user_role add value if not exists 'super-admin';
alter type user_role add value if not exists 'local-admin';

-- UNSAFE: Cannot remove enum values directly
-- Workaround: Create new type, migrate data, drop old
-- Example (for reference only, NOT used in this feature):
alter type user_role rename to user_role_old;
create type user_role as enum ('masjid-admin', 'local-admin'); -- 'public-user' removed
alter table user_roles
  alter column role type user_role using role::text::user_role;
drop type user_role_old;
```

**Rollback Strategy**:

```sql
-- Supabase does NOT support automatic rollback
-- Use transactions for safety
begin;
  alter table masjids add column tier text default 'rakyat';
  -- Validate with SELECT queries
  select count(*) from masjids where tier is null; -- Should return 0
commit; -- Or ROLLBACK if validation fails
```

**Seed Data Management**:

```sql
-- supabase/seed.sql (runs after all migrations via `supabase db reset`)
-- Use UPSERTS for idempotency
insert into masjids (id, name, tier)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Test Masjid Rakyat', 'rakyat'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Test Masjid Pro', 'pro'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Test Masjid Premium', 'premium')
on conflict (id) do update
set
  name = excluded.name,
  tier = excluded.tier;

-- Create test users (fixed UUIDs for E2E tests)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'rakyat@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
)
on conflict (id) do nothing;

-- Assign roles
insert into user_roles (user_id, role, masjid_id)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'public-user', '11111111-1111-1111-1111-111111111111'::uuid)
on conflict do nothing;
```

**Alternatives Considered**:

- Sequential numbering (001, 002): Rejected (conflicts in team environments)
- Date-only names (20241224): Rejected (multiple migrations per day collision)
- Flyway-style versioning (V1\_\_name.sql): Rejected (not compatible with Supabase CLI)

---

## 3. Key Architectural Decisions Summary

### 3.1 Payment Integration

- ✅ Manual monthly bill generation (no native recurring)
- ✅ Internal credit system for Local Admin split billing (not real-time bank transfer)
- ✅ Webhook + polling hybrid for payment confirmation
- ✅ Sandbox testing with dev.toyyibpay.com

### 3.2 Multi-Tenancy

- ✅ RLS-enforced tenant isolation (no separate DB instances)
- ✅ JWT claims for tier checks (app_metadata, not user_metadata)
- ✅ Custom Auth Hook for role injection into JWT
- ✅ Super admin bypass via RLS policies

### 3.3 Real-time Features

- ✅ Postgres changes subscription for grace period updates
- ✅ Client-side countdown calculation (not server polling)
- ✅ Filtered channels per masjid (scales to 1,000+ users)
- ✅ pg_cron for daily grace period expiry checks

### 3.4 Database Patterns

- ✅ Timestamp-based migration naming (YYYYMMDDHHMMSS)
- ✅ Enum extensions (add values only, cannot remove)
- ✅ Seed data with upserts (idempotent resets)
- ✅ Transaction-wrapped migrations for safety

---

## 4. Unresolved Technical Questions (NONE)

All NEEDS CLARIFICATION items from plan.md Technical Context have been resolved through research.

---

**Next Phase**: Phase 1 (data-model.md, contracts/, quickstart.md) → Use findings above to design concrete database schema and API contracts.
