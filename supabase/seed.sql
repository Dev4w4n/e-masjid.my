-- ============================================================================
-- SEED DATA FOR E-MASJID SUITE PROFILE MODULE
-- ============================================================================
-- This file contains sample data for development and testing purposes
-- Run this after all migrations have been applied

-- ============================================================================
-- SEED DATA FOR E-MASJID SUITE PROFILE MODULE
-- ============================================================================
-- This file contains sample data for development and testing purposes
-- Run this after all migrations have been applied

-- NOTE: To seed with sample data, first create users via Supabase Auth
-- Then uncomment and run the INSERT statements below with actual user IDs

-- ============================================================================
-- SAMPLE MASJIDS (Uncomment after creating super admin via Auth)
-- ============================================================================

/*
-- First create a super admin user via Supabase Studio:
-- Email: super.admin@emasjid.my
-- Password: SuperAdmin123!
-- Then replace 'YOUR_SUPER_ADMIN_ID' below with the actual UUID

INSERT INTO public.masjids (
    id,
    name,
    registration_number,
    email,
    phone_number,
    description,
    address,
    status,
    created_by,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Masjid Al-Hidayah',
    'MSJ-2024-001',
    'info@alhidayah.my',
    '+60379561234',
    'A peaceful masjid serving the local community with various Islamic programs and activities.',
    '{
        "address_line_1": "No. 15, Jalan Masjid Al-Hidayah",
        "address_line_2": "Seksyen 7",
        "city": "Shah Alam",
        "state": "Selangor",
        "postcode": "40100",
        "country": "Malaysia"
    }'::jsonb,
    'active',
    'YOUR_SUPER_ADMIN_ID',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Masjid An-Nur',
    'MSJ-2024-002',
    'contact@annur.my',
    '+60321425678',
    'Modern masjid with comprehensive facilities for the community.',
    '{
        "address_line_1": "Jalan Masjid India",
        "address_line_2": "",
        "city": "Kuala Lumpur",
        "state": "Kuala Lumpur",
        "postcode": "50100",
        "country": "Malaysia"
    }'::jsonb,
    'active',
    'YOUR_SUPER_ADMIN_ID',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Masjid At-Taqwa',
    'MSJ-2024-003',
    'admin@attaqwa.my',
    '+60722398765',
    'Traditional masjid with a strong focus on community education and welfare.',
    '{
        "address_line_1": "Jalan Tun Abdul Razak",
        "address_line_2": "Taman Johor Jaya",
        "city": "Johor Bahru",
        "state": "Johor",
        "postcode": "81100",
        "country": "Malaysia"
    }'::jsonb,
    'active',
    'YOUR_SUPER_ADMIN_ID',
    NOW(),
    NOW()
);
*/

-- ============================================================================
-- SAMPLE USER DATA (for manual insertion after auth users are created)
-- ============================================================================

-- This section provides INSERT statements that can be run after creating
-- auth users via Supabase Studio or Auth API

/*
-- Example: After creating auth users, insert corresponding public.users records
-- Replace the UUIDs with actual IDs from auth.users

-- Super Admin
INSERT INTO public.users (id, email, role, email_verified, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'super.admin@emasjid.my', 'super_admin', true, NOW(), NOW());

-- Masjid Admins
INSERT INTO public.users (id, email, role, email_verified, created_at, updated_at) VALUES
('22222222-2222-2222-2222-222222222222', 'admin.alhidayah@emasjid.my', 'masjid_admin', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'admin.annur@emasjid.my', 'masjid_admin', true, NOW(), NOW());

-- Regular Users
INSERT INTO public.users (id, email, role, email_verified, created_at, updated_at) VALUES
('44444444-4444-4444-4444-444444444444', 'ahmad.ibrahim@example.com', 'registered', true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'fatimah.hassan@example.com', 'registered', true, NOW(), NOW());

-- Profiles (will be auto-created by trigger, but can be updated)
UPDATE public.profiles SET 
    full_name = 'Super Admin',
    phone_number = '+60-12-345-6789',
    date_of_birth = '1980-01-01',
    gender = 'male',
    preferred_language = 'en',
    home_masjid_id = '550e8400-e29b-41d4-a716-446655440001',
    is_complete = true,
    updated_at = NOW()
WHERE user_id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles SET 
    full_name = 'Ahmad Ibrahim bin Abdullah',
    phone_number = '+60-13-456-7890',
    date_of_birth = '1985-05-15',
    gender = 'male',
    preferred_language = 'ms',
    home_masjid_id = '550e8400-e29b-41d4-a716-446655440001',
    is_complete = true,
    updated_at = NOW()
WHERE user_id = '22222222-2222-2222-2222-222222222222';

UPDATE public.profiles SET 
    full_name = 'Mohd Zaki bin Hassan',
    phone_number = '+60-14-567-8901',
    date_of_birth = '1982-08-22',
    gender = 'male',
    preferred_language = 'ms',
    home_masjid_id = '550e8400-e29b-41d4-a716-446655440002',
    is_complete = true,
    updated_at = NOW()
WHERE user_id = '33333333-3333-3333-3333-333333333333';

UPDATE public.profiles SET 
    full_name = 'Ahmad Ibrahim',
    phone_number = '+60-15-678-9012',
    date_of_birth = '1990-03-10',
    gender = 'male',
    preferred_language = 'ms',
    home_masjid_id = '550e8400-e29b-41d4-a716-446655440001',
    is_complete = true,
    updated_at = NOW()
WHERE user_id = '44444444-4444-4444-4444-444444444444';

UPDATE public.profiles SET 
    full_name = 'Fatimah Hassan',
    phone_number = '+60-16-789-0123',
    date_of_birth = '1988-11-25',
    gender = 'female',
    preferred_language = 'ms',
    home_masjid_id = '550e8400-e29b-41d4-a716-446655440002',
    is_complete = true,
    updated_at = NOW()
WHERE user_id = '55555555-5555-5555-5555-555555555555';

-- Profile Addresses
INSERT INTO public.profile_addresses (
    profile_id,
    address_line_1,
    address_line_2,
    city,
    state,
    postcode,
    country,
    is_primary
) VALUES
-- Address for Ahmad Ibrahim (get profile_id from profiles table)
((SELECT id FROM public.profiles WHERE user_id = '22222222-2222-2222-2222-222222222222'), 
 'No. 12, Jalan Harmoni 3/2', 'Taman Harmoni', 'Shah Alam', 'Selangor', '40100', 'Malaysia', true),

-- Address for Mohd Zaki
((SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), 
 'No. 45, Jalan Wangsa Maju 5/3', 'Taman Wangsa Maju', 'Kuala Lumpur', 'Kuala Lumpur', '53300', 'Malaysia', true),

-- Address for Ahmad Ibrahim (user)
((SELECT id FROM public.profiles WHERE user_id = '44444444-4444-4444-4444-444444444444'), 
 'No. 78, Jalan Tun Razak 2/1', 'Taman Tun Razak', 'Petaling Jaya', 'Selangor', '46000', 'Malaysia', true),

-- Address for Fatimah Hassan
((SELECT id FROM public.profiles WHERE user_id = '55555555-5555-5555-5555-555555555555'), 
 'No. 23, Jalan Ampang 4/7', 'Taman Ampang', 'Kuala Lumpur', 'Kuala Lumpur', '50450', 'Malaysia', true);

-- Masjid Admin Assignments
INSERT INTO public.masjid_admins (
    id,
    user_id,
    masjid_id,
    assigned_by,
    assigned_at,
    status,
    notes
) VALUES
('aa111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', NOW(), 'active', 'Initial admin assignment'),
('aa222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440002', '11111111-1111-1111-1111-111111111111', NOW(), 'active', 'Initial admin assignment');
*/

-- ============================================================================
-- SAMPLE ADMIN APPLICATIONS (for testing the application workflow)
-- ============================================================================

/*
-- Example admin applications (uncomment and modify UUIDs after creating users)
INSERT INTO public.admin_applications (
    id,
    user_id,
    masjid_id,
    reason,
    experience,
    references,
    status,
    created_at
) VALUES
('app11111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440003', 
 'I would like to contribute to the management of our local masjid and help organize community programs.',
 'I have 5 years of experience in community organizing and event management. I am also a regular congregant at this masjid.',
 'Ustaz Abdullah (imam), Encik Rahman (current committee member)',
 'pending', NOW()),

('app22222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440003',
 'I want to help with the educational programs and youth activities at the masjid.',
 'I am a teacher by profession and have been involved in Islamic education for 8 years.',
 'Ustazah Khadijah (madrasah teacher), Puan Aminah (youth coordinator)',
 'pending', NOW());
*/

-- ============================================================================
-- UTILITY QUERIES FOR DEVELOPMENT
-- ============================================================================

-- View all users with their profiles and masjid assignments
/*
SELECT 
    u.email,
    u.role,
    p.full_name,
    p.phone_number,
    m.name as home_masjid,
    ma.masjid_id as admin_masjid_id,
    ma.status as admin_status
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.masjids m ON p.home_masjid_id = m.id
LEFT JOIN public.masjid_admins ma ON u.id = ma.user_id AND ma.status = 'active'
ORDER BY u.role, u.created_at;
*/

-- View all masjids with their admin count
/*
SELECT 
    m.name,
    m.address->>'state' as state,
    m.address->>'city' as city,
    m.status,
    COUNT(ma.user_id) as admin_count
FROM public.masjids m
LEFT JOIN public.masjid_admins ma ON m.id = ma.masjid_id AND ma.status = 'active'
GROUP BY m.id, m.name, m.address, m.status
ORDER BY m.name;
*/

-- View pending admin applications
/*
SELECT 
    aa.id,
    u.email,
    p.full_name,
    m.name as masjid_name,
    aa.reason,
    aa.created_at
FROM public.admin_applications aa
JOIN public.users u ON aa.user_id = u.id
JOIN public.profiles p ON u.id = p.user_id
JOIN public.masjids m ON aa.masjid_id = m.id
WHERE aa.status = 'pending'
ORDER BY aa.created_at;
*/

-- ============================================================================
-- DEVELOPMENT HELPER FUNCTIONS
-- ============================================================================

-- Function to reset all data (for development only)
CREATE OR REPLACE FUNCTION public.reset_development_data()
RETURNS void AS $$
BEGIN
    -- Delete in reverse dependency order
    DELETE FROM public.admin_applications;
    DELETE FROM public.masjid_admins;
    DELETE FROM public.profile_addresses;
    DELETE FROM public.profiles WHERE user_id NOT IN (SELECT id FROM public.users WHERE role = 'super_admin');
    DELETE FROM public.masjids;
    DELETE FROM public.users WHERE role != 'super_admin';
    DELETE FROM auth.users WHERE email != 'super.admin@emasjid.my';
    
    RAISE NOTICE 'Development data reset completed';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on development functions
GRANT EXECUTE ON FUNCTION public.reset_development_data() TO authenticated;

-- ============================================================================
-- DEVELOPMENT NOTES
-- ============================================================================

/*
SETUP INSTRUCTIONS:

1. Run all migrations first:
   supabase db reset

2. Create auth users via Supabase Studio or API:
   - Go to http://localhost:54323
   - Navigate to Authentication > Users
   - Create users with the emails listed above

3. Update the commented INSERT statements above with actual UUIDs from auth.users

4. Run the INSERT statements to populate sample data

5. Test the application with different user roles:
   - Super admin: Can manage all masjids and users
   - Masjid admin: Can manage their assigned masjid
   - Regular users: Can view masjids and apply for admin roles

TESTING SCENARIOS:

1. User Registration Flow:
   - Create new auth user
   - Verify profile auto-creation
   - Test profile completion

2. Admin Application Flow:
   - Regular user applies for admin role
   - Super admin reviews and approves/rejects
   - Verify role changes and permissions

3. Masjid Management:
   - Admin updates masjid information
   - Test RLS policies for different user roles

4. Profile Management:
   - User updates profile information
   - Test address management
   - Verify profile completion logic

AUTH USER CREATION EXAMPLES:

1. Super Admin:
   Email: super.admin@emasjid.my
   Password: SuperAdmin123!

2. Masjid Admins:
   Email: admin.alhidayah@emasjid.my
   Password: Admin123!
   
   Email: admin.annur@emasjid.my
   Password: Admin123!

3. Regular Users:
   Email: ahmad.ibrahim@example.com
   Password: User123!
   
   Email: fatimah.hassan@example.com
   Password: User123!
*/

-- ============================================================================
-- END OF SEED FILE
-- ============================================================================
