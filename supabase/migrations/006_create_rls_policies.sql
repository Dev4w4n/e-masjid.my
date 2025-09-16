-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masjids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masjid_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own record
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Super admins can view all users
CREATE POLICY "users_select_super_admin" ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can view users in their masjid community
CREATE POLICY "users_select_masjid_admin" ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            JOIN public.profiles p ON p.home_masjid_id = ma.masjid_id
            WHERE ma.user_id = auth.uid() 
            AND ma.status = 'active'
            AND p.user_id = users.id
        )
    );

-- Policy: Users can update their own record (limited fields)
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Super admins can update user roles
CREATE POLICY "users_update_super_admin" ON public.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Policy: Users can view and manage their own profile
CREATE POLICY "profiles_all_own" ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Super admins can view all profiles
CREATE POLICY "profiles_select_super_admin" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can view profiles of users who selected their masjid as home
CREATE POLICY "profiles_select_masjid_admin" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            WHERE ma.user_id = auth.uid() 
            AND ma.status = 'active'
            AND ma.masjid_id = profiles.home_masjid_id
        )
    );

-- ============================================================================
-- PROFILE_ADDRESSES TABLE POLICIES
-- ============================================================================

-- Policy: Users can manage their own profile addresses
CREATE POLICY "profile_addresses_all_own" ON public.profile_addresses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = profile_addresses.profile_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = profile_addresses.profile_id 
            AND user_id = auth.uid()
        )
    );

-- Policy: Super admins can view all profile addresses
CREATE POLICY "profile_addresses_select_super_admin" ON public.profile_addresses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can view addresses of users in their masjid
CREATE POLICY "profile_addresses_select_masjid_admin" ON public.profile_addresses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            JOIN public.profiles p ON p.home_masjid_id = ma.masjid_id
            WHERE ma.user_id = auth.uid() 
            AND ma.status = 'active'
            AND p.id = profile_addresses.profile_id
        )
    );

-- ============================================================================
-- MASJIDS TABLE POLICIES
-- ============================================================================

-- Policy: Public read access for basic masjid information
CREATE POLICY "masjids_select_public" ON public.masjids
    FOR SELECT
    USING (status = 'active');

-- Policy: Super admins can manage all masjids
CREATE POLICY "masjids_all_super_admin" ON public.masjids
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can update their assigned masjids
CREATE POLICY "masjids_update_admin" ON public.masjids
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            WHERE ma.user_id = auth.uid() 
            AND ma.masjid_id = masjids.id
            AND ma.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            WHERE ma.user_id = auth.uid() 
            AND ma.masjid_id = masjids.id
            AND ma.status = 'active'
        )
    );

-- ============================================================================
-- MASJID_ADMINS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own admin assignments
CREATE POLICY "masjid_admins_select_own" ON public.masjid_admins
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Super admins can manage all admin assignments
CREATE POLICY "masjid_admins_all_super_admin" ON public.masjid_admins
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can view other admins of their masjids
CREATE POLICY "masjid_admins_select_peer_admins" ON public.masjid_admins
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            WHERE ma.user_id = auth.uid() 
            AND ma.masjid_id = masjid_admins.masjid_id
            AND ma.status = 'active'
        )
    );

-- ============================================================================
-- ADMIN_APPLICATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view and manage their own applications
CREATE POLICY "admin_applications_all_own" ON public.admin_applications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Super admins can manage all applications
CREATE POLICY "admin_applications_all_super_admin" ON public.admin_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Policy: Masjid admins can view applications for their masjids
CREATE POLICY "admin_applications_select_masjid_admin" ON public.admin_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.masjid_admins ma
            WHERE ma.user_id = auth.uid() 
            AND ma.masjid_id = admin_applications.masjid_id
            AND ma.status = 'active'
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin of specific masjid
CREATE OR REPLACE FUNCTION public.is_admin_of_masjid(masjid_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.masjid_admins 
        WHERE user_id = auth.uid() 
        AND masjid_id = is_admin_of_masjid.masjid_id
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value 
    FROM public.users 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role_value, 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's admin masjids
CREATE OR REPLACE FUNCTION public.get_user_admin_masjids()
RETURNS UUID[] AS $$
DECLARE
    masjid_ids UUID[];
BEGIN
    SELECT ARRAY(
        SELECT masjid_id 
        FROM public.masjid_admins 
        WHERE user_id = auth.uid() AND status = 'active'
    ) INTO masjid_ids;
    
    RETURN COALESCE(masjid_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECURITY POLICIES FOR FUNCTIONS
-- ============================================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_of_masjid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_admin_masjids() TO authenticated;

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION public.get_user_admin_assignments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_masjid_admin_list(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_masjid_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_applications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_masjid_applications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_masjids_by_state(TEXT) TO authenticated;

-- Grant execute permissions on action functions (with RLS checks inside)
GRANT EXECUTE ON FUNCTION public.approve_admin_application(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_admin_application(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.withdraw_admin_application(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin_assignment(UUID, UUID) TO authenticated;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "users_select_own" ON public.users IS 'Users can view their own user record';
COMMENT ON POLICY "users_select_super_admin" ON public.users IS 'Super admins can view all user records';
COMMENT ON POLICY "users_select_masjid_admin" ON public.users IS 'Masjid admins can view users in their masjid community';

COMMENT ON POLICY "profiles_all_own" ON public.profiles IS 'Users have full access to their own profile';
COMMENT ON POLICY "profiles_select_super_admin" ON public.profiles IS 'Super admins can view all profiles';
COMMENT ON POLICY "profiles_select_masjid_admin" ON public.profiles IS 'Masjid admins can view profiles of users in their masjid';

COMMENT ON POLICY "masjids_select_public" ON public.masjids IS 'Public read access to active masjids';
COMMENT ON POLICY "masjids_all_super_admin" ON public.masjids IS 'Super admins can manage all masjids';
COMMENT ON POLICY "masjids_update_admin" ON public.masjids IS 'Masjid admins can update their assigned masjids';

COMMENT ON FUNCTION public.is_super_admin() IS 'Helper function to check if current user is super admin';
COMMENT ON FUNCTION public.is_admin_of_masjid(UUID) IS 'Helper function to check if current user is admin of specific masjid';
COMMENT ON FUNCTION public.get_user_role() IS 'Helper function to get current user role';
COMMENT ON FUNCTION public.get_user_admin_masjids() IS 'Helper function to get array of masjid IDs user administers';
