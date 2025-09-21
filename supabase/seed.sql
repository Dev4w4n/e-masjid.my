<<<<<<< HEAD
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
=======
-- Seed data for TV Display System
-- This will be automatically run when starting Supabase

-- Wait for user data to be created first
-- This should be run after users and masjids are created

-- Function to get first masjid ID (will be created by the test script)
DO $$
DECLARE
  test_masjid_id UUID;
  test_user_id UUID;
  display_1_id UUID;
  display_2_id UUID;
  content_1_id UUID;
  content_2_id UUID;
  content_3_id UUID;
BEGIN
  -- Get a test masjid ID - if none exists, create a minimal one
  SELECT id INTO test_masjid_id FROM masjids LIMIT 1;
  
  -- If no masjids exist, skip seeding (setup script will handle this)
  IF test_masjid_id IS NULL THEN
    RAISE NOTICE 'No masjids found - skipping TV display seed data. Run setup script first.';
    RETURN;
  END IF;
  
  -- Get a test user ID
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found - skipping TV display seed data. Run setup script first.';
    RETURN;
  END IF;

  -- Insert test TV displays
  INSERT INTO tv_displays (
    id, masjid_id, display_name, description, 
    resolution, orientation, carousel_interval, 
    prayer_time_position, is_active
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      'Main Hall Display',
      'Primary display for the main prayer hall',
      '1920x1080',
      'landscape',
      10,
      'top',
      true
    )
  RETURNING id INTO display_1_id;

  INSERT INTO tv_displays (
    id, masjid_id, display_name, description,
    resolution, orientation, carousel_interval,
    prayer_time_position, is_active
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      'Entrance Display',
      'Display at the mosque entrance',
      '1920x1080',
      'landscape',
      15,
      'center',
      true
    )
  RETURNING id INTO display_2_id;

  -- Insert test display content
  INSERT INTO display_content (
    id, masjid_id, display_id, title, type, url, duration,
    status, submitted_by, start_date, end_date
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      NULL, -- Available for all displays
      'Welcome to Our Masjid',
      'text_announcement',
      'data:text/plain;base64,V2VsY29tZSB0byBvdXIgbWFzamlk', -- "Welcome to our masjid" in base64
      10,
      'active',
      test_user_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days'
    )
  RETURNING id INTO content_1_id;

  INSERT INTO display_content (
    id, masjid_id, display_id, title, type, url, duration,
    status, submitted_by, start_date, end_date, sponsorship_amount
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      NULL,
      'Friday Prayer Announcement',
      'text_announcement',
      'data:text/plain;base64,RnJpZGF5IFByYXllciBBbm5vdW5jZW1lbnQ=', -- "Friday Prayer Announcement"
      15,
      'active',
      test_user_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days',
      50.00
    )
  RETURNING id INTO content_2_id;

  INSERT INTO display_content (
    id, masjid_id, display_id, title, type, url, duration,
    status, submitted_by, start_date, end_date, sponsorship_amount
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      display_1_id, -- Only for main hall display
      'Donation Information',
      'text_announcement',
      'data:text/plain;base64,U3VwcG9ydCBPdXIgTWFzamlk', -- "Support Our Masjid"
      12,
      'active',
      test_user_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '14 days',
      25.00
    )
  RETURNING id INTO content_3_id;

  -- Insert test prayer times
  INSERT INTO prayer_times (
    masjid_id, prayer_date, fajr_time, sunrise_time, dhuhr_time, 
    asr_time, maghrib_time, isha_time, source
  ) VALUES 
    (
      test_masjid_id,
      CURRENT_DATE,
      '05:45:00',
      '07:10:00',
      '13:15:00',
      '16:30:00',
      '19:20:00',
      '20:35:00',
      'MANUAL_ENTRY'
    ),
    (
      test_masjid_id,
      CURRENT_DATE + INTERVAL '1 day',
      '05:46:00',
      '07:11:00',
      '13:15:00',
      '16:29:00',
      '19:19:00',
      '20:34:00',
      'MANUAL_ENTRY'
    );

  -- Insert prayer time configuration
  INSERT INTO prayer_time_config (
    masjid_id, zone_code, location_name, latitude, longitude
  ) VALUES 
    (
      test_masjid_id,
      'WLY01',
      'Kuala Lumpur',
      3.139003,
      101.686855
    );

  -- Insert test sponsorships
  INSERT INTO sponsorships (
    content_id, masjid_id, sponsor_name, sponsor_email, amount, 
    tier, payment_method, payment_reference, payment_status
  ) VALUES 
    (
      content_2_id,
      test_masjid_id,
      'Local Islamic Bookstore',
      'contact@islamicbooks.com',
      50.00,
      'silver',
      'fpx',
      'TXN-001-TEST',
      'paid'
    ),
    (
      content_3_id,
      test_masjid_id,
      'Halal Restaurant',
      'info@halalrestaurant.com',
      25.00,
      'bronze',
      'bank_transfer',
      'TXN-002-TEST',
      'paid'
    );

  -- Insert display status
  INSERT INTO display_status (
    display_id, is_online, current_content_id, content_load_time, 
    api_response_time, uptime_percentage
  ) VALUES 
    (
      display_1_id,
      true,
      content_1_id,
      150,
      45,
      99.5
    ),
    (
      display_2_id,
      true,
      content_2_id,
      120,
      38,
      98.8
    );

  RAISE NOTICE 'TV Display seed data inserted successfully!';
  RAISE NOTICE 'Created displays: %, %', display_1_id, display_2_id;
  RAISE NOTICE 'Created content items: %, %, %', content_1_id, content_2_id, content_3_id;

>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
END $$;