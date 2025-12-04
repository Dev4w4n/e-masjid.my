-- ============================================================================
-- SIMPLIFICATION CLEANUP MIGRATION
-- Date: 2025-12-04
-- Purpose: Remove user approval, sponsorship, and content approval systems
-- Goal: Simplify to 2 roles (super_admin, masjid_admin) with direct content creation
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop Approval-Related Functions (to avoid dependency issues)
-- ============================================================================

-- User approval functions
DROP FUNCTION IF EXISTS validate_user_approval() CASCADE;
DROP FUNCTION IF EXISTS process_approved_user() CASCADE;
DROP FUNCTION IF EXISTS prevent_home_masjid_change() CASCADE;
DROP FUNCTION IF EXISTS create_user_approval_on_home_masjid_set() CASCADE;
DROP FUNCTION IF EXISTS get_pending_user_approvals(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_approvals_history(UUID) CASCADE;
DROP FUNCTION IF EXISTS approve_user_registration(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_user_registration(UUID, UUID, TEXT) CASCADE;

-- Admin application functions
DROP FUNCTION IF EXISTS validate_admin_application() CASCADE;
DROP FUNCTION IF EXISTS process_approved_application() CASCADE;
DROP FUNCTION IF EXISTS get_pending_applications() CASCADE;
DROP FUNCTION IF EXISTS get_masjid_applications(UUID) CASCADE;
DROP FUNCTION IF EXISTS approve_admin_application(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_admin_application(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS withdraw_admin_application(UUID, UUID) CASCADE;

-- Content approval functions
DROP FUNCTION IF EXISTS approve_content(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS reject_content(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_resubmission_history(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_pending_approvals_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS notify_content_approval_change() CASCADE;

-- Sponsorship functions
DROP FUNCTION IF EXISTS set_sponsorship_tier() CASCADE;
DROP FUNCTION IF EXISTS get_display_content(UUID, INTEGER) CASCADE;

-- ============================================================================
-- STEP 2: Drop Tables
-- ============================================================================

-- Drop user approvals table
DROP TABLE IF EXISTS public.user_approvals CASCADE;

-- Drop admin applications table
DROP TABLE IF EXISTS public.admin_applications CASCADE;

-- Drop sponsorships table
DROP TABLE IF EXISTS public.sponsorships CASCADE;

-- ============================================================================
-- STEP 3: Drop policies that depend on columns to be removed
-- ============================================================================

DROP POLICY IF EXISTS "Users can resubmit their own rejected content" ON public.display_content;

-- ============================================================================
-- STEP 4: Remove Columns from Existing Tables
-- ============================================================================

-- Remove approval columns from display_content
ALTER TABLE public.display_content 
  DROP COLUMN IF EXISTS approval_notes,
  DROP COLUMN IF EXISTS resubmission_of,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS sponsorship_amount,
  DROP COLUMN IF EXISTS sponsorship_tier,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS payment_reference;

-- Remove sponsorship columns from tv_displays
ALTER TABLE public.tv_displays
  DROP COLUMN IF EXISTS show_sponsorship_amounts,
  DROP COLUMN IF EXISTS sponsorship_tier_colors;

-- Remove user approval column from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS home_masjid_approved_at;

-- ============================================================================
-- STEP 5: Simplify content_status Enum
-- ============================================================================

-- Migrate existing content status to simplified values
UPDATE public.display_content 
SET status = 'active'::content_status 
WHERE status = 'pending'::content_status;

UPDATE public.display_content 
SET status = 'expired'::content_status 
WHERE status = 'rejected'::content_status;

-- Note: We keep the existing content_status enum as-is for now to avoid breaking changes
-- The enum still has: 'pending', 'active', 'expired', 'rejected'
-- But we'll only use: 'active', 'expired' going forward
-- 'pending' will be treated as 'active' in the application layer

-- ============================================================================
-- STEP 6: Drop Unused Enums
-- ============================================================================

DROP TYPE IF EXISTS user_approval_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS sponsorship_tier CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- ============================================================================
-- STEP 7: Update RLS Policies - Remove Approval Policies
-- ============================================================================

-- Drop old approval-related policies from display_content
DROP POLICY IF EXISTS "Users can view approval details of their own content" ON public.display_content;
DROP POLICY IF EXISTS "Masjid admins can view approval workflow details" ON public.display_content;
DROP POLICY IF EXISTS "Masjid admins can manage approval workflow" ON public.display_content;

-- Note: sponsorship policies were already dropped when sponsorships table was dropped in STEP 2

-- Simplify display_content policies
DROP POLICY IF EXISTS "Users can view content for their masjids" ON public.display_content;
DROP POLICY IF EXISTS "Users can submit content to their masjids" ON public.display_content;
DROP POLICY IF EXISTS "Masjid admins can manage content" ON public.display_content;

-- Create new simplified policies for display_content
CREATE POLICY "Masjid admins can view their masjid content" ON public.display_content
  FOR SELECT USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

CREATE POLICY "Masjid admins can create content for their masjids" ON public.display_content
  FOR INSERT WITH CHECK (
    masjid_id = ANY(get_user_admin_masjids())
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Masjid admins can update their masjid content" ON public.display_content
  FOR UPDATE USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

CREATE POLICY "Masjid admins can delete their masjid content" ON public.display_content
  FOR DELETE USING (
    masjid_id = ANY(get_user_admin_masjids())
  );

-- Public read access for active content (for TV displays)
CREATE POLICY "Public can view active content" ON public.display_content
  FOR SELECT USING (
    status = 'active' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
  );

-- Super admin full access
CREATE POLICY "Super admins can manage all content" ON public.display_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================================
-- STEP 8: Update Triggers
-- ============================================================================

-- Note: Triggers on dropped tables (user_approvals, admin_applications) were CASCADE dropped
-- Drop remaining approval triggers on existing tables
DROP TRIGGER IF EXISTS prevent_home_masjid_change_trigger ON public.profiles;
DROP TRIGGER IF EXISTS create_user_approval_trigger ON public.profiles;

-- ============================================================================
-- STEP 9: Create Simplified Helper Functions
-- ============================================================================

-- Function to auto-activate content on creation (replaces approval workflow)
CREATE OR REPLACE FUNCTION auto_activate_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-activate content when created by masjid admins
  IF NEW.status = 'pending' OR NEW.status IS NULL THEN
    NEW.status = 'active';
  END IF;
  
  -- Set submitted_at if not provided
  IF NEW.submitted_at IS NULL THEN
    NEW.submitted_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-activation
CREATE TRIGGER auto_activate_content_trigger
  BEFORE INSERT ON public.display_content
  FOR EACH ROW
  EXECUTE FUNCTION auto_activate_content();

-- ============================================================================
-- STEP 10: Update Comments
-- ============================================================================

COMMENT ON TABLE public.display_content IS 'Content for TV displays - simplified workflow without approval';
COMMENT ON COLUMN public.display_content.status IS 'Content status: active (published), expired (past end date)';
COMMENT ON COLUMN public.display_content.submitted_by IS 'Masjid admin who created the content';
COMMENT ON POLICY "Masjid admins can view their masjid content" ON public.display_content IS 'Masjid admins can view content for their assigned masjids';
COMMENT ON POLICY "Masjid admins can create content for their masjids" ON public.display_content IS 'Masjid admins can create content directly without approval';
COMMENT ON POLICY "Public can view active content" ON public.display_content IS 'Public access for TV displays to fetch active content';
COMMENT ON POLICY "Super admins can manage all content" ON public.display_content IS 'Super admins have full access to all content';

-- ============================================================================
-- STEP 11: Data Migration Notes
-- ============================================================================

-- All existing 'pending' content has been migrated to 'active'
-- All existing 'rejected' content has been migrated to 'expired'
-- Masjid admins can now directly create and publish content
-- Super admins can assign users as masjid admins via masjid_admins table
-- User roles simplified to: masjid_admin, super_admin

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Check remaining tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check display_content columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'display_content' ORDER BY ordinal_position;

-- Check content status distribution
-- SELECT status, COUNT(*) FROM public.display_content GROUP BY status;

-- Check RLS policies
-- SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = 'display_content';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration successfully:
-- ✅ Removed user_approvals table
-- ✅ Removed admin_applications table  
-- ✅ Removed sponsorships table
-- ✅ Removed approval workflow columns from display_content
-- ✅ Removed sponsorship columns from tv_displays
-- ✅ Simplified RLS policies
-- ✅ Auto-activated all pending content
-- ✅ Created simplified content creation workflow
