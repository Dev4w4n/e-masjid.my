-- Add JAKIM zone code to masjids table
-- Migration: 008_add_jakim_zone_to_masjids.sql

-- Add jakim_zone_code column to masjids table
ALTER TABLE public.masjids 
ADD COLUMN jakim_zone_code VARCHAR(10);

-- Add comment for the new column
COMMENT ON COLUMN public.masjids.jakim_zone_code IS 'JAKIM prayer time zone code (e.g., WLY01 for Kuala Lumpur)';

-- Create index for efficient lookup by zone code
CREATE INDEX IF NOT EXISTS idx_masjids_jakim_zone_code ON public.masjids(jakim_zone_code);

-- Update the address validation function to optionally set zone code based on state
CREATE OR REPLACE FUNCTION public.validate_masjid_address_with_zone()
RETURNS TRIGGER AS $$
DECLARE
    suggested_zone VARCHAR(10);
BEGIN
    -- Call the existing address validation
    PERFORM public.validate_masjid_address();
    
    -- Auto-suggest zone code based on state if not provided
    IF NEW.jakim_zone_code IS NULL THEN
        CASE NEW.address->>'state'
            WHEN 'Kuala Lumpur' THEN suggested_zone := 'WLY01';
            WHEN 'Putrajaya' THEN suggested_zone := 'WLY01';
            WHEN 'Labuan' THEN suggested_zone := 'WLY02';
            WHEN 'Selangor' THEN suggested_zone := 'SGR01';
            WHEN 'Johor' THEN suggested_zone := 'JHR02';
            WHEN 'Kedah' THEN suggested_zone := 'KDH01';
            WHEN 'Kelantan' THEN suggested_zone := 'KTN01';
            WHEN 'Malacca' THEN suggested_zone := 'MLK01';
            WHEN 'Negeri Sembilan' THEN suggested_zone := 'NGS01';
            WHEN 'Pahang' THEN suggested_zone := 'PHG02';
            WHEN 'Perak' THEN suggested_zone := 'PRK02';
            WHEN 'Perlis' THEN suggested_zone := 'PLS01';
            WHEN 'Penang' THEN suggested_zone := 'PNG01';
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

-- Replace the existing trigger with the new validation function
DROP TRIGGER IF EXISTS validate_masjid_address_trigger ON public.masjids;
CREATE TRIGGER validate_masjid_address_with_zone_trigger
    BEFORE INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_masjid_address_with_zone();

-- Function to get masjids by JAKIM zone
CREATE OR REPLACE FUNCTION public.get_masjids_by_jakim_zone(target_zone VARCHAR(10))
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    address JSONB,
    jakim_zone_code VARCHAR(10),
    status masjid_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.address,
        m.jakim_zone_code,
        m.status
    FROM public.masjids m
    WHERE m.status = 'active'
      AND m.jakim_zone_code = target_zone
    ORDER BY m.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update prayer time config when zone code changes
CREATE OR REPLACE FUNCTION public.sync_prayer_time_config()
RETURNS TRIGGER AS $$
BEGIN
    -- Update prayer_time_config table when jakim_zone_code changes
    IF OLD.jakim_zone_code IS DISTINCT FROM NEW.jakim_zone_code THEN
        UPDATE prayer_time_config 
        SET zone_code = NEW.jakim_zone_code,
            updated_at = NOW()
        WHERE masjid_id = NEW.id;
        
        -- Create prayer_time_config if it doesn't exist
        IF NOT FOUND THEN
            INSERT INTO prayer_time_config (
                masjid_id,
                zone_code,
                location_name
            ) VALUES (
                NEW.id,
                NEW.jakim_zone_code,
                NEW.address->>'city' || ', ' || NEW.address->>'state'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync prayer time config when masjid zone code changes
CREATE TRIGGER sync_prayer_time_config_trigger
    AFTER INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_prayer_time_config();

-- Comments for documentation
COMMENT ON FUNCTION public.validate_masjid_address_with_zone() IS 'Validates Malaysian address and auto-suggests JAKIM zone code';
COMMENT ON FUNCTION public.get_masjids_by_jakim_zone(VARCHAR) IS 'Returns active masjids in a specific JAKIM prayer time zone';
COMMENT ON FUNCTION public.sync_prayer_time_config() IS 'Automatically updates prayer_time_config when masjid zone code changes';