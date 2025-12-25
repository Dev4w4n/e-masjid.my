-- Migration: Fix check_masjid_creator_role function to use user_roles table
-- Feature: 007-multi-tenant-saas
-- Phase: Seed Data (T017-T021)
-- Issue: Function still references old users.role column

-- Drop and recreate the function to use user_roles table
CREATE OR REPLACE FUNCTION public.check_masjid_creator_role()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin BOOLEAN;
BEGIN
    -- Check if the user has super-admin role in user_roles table
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = NEW.created_by 
          AND role = 'super-admin'
    ) INTO is_super_admin;
    
    -- Only super-admin can create masjids
    IF NOT is_super_admin THEN
        RAISE EXCEPTION 'Only super administrators can create masjids';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_masjid_creator_role() IS 'Validates that only users with super-admin role can create masjids. Updated to use user_roles table instead of legacy users.role column.';
