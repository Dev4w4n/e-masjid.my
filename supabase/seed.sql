-- Seed data for E-Masjid Suite
-- This file is used by both local development and Supabase cloud deployment
--
-- For local development: Use scripts/setup-supabase.sh which provides comprehensive test data
-- For cloud deployment: This file provides minimal essential data for staging/production

-- ============================================
-- CLOUD DEPLOYMENT SEED DATA
-- ============================================
-- This section runs automatically when Supabase deploys to preview branches

DO $$
DECLARE
  v_super_admin_id UUID;
  v_super_admin_email TEXT;
  v_environment TEXT;
BEGIN
  -- Detect environment from database name or use default
  -- Preview branches typically have branch names in the connection
  v_environment := COALESCE(current_setting('app.environment', true), 'staging');
  
  -- Set admin email based on environment
  IF v_environment = 'production' THEN
    v_super_admin_email := 'admin@emasjid.my';
  ELSE
    v_super_admin_email := 'staging-admin@emasjid.my';
  END IF;
  
  RAISE NOTICE 'Seeding data for % environment...', v_environment;
  
  -- Check if super admin already exists in auth.users
  SELECT id INTO v_super_admin_id 
  FROM auth.users 
  WHERE email = v_super_admin_email 
  LIMIT 1;
  
  -- If super admin exists, ensure their role is set correctly
  IF v_super_admin_id IS NOT NULL THEN
    RAISE NOTICE 'Super admin user already exists: %', v_super_admin_email;
    
    -- Update role in users table
    UPDATE public.users 
    SET role = 'super_admin',
        updated_at = NOW()
    WHERE id = v_super_admin_id;
    
    -- Ensure profile exists and is complete
    INSERT INTO public.profiles (
      user_id, full_name, preferred_language, is_complete
    ) VALUES (
      v_super_admin_id, 
      'Super Admin', 
      'en', 
      true
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET full_name = 'Super Admin',
        is_complete = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Super admin role and profile updated successfully';
  ELSE
    RAISE NOTICE 'No super admin user found in auth.users';
    RAISE NOTICE 'Please create the super admin user via Supabase Dashboard:';
    RAISE NOTICE '  Email: %', v_super_admin_email;
    RAISE NOTICE '  Then update their role with: UPDATE users SET role = ''super_admin'' WHERE email = ''%'';', v_super_admin_email;
  END IF;
  
  -- Add any static lookup data here (zones, configurations, etc.)
  -- Example:
  -- INSERT INTO prayer_zones (code, name, description) VALUES 
  --   ('WLY01', 'Kuala Lumpur', 'Federal Territory of Kuala Lumpur')
  -- ON CONFLICT (code) DO NOTHING;
  
  RAISE NOTICE 'Seed data completed for % environment', v_environment;
  RAISE NOTICE '====================================';
  RAISE NOTICE 'IMPORTANT: Create super admin user in Supabase Dashboard > Authentication';
  RAISE NOTICE 'Then run: UPDATE users SET role = ''super_admin'' WHERE email = ''%'';', v_super_admin_email;
  RAISE NOTICE '====================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error during seeding: %', SQLERRM;
    RAISE NOTICE 'This is expected if auth.users is not accessible or user does not exist yet';
    RAISE NOTICE 'Please create the super admin user manually via Supabase Dashboard';
END $$;