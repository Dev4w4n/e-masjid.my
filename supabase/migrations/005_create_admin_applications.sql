-- Create admin application status enum
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- Create admin_applications table
CREATE TABLE IF NOT EXISTS public.admin_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    masjid_id UUID REFERENCES public.masjids(id) ON DELETE CASCADE NOT NULL,
    application_message TEXT,
    status application_status DEFAULT 'pending' NOT NULL,
    review_notes TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT application_message_length CHECK (
        application_message IS NULL OR 
        length(trim(application_message)) >= 10
    ),
    CONSTRAINT review_data_consistency CHECK (
        (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
        (status IN ('approved', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL) OR
        (status = 'withdrawn')
    ),
    
    -- Unique constraint to prevent multiple pending applications
    CONSTRAINT unique_pending_application 
    EXCLUDE (user_id WITH =, masjid_id WITH =) 
    WHERE (status = 'pending')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_applications_user_id ON public.admin_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_applications_masjid_id ON public.admin_applications(masjid_id);
CREATE INDEX IF NOT EXISTS idx_admin_applications_status ON public.admin_applications(status);
CREATE INDEX IF NOT EXISTS idx_admin_applications_reviewed_by ON public.admin_applications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_admin_applications_created_at ON public.admin_applications(created_at);

-- Create compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_admin_applications_masjid_status ON public.admin_applications(masjid_id, status);
CREATE INDEX IF NOT EXISTS idx_admin_applications_user_status ON public.admin_applications(user_id, status);

-- Create updated_at trigger
CREATE TRIGGER update_admin_applications_updated_at 
    BEFORE UPDATE ON public.admin_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate admin application
CREATE OR REPLACE FUNCTION public.validate_admin_application()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    user_profile_complete BOOLEAN;
    reviewer_role user_role;
    existing_admin BOOLEAN;
BEGIN
    -- Get user role and profile completion status
    SELECT u.role, p.is_complete 
    INTO user_role_value, user_profile_complete
    FROM public.users u
    JOIN public.profiles p ON u.id = p.user_id
    WHERE u.id = NEW.user_id;
    
    -- Validate user can apply for admin role
    IF user_role_value NOT IN ('registered', 'masjid_admin') THEN
        RAISE EXCEPTION 'Only registered users can apply for admin roles';
    END IF;
    
    -- Validate user profile is complete
    IF user_profile_complete = FALSE THEN
        RAISE EXCEPTION 'User must complete their profile before applying for admin role';
    END IF;
    
    -- Check if user is already admin of this masjid
    SELECT EXISTS(
        SELECT 1 FROM public.masjid_admins 
        WHERE user_id = NEW.user_id 
        AND masjid_id = NEW.masjid_id 
        AND status = 'active'
    ) INTO existing_admin;
    
    IF existing_admin THEN
        RAISE EXCEPTION 'User is already an admin of this masjid';
    END IF;
    
    -- Validate reviewer if status is being updated to approved/rejected
    IF NEW.status IN ('approved', 'rejected') AND NEW.reviewed_by IS NOT NULL THEN
        SELECT role INTO reviewer_role 
        FROM public.users 
        WHERE id = NEW.reviewed_by;
        
        IF reviewer_role != 'super_admin' THEN
            RAISE EXCEPTION 'Only super administrators can review admin applications';
        END IF;
        
        -- Set reviewed_at if not provided
        IF NEW.reviewed_at IS NULL THEN
            NEW.reviewed_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for application validation
CREATE TRIGGER validate_admin_application_trigger
    BEFORE INSERT OR UPDATE ON public.admin_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_admin_application();

-- Function to auto-create admin assignment when application is approved
CREATE OR REPLACE FUNCTION public.process_approved_application()
RETURNS TRIGGER AS $$
BEGIN
    -- If application was approved, create admin assignment
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO public.masjid_admins (
            user_id, 
            masjid_id, 
            status, 
            approved_by, 
            approved_at
        ) VALUES (
            NEW.user_id, 
            NEW.masjid_id, 
            'active', 
            NEW.reviewed_by, 
            NEW.reviewed_at
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating admin assignment
CREATE TRIGGER process_approved_application_trigger
    AFTER UPDATE ON public.admin_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.process_approved_application();

-- Function to get pending applications for super admin review
CREATE OR REPLACE FUNCTION public.get_pending_applications()
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    user_phone VARCHAR(20),
    masjid_id UUID,
    masjid_name VARCHAR(255),
    application_message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aa.id as application_id,
        u.id as user_id,
        u.email as user_email,
        p.full_name as user_full_name,
        p.phone_number as user_phone,
        m.id as masjid_id,
        m.name as masjid_name,
        aa.application_message,
        aa.created_at as applied_at
    FROM public.admin_applications aa
    JOIN public.users u ON aa.user_id = u.id
    JOIN public.profiles p ON u.id = p.user_id
    JOIN public.masjids m ON aa.masjid_id = m.id
    WHERE aa.status = 'pending'
    ORDER BY aa.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get applications for a specific masjid
CREATE OR REPLACE FUNCTION public.get_masjid_applications(target_masjid_id UUID)
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    application_message TEXT,
    status application_status,
    applied_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_email VARCHAR(255),
    review_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aa.id as application_id,
        u.id as user_id,
        u.email as user_email,
        p.full_name as user_full_name,
        aa.application_message,
        aa.status,
        aa.created_at as applied_at,
        aa.reviewed_at,
        rev.email as reviewer_email,
        aa.review_notes
    FROM public.admin_applications aa
    JOIN public.users u ON aa.user_id = u.id
    JOIN public.profiles p ON u.id = p.user_id
    LEFT JOIN public.users rev ON aa.reviewed_by = rev.id
    WHERE aa.masjid_id = target_masjid_id
    ORDER BY aa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve admin application
CREATE OR REPLACE FUNCTION public.approve_admin_application(
    application_id UUID,
    approving_user_id UUID,
    approval_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    approver_role user_role;
BEGIN
    -- Check if approver is super admin
    SELECT role INTO approver_role 
    FROM public.users 
    WHERE id = approving_user_id;
    
    IF approver_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can approve admin applications';
    END IF;
    
    -- Update application status
    UPDATE public.admin_applications 
    SET 
        status = 'approved',
        reviewed_by = approving_user_id,
        reviewed_at = NOW(),
        review_notes = approval_notes,
        updated_at = NOW()
    WHERE id = application_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject admin application
CREATE OR REPLACE FUNCTION public.reject_admin_application(
    application_id UUID,
    rejecting_user_id UUID,
    rejection_notes TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    rejector_role user_role;
BEGIN
    -- Check if rejector is super admin
    SELECT role INTO rejector_role 
    FROM public.users 
    WHERE id = rejecting_user_id;
    
    IF rejector_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can reject admin applications';
    END IF;
    
    -- Validation: rejection notes are required
    IF rejection_notes IS NULL OR length(trim(rejection_notes)) < 5 THEN
        RAISE EXCEPTION 'Rejection notes are required and must be at least 5 characters';
    END IF;
    
    -- Update application status
    UPDATE public.admin_applications 
    SET 
        status = 'rejected',
        reviewed_by = rejecting_user_id,
        reviewed_at = NOW(),
        review_notes = rejection_notes,
        updated_at = NOW()
    WHERE id = application_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to withdraw application (by applicant)
CREATE OR REPLACE FUNCTION public.withdraw_admin_application(
    application_id UUID,
    withdrawing_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update application status (only applicant can withdraw their own application)
    UPDATE public.admin_applications 
    SET 
        status = 'withdrawn',
        updated_at = NOW()
    WHERE id = application_id 
    AND user_id = withdrawing_user_id 
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.admin_applications IS 'Admin role applications with approval workflow';
COMMENT ON COLUMN public.admin_applications.status IS 'pending, approved, rejected, withdrawn';
COMMENT ON COLUMN public.admin_applications.application_message IS 'Optional message from applicant (min 10 chars if provided)';
COMMENT ON COLUMN public.admin_applications.review_notes IS 'Super admin notes during review process';
COMMENT ON CONSTRAINT unique_pending_application ON public.admin_applications IS 'Prevents multiple pending applications for same user-masjid pair';
COMMENT ON FUNCTION public.validate_admin_application() IS 'Validates applicant eligibility and reviewer permissions';
COMMENT ON FUNCTION public.process_approved_application() IS 'Auto-creates admin assignment when application is approved';
COMMENT ON FUNCTION public.get_pending_applications() IS 'Returns all pending applications for super admin review';
COMMENT ON FUNCTION public.approve_admin_application(UUID, UUID, TEXT) IS 'Approves application and creates admin assignment';
COMMENT ON FUNCTION public.reject_admin_application(UUID, UUID, TEXT) IS 'Rejects application with required notes';
COMMENT ON FUNCTION public.withdraw_admin_application(UUID, UUID) IS 'Allows applicant to withdraw their pending application';
