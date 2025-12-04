-- Force recreation of triggers to ensure new functions are used
-- This fixes persistent "operator does not exist: text ->> unknown" error

-- Drop all existing triggers on masjids table
DROP TRIGGER IF EXISTS validate_masjid_address_trigger ON public.masjids;
DROP TRIGGER IF EXISTS validate_masjid_address_with_zone_trigger ON public.masjids;
DROP TRIGGER IF EXISTS sync_prayer_time_config_trigger ON public.masjids;
DROP TRIGGER IF EXISTS update_masjids_updated_at ON public.masjids;
DROP TRIGGER IF EXISTS check_masjid_creator_role_trigger ON public.masjids;

-- Recreate the zone validation trigger with new function
CREATE TRIGGER validate_masjid_address_with_zone_trigger
    BEFORE INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_masjid_address_with_zone();

-- Fix sync_prayer_time_config function with explicit casting
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
                (NEW.address->>'city')::text || ', ' || (NEW.address->>'state')::text
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate sync trigger
CREATE TRIGGER sync_prayer_time_config_trigger
    AFTER INSERT OR UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_prayer_time_config();

-- Recreate updated_at trigger
CREATE TRIGGER update_masjids_updated_at 
    BEFORE UPDATE ON public.masjids 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate creator role validation trigger
CREATE TRIGGER check_masjid_creator_role_trigger
    BEFORE INSERT ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.check_masjid_creator_role();

-- Verify triggers are properly set
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgrelid = 'public.masjids'::regclass
    AND tgname IN (
        'validate_masjid_address_with_zone_trigger',
        'sync_prayer_time_config_trigger',
        'update_masjids_updated_at',
        'check_masjid_creator_role_trigger'
    );
    
    IF trigger_count = 4 THEN
        RAISE NOTICE 'All 4 triggers successfully created on masjids table';
    ELSE
        RAISE WARNING 'Expected 4 triggers but found %', trigger_count;
    END IF;
END $$;
