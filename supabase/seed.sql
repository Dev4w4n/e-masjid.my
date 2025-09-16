-- Seed data for Masjid Suite Profile Management System
-- This file contains initial data for development and testing

-- ============================================================================
-- SUPER ADMIN USER SETUP
-- ============================================================================

-- Note: Super admin will be created via Supabase Auth with email from .env
-- This seed sets up the profile for the super admin user
-- The super admin user ID will be inserted by the auth trigger

-- ============================================================================
-- SAMPLE MASJIDS
-- ============================================================================

-- Insert sample masjids (will be created by super admin)
INSERT INTO public.masjids (id, name, registration_number, email, phone_number, description, address, status, created_by) VALUES

-- Masjid Jamek Sungai Rambai (Primary test masjid)
(
    '01234567-89ab-cdef-0123-456789abcdef',
    'Masjid Jamek Sungai Rambai',
    'MSJ-2024-001',
    'admin@masjidjameksungairambai.org',
    '+60412345678',
    'Community mosque serving the Sungai Rambai area in Bukit Mertajam. Established in 1985, this mosque serves over 300 families and offers daily prayers, Friday sermons, and religious education programs.',
    '{"address_line_1": "Jalan Masjid Jamek", "address_line_2": "Sungai Rambai", "city": "Bukit Mertajam", "state": "Penang", "postcode": "14000", "country": "MYS"}',
    'active',
    (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1)
),

-- Masjid Al-Hidayah (Secondary test masjid)
(
    '01234567-89ab-cdef-0123-456789abcde0',
    'Masjid Al-Hidayah',
    'MSJ-2024-002',
    'contact@masjidalhidayah.my',
    '+60387654321',
    'Modern community mosque in Shah Alam serving diverse Islamic community with multilingual services and youth programs.',
    '{"address_line_1": "No. 15, Jalan Masjid Al-Hidayah", "address_line_2": "Seksyen 7", "city": "Shah Alam", "state": "Selangor", "postcode": "40000", "country": "MYS"}',
    'active',
    (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1)
),

-- Masjid Ar-Rahman (Third test masjid)
(
    '01234567-89ab-cdef-0123-456789abcde1',
    'Masjid Ar-Rahman',
    'MSJ-2024-003',
    'info@masjidarrahman.org.my',
    '+60361234567',
    'Historic mosque in Kuala Lumpur city center, known for its beautiful architecture and active community outreach programs.',
    '{"address_line_1": "Jalan Masjid India", "address_line_2": "", "city": "Kuala Lumpur", "state": "Kuala Lumpur", "postcode": "50100", "country": "MYS"}',
    'active',
    (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1)
);

-- ============================================================================
-- SAMPLE REGISTERED USERS
-- ============================================================================

-- Note: These users will be created through the auth system
-- This is just for documentation of test users
-- In development, you can create these users through the registration flow

/*
Sample users for testing:

1. Ali bin Abdullah
   Email: ali@example.com
   Password: UserPassword123!
   Role: registered -> masjid_admin (after approval)
   Home Masjid: Masjid Jamek Sungai Rambai

2. Siti Nurhaliza
   Email: siti@example.com  
   Password: UserPassword123!
   Role: registered
   Home Masjid: Masjid Al-Hidayah

3. Ahmad Rahman
   Email: ahmad@example.com
   Password: UserPassword123!
   Role: registered -> masjid_admin (after approval)
   Home Masjid: Masjid Ar-Rahman

4. Fatimah Zahra
   Email: fatimah@example.com
   Password: UserPassword123!
   Role: registered
   Home Masjid: Masjid Jamek Sungai Rambai

5. Public User (No registration)
   Can browse masjids without account
*/

-- ============================================================================
-- MALAYSIAN POSTAL CODE VALIDATION DATA
-- ============================================================================

-- Create table for postal code validation (optional enhancement)
CREATE TABLE IF NOT EXISTS public.malaysian_postcodes (
    postcode VARCHAR(5) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state malaysian_state NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample postal codes for major cities
INSERT INTO public.malaysian_postcodes (postcode, city, state) VALUES
-- Kuala Lumpur
('50100', 'Kuala Lumpur', 'Kuala Lumpur'),
('50200', 'Kuala Lumpur', 'Kuala Lumpur'),
('50300', 'Kuala Lumpur', 'Kuala Lumpur'),
('50400', 'Kuala Lumpur', 'Kuala Lumpur'),
('50450', 'Kuala Lumpur', 'Kuala Lumpur'),
('50470', 'Kuala Lumpur', 'Kuala Lumpur'),
('50480', 'Kuala Lumpur', 'Kuala Lumpur'),
('50490', 'Kuala Lumpur', 'Kuala Lumpur'),

-- Selangor
('40000', 'Shah Alam', 'Selangor'),
('40100', 'Shah Alam', 'Selangor'),
('40150', 'Shah Alam', 'Selangor'),
('40160', 'Shah Alam', 'Selangor'),
('40170', 'Shah Alam', 'Selangor'),
('46000', 'Petaling Jaya', 'Selangor'),
('46100', 'Petaling Jaya', 'Selangor'),
('46150', 'Petaling Jaya', 'Selangor'),
('46200', 'Petaling Jaya', 'Selangor'),
('47000', 'Sungai Buloh', 'Selangor'),
('47100', 'Puchong', 'Selangor'),
('47300', 'Kelana Jaya', 'Selangor'),

-- Penang
('10000', 'George Town', 'Penang'),
('10050', 'George Town', 'Penang'),
('10100', 'George Town', 'Penang'),
('10150', 'George Town', 'Penang'),
('10200', 'George Town', 'Penang'),
('10250', 'George Town', 'Penang'),
('10300', 'George Town', 'Penang'),
('10350', 'George Town', 'Penang'),
('10400', 'George Town', 'Penang'),
('10450', 'George Town', 'Penang'),
('10500', 'George Town', 'Penang'),
('10550', 'George Town', 'Penang'),
('10600', 'George Town', 'Penang'),
('10650', 'George Town', 'Penang'),
('10700', 'George Town', 'Penang'),
('10750', 'George Town', 'Penang'),
('10800', 'George Town', 'Penang'),
('10850', 'George Town', 'Penang'),
('10900', 'George Town', 'Penang'),
('10950', 'George Town', 'Penang'),
('11000', 'Balik Pulau', 'Penang'),
('11100', 'Batu Maung', 'Penang'),
('11200', 'Tanjung Bungah', 'Penang'),
('11300', 'Air Itam', 'Penang'),
('11400', 'Ayer Itam', 'Penang'),
('11500', 'Air Itam', 'Penang'),
('11600', 'George Town', 'Penang'),
('11700', 'Gelugor', 'Penang'),
('11800', 'Gelugor', 'Penang'),
('11900', 'Bayan Lepas', 'Penang'),
('12000', 'Butterworth', 'Penang'),
('12100', 'Butterworth', 'Penang'),
('12200', 'Butterworth', 'Penang'),
('12300', 'Butterworth', 'Penang'),
('13000', 'Kepala Batas', 'Penang'),
('13100', 'Kepala Batas', 'Penang'),
('13200', 'Kepala Batas', 'Penang'),
('13300', 'Kepala Batas', 'Penang'),
('13400', 'Kepala Batas', 'Penang'),
('14000', 'Bukit Mertajam', 'Penang'),
('14100', 'Bukit Mertajam', 'Penang'),
('14200', 'Bukit Mertajam', 'Penang'),
('14300', 'Bukit Mertajam', 'Penang'),

-- Johor
('80000', 'Johor Bahru', 'Johor'),
('80100', 'Johor Bahru', 'Johor'),
('80150', 'Johor Bahru', 'Johor'),
('80200', 'Johor Bahru', 'Johor'),
('80250', 'Johor Bahru', 'Johor'),
('80300', 'Johor Bahru', 'Johor'),
('81000', 'Kulai', 'Johor'),
('81100', 'Kulai', 'Johor'),
('81200', 'Johor Bahru', 'Johor'),
('81300', 'Johor Bahru', 'Johor'),
('81400', 'Senai', 'Johor'),
('81500', 'Senai', 'Johor'),
('81600', 'Senai', 'Johor'),
('81700', 'Pasir Gudang', 'Johor'),
('81800', 'Ulu Tiram', 'Johor'),
('81900', 'Kota Tinggi', 'Johor'),

-- Sabah
('88000', 'Kota Kinabalu', 'Sabah'),
('88100', 'Kota Kinabalu', 'Sabah'),
('88200', 'Kota Kinabalu', 'Sabah'),
('88300', 'Kota Kinabalu', 'Sabah'),
('88400', 'Kota Kinabalu', 'Sabah'),
('88450', 'Kota Kinabalu', 'Sabah'),
('88460', 'Kota Kinabalu', 'Sabah'),
('88470', 'Kota Kinabalu', 'Sabah'),
('88480', 'Kota Kinabalu', 'Sabah'),
('88490', 'Kota Kinabalu', 'Sabah'),
('88500', 'Kota Kinabalu', 'Sabah'),
('88550', 'Kota Kinabalu', 'Sabah'),
('88560', 'Kota Kinabalu', 'Sabah'),
('88570', 'Kota Kinabalu', 'Sabah'),
('88580', 'Kota Kinabalu', 'Sabah'),
('88590', 'Kota Kinabalu', 'Sabah'),
('88600', 'Kota Kinabalu', 'Sabah'),
('88610', 'Kota Kinabalu', 'Sabah'),
('88620', 'Kota Kinabalu', 'Sabah'),
('88624', 'Kota Kinabalu', 'Sabah'),
('88626', 'Kota Kinabalu', 'Sabah'),
('88628', 'Kota Kinabalu', 'Sabah'),
('88630', 'Kota Kinabalu', 'Sabah'),
('88632', 'Kota Kinabalu', 'Sabah'),
('88634', 'Kota Kinabalu', 'Sabah'),
('88636', 'Kota Kinabalu', 'Sabah'),
('88638', 'Kota Kinabalu', 'Sabah'),
('88640', 'Kota Kinabalu', 'Sabah'),
('88644', 'Kota Kinabalu', 'Sabah'),
('88646', 'Kota Kinabalu', 'Sabah'),
('88648', 'Kota Kinabalu', 'Sabah'),
('88650', 'Kota Kinabalu', 'Sabah'),
('88660', 'Kota Kinabalu', 'Sabah'),
('88661', 'Kota Kinabalu', 'Sabah'),
('88662', 'Kota Kinabalu', 'Sabah'),
('88670', 'Kota Kinabalu', 'Sabah'),
('88672', 'Kota Kinabalu', 'Sabah'),
('88673', 'Kota Kinabalu', 'Sabah'),
('88675', 'Kota Kinabalu', 'Sabah'),
('88676', 'Kota Kinabalu', 'Sabah'),
('88680', 'Kota Kinabalu', 'Sabah'),
('88690', 'Kota Kinabalu', 'Sabah'),

-- Sarawak
('93000', 'Kuching', 'Sarawak'),
('93100', 'Kuching', 'Sarawak'),
('93150', 'Kuching', 'Sarawak'),
('93200', 'Kuching', 'Sarawak'),
('93250', 'Kuching', 'Sarawak'),
('93300', 'Kuching', 'Sarawak'),
('93350', 'Kuching', 'Sarawak'),
('93400', 'Kuching', 'Sarawak'),
('93450', 'Kuching', 'Sarawak'),
('93500', 'Kuching', 'Sarawak'),
('93550', 'Kuching', 'Sarawak'),
('93582', 'Kuching', 'Sarawak'),
('93586', 'Kuching', 'Sarawak'),
('93590', 'Kuching', 'Sarawak'),
('93594', 'Kuching', 'Sarawak'),
('93596', 'Kuching', 'Sarawak'),
('93600', 'Kuching', 'Sarawak'),
('93610', 'Kuching', 'Sarawak'),
('93614', 'Kuching', 'Sarawak'),
('93616', 'Kuching', 'Sarawak'),
('93618', 'Kuching', 'Sarawak'),
('93620', 'Kuching', 'Sarawak'),
('93622', 'Kuching', 'Sarawak'),
('93624', 'Kuching', 'Sarawak'),
('93626', 'Kuching', 'Sarawak'),
('93628', 'Kuching', 'Sarawak'),
('93630', 'Kuching', 'Sarawak'),
('93632', 'Kuching', 'Sarawak'),
('93634', 'Kuching', 'Sarawak'),
('93636', 'Kuching', 'Sarawak'),
('93638', 'Kuching', 'Sarawak'),
('93640', 'Kuching', 'Sarawak'),
('93642', 'Kuching', 'Sarawak'),
('93644', 'Kuching', 'Sarawak'),
('93646', 'Kuching', 'Sarawak'),
('93648', 'Kuching', 'Sarawak'),
('93650', 'Kuching', 'Sarawak'),
('93660', 'Kuching', 'Sarawak'),
('93661', 'Kuching', 'Sarawak'),
('93662', 'Kuching', 'Sarawak'),
('93670', 'Kuching', 'Sarawak'),
('93672', 'Kuching', 'Sarawak'),
('93673', 'Kuching', 'Sarawak'),
('93675', 'Kuching', 'Sarawak'),
('93700', 'Kuching', 'Sarawak'),
('93710', 'Kuching', 'Sarawak'),
('93720', 'Kuching', 'Sarawak'),
('93722', 'Kuching', 'Sarawak'),
('93724', 'Kuching', 'Sarawak'),
('93726', 'Kuching', 'Sarawak'),
('93728', 'Kuching', 'Sarawak'),
('93730', 'Kuching', 'Sarawak'),
('93732', 'Kuching', 'Sarawak'),
('93734', 'Kuching', 'Sarawak'),
('93736', 'Kuching', 'Sarawak'),
('93738', 'Kuching', 'Sarawak'),
('93740', 'Kuching', 'Sarawak'),
('93742', 'Kuching', 'Sarawak'),
('93744', 'Kuching', 'Sarawak'),
('93746', 'Kuching', 'Sarawak'),
('93748', 'Kuching', 'Sarawak'),
('93750', 'Kuching', 'Sarawak'),
('93760', 'Kuching', 'Sarawak'),
('93762', 'Kuching', 'Sarawak'),
('93990', 'Kuching', 'Sarawak');

-- Create index for postcode lookup
CREATE INDEX IF NOT EXISTS idx_malaysian_postcodes_lookup ON public.malaysian_postcodes(postcode, state);

-- ============================================================================
-- DEVELOPMENT HELPER FUNCTIONS
-- ============================================================================

-- Function to reset all data (for development only)
CREATE OR REPLACE FUNCTION public.reset_development_data()
RETURNS void AS $$
BEGIN
    -- Only allow in development
    IF current_setting('app.environment', true) != 'development' THEN
        RAISE EXCEPTION 'This function can only be used in development environment';
    END IF;
    
    -- Delete in reverse dependency order
    DELETE FROM public.admin_applications;
    DELETE FROM public.masjid_admins;
    DELETE FROM public.profile_addresses;
    DELETE FROM public.profiles;
    DELETE FROM public.masjids;
    DELETE FROM public.users WHERE role != 'super_admin';
    
    RAISE NOTICE 'Development data reset completed';
END;
$$ LANGUAGE plpgsql;

-- Function to create sample data (for development only)
CREATE OR REPLACE FUNCTION public.create_sample_data()
RETURNS void AS $$
BEGIN
    -- Only allow in development
    IF current_setting('app.environment', true) != 'development' THEN
        RAISE EXCEPTION 'This function can only be used in development environment';
    END IF;
    
    -- This function would create sample users, profiles, etc.
    -- Implementation would go here based on test scenarios
    
    RAISE NOTICE 'Sample data creation completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.malaysian_postcodes IS 'Lookup table for Malaysian postal codes validation';
COMMENT ON FUNCTION public.reset_development_data() IS 'Development helper to reset all non-super-admin data';
COMMENT ON FUNCTION public.create_sample_data() IS 'Development helper to create sample test data';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant select permission on postcode lookup to authenticated users
GRANT SELECT ON public.malaysian_postcodes TO authenticated;

-- Grant execute permissions on development functions
GRANT EXECUTE ON FUNCTION public.reset_development_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sample_data() TO authenticated;
