-- Migration: 029_fix_masjid_insert_policy.sql
-- Description: Add explicit INSERT policy for masjids table to allow super_admin to create masjids
-- This fixes the RLS policy violation error when creating masjids

-- ============================================================================
-- MASJIDS TABLE - FIX INSERT POLICY
-- ============================================================================

-- The issue: masjids table has a trigger that checks if creator is super_admin,
-- but there's no RLS policy that allows super_admin to INSERT.
-- The "masjids_all_super_admin" policy in migration 006 is a FOR ALL policy,
-- but it seems INSERT needs an explicit policy.

-- Drop the existing "FOR ALL" policy if it exists (it may be conflicting)
DROP POLICY IF EXISTS "masjids_all_super_admin" ON public.masjids;

-- Create explicit INSERT policy for super_admin
CREATE POLICY "masjids_insert_super_admin" ON public.masjids
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Re-create the SELECT policy (was part of the ALL policy)
CREATE POLICY "masjids_select_super_admin" ON public.masjids
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Re-create the UPDATE policy (was part of the ALL policy)
CREATE POLICY "masjids_update_super_admin" ON public.masjids
    FOR UPDATE
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

-- Re-create the DELETE policy (was part of the ALL policy)
CREATE POLICY "masjids_delete_super_admin" ON public.masjids
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "masjids_insert_super_admin" ON public.masjids IS 'Super admins can create masjids - works with check_masjid_creator_role_trigger';
COMMENT ON POLICY "masjids_select_super_admin" ON public.masjids IS 'Super admins can view all masjids';
COMMENT ON POLICY "masjids_update_super_admin" ON public.masjids IS 'Super admins can update any masjid (replaces masjids_all_super_admin FOR UPDATE)';
COMMENT ON POLICY "masjids_delete_super_admin" ON public.masjids IS 'Super admins can delete masjids';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query to verify masjid policies are in place:
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'masjids'
-- ORDER BY cmd, policyname;
