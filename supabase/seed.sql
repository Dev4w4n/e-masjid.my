-- Seed data for E-Masjid Suite
-- This will be automatically run when starting Supabase

-- Note: TV Display system data is now handled by the setup-supabase.sh script
-- This ensures proper dynamic ID assignment and relationship management

-- Basic seed data that doesn't require dynamic relationships can be added here
-- Complex relational data should be added via the setup script for proper ID management

-- You can add static lookup data, configuration values, or other data that
-- doesn't depend on dynamically generated UUIDs here

-- Example of static data that could go here:
-- INSERT INTO prayer_zones (code, name, description) VALUES 
--   ('WLY01', 'Kuala Lumpur', 'Federal Territory of Kuala Lumpur'),
--   ('JHR01', 'Pulau Aur dan Pulau Pemanggil', 'Johor zone 1');

DO $$
BEGIN
  RAISE NOTICE 'Basic seed data loaded. Complex relational data is handled by setup-supabase.sh script.';
END $$;