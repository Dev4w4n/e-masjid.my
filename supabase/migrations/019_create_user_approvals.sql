-- Migration: User Approval System
-- Description: Creates approval workflow for public users selecting home masjid
-- Pattern: Similar to admin_applications but for user registration approval

-- ============================================================================
-- TYPES
-- ============================================================================

-- Create user approval status enum
CREATE TYPE user_approval_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create user_approvals table
CREATE TABLE IF NOT EXISTS public.user_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    home_masjid_id UUID REFERENCES public.masjids(id) ON DELETE CASCADE NOT NULL,
    status user_approval_status DEFAULT 'pending' NOT NULL,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT review_data_consistency CHECK (
        (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
        (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    ),
    
    -- Unique constraint to prevent multiple pending approvals per user
    CONSTRAINT unique_pending_user_approval 
    EXCLUDE (user_id WITH =) 
    WHERE (status = 'pending')
);

-- Add home_masjid_approved_at column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS home_masjid_approved_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_approvals_user_id ON public.user_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_approvals_home_masjid_id ON public.user_approvals(home_masjid_id);
CREATE INDEX IF NOT EXISTS idx_user_approvals_status ON public.user_approvals(status);
CREATE INDEX IF NOT EXISTS idx_user_approvals_reviewed_by ON public.user_approvals(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_user_approvals_created_at ON public.user_approvals(created_at);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_approvals_masjid_status ON public.user_approvals(home_masjid_id, status);
CREATE INDEX IF NOT EXISTS idx_user_approvals_user_status ON public.user_approvals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_profiles_home_masjid_approved_at ON public.profiles(home_masjid_approved_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create updated_at trigger
CREATE TRIGGER update_user_approvals_updated_at 
    BEFORE UPDATE ON public.user_approvals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to validate user approval
CREATE OR REPLACE FUNCTION public.validate_user_approval()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    reviewer_role user_role;
    reviewer_is_admin BOOLEAN;
BEGIN
    -- Get user role
    SELECT role INTO user_role_value
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Validate user is public role
    IF user_role_value != 'public' THEN
        RAISE EXCEPTION 'Only public users can request home masjid approval';
    END IF;
    
    -- Validate reviewer if status is being updated to approved/rejected
    IF NEW.status IN ('approved', 'rejected') AND NEW.reviewed_by IS NOT NULL THEN
        -- Check if reviewer is super admin or masjid admin for this masjid
        SELECT role INTO reviewer_role 
        FROM public.users 
        WHERE id = NEW.reviewed_by;
        
        IF reviewer_role = 'super_admin' THEN
            reviewer_is_admin := TRUE;
        ELSE
            -- Check if reviewer is admin of this specific masjid
            SELECT EXISTS(
                SELECT 1 FROM public.masjid_admins 
                WHERE user_id = NEW.reviewed_by 
                AND masjid_id = NEW.home_masjid_id 
                AND status = 'active'
            ) INTO reviewer_is_admin;
        END IF;
        
        IF NOT reviewer_is_admin THEN
            RAISE EXCEPTION 'Only masjid admins or super admins can review user approvals';
        END IF;
        
        -- Set reviewed_at if not provided
        IF NEW.reviewed_at IS NULL THEN
            NEW.reviewed_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for approval validation
CREATE TRIGGER validate_user_approval_trigger
    BEFORE INSERT OR UPDATE ON public.user_approvals
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_user_approval();

-- Function to process approved user
CREATE OR REPLACE FUNCTION public.process_approved_user()
RETURNS TRIGGER AS $$
BEGIN
    -- If approval was approved, update user role and lock home masjid
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Update user role to registered
        UPDATE public.users 
        SET role = 'registered', updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Set home_masjid_approved_at to lock the selection
        UPDATE public.profiles 
        SET home_masjid_approved_at = NEW.reviewed_at, updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- If approval was rejected, clear home masjid from profile
    IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
        UPDATE public.profiles 
        SET home_masjid_id = NULL, updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for processing approved user
CREATE TRIGGER process_approved_user_trigger
    AFTER UPDATE ON public.user_approvals
    FOR EACH ROW
    EXECUTE FUNCTION public.process_approved_user();

-- Function to prevent home masjid change after approval
CREATE OR REPLACE FUNCTION public.prevent_home_masjid_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent home_masjid_id changes if already approved
    IF OLD.home_masjid_approved_at IS NOT NULL 
       AND NEW.home_masjid_id IS DISTINCT FROM OLD.home_masjid_id THEN
        RAISE EXCEPTION 'Cannot change home masjid after approval. Home masjid was approved on %', OLD.home_masjid_approved_at;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent home masjid change
CREATE TRIGGER prevent_home_masjid_change_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (OLD.home_masjid_approved_at IS NOT NULL)
    EXECUTE FUNCTION prevent_home_masjid_change();

-- Function to automatically create approval when home masjid is set
CREATE OR REPLACE FUNCTION public.create_user_approval_on_home_masjid_set()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
BEGIN
    -- Only create approval if home_masjid_id was set/changed and user is public
    IF NEW.home_masjid_id IS NOT NULL 
       AND (OLD.home_masjid_id IS NULL OR OLD.home_masjid_id != NEW.home_masjid_id)
       AND NEW.home_masjid_approved_at IS NULL THEN
        
        -- Get user role
        SELECT role INTO user_role_value
        FROM public.users
        WHERE id = NEW.user_id;
        
        -- Only create approval for public users
        IF user_role_value = 'public' THEN
            -- Create pending approval
            INSERT INTO public.user_approvals (user_id, home_masjid_id, status)
            VALUES (NEW.user_id, NEW.home_masjid_id, 'pending')
            ON CONFLICT DO NOTHING; -- Handle race conditions
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create approval
CREATE TRIGGER create_user_approval_trigger
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_approval_on_home_masjid_set();

-- Function to get pending user approvals for a masjid
CREATE OR REPLACE FUNCTION public.get_pending_user_approvals(target_masjid_id UUID)
RETURNS TABLE (
    approval_id UUID,
    user_id UUID,
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    user_phone VARCHAR(20),
    profile_complete BOOLEAN,
    requested_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id as approval_id,
        u.id as user_id,
        u.email as user_email,
        p.full_name as user_full_name,
        p.phone_number as user_phone,
        p.is_complete as profile_complete,
        ua.created_at as requested_at
    FROM public.user_approvals ua
    JOIN public.users u ON ua.user_id = u.id
    JOIN public.profiles p ON u.id = p.user_id
    WHERE ua.home_masjid_id = target_masjid_id
    AND ua.status = 'pending'
    ORDER BY ua.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all user approvals for a masjid (with history)
CREATE OR REPLACE FUNCTION public.get_user_approvals_history(target_masjid_id UUID)
RETURNS TABLE (
    approval_id UUID,
    user_id UUID,
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    status user_approval_status,
    requested_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_email VARCHAR(255),
    review_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id as approval_id,
        u.id as user_id,
        u.email as user_email,
        p.full_name as user_full_name,
        ua.status,
        ua.created_at as requested_at,
        ua.reviewed_at,
        rev.email as reviewer_email,
        ua.review_notes
    FROM public.user_approvals ua
    JOIN public.users u ON ua.user_id = u.id
    JOIN public.profiles p ON u.id = p.user_id
    LEFT JOIN public.users rev ON ua.reviewed_by = rev.id
    WHERE ua.home_masjid_id = target_masjid_id
    ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve user registration
CREATE OR REPLACE FUNCTION public.approve_user_registration(
    approval_id UUID,
    approver_id UUID,
    approval_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    approver_role user_role;
    target_masjid_id UUID;
    is_admin_of_masjid BOOLEAN;
BEGIN
    -- Get the masjid_id from the approval
    SELECT home_masjid_id INTO target_masjid_id
    FROM public.user_approvals
    WHERE id = approval_id;
    
    -- Check if approver has permission
    SELECT role INTO approver_role 
    FROM public.users 
    WHERE id = approver_id;
    
    IF approver_role = 'super_admin' THEN
        is_admin_of_masjid := TRUE;
    ELSE
        -- Check if approver is admin of this specific masjid
        SELECT EXISTS(
            SELECT 1 FROM public.masjid_admins 
            WHERE user_id = approver_id 
            AND masjid_id = target_masjid_id 
            AND status = 'active'
        ) INTO is_admin_of_masjid;
    END IF;
    
    IF NOT is_admin_of_masjid THEN
        RAISE EXCEPTION 'Only masjid admins or super admins can approve user registrations';
    END IF;
    
    -- Update approval status
    UPDATE public.user_approvals 
    SET 
        status = 'approved',
        reviewed_by = approver_id,
        reviewed_at = NOW(),
        review_notes = approval_notes,
        updated_at = NOW()
    WHERE id = approval_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject user registration
CREATE OR REPLACE FUNCTION public.reject_user_registration(
    approval_id UUID,
    rejector_id UUID,
    rejection_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    rejector_role user_role;
    target_masjid_id UUID;
    is_admin_of_masjid BOOLEAN;
BEGIN
    -- Validation: rejection notes are required
    IF rejection_notes IS NULL OR length(trim(rejection_notes)) < 5 THEN
        RAISE EXCEPTION 'Rejection notes are required and must be at least 5 characters';
    END IF;
    
    -- Get the masjid_id from the approval
    SELECT home_masjid_id INTO target_masjid_id
    FROM public.user_approvals
    WHERE id = approval_id;
    
    -- Check if rejector has permission
    SELECT role INTO rejector_role 
    FROM public.users 
    WHERE id = rejector_id;
    
    IF rejector_role = 'super_admin' THEN
        is_admin_of_masjid := TRUE;
    ELSE
        -- Check if rejector is admin of this specific masjid
        SELECT EXISTS(
            SELECT 1 FROM public.masjid_admins 
            WHERE user_id = rejector_id 
            AND masjid_id = target_masjid_id 
            AND status = 'active'
        ) INTO is_admin_of_masjid;
    END IF;
    
    IF NOT is_admin_of_masjid THEN
        RAISE EXCEPTION 'Only masjid admins or super admins can reject user registrations';
    END IF;
    
    -- Update approval status
    UPDATE public.user_approvals 
    SET 
        status = 'rejected',
        reviewed_by = rejector_id,
        reviewed_at = NOW(),
        review_notes = rejection_notes,
        updated_at = NOW()
    WHERE id = approval_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.user_approvals IS 'User registration approval workflow when selecting home masjid';
COMMENT ON COLUMN public.user_approvals.status IS 'pending, approved, rejected';
COMMENT ON COLUMN public.user_approvals.review_notes IS 'Optional notes from admin during review';
COMMENT ON COLUMN public.profiles.home_masjid_approved_at IS 'Timestamp when home masjid was approved, makes home_masjid_id immutable';
COMMENT ON CONSTRAINT unique_pending_user_approval ON public.user_approvals IS 'Prevents multiple pending approvals for same user';
COMMENT ON FUNCTION public.validate_user_approval() IS 'Validates only public users can request approval and only admins can review';
COMMENT ON FUNCTION public.process_approved_user() IS 'Auto-updates user role to registered and locks home masjid on approval';
COMMENT ON FUNCTION public.prevent_home_masjid_change() IS 'Prevents home masjid changes after approval';
COMMENT ON FUNCTION public.create_user_approval_on_home_masjid_set() IS 'Auto-creates pending approval when public user sets home masjid';
COMMENT ON FUNCTION public.get_pending_user_approvals(UUID) IS 'Returns pending user approvals for specific masjid';
COMMENT ON FUNCTION public.approve_user_registration(UUID, UUID, TEXT) IS 'Approves user and promotes to registered role';
COMMENT ON FUNCTION public.reject_user_registration(UUID, UUID, TEXT) IS 'Rejects user and clears home masjid selection';
