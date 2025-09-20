-- Add website_url, capacity, and facilities columns to masjids table
-- Migration 007: Add extended fields for masjid management

-- Add website_url column
ALTER TABLE public.masjids 
ADD COLUMN website_url VARCHAR(500);

-- Add capacity column (number of people the masjid can accommodate)
ALTER TABLE public.masjids 
ADD COLUMN capacity INTEGER;

-- Add facilities column (JSON array of facility names)
ALTER TABLE public.masjids 
ADD COLUMN facilities JSONB DEFAULT '[]'::jsonb;

-- Add constraints for new fields
ALTER TABLE public.masjids 
ADD CONSTRAINT masjid_website_url_format CHECK (
    website_url IS NULL OR 
    website_url ~ '^https?:\/\/[^\s/$.?#].[^\s]*$'
);

ALTER TABLE public.masjids 
ADD CONSTRAINT masjid_capacity_positive CHECK (
    capacity IS NULL OR 
    capacity > 0
);

ALTER TABLE public.masjids 
ADD CONSTRAINT masjid_facilities_array CHECK (
    jsonb_typeof(facilities) = 'array'
);

-- Create index for facilities search
CREATE INDEX IF NOT EXISTS idx_masjids_facilities_gin ON public.masjids USING gin(facilities);

-- Create index for capacity queries
CREATE INDEX IF NOT EXISTS idx_masjids_capacity ON public.masjids(capacity) WHERE capacity IS NOT NULL;

-- Create index for website_url
CREATE INDEX IF NOT EXISTS idx_masjids_website_url ON public.masjids(website_url) WHERE website_url IS NOT NULL;

-- Function to validate facilities array contains only strings
CREATE OR REPLACE FUNCTION public.validate_masjid_facilities()
RETURNS TRIGGER AS $$
BEGIN
    -- Check that all elements in facilities array are strings
    IF NEW.facilities IS NOT NULL THEN
        -- Check if any element is not a string
        IF EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(NEW.facilities) AS facility
            WHERE jsonb_typeof(facility) != 'string'
        ) THEN
            RAISE EXCEPTION 'All facilities must be text strings';
        END IF;
        
        -- Check for empty strings
        IF EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(NEW.facilities) AS facility_text
            WHERE length(trim(facility_text)) = 0
        ) THEN
            RAISE EXCEPTION 'Facility names cannot be empty';
        END IF;
        
        -- Check for duplicate facilities (case-insensitive)
        IF (
            SELECT COUNT(DISTINCT lower(facility_text))
            FROM jsonb_array_elements_text(NEW.facilities) AS facility_text
        ) != (
            SELECT jsonb_array_length(NEW.facilities)
        ) THEN
            RAISE EXCEPTION 'Duplicate facilities are not allowed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for facilities validation
CREATE TRIGGER validate_masjid_facilities_trigger
    BEFORE INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_masjid_facilities();

-- Comments for documentation
COMMENT ON COLUMN public.masjids.website_url IS 'Official website URL of the masjid (optional)';
COMMENT ON COLUMN public.masjids.capacity IS 'Maximum number of people the masjid can accommodate (optional)';
COMMENT ON COLUMN public.masjids.facilities IS 'Array of available facilities as JSON strings (e.g., ["Parking", "AC", "Wheelchair Access"])';
COMMENT ON FUNCTION public.validate_masjid_facilities() IS 'Validates that facilities array contains only non-empty strings without duplicates';

-- Sample update to demonstrate usage (commented out for production)
-- UPDATE public.masjids 
-- SET 
--     website_url = 'https://example-masjid.com',
--     capacity = 500,
--     facilities = '["Parking", "Air Conditioning", "Wheelchair Access", "Kitchen"]'::jsonb
-- WHERE name = 'Example Masjid';