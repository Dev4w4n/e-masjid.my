-- Update Malaysian state enum to match JAKIM API names
-- This fixes the prayer zone dropdown being disabled for Penang and Malacca

-- Note: We can't add and immediately use enum values in the same transaction
-- So we'll just add the new values and let the application use them
-- The old values (Malacca, Penang) can coexist with new ones (Melaka, Pulau Pinang)

-- Add new enum values
DO $$ 
BEGIN
    -- Add Melaka if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Melaka' AND enumtypid = 'malaysian_state'::regtype) THEN
        ALTER TYPE malaysian_state ADD VALUE 'Melaka';
    END IF;
    
    -- Add Pulau Pinang if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Pulau Pinang' AND enumtypid = 'malaysian_state'::regtype) THEN
        ALTER TYPE malaysian_state ADD VALUE 'Pulau Pinang';
    END IF;
END $$;

-- Update setup script references
COMMENT ON TYPE malaysian_state IS 'Malaysian states - Now includes both old names (Malacca, Penang) and JAKIM API names (Melaka, Pulau Pinang). Applications should use the JAKIM names.';
