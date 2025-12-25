# Quick Start Guide: Multi-Tenant SaaS Development

**Feature**: 007-multi-tenant-saas  
**Branch**: `007-multi-tenant-saas`  
**Estimated Setup Time**: 30-45 minutes

---

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase CLI installed (`brew install supabase/tap/supabase` or `npm install -g supabase`)
- ToyyibPay sandbox account (register at https://dev.toyyibpay.com)
- Git configured with SSH keys

---

## 1. Branch Setup

### 1.1 Check Out Feature Branch

```bash
cd /path/to/emasjid-my
git fetch origin
git checkout 007-multi-tenant-saas

# Verify branch
git branch --show-current
# Expected: 007-multi-tenant-saas
```

---

## 2. Install Dependencies

### 2.1 Clean Install

```bash
# Clean existing build artifacts
pnpm clean

# Install all dependencies
pnpm install

# Build packages in correct order (CRITICAL after clean)
pnpm run build:clean
```

**⚠️ IMPORTANT**: Always use `pnpm run build:clean` after `pnpm clean && pnpm install` to ensure TypeScript composite projects build in correct dependency order.

---

## 3. Database Setup

### 3.1 Start Local Supabase

```bash
# Start Supabase (Postgres, Auth, Storage, Real-time)
supabase start

# Wait for output (takes ~2 minutes first time)
# Note the following URLs and keys:
# - API URL: http://localhost:54321
# - anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# - service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Apply Migrations

```bash
# Apply all database migrations
supabase db reset

# Verify migrations applied
supabase migration list
# Expected output:
# ✓ 20251224000001_add_tier_and_subscription_tables.sql
# ✓ 20251224000002_add_local_admin_and_roles.sql
# ✓ 20251224000003_add_tier_based_rls_policies.sql
# ✓ 20251224000004_add_tier_helper_functions.sql
# ✓ 20251224000005_add_grace_period_cron.sql
```

### 3.3 Verify Seed Data

```bash
# Connect to local database
supabase db psql

# Check masjids table
SELECT id, name, tier, subscription_status FROM masjids;
# Expected: 3 test masjids (Rakyat, Pro, Premium)

# Check user_roles table
SELECT u.email, ur.role, m.name as masjid_name
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
LEFT JOIN masjids m ON m.id = ur.masjid_id;
# Expected: Test users with roles (super-admin, masjid-admin, local-admin, public-user)

# Exit psql
\q
```

---

## 4. Environment Configuration

### 4.1 Create Environment Files

```bash
# Hub app (main application)
cp apps/hub/.env.example apps/hub/.env.local

# Papan Info app (public displays)
cp apps/papan-info/.env.example apps/papan-info/.env.local

# TV Display app (display-only)
cp apps/tv-display/.env.example apps/tv-display/.env.local
```

### 4.2 Configure Environment Variables

Edit `apps/hub/.env.local`:

```env
# Supabase (from supabase start output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ToyyibPay Sandbox
TOYYIBPAY_ENV=sandbox
TOYYIBPAY_API_URL=https://dev.toyyibpay.com/index.php/api
TOYYIBPAY_SECRET_KEY=your-sandbox-secret-key
TOYYIBPAY_CATEGORY_CODE=your-sandbox-category-code
TOYYIBPAY_WEBHOOK_URL=http://localhost:3000/api/payment/webhook
TOYYIBPAY_RETURN_URL=http://localhost:3000/billing/success

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**🔑 Getting ToyyibPay Sandbox Credentials**:

1. Register at https://dev.toyyibpay.com
2. Login → Dashboard → Settings → User Secret Key (copy this)
3. Dashboard → Categories → Create Category (copy Category Code)

---

## 5. Run Development Servers

### 5.1 Start All Apps

```bash
# Start all apps in watch mode
pnpm dev

# Alternatively, start individual apps:
# pnpm --filter hub dev
# pnpm --filter papan-info dev
# pnpm --filter tv-display dev
```

### 5.2 Verify Apps Running

Open in browser:

- Hub app: http://localhost:3000
- Papan Info: http://localhost:3001
- TV Display: http://localhost:3002

**Expected Behavior**:

- Hub landing page displays tier comparison table (Rakyat/Pro/Premium)
- Registration flow includes tier selection
- Super admin can login at http://localhost:3000/admin with seed credentials

---

## 6. Test Workflows

### 6.1 Test Rakyat (Free) Tier Registration

**Scenario**: User registers and immediately creates TV display without payment.

```bash
# 1. Open Hub app: http://localhost:3000
# 2. Click "Register" button
# 3. Fill form:
#    - Email: test-rakyat@example.com
#    - Password: Password123!
#    - Full Name: Test Rakyat User
# 4. Check email (MailHog at http://localhost:54324) for verification link
# 5. Click verification link
# 6. Fill masjid setup:
#    - Masjid Name: Test Masjid Rakyat
#    - Location: Kuala Lumpur
#    - Contact: 0123456789
# 7. Select "Rakyat (Free)" tier
# 8. Click "Complete Registration"
# 9. Verify: Redirected to dashboard immediately (no payment flow)
# 10. Create TV display → should show "Powered by e-Masjid" branding
# 11. Try to upload custom logo → should show upgrade prompt
```

### 6.2 Test Pro Tier Registration

**Scenario**: User registers, redirected to ToyyibPay sandbox, completes payment, features activated.

```bash
# 1. Open Hub app: http://localhost:3000
# 2. Register new user: test-pro@example.com
# 3. Complete email verification and masjid setup
# 4. Select "Pro (RM30/month)" tier
# 5. Verify: Redirected to ToyyibPay sandbox payment page
# 6. Complete sandbox payment (use Bank Simulator)
# 7. Verify: Redirected back to http://localhost:3000/billing/success
# 8. Verify: Subscription status = "active" in dashboard
# 9. Verify: Can upload custom logo and set brand colors
# 10. Verify: "Powered by e-Masjid" branding removed
# 11. Create schedule rule → should work without errors
```

### 6.3 Test Grace Period Flow

**Scenario**: Simulate payment failure, trigger 14-day grace period, verify soft-lock after expiry.

```bash
# 1. Login as Pro tier user (test-pro@example.com)
# 2. Open browser console and run:
#    await fetch('/api/subscription/trigger-grace-period', {
#      method: 'POST',
#      headers: { 'Content-Type': 'application/json' },
#      body: JSON.stringify({
#        subscriptionId: 'sub_660e9511-f3ac-52e5-b827',
#        failureReason: 'Insufficient funds'
#      })
#    });
# 3. Verify: Grace period banner appears with countdown (14 days)
# 4. Verify: Email notification sent (check MailHog)
# 5. Verify: Can still access Pro features during grace period
# 6. Fast-forward database date by 14 days:
#    UPDATE subscriptions SET grace_period_end = now() - interval '1 day'
#    WHERE masjid_id = '22222222-2222-2222-2222-222222222222';
# 7. Wait for pg_cron to run (or manually trigger soft-lock)
# 8. Verify: Custom branding reverted to "Powered by e-Masjid"
# 9. Verify: Schedule creation disabled
# 10. Verify: Data export disabled
# 11. Verify: All existing data preserved (read-only access)
```

### 6.4 Test Super Admin Access

**Scenario**: Super admin views all masjids, edits any content, views billing records.

```bash
# 1. Login as super admin: super@emasjid.my / SuperAdmin123!
# 2. Navigate to /admin/dashboard
# 3. Verify: Can see all 3 test masjids (Rakyat, Pro, Premium)
# 4. Click "View All Masjids"
# 5. Select any masjid → should open edit page
# 6. Verify: Can edit masjid details, subscription, content
# 7. Navigate to /admin/billing
# 8. Verify: Can see all payment transactions with split billing details
# 9. Navigate to /admin/soft-locked
# 10. Verify: Can see all soft-locked accounts with manual unlock button
```

### 6.5 Test Local Admin Multi-Masjid Access

**Scenario**: Local Admin manages content for multiple Premium masjids.

```bash
# 1. Login as Local Admin: local-admin@emasjid.my / LocalAdmin123!
# 2. Navigate to /admin/local-admin/dashboard
# 3. Verify: Can see assigned masjids list (max 10)
# 4. Verify: Can see earnings summary (RM150 per Premium subscription)
# 5. Select masjid from list → should open content management page
# 6. Create content on behalf of masjid → should save successfully
# 7. Verify: Content shows "Created by Local Admin" label
# 8. Navigate to /admin/local-admin/earnings
# 9. Verify: Can see payment history and pending transfers
```

---

## 7. Testing with ToyyibPay Sandbox

### 7.1 Webhook Testing

**⚠️ Limitation**: ToyyibPay sandbox cannot send webhooks to `localhost`. Use polling fallback for local testing.

**Workaround for Webhook Testing**:

1. Deploy to staging environment (Cloudflare)
2. Or use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   # Copy HTTPS URL (e.g., https://abc123.ngrok.io)
   # Update TOYYIBPAY_WEBHOOK_URL in .env.local
   ```

### 7.2 Manual Webhook Simulation

```bash
# Simulate successful payment webhook
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "refno=TP241224000001" \
  -d "status=1" \
  -d "reason=Payment successful" \
  -d "billcode=abc123xyz" \
  -d "order_id=sub_660e9511-f3ac-52e5-b827" \
  -d "amount=3000" \
  -d "transaction_time=2025-12-24T10:30:00+08:00"

# Check response (should return 200 OK)
```

---

## 8. Running Tests

### 8.1 Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests for specific package
pnpm --filter subscription-management test

# Run tests in watch mode
pnpm --filter subscription-management test:watch
```

### 8.2 E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
pnpm playwright install

# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm playwright test tests/e2e/registration-flow.spec.ts

# Run tests with UI (debugging)
pnpm playwright test --ui
```

**Key E2E Test Scenarios**:

- `registration-flow.spec.ts`: Tests all three tier registration flows
- `payment-integration.spec.ts`: Tests ToyyibPay payment flow with sandbox
- `grace-period.spec.ts`: Tests grace period countdown and soft-lock trigger
- `super-admin.spec.ts`: Tests super admin access to all masjids
- `local-admin.spec.ts`: Tests Local Admin multi-masjid content management

---

## 9. Database Debugging

### 9.1 Inspect Database State

```bash
# Connect to local Supabase database
supabase db psql

# View all subscriptions
SELECT
  s.id,
  m.name as masjid_name,
  s.tier,
  s.status,
  s.grace_period_end,
  s.soft_locked_at
FROM subscriptions s
JOIN masjids m ON m.id = s.masjid_id;

# View payment transactions with split billing
SELECT
  pt.id,
  m.name as masjid_name,
  pt.amount,
  pt.status,
  pt.split_billing_details->>'transfer_status' as split_status,
  pt.paid_at
FROM payment_transactions pt
JOIN masjids m ON m.id = pt.masjid_id
ORDER BY pt.created_at DESC;

# View Local Admin assignments
SELECT
  la.full_name,
  count(m.id) as assigned_count,
  la.max_capacity,
  (la.earnings_summary->>'total_earnings')::numeric as total_earnings
FROM local_admins la
LEFT JOIN masjids m ON m.local_admin_id = la.id
GROUP BY la.id, la.full_name, la.max_capacity, la.earnings_summary;

# Exit psql
\q
```

### 9.2 Reset Database (Fresh Start)

```bash
# Reset to clean state
supabase db reset

# Verify seed data applied
supabase db psql -c "SELECT name, tier FROM masjids;"
```

---

## 10. Common Issues & Solutions

### Issue 1: `pnpm build` fails with "Cannot find module"

**Solution**: Use `pnpm run build:clean` after clean install.

```bash
pnpm clean
pnpm install
pnpm run build:clean  # NOT pnpm build
```

---

### Issue 2: ToyyibPay webhook not received

**Solution**: Use polling fallback or ngrok for local testing.

```bash
# Enable polling in .env.local
TOYYIBPAY_ENABLE_POLLING=true
TOYYIBPAY_POLLING_INTERVAL=900000  # 15 minutes in ms
```

---

### Issue 3: RLS policy prevents data access

**Solution**: Check user role in JWT token.

```bash
# Inspect JWT token in browser console
const { data: { session } } = await supabase.auth.getSession();
console.log(atob(session.access_token.split('.')[1]));
# Look for "user_role" in claims

# If role missing, verify Auth Hook:
supabase db psql -c "SELECT * FROM pg_proc WHERE proname = 'custom_access_token_hook';"
```

---

### Issue 4: Grace period not triggering soft-lock

**Solution**: Manually run pg_cron job.

```bash
# Trigger grace period expiry check manually
supabase db psql -c "
  UPDATE subscriptions
  SET status = 'soft-locked', soft_locked_at = now()
  WHERE status = 'grace-period' AND grace_period_end < now();
"
```

---

## 11. Next Steps

After completing quick start:

1. **Read Documentation**:
   - `/docs/TIER-MANAGEMENT.md` - Feature matrix and access control
   - `/docs/SUBSCRIPTION-BILLING.md` - ToyyibPay integration details
   - `/docs/LOCAL-ADMIN-GUIDE.md` - Local Admin workflow

2. **Implement Features** (TDD Approach):
   - Write test FIRST (e.g., `SubscriptionService.test.ts`)
   - See test fail
   - Implement service to make test pass
   - Verify with E2E test

3. **Review Contracts**:
   - `specs/007-multi-tenant-saas/contracts/payment-service.md`
   - `specs/007-multi-tenant-saas/contracts/subscription-service.md`
   - `specs/007-multi-tenant-saas/contracts/tier-service.md`

4. **Generate Tasks**:
   ```bash
   # Run task generation command
   /speckit.tasks
   # This will create specs/007-multi-tenant-saas/tasks.md
   ```

---

## 12. Support

- **Documentation**: `/specs/007-multi-tenant-saas/plan.md`
- **Research**: `/specs/007-multi-tenant-saas/research.md`
- **Data Model**: `/specs/007-multi-tenant-saas/data-model.md`
- **API Contracts**: `/specs/007-multi-tenant-saas/contracts/`

**Estimated Time to First Feature**: ~2-3 days (including tests)
