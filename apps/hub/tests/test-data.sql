-- test-data.sql
-- SQL template for test data
-- NOTE: This file is now used as a template for the seed-supabase.sh script
-- The actual SQL executed is dynamically generated in test-data-generated.sql

-- This file now serves as documentation of what data will be created
-- Actual data creation happens in the seed-supabase.sh script which:
-- 1. Creates Supabase auth users with dynamic IDs
-- 2. Uses those IDs for proper foreign key references
-- 3. Generates a new SQL file with proper IDs

-- Reset database (optional, you might want to do this separately)
-- TRUNCATE TABLE public.admin_applications CASCADE;
-- TRUNCATE TABLE public.masjid_admins CASCADE;
-- TRUNCATE TABLE public.profile_addresses CASCADE;
-- TRUNCATE TABLE public.profiles CASCADE;
-- TRUNCATE TABLE public.masjids CASCADE;
-- TRUNCATE TABLE public.users CASCADE;

-- Create test users with different roles
-- Note: In a real environment, these would be created via Supabase Auth
-- and the public.users would be populated by the auth triggers

-- 1. Super Admin User
INSERT INTO public.users (id, email, role, email_verified)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'super.admin@test.com', 'super_admin', true);

-- 2. Masjid Admin User
INSERT INTO public.users (id, email, role, email_verified)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'masjid.admin@test.com', 'masjid_admin', true);

-- 3. Regular Users
INSERT INTO public.users (id, email, role, email_verified)
VALUES 
  ('00000000-0000-0000-0000-000000000003', 'user1@test.com', 'registered', true),
  ('00000000-0000-0000-0000-000000000004', 'user2@test.com', 'registered', true),
  ('00000000-0000-0000-0000-000000000005', 'user3@test.com', 'registered', false),
  ('00000000-0000-0000-0000-000000000006', 'incompleteuser@test.com', 'registered', true);

-- Create profiles for users
INSERT INTO public.profiles (id, user_id, full_name, phone_number, preferred_language, is_complete)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Super Admin', '+60123456789', 'en', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Masjid Admin', '+60123456790', 'ms', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Regular User 1', '+60123456791', 'en', true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Regular User 2', '+60123456792', 'en', true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Unverified User', '+60123456793', 'zh', true),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'Incomplete User', NULL, 'en', false);

-- Add addresses for profiles
INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
VALUES
  ('10000000-0000-0000-0000-000000000001', '123 Admin Street', 'Admin Tower', 'Kuala Lumpur', 'Kuala Lumpur', '50100', 'MYS', true),
  ('10000000-0000-0000-0000-000000000002', '456 Masjid Road', 'Unit 7', 'Shah Alam', 'Selangor', '40100', 'MYS', true),
  ('10000000-0000-0000-0000-000000000003', '789 User Lane', 'Apt 12', 'Subang Jaya', 'Selangor', '47500', 'MYS', true),
  ('10000000-0000-0000-0000-000000000004', '101 Test Avenue', NULL, 'Petaling Jaya', 'Selangor', '46000', 'MYS', true),
  ('10000000-0000-0000-0000-000000000005', '202 Verify Road', 'Block B', 'Johor Bahru', 'Johor', '80100', 'MYS', true);
-- Note: No address for incomplete user

-- Create test masjids
INSERT INTO public.masjids (
  id, name, registration_number, email, phone_number, description, 
  address, status, created_by
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001', 
    'Masjid Al-Test', 
    'MSJ-TEST-001', 
    'admin@altest.com', 
    '+60312345678', 
    'Test mosque for unit tests',
    '{"address_line_1": "10 Masjid Lane", "city": "Kuala Lumpur", "state": "Kuala Lumpur", "postcode": "50100", "country": "MYS"}',
    'active',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002', 
    'Masjid Unit-Test', 
    'MSJ-TEST-002', 
    'admin@unittest.com', 
    '+60312345679', 
    'Another test mosque',
    '{"address_line_1": "20 Testing Road", "city": "Shah Alam", "state": "Selangor", "postcode": "40100", "country": "MYS"}',
    'active',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000003', 
    'Masjid Pending', 
    'MSJ-TEST-003', 
    'admin@pending.com', 
    '+60312345680', 
    'Pending verification masjid',
    '{"address_line_1": "30 Pending Street", "city": "Ipoh", "state": "Perak", "postcode": "30000", "country": "MYS"}',
    'pending_verification',
    '00000000-0000-0000-0000-000000000001'
  );

-- Associate profiles with home masjids
UPDATE public.profiles 
SET home_masjid_id = '20000000-0000-0000-0000-000000000001'
WHERE id IN ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003');

UPDATE public.profiles
SET home_masjid_id = '20000000-0000-0000-0000-000000000002'
WHERE id = '10000000-0000-0000-0000-000000000004';

-- Create masjid admin assignments
INSERT INTO public.masjid_admins (
  user_id, masjid_id, status, approved_by, approved_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000002', 
    '20000000-0000-0000-0000-000000000001',
    'active',
    '00000000-0000-0000-0000-000000000001',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003', 
    '20000000-0000-0000-0000-000000000002',
    'active',
    '00000000-0000-0000-0000-000000000001',
    NOW()
  );

-- Create admin applications
INSERT INTO public.admin_applications (
  user_id, masjid_id, application_message, status, review_notes, reviewed_by, reviewed_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000004', 
    '20000000-0000-0000-0000-000000000001',
    'I would like to help manage this masjid. I am active in the community.',
    'pending',
    NULL,
    NULL,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000005', 
    '20000000-0000-0000-0000-000000000001',
    'Please consider my application to help manage this masjid.',
    'approved',
    'Approved based on community recommendation',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000003', 
    '20000000-0000-0000-0000-000000000003',
    'I want to help manage this masjid.',
    'rejected',
    'Masjid is still pending verification',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '14 days'
  );

-- Create service role JWT tokens for testing (these are dummy tokens, not actual JWT)
-- In real testing, you would need to generate real tokens or use Supabase client
-- This is just to document what tokens might be needed for tests
/*
SUPER_ADMIN_TOKEN = <JWT for 00000000-0000-0000-0000-000000000001>
MASJID_ADMIN_TOKEN = <JWT for 00000000-0000-0000-0000-000000000002>
USER_TOKEN = <JWT for 00000000-0000-0000-0000-000000000003>
INCOMPLETE_USER_TOKEN = <JWT for 00000000-0000-0000-0000-000000000006>
UNVERIFIED_USER_TOKEN = <JWT for 00000000-0000-0000-0000-000000000005>
*/