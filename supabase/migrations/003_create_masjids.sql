-- Create masjid status enum
CREATE TYPE masjid_status AS ENUM ('active', 'inactive', 'pending_verification');

-- Create masjids table
CREATE TABLE IF NOT EXISTS public.masjids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    description TEXT,
    address JSONB NOT NULL,
    status masjid_status DEFAULT 'active' NOT NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT masjid_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT masjid_email_format CHECK (
        email IS NULL OR 
        email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT masjid_phone_format CHECK (
        phone_number IS NULL OR 
        phone_number ~ '^(\+60|0)[1-9][0-9]{7,9}$'
    ),
    CONSTRAINT address_required CHECK (jsonb_typeof(address) = 'object')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_masjids_name ON public.masjids(name);
CREATE INDEX IF NOT EXISTS idx_masjids_status ON public.masjids(status);
CREATE INDEX IF NOT EXISTS idx_masjids_created_by ON public.masjids(created_by);
CREATE INDEX IF NOT EXISTS idx_masjids_created_at ON public.masjids(created_at);
CREATE INDEX IF NOT EXISTS idx_masjids_registration_number ON public.masjids(registration_number);

-- Create GIN index for address JSONB column for efficient searching
CREATE INDEX IF NOT EXISTS idx_masjids_address_gin ON public.masjids USING gin(address);

-- Create specific indexes for common address searches (using B-tree for exact matches)
CREATE INDEX IF NOT EXISTS idx_masjids_address_state ON public.masjids ((address->>'state'));
CREATE INDEX IF NOT EXISTS idx_masjids_address_city ON public.masjids ((address->>'city'));
CREATE INDEX IF NOT EXISTS idx_masjids_address_postcode ON public.masjids ((address->>'postcode'));

-- Create updated_at trigger
CREATE TRIGGER update_masjids_updated_at 
    BEFORE UPDATE ON public.masjids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to validate address JSON structure
CREATE OR REPLACE FUNCTION public.validate_masjid_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Check required address fields
    IF NOT (
        NEW.address ? 'address_line_1' AND
        NEW.address ? 'city' AND
        NEW.address ? 'state' AND
        NEW.address ? 'postcode' AND
        NEW.address ? 'country'
    ) THEN
        RAISE EXCEPTION 'Address must contain address_line_1, city, state, postcode, and country';
    END IF;
    
    -- Validate postcode format
    IF NOT (NEW.address->>'postcode' ~ '^[0-9]{5}$') THEN
        RAISE EXCEPTION 'Postcode must be 5 digits';
    END IF;
    
    -- Validate postcode range for Malaysia
    IF (NEW.address->>'postcode')::INTEGER NOT BETWEEN 10000 AND 98000 THEN
        RAISE EXCEPTION 'Postcode must be between 10000 and 98000 for Malaysia';
    END IF;
    
    -- Validate state is Malaysian state
    IF NOT (NEW.address->>'state' IN (
        'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
        'Pahang', 'Pulau Pinang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 
        'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
    )) THEN
        RAISE EXCEPTION 'State must be a valid Malaysian state';
    END IF;
    
    -- Validate country is Malaysia
    IF NEW.address->>'country' != 'MYS' THEN
        RAISE EXCEPTION 'Country must be MYS (Malaysia)';
    END IF;
    
    -- Ensure required text fields are not empty
    IF length(trim(NEW.address->>'address_line_1')) = 0 THEN
        RAISE EXCEPTION 'Address line 1 cannot be empty';
    END IF;
    
    IF length(trim(NEW.address->>'city')) = 0 THEN
        RAISE EXCEPTION 'City cannot be empty';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for address validation
CREATE TRIGGER validate_masjid_address_trigger
    BEFORE INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_masjid_address();

-- Function to ensure only super_admin can create masjids
CREATE OR REPLACE FUNCTION public.check_masjid_creator_role()
RETURNS TRIGGER AS $$
DECLARE
    creator_role user_role;
BEGIN
    -- Get the role of the user creating the masjid
    SELECT role INTO creator_role 
    FROM public.users 
    WHERE id = NEW.created_by;
    
    -- Only super_admin can create masjids
    IF creator_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super administrators can create masjids';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creator role validation
CREATE TRIGGER check_masjid_creator_role_trigger
    BEFORE INSERT ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.check_masjid_creator_role();

-- Add foreign key to profiles table for home_masjid_id
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_home_masjid 
FOREIGN KEY (home_masjid_id) REFERENCES public.masjids(id) ON DELETE SET NULL;

-- Create index for home masjid relationship
CREATE INDEX IF NOT EXISTS idx_profiles_home_masjid_fk ON public.profiles(home_masjid_id);

-- Function to get masjids by proximity (for future use)
CREATE OR REPLACE FUNCTION public.get_masjids_by_state(target_state TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    address JSONB,
    status masjid_status,
    distance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.address,
        m.status,
        CASE 
            WHEN m.address->>'state' = target_state THEN 1
            ELSE 2
        END as distance_score
    FROM public.masjids m
    WHERE m.status = 'active'
    ORDER BY distance_score ASC, m.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.masjids IS 'Mosque entities with Malaysian address validation';
COMMENT ON COLUMN public.masjids.address IS 'JSONB address following Malaysian postal format';
COMMENT ON COLUMN public.masjids.registration_number IS 'Official masjid registration number (unique if provided)';
COMMENT ON COLUMN public.masjids.created_by IS 'Must be super_admin role to create masjids';
COMMENT ON COLUMN public.masjids.status IS 'active, inactive, or pending_verification';
COMMENT ON FUNCTION public.validate_masjid_address() IS 'Validates Malaysian address format in JSONB field';
COMMENT ON FUNCTION public.get_masjids_by_state(TEXT) IS 'Returns masjids ordered by proximity to target state';
