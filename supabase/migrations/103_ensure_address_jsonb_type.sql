-- Ensure address column is JSONB type and fix any type casting issues
-- This fixes "operator does not exist: text ->> unknown" error

-- Verify and fix address column type if needed
DO $$ 
BEGIN
    -- Check if address column is not JSONB
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'masjids' 
        AND column_name = 'address' 
        AND data_type != 'jsonb'
    ) THEN
        -- If it's text or varchar, convert it to JSONB
        ALTER TABLE public.masjids 
        ALTER COLUMN address TYPE JSONB USING address::jsonb;
        
        RAISE NOTICE 'Converted address column to JSONB';
    ELSE
        RAISE NOTICE 'Address column is already JSONB';
    END IF;
END $$;

-- Recreate the validation functions with explicit type handling
CREATE OR REPLACE FUNCTION public.validate_masjid_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure address is JSONB (defensive programming)
    IF pg_typeof(NEW.address) != 'jsonb'::regtype THEN
        RAISE EXCEPTION 'Address must be JSONB type, got %', pg_typeof(NEW.address);
    END IF;

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
    IF NOT ((NEW.address->>'postcode')::text ~ '^[0-9]{5}$') THEN
        RAISE EXCEPTION 'Postcode must be 5 digits';
    END IF;
    
    -- Validate postcode range for Malaysia
    IF ((NEW.address->>'postcode')::text)::INTEGER NOT BETWEEN 10000 AND 98000 THEN
        RAISE EXCEPTION 'Postcode must be between 10000 and 98000 for Malaysia';
    END IF;
    
    -- Validate state is Malaysian state (accepts both old and new names)
    IF NOT ((NEW.address->>'state')::text IN (
        'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Malacca', 'Negeri Sembilan', 
        'Pahang', 'Pulau Pinang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 
        'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
    )) THEN
        RAISE EXCEPTION 'State must be a valid Malaysian state';
    END IF;
    
    -- Validate country is Malaysia
    IF (NEW.address->>'country')::text != 'MYS' THEN
        RAISE EXCEPTION 'Country must be MYS (Malaysia)';
    END IF;
    
    -- Ensure required text fields are not empty
    IF length(trim((NEW.address->>'address_line_1')::text)) = 0 THEN
        RAISE EXCEPTION 'Address line 1 cannot be empty';
    END IF;
    
    IF length(trim((NEW.address->>'city')::text)) = 0 THEN
        RAISE EXCEPTION 'City cannot be empty';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the zone validation function with explicit type handling
CREATE OR REPLACE FUNCTION public.validate_masjid_address_with_zone()
RETURNS TRIGGER AS $$
DECLARE
    suggested_zone VARCHAR(10);
    state_value TEXT;
BEGIN
    -- Ensure address is JSONB (defensive programming)
    IF pg_typeof(NEW.address) != 'jsonb'::regtype THEN
        RAISE EXCEPTION 'Address must be JSONB type, got %', pg_typeof(NEW.address);
    END IF;

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
    IF NOT ((NEW.address->>'postcode')::text ~ '^[0-9]{5}$') THEN
        RAISE EXCEPTION 'Postcode must be 5 digits';
    END IF;
    
    -- Validate postcode range for Malaysia
    IF ((NEW.address->>'postcode')::text)::INTEGER NOT BETWEEN 10000 AND 98000 THEN
        RAISE EXCEPTION 'Postcode must be between 10000 and 98000 for Malaysia';
    END IF;
    
    -- Extract state value explicitly as TEXT
    state_value := (NEW.address->>'state')::text;
    
    -- Validate state is Malaysian state (accepts both old and new names)
    IF NOT (state_value IN (
        'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Malacca', 'Negeri Sembilan', 
        'Pahang', 'Pulau Pinang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak', 
        'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
    )) THEN
        RAISE EXCEPTION 'State must be a valid Malaysian state';
    END IF;
    
    -- Validate country is Malaysia
    IF (NEW.address->>'country')::text != 'MYS' THEN
        RAISE EXCEPTION 'Country must be MYS (Malaysia)';
    END IF;
    
    -- Ensure required text fields are not empty
    IF length(trim((NEW.address->>'address_line_1')::text)) = 0 THEN
        RAISE EXCEPTION 'Address line 1 cannot be empty';
    END IF;
    
    IF length(trim((NEW.address->>'city')::text)) = 0 THEN
        RAISE EXCEPTION 'City cannot be empty';
    END IF;
    
    -- Auto-suggest zone code based on state if not provided
    IF NEW.jakim_zone_code IS NULL THEN
        CASE state_value
            WHEN 'Kuala Lumpur' THEN suggested_zone := 'WLY01';
            WHEN 'Putrajaya' THEN suggested_zone := 'WLY01';
            WHEN 'Labuan' THEN suggested_zone := 'WLY02';
            WHEN 'Selangor' THEN suggested_zone := 'SGR01';
            WHEN 'Johor' THEN suggested_zone := 'JHR02';
            WHEN 'Kedah' THEN suggested_zone := 'KDH01';
            WHEN 'Kelantan' THEN suggested_zone := 'KTN01';
            WHEN 'Malacca', 'Melaka' THEN suggested_zone := 'MLK01';
            WHEN 'Negeri Sembilan' THEN suggested_zone := 'NGS01';
            WHEN 'Pahang' THEN suggested_zone := 'PHG02';
            WHEN 'Perak' THEN suggested_zone := 'PRK02';
            WHEN 'Perlis' THEN suggested_zone := 'PLS01';
            WHEN 'Penang', 'Pulau Pinang' THEN suggested_zone := 'PNG01';
            WHEN 'Sabah' THEN suggested_zone := 'SBH07';
            WHEN 'Sarawak' THEN suggested_zone := 'SWK08';
            WHEN 'Terengganu' THEN suggested_zone := 'TRG01';
            ELSE suggested_zone := 'WLY01'; -- Default to Kuala Lumpur
        END CASE;
        
        NEW.jakim_zone_code := suggested_zone;
    END IF;
    
    -- Validate zone code format if provided
    IF NEW.jakim_zone_code IS NOT NULL THEN
        IF NOT (NEW.jakim_zone_code ~ '^[A-Z]{3}[0-9]{2}$') THEN
            RAISE EXCEPTION 'JAKIM zone code must be in format: 3 letters + 2 digits (e.g., WLY01)';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION public.validate_masjid_address() IS 'Validates Malaysian address format in JSONB field with explicit type casting';
COMMENT ON FUNCTION public.validate_masjid_address_with_zone() IS 'Validates Malaysian address and auto-suggests JAKIM zone code with explicit type handling';
