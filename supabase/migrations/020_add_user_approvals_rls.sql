-- RLS Policies for User Approvals System
-- This migration adds Row Level Security policies for user_approvals table

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR USER_APPROVALS
-- ============================================================================

-- Policy: Users can view their own approval requests
CREATE POLICY user_approvals_select_own ON public.user_approvals
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Policy: Masjid admins can view approvals for their masjids
CREATE POLICY user_approvals_select_admin ON public.user_approvals
FOR SELECT TO authenticated
USING (
  home_masjid_id = ANY(get_user_admin_masjids())
  OR is_super_admin()
);

-- Policy: Super admins can view all approvals
-- (Already covered by user_approvals_select_admin)

-- Policy: No direct INSERT - approvals created by trigger function
-- (System function handles creation)

-- Policy: No direct UPDATE - use approval functions
-- (Functions handle approval/rejection with proper validation)

-- Policy: No direct DELETE
-- (Cascade deletion handled by foreign key constraints)

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

-- Grant execute permissions on user approval functions
GRANT EXECUTE ON FUNCTION public.get_pending_user_approvals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_approvals_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_user_registration(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_user_registration(UUID, UUID, TEXT) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY user_approvals_select_own ON public.user_approvals IS 'Users can view their own approval requests';
COMMENT ON POLICY user_approvals_select_admin ON public.user_approvals IS 'Masjid admins can view approvals for their assigned masjids';
