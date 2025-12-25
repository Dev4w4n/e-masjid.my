-- Migration: Add Multi-Tenant SaaS Seed Data
-- Purpose: Populate test data for tier management, subscriptions, and user roles
-- Related Tasks: T017-T021

-- ============================================================================
-- 1. SAMPLE MASJIDS (One per tier)
-- ============================================================================

-- Rakyat Tier (Free)
INSERT INTO public.masjids (id, name, address, city, state, country, tier, created_at)
VALUES (
  'b7f3a1c0-0001-0000-0000-000000000001',
  'Masjid Al-Falah',
  'Jalan Tunku Abdul Rahman',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  'rakyat',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Pro Tier (RM30/month)
INSERT INTO public.masjids (id, name, address, city, state, country, tier, created_at)
VALUES (
  'b7f3a1c0-0002-0000-0000-000000000002',
  'Masjid Ar-Rahman',
  'Jalan Sultan Ismail',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  'pro',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Premium Tier (RM300-500/month)
INSERT INTO public.masjids (id, name, address, city, state, country, tier, created_at)
VALUES (
  'b7f3a1c0-0003-0000-0000-000000000003',
  'Masjid An-Nur',
  'Jalan Ampang',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  'premium',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. SAMPLE USERS (Super Admin, Masjid Admins, Local Admin)
-- ============================================================================

-- Super Admin User
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'superadmin@e-masjid.my',
  crypt('SuperAdmin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Masjid Admin for Al-Falah (Rakyat)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0001-000000000001',
  'admin.alfalah@e-masjid.my',
  crypt('AdminAlFalah123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Masjid Admin for Ar-Rahman (Pro)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0002-000000000002',
  'admin.arrahman@e-masjid.my',
  crypt('AdminArRahman123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Masjid Admin for An-Nur (Premium)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0003-000000000003',
  'admin.annur@e-masjid.my',
  crypt('AdminAnNur123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Local Admin for Premium Tier
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0004-000000000004',
  'localadmin@e-masjid.my',
  crypt('LocalAdmin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. USER ROLES
-- ============================================================================

-- Super Admin Role
INSERT INTO public.user_roles (user_id, role, masjid_id, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'super-admin',
  NULL,
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Masjid Admin for Al-Falah
INSERT INTO public.user_roles (user_id, role, masjid_id, created_at)
VALUES (
  'a0000000-0000-0000-0001-000000000001',
  'masjid-admin',
  'b7f3a1c0-0001-0000-0000-000000000001',
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Masjid Admin for Ar-Rahman
INSERT INTO public.user_roles (user_id, role, masjid_id, created_at)
VALUES (
  'a0000000-0000-0000-0002-000000000002',
  'masjid-admin',
  'b7f3a1c0-0002-0000-0000-000000000002',
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Masjid Admin for An-Nur
INSERT INTO public.user_roles (user_id, role, masjid_id, created_at)
VALUES (
  'a0000000-0000-0000-0003-000000000003',
  'masjid-admin',
  'b7f3a1c0-0003-0000-0000-000000000003',
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Local Admin Role
INSERT INTO public.user_roles (user_id, role, masjid_id, created_at)
VALUES (
  'a0000000-0000-0000-0004-000000000004',
  'local-admin',
  NULL,
  NOW()
) ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 4. SUBSCRIPTIONS
-- ============================================================================

-- Rakyat Subscription (Active, Free Forever)
INSERT INTO public.subscriptions (
  id, 
  masjid_id, 
  tier, 
  status, 
  price, 
  billing_cycle, 
  next_billing_date, 
  created_at
)
VALUES (
  'c0000000-0001-0000-0000-000000000001',
  'b7f3a1c0-0001-0000-0000-000000000001',
  'rakyat',
  'active',
  0.00,
  'monthly',
  NULL, -- Free tier has no billing cycle
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Pro Subscription (Active, RM30/month)
INSERT INTO public.subscriptions (
  id, 
  masjid_id, 
  tier, 
  status, 
  price, 
  billing_cycle, 
  next_billing_date, 
  created_at
)
VALUES (
  'c0000000-0002-0000-0000-000000000002',
  'b7f3a1c0-0002-0000-0000-000000000002',
  'pro',
  'active',
  30.00,
  'monthly',
  NOW() + INTERVAL '30 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Premium Subscription (Grace Period, RM300/month)
INSERT INTO public.subscriptions (
  id, 
  masjid_id, 
  tier, 
  status, 
  price, 
  billing_cycle, 
  next_billing_date,
  grace_period_start,
  grace_period_end,
  created_at
)
VALUES (
  'c0000000-0003-0000-0000-000000000003',
  'b7f3a1c0-0003-0000-0000-000000000003',
  'premium',
  'grace-period',
  300.00,
  'monthly',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '5 days', -- Started 5 days ago
  NOW() + INTERVAL '9 days', -- Expires in 9 days
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. LOCAL ADMINS
-- ============================================================================

INSERT INTO public.local_admins (
  user_id,
  full_name,
  phone_number,
  whatsapp_number,
  availability_status,
  max_capacity,
  current_assignments,
  earnings_summary,
  created_at
)
VALUES (
  'a0000000-0000-0000-0004-000000000004',
  'Ahmad bin Abdullah',
  '+60123456789',
  '+60123456789',
  'available',
  5, -- Max 5 Premium masjids
  1, -- Currently assigned to 1 (An-Nur)
  jsonb_build_object(
    'total_earnings', 450.00,
    'current_month_earnings', 150.00,
    'last_payment_date', NOW() - INTERVAL '5 days',
    'payment_history', jsonb_build_array(
      jsonb_build_object(
        'date', NOW() - INTERVAL '35 days',
        'amount', 150.00,
        'masjid_id', 'b7f3a1c0-0003-0000-0000-000000000003'
      ),
      jsonb_build_object(
        'date', NOW() - INTERVAL '5 days',
        'amount', 150.00,
        'masjid_id', 'b7f3a1c0-0003-0000-0000-000000000003'
      )
    )
  ),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Link Local Admin to Premium Masjid (An-Nur)
UPDATE public.masjids 
SET local_admin_id = 'a0000000-0000-0000-0004-000000000004'
WHERE id = 'b7f3a1c0-0003-0000-0000-000000000003';

-- ============================================================================
-- 6. PAYMENT TRANSACTIONS
-- ============================================================================

-- Pro Tier - Successful Payment
INSERT INTO public.payment_transactions (
  id,
  subscription_id,
  masjid_id,
  amount,
  payment_date,
  payment_method,
  payment_status,
  toyyibpay_billcode,
  toyyibpay_refno,
  created_at
)
VALUES (
  'd0000000-0001-0000-0000-000000000001',
  'c0000000-0002-0000-0000-000000000002',
  'b7f3a1c0-0002-0000-0000-000000000002',
  30.00,
  NOW() - INTERVAL '5 days',
  'online_banking',
  'success',
  'TEST-BILL-PRO-001',
  'TEST-REF-PRO-001',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Premium Tier - Successful Payment with Split Billing
INSERT INTO public.payment_transactions (
  id,
  subscription_id,
  masjid_id,
  amount,
  payment_date,
  payment_method,
  payment_status,
  toyyibpay_billcode,
  toyyibpay_refno,
  split_billing_details,
  created_at
)
VALUES (
  'd0000000-0002-0000-0000-000000000002',
  'c0000000-0003-0000-0000-000000000003',
  'b7f3a1c0-0003-0000-0000-000000000003',
  300.00,
  NOW() - INTERVAL '35 days',
  'online_banking',
  'success',
  'TEST-BILL-PREMIUM-001',
  'TEST-REF-PREMIUM-001',
  jsonb_build_object(
    'local_admin_share', 150.00,
    'platform_share', 150.00,
    'local_admin_transfer_id', 'TRANSFER-001',
    'transfer_status', 'completed',
    'transferred_at', NOW() - INTERVAL '35 days'
  ),
  NOW() - INTERVAL '35 days'
) ON CONFLICT (id) DO NOTHING;

-- Premium Tier - Failed Payment (Triggered Grace Period)
INSERT INTO public.payment_transactions (
  id,
  subscription_id,
  masjid_id,
  amount,
  payment_date,
  payment_method,
  payment_status,
  toyyibpay_billcode,
  toyyibpay_refno,
  failure_reason,
  created_at
)
VALUES (
  'd0000000-0003-0000-0000-000000000003',
  'c0000000-0003-0000-0000-000000000003',
  'b7f3a1c0-0003-0000-0000-000000000003',
  300.00,
  NOW() - INTERVAL '5 days',
  'online_banking',
  'failed',
  'TEST-BILL-PREMIUM-002',
  'TEST-REF-PREMIUM-002',
  'Insufficient funds',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Commented out - use in psql for verification)
-- ============================================================================

-- SELECT 'Masjids' as entity, COUNT(*) as count FROM public.masjids WHERE tier IS NOT NULL
-- UNION ALL
-- SELECT 'Users' as entity, COUNT(*) as count FROM auth.users WHERE email LIKE '%@e-masjid.my'
-- UNION ALL
-- SELECT 'User Roles' as entity, COUNT(*) as count FROM public.user_roles
-- UNION ALL
-- SELECT 'Subscriptions' as entity, COUNT(*) as count FROM public.subscriptions
-- UNION ALL
-- SELECT 'Local Admins' as entity, COUNT(*) as count FROM public.local_admins
-- UNION ALL
-- SELECT 'Payment Transactions' as entity, COUNT(*) as count FROM public.payment_transactions;

-- ============================================================================
-- NOTES
-- ============================================================================
-- Test credentials for development:
-- Super Admin: superadmin@e-masjid.my / SuperAdmin123!
-- Al-Falah Admin: admin.alfalah@e-masjid.my / AdminAlFalah123!
-- Ar-Rahman Admin: admin.arrahman@e-masjid.my / AdminArRahman123!
-- An-Nur Admin: admin.annur@e-masjid.my / AdminAnNur123!
-- Local Admin: localadmin@e-masjid.my / LocalAdmin123!
