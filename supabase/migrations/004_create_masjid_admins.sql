-- Create masjid admin assignment status enum
CREATE TYPE admin_assignment_status AS ENUM ('active', 'inactive', 'pending', 'revoked');

-- Create masjid_admins table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.masjid_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    masjid_id UUID REFERENCES public.masjids(id) ON DELETE CASCADE NOT NULL,
    status admin_assignment_status DEFAULT 'active' NOT NULL,
    approved_by UUID REFERENCES public.users(id) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Unique constraint to prevent duplicate assignments
    CONSTRAINT unique_user_masjid_assignment UNIQUE (user_id, masjid_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_masjid_admins_user_id ON public.masjid_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_masjid_admins_masjid_id ON public.masjid_admins(masjid_id);
CREATE INDEX IF NOT EXISTS idx_masjid_admins_status ON public.masjid_admins(status);
CREATE INDEX IF NOT EXISTS idx_masjid_admins_approved_by ON public.masjid_admins(approved_by);
CREATE INDEX IF NOT EXISTS idx_masjid_admins_approved_at ON public.masjid_admins(approved_at);

-- Create compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_masjid_admins_user_status ON public.masjid_admins(user_id, status);
CREATE INDEX IF NOT EXISTS idx_masjid_admins_masjid_status ON public.masjid_admins(masjid_id, status);

-- Create updated_at trigger
CREATE TRIGGER update_masjid_admins_updated_at 
    BEFORE UPDATE ON public.masjid_admins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate admin assignment
CREATE OR REPLACE FUNCTION public.validate_admin_assignment()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value user_role;
    approver_role user_role;
    user_profile_complete BOOLEAN;
BEGIN
    -- Get user role
    SELECT role INTO user_role_value 
    FROM public.users 
    WHERE id = NEW.user_id;
    
    -- Get approver role
    SELECT role INTO approver_role 
    FROM public.users 
    WHERE id = NEW.approved_by;
    
    -- Check if user profile is complete
    SELECT is_complete INTO user_profile_complete 
    FROM public.profiles 
    WHERE user_id = NEW.user_id;
    
    -- Validate user can be assigned as admin
    IF user_role_value NOT IN ('registered', 'masjid_admin') THEN
        RAISE EXCEPTION 'Only registered users can be assigned as masjid admins';
    END IF;
    
    -- Validate approver is super admin
    IF approver_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can approve admin assignments';
    END IF;
    
    -- Validate user profile is complete
    IF user_profile_complete = FALSE THEN
        RAISE EXCEPTION 'User must complete their profile before being assigned as admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for admin assignment validation
CREATE TRIGGER validate_admin_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.masjid_admins
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_admin_assignment();

-- Function to update user role when admin assignment is created/updated
CREATE OR REPLACE FUNCTION public.sync_user_role_with_admin_assignment()
RETURNS TRIGGER AS $$
DECLARE
    active_assignments INTEGER;
BEGIN
    -- Count active admin assignments for the user
    SELECT COUNT(*) INTO active_assignments
    FROM public.masjid_admins
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND status = 'active';
    
    -- Update user role based on active assignments
    IF active_assignments > 0 THEN
        UPDATE public.users 
        SET role = 'masjid_admin' 
        WHERE id = COALESCE(NEW.user_id, OLD.user_id) AND role != 'super_admin';
    ELSE
        -- If no active assignments, revert to registered user
        UPDATE public.users 
        SET role = 'registered' 
        WHERE id = COALESCE(NEW.user_id, OLD.user_id) AND role = 'masjid_admin';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for role synchronization
CREATE TRIGGER sync_user_role_on_admin_insert
    AFTER INSERT ON public.masjid_admins
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_role_with_admin_assignment();

CREATE TRIGGER sync_user_role_on_admin_update
    AFTER UPDATE ON public.masjid_admins
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_role_with_admin_assignment();

CREATE TRIGGER sync_user_role_on_admin_delete
    AFTER DELETE ON public.masjid_admins
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_role_with_admin_assignment();

-- Function to get admin assignments for a user
CREATE OR REPLACE FUNCTION public.get_user_admin_assignments(target_user_id UUID)
RETURNS TABLE (
    assignment_id UUID,
    masjid_id UUID,
    masjid_name VARCHAR(255),
    assignment_status admin_assignment_status,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_email VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.id as assignment_id,
        m.id as masjid_id,
        m.name as masjid_name,
        ma.status as assignment_status,
        ma.approved_at,
        u.email as approved_by_email
    FROM public.masjid_admins ma
    JOIN public.masjids m ON ma.masjid_id = m.id
    JOIN public.users u ON ma.approved_by = u.id
    WHERE ma.user_id = target_user_id
    ORDER BY ma.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admins for a masjid
CREATE OR REPLACE FUNCTION public.get_masjid_admin_list(target_masjid_id UUID)
RETURNS TABLE (
    user_id UUID,
    full_name VARCHAR(255),
    email VARCHAR(255),
    assignment_status admin_assignment_status,
    assigned_at TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        p.full_name,
        u.email,
        ma.status as assignment_status,
        ma.approved_at as assigned_at,
        p.phone_number
    FROM public.masjid_admins ma
    JOIN public.users u ON ma.user_id = u.id
    JOIN public.profiles p ON u.id = p.user_id
    WHERE ma.masjid_id = target_masjid_id AND ma.status = 'active'
    ORDER BY ma.approved_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin of specific masjid
CREATE OR REPLACE FUNCTION public.is_user_masjid_admin(
    target_user_id UUID, 
    target_masjid_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.masjid_admins 
        WHERE user_id = target_user_id 
        AND masjid_id = target_masjid_id 
        AND status = 'active'
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke admin assignment
CREATE OR REPLACE FUNCTION public.revoke_admin_assignment(
    target_assignment_id UUID,
    revoking_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    revoker_role user_role;
BEGIN
    -- Check if revoker is super admin
    SELECT role INTO revoker_role 
    FROM public.users 
    WHERE id = revoking_user_id;
    
    IF revoker_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can revoke admin assignments';
    END IF;
    
    -- Update assignment status
    UPDATE public.masjid_admins 
    SET status = 'revoked', updated_at = NOW()
    WHERE id = target_assignment_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.masjid_admins IS 'Many-to-many relationship between users and masjids for admin assignments';
COMMENT ON COLUMN public.masjid_admins.status IS 'active, inactive, pending, revoked';
COMMENT ON COLUMN public.masjid_admins.approved_by IS 'Must be super_admin who approved this assignment';
COMMENT ON CONSTRAINT unique_user_masjid_assignment ON public.masjid_admins IS 'Prevents duplicate admin assignments for same user-masjid pair';
COMMENT ON FUNCTION public.validate_admin_assignment() IS 'Ensures only registered users with complete profiles can be assigned by super admins';
COMMENT ON FUNCTION public.sync_user_role_with_admin_assignment() IS 'Automatically updates user role based on active admin assignments';
COMMENT ON FUNCTION public.get_user_admin_assignments(UUID) IS 'Returns all masjid admin assignments for a specific user';
COMMENT ON FUNCTION public.get_masjid_admin_list(UUID) IS 'Returns all active admins for a specific masjid';
COMMENT ON FUNCTION public.is_user_masjid_admin(UUID, UUID) IS 'Checks if user is active admin of specific masjid';
COMMENT ON FUNCTION public.revoke_admin_assignment(UUID, UUID) IS 'Revokes admin assignment (super admin only)';
