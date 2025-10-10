-- Migration: 023_add_super_admin_full_permissions.sql
-- Description: Grant full permissions to super_admin role across all tables
-- This ensures super_admin can view and upsert anything in the system

-- ============================================================================
-- SUPER ADMIN POLICIES FOR USERS TABLE
-- ============================================================================

-- Super admins can view all users
CREATE POLICY "users_select_super_admin" ON public.users
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can update any user
CREATE POLICY "users_update_super_admin" ON public.users
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can insert users (if needed)
CREATE POLICY "users_insert_super_admin" ON public.users
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can delete users (if needed)
CREATE POLICY "users_delete_super_admin" ON public.users
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR MASJID_ADMINS TABLE
-- ============================================================================

-- Super admins can view all masjid admin assignments
CREATE POLICY "masjid_admins_select_super_admin" ON public.masjid_admins
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create masjid admin assignments
CREATE POLICY "masjid_admins_insert_super_admin" ON public.masjid_admins
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update masjid admin assignments
CREATE POLICY "masjid_admins_update_super_admin" ON public.masjid_admins
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete masjid admin assignments
CREATE POLICY "masjid_admins_delete_super_admin" ON public.masjid_admins
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR TV DISPLAYS TABLE
-- ============================================================================

-- Super admins can view all TV displays
CREATE POLICY "tv_displays_select_super_admin" ON public.tv_displays
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create TV displays
CREATE POLICY "tv_displays_insert_super_admin" ON public.tv_displays
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update TV displays
CREATE POLICY "tv_displays_update_super_admin" ON public.tv_displays
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete TV displays
CREATE POLICY "tv_displays_delete_super_admin" ON public.tv_displays
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR DISPLAY CONTENT TABLE
-- ============================================================================

-- Super admins can view all display content
CREATE POLICY "display_content_select_super_admin" ON public.display_content
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create display content
CREATE POLICY "display_content_insert_super_admin" ON public.display_content
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update display content
CREATE POLICY "display_content_update_super_admin" ON public.display_content
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete display content
CREATE POLICY "display_content_delete_super_admin" ON public.display_content
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR DISPLAY CONTENT ASSIGNMENTS TABLE
-- ============================================================================

-- Check if table exists and add policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'display_content_assignments') THEN
        -- Super admins can view all content assignments
        EXECUTE 'CREATE POLICY "display_content_assignments_select_super_admin" ON public.display_content_assignments
            FOR SELECT
            USING (public.is_super_admin())';

        -- Super admins can create content assignments
        EXECUTE 'CREATE POLICY "display_content_assignments_insert_super_admin" ON public.display_content_assignments
            FOR INSERT
            WITH CHECK (public.is_super_admin())';

        -- Super admins can update content assignments
        EXECUTE 'CREATE POLICY "display_content_assignments_update_super_admin" ON public.display_content_assignments
            FOR UPDATE
            USING (public.is_super_admin())
            WITH CHECK (public.is_super_admin())';

        -- Super admins can delete content assignments
        EXECUTE 'CREATE POLICY "display_content_assignments_delete_super_admin" ON public.display_content_assignments
            FOR DELETE
            USING (public.is_super_admin())';
    END IF;
END $$;

-- ============================================================================
-- SUPER ADMIN POLICIES FOR PRAYER TIMES TABLE
-- ============================================================================

-- Super admins can view all prayer times
CREATE POLICY "prayer_times_select_super_admin" ON public.prayer_times
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create prayer times
CREATE POLICY "prayer_times_insert_super_admin" ON public.prayer_times
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update prayer times
CREATE POLICY "prayer_times_update_super_admin" ON public.prayer_times
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete prayer times
CREATE POLICY "prayer_times_delete_super_admin" ON public.prayer_times
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR PRAYER TIME CONFIG TABLE
-- ============================================================================

-- Super admins can view all prayer time configs
CREATE POLICY "prayer_time_config_select_super_admin" ON public.prayer_time_config
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create prayer time configs
CREATE POLICY "prayer_time_config_insert_super_admin" ON public.prayer_time_config
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update prayer time configs
CREATE POLICY "prayer_time_config_update_super_admin" ON public.prayer_time_config
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete prayer time configs
CREATE POLICY "prayer_time_config_delete_super_admin" ON public.prayer_time_config
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR SPONSORSHIPS TABLE
-- ============================================================================

-- Super admins can view all sponsorships
CREATE POLICY "sponsorships_select_super_admin" ON public.sponsorships
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create sponsorships
CREATE POLICY "sponsorships_insert_super_admin" ON public.sponsorships
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update sponsorships
CREATE POLICY "sponsorships_update_super_admin" ON public.sponsorships
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete sponsorships
CREATE POLICY "sponsorships_delete_super_admin" ON public.sponsorships
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR DISPLAY STATUS TABLE
-- ============================================================================

-- Super admins can view all display status
CREATE POLICY "display_status_select_super_admin" ON public.display_status
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create display status
CREATE POLICY "display_status_insert_super_admin" ON public.display_status
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update display status
CREATE POLICY "display_status_update_super_admin" ON public.display_status
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete display status
CREATE POLICY "display_status_delete_super_admin" ON public.display_status
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR DISPLAY ANALYTICS TABLE
-- ============================================================================

-- Super admins can view all display analytics
CREATE POLICY "display_analytics_select_super_admin" ON public.display_analytics
    FOR SELECT
    USING (public.is_super_admin());

-- Super admins can create display analytics
CREATE POLICY "display_analytics_insert_super_admin" ON public.display_analytics
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update display analytics
CREATE POLICY "display_analytics_update_super_admin" ON public.display_analytics
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete display analytics
CREATE POLICY "display_analytics_delete_super_admin" ON public.display_analytics
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR USER APPROVALS TABLE
-- ============================================================================

-- Super admins can insert user approvals (if needed)
CREATE POLICY "user_approvals_insert_super_admin" ON public.user_approvals
    FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Super admins can update user approvals
CREATE POLICY "user_approvals_update_super_admin" ON public.user_approvals
    FOR UPDATE
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Super admins can delete user approvals
CREATE POLICY "user_approvals_delete_super_admin" ON public.user_approvals
    FOR DELETE
    USING (public.is_super_admin());

-- ============================================================================
-- SUPER ADMIN POLICIES FOR PROFILE ADDRESSES TABLE
-- ============================================================================

-- Note: profile_addresses already has super_admin policy from migration 006
-- Adding INSERT and DELETE policies if not present

DO $$
BEGIN
    -- Check if INSERT policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profile_addresses' 
        AND policyname = 'profile_addresses_insert_super_admin'
    ) THEN
        CREATE POLICY "profile_addresses_insert_super_admin" ON public.profile_addresses
            FOR INSERT
            WITH CHECK (public.is_super_admin());
    END IF;

    -- Check if DELETE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profile_addresses' 
        AND policyname = 'profile_addresses_delete_super_admin'
    ) THEN
        CREATE POLICY "profile_addresses_delete_super_admin" ON public.profile_addresses
            FOR DELETE
            USING (public.is_super_admin());
    END IF;
END $$;

-- ============================================================================
-- STORAGE BUCKET POLICIES FOR SUPER ADMIN
-- ============================================================================

-- Super admins can manage all content images
CREATE POLICY "super_admin_all_content_images"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'content-images' 
    AND public.is_super_admin()
)
WITH CHECK (
    bucket_id = 'content-images' 
    AND public.is_super_admin()
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "users_select_super_admin" ON public.users IS 'Super admins can view all users';
COMMENT ON POLICY "users_update_super_admin" ON public.users IS 'Super admins can update any user';
COMMENT ON POLICY "masjid_admins_select_super_admin" ON public.masjid_admins IS 'Super admins can view all masjid admin assignments';
COMMENT ON POLICY "tv_displays_select_super_admin" ON public.tv_displays IS 'Super admins can view all TV displays';
COMMENT ON POLICY "display_content_select_super_admin" ON public.display_content IS 'Super admins can view all display content';
COMMENT ON POLICY "prayer_times_select_super_admin" ON public.prayer_times IS 'Super admins can view all prayer times';
COMMENT ON POLICY "prayer_time_config_select_super_admin" ON public.prayer_time_config IS 'Super admins can view all prayer time configs';
COMMENT ON POLICY "sponsorships_select_super_admin" ON public.sponsorships IS 'Super admins can view all sponsorships';
COMMENT ON POLICY "display_status_select_super_admin" ON public.display_status IS 'Super admins can view all display status';
COMMENT ON POLICY "display_analytics_select_super_admin" ON public.display_analytics IS 'Super admins can view all display analytics';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query to verify all super_admin policies are in place:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE policyname LIKE '%super_admin%'
-- ORDER BY tablename, cmd, policyname;
