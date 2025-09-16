-- Create language enum for UI preferences
CREATE TYPE language_code AS ENUM ('en', 'ms', 'zh', 'ta');

-- Create address type enum
CREATE TYPE address_type AS ENUM ('home', 'work', 'other');

-- Create Malaysian states enum
CREATE TYPE malaysian_state AS ENUM (
    'Johor', 
    'Kedah', 
    'Kelantan', 
    'Malacca', 
    'Negeri Sembilan', 
    'Pahang', 
    'Penang', 
    'Perak', 
    'Perlis', 
    'Sabah', 
    'Sarawak', 
    'Selangor', 
    'Terengganu', 
    'Kuala Lumpur', 
    'Labuan', 
    'Putrajaya'
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    preferred_language language_code DEFAULT 'en' NOT NULL,
    home_masjid_id UUID, -- Will reference masjids table created later
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT phone_number_format CHECK (
        phone_number IS NULL OR 
        phone_number ~ '^(\+60|0)[1-9][0-9]{7,9}$'
    ),
    CONSTRAINT full_name_length CHECK (length(full_name) >= 2 AND length(full_name) <= 255)
);

-- Create profile_addresses table
CREATE TABLE IF NOT EXISTS public.profile_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state malaysian_state NOT NULL,
    postcode VARCHAR(5) NOT NULL,
    country VARCHAR(3) DEFAULT 'MYS' NOT NULL,
    address_type address_type DEFAULT 'home' NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT postcode_format CHECK (postcode ~ '^[0-9]{5}$'),
    CONSTRAINT postcode_range CHECK (postcode::INTEGER BETWEEN 10000 AND 98000),
    CONSTRAINT address_line_1_not_empty CHECK (length(trim(address_line_1)) > 0),
    CONSTRAINT city_not_empty CHECK (length(trim(city)) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_complete ON public.profiles(is_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_home_masjid ON public.profiles(home_masjid_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_profile_addresses_profile_id ON public.profile_addresses(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_addresses_postcode ON public.profile_addresses(postcode);
CREATE INDEX IF NOT EXISTS idx_profile_addresses_state ON public.profile_addresses(state);
CREATE INDEX IF NOT EXISTS idx_profile_addresses_is_primary ON public.profile_addresses(is_primary);

-- Create unique constraint for primary address per profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_addresses_one_primary 
    ON public.profile_addresses(profile_id) 
    WHERE is_primary = TRUE;

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_addresses_updated_at 
    BEFORE UPDATE ON public.profile_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check profile completion
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    has_address BOOLEAN;
BEGIN
    -- Check if profile has required fields and at least one address
    SELECT EXISTS(
        SELECT 1 FROM public.profile_addresses 
        WHERE profile_id = NEW.id AND is_primary = TRUE
    ) INTO has_address;
    
    -- Update completion status
    NEW.is_complete := (
        NEW.full_name IS NOT NULL AND 
        length(trim(NEW.full_name)) > 0 AND
        NEW.phone_number IS NOT NULL AND
        NEW.home_masjid_id IS NOT NULL AND
        has_address
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile completion check
CREATE TRIGGER check_profile_completion_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_completion();

-- Function to ensure only one primary address per profile
CREATE OR REPLACE FUNCTION public.ensure_one_primary_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this address as primary, unset others for this profile
    IF NEW.is_primary = TRUE THEN
        UPDATE public.profile_addresses 
        SET is_primary = FALSE 
        WHERE profile_id = NEW.profile_id AND id != NEW.id;
    END IF;
    
    -- Trigger profile completion recheck
    UPDATE public.profiles 
    SET updated_at = NOW() 
    WHERE id = NEW.profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for primary address management
CREATE TRIGGER ensure_one_primary_address_trigger
    AFTER INSERT OR UPDATE ON public.profile_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_one_primary_address();

-- Function to automatically create profile when user is created
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, is_complete)
    VALUES (NEW.id, '', FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user is created
CREATE TRIGGER create_profile_on_user_creation
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_new_user();

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information with completion tracking';
COMMENT ON TABLE public.profile_addresses IS 'User addresses with Malaysian format validation';
COMMENT ON COLUMN public.profiles.is_complete IS 'Auto-calculated based on required fields and address';
COMMENT ON COLUMN public.profiles.phone_number IS 'Malaysian phone format: +60-xx-xxxx-xxxx or 0xx-xxxx-xxxx';
COMMENT ON COLUMN public.profile_addresses.postcode IS 'Malaysian 5-digit postal code (10000-98000)';
COMMENT ON COLUMN public.profile_addresses.is_primary IS 'Only one primary address allowed per profile';
