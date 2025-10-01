#!/bin/bash

# E-Masjid Suite Profile Module - Setup Script
# This script helps set up the database and create the initial super admin user

set -e

echo "🚀 Setting up E-Masjid Suite Profile Module..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command-line arguments
SETUP_TYPE="default"
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --test) SETUP_TYPE="test"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
done

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}Error: supabase/config.toml not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}1. Resetting Supabase database...${NC}"
supabase db reset

echo -e "${BLUE}2. Starting Supabase services...${NC}"
supabase start

# Get the service role key
echo -e "${BLUE}Getting service role key...${NC}"

# Get Supabase status to extract keys
SUPABASE_STATUS_OUTPUT=$(supabase status 2>/dev/null)

# Extract keys from status output (modern sb_ format)
SERVICE_ROLE_KEY=$(echo "$SUPABASE_STATUS_OUTPUT" | grep "Secret key:" | awk '{print $3}')
ANON_KEY=$(echo "$SUPABASE_STATUS_OUTPUT" | grep "Publishable key:" | awk '{print $3}')
API_URL=$(echo "$SUPABASE_STATUS_OUTPUT" | grep "API URL:" | awk '{print $3}')

# The modern keys are in sb_ format, but we need the underlying JWT tokens
# Let's extract the actual JWT from the config files
if [ -f "supabase/.temp/project-ref" ]; then
    PROJECT_REF=$(cat "supabase/.temp/project-ref" 2>/dev/null || echo "")
fi

# Try to get JWT keys from config
JWT_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
JWT_SERVICE_ROLE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

# Use the hardcoded JWT keys for local development
SERVICE_ROLE_KEY="$JWT_SERVICE_ROLE"
ANON_KEY="$JWT_ANON"

if [ -z "$SERVICE_ROLE_KEY" ] || [ -z "$ANON_KEY" ] || [ -z "$API_URL" ]; then
    echo -e "${RED}Error: Could not retrieve Supabase configuration. Please ensure Supabase is running.${NC}"
    echo -e "${YELLOW}Debug information:${NC}"
    echo "SERVICE_ROLE_KEY: '$SERVICE_ROLE_KEY'"
    echo "ANON_KEY: '$ANON_KEY'"
    echo "API_URL: '$API_URL'"
    exit 1
fi

echo -e "${GREEN}✅ Supabase configuration obtained${NC}"
echo -e "${BLUE}   • API URL: $API_URL${NC}"
echo -e "${BLUE}   • Anon Key: ${ANON_KEY:0:20}...${NC}"
echo -e "${BLUE}   • Service Role Key: ${SERVICE_ROLE_KEY:0:20}...${NC}"

# Function to create TV display test data
create_tv_display_data() {
    local test_user_id="$1"
    local masjid_admin_id="$2"
    
    echo -e "${BLUE}Creating TV display test data...${NC}"
    
    # First, fix the trigger function issue that's causing problems during seed data creation
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOSQL'
-- Fix the trigger function to not call another trigger function
CREATE OR REPLACE FUNCTION public.validate_masjid_address_with_zone()
RETURNS TRIGGER AS $$
DECLARE
    suggested_zone VARCHAR(10);
BEGIN
    -- Inline address validation instead of calling another trigger function
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
        RAISE EXCEPTION 'Invalid Malaysian postcode range';
    END IF;
    
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOSQL
    
    # Create TV display test data SQL
    cat > /tmp/tv_display_seed.sql << 'EOL'
-- TV Display System Seed Data with Dynamic IDs
-- This creates test data for the TV display system

DO $$
DECLARE
  test_masjid_id UUID;
  test_user_id UUID;
  masjid_admin_id UUID;
  display_1_id UUID;
  display_2_id UUID;
  content_1_id UUID;
  content_2_id UUID;
  content_3_id UUID;
BEGIN
  -- Get the first active masjid
  SELECT id INTO test_masjid_id 
  FROM masjids 
  WHERE status = 'active' 
  LIMIT 1;
  
  -- If no masjids exist, skip seeding
  IF test_masjid_id IS NULL THEN
    RAISE NOTICE 'No active masjids found - skipping TV display seed data.';
    RETURN;
  END IF;
  
  -- Get test users
  SELECT id INTO test_user_id 
  FROM users 
  WHERE email LIKE '%test.com' OR email = 'user1@test.com'
  LIMIT 1;
  
  SELECT id INTO masjid_admin_id 
  FROM users 
  WHERE email LIKE 'masjid.admin%' OR role = 'super_admin'
  LIMIT 1;
  
  -- Use super admin if no specific users found
  IF test_user_id IS NULL THEN
    SELECT id INTO test_user_id FROM users WHERE role = 'super_admin' LIMIT 1;
  END IF;
  
  IF masjid_admin_id IS NULL THEN
    SELECT id INTO masjid_admin_id FROM users WHERE role = 'super_admin' LIMIT 1;
  END IF;
  
  IF test_user_id IS NULL OR masjid_admin_id IS NULL THEN
    RAISE NOTICE 'No users found - skipping TV display seed data.';
    RETURN;
  END IF;

  -- Insert test TV displays
  -- First display with fixed UUID for contract tests
  INSERT INTO tv_displays (
    id, masjid_id, display_name, description, 
    resolution, orientation, carousel_interval, 
    prayer_time_position, is_active
  ) VALUES 
    (
      '550e8400-e29b-41d4-a716-446655440000'::uuid,
      test_masjid_id,
      'Contract Test Display',
      'Display specifically for contract testing',
      '1920x1080',
      'landscape',
      10,
      'top',
      true
    );

  -- Additional dynamic display  
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

  -- Insert test display content (without display_id column)
  INSERT INTO display_content (
    id, masjid_id, title, type, url, duration,
    status, submitted_by, start_date, end_date
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
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
    id, masjid_id, title, type, url, duration,
    status, submitted_by, start_date, end_date, sponsorship_amount
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
      'Friday Prayer Announcement',
      'text_announcement',
      'data:text/plain;base64,RnJpZGF5IFByYXllciBBbm5vdW5jZW1lbnQ=', -- "Friday Prayer Announcement"
      15,
      'active',
      masjid_admin_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days',
      50.00
    )
  RETURNING id INTO content_2_id;

  INSERT INTO display_content (
    id, masjid_id, title, type, url, duration,
    status, submitted_by, start_date, end_date, sponsorship_amount
  ) VALUES 
    (
      gen_random_uuid(),
      test_masjid_id,
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

  -- Insert display content assignments using the new many-to-many table
  -- Assign content_1 to all displays (available for all)
  INSERT INTO display_content_assignments (display_id, content_id, assigned_by) VALUES 
    (display_1_id, content_1_id, masjid_admin_id),
    (display_2_id, content_1_id, masjid_admin_id);

  -- Assign content_2 to all displays
  INSERT INTO display_content_assignments (display_id, content_id, assigned_by) VALUES 
    (display_1_id, content_2_id, masjid_admin_id),
    (display_2_id, content_2_id, masjid_admin_id);

  -- Assign content_3 only to main hall display
  INSERT INTO display_content_assignments (display_id, content_id, assigned_by) VALUES 
    (display_1_id, content_3_id, test_user_id);

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

  -- Insert prayer time configuration (only if not exists)
  INSERT INTO prayer_time_config (
    masjid_id, zone_code, location_name, latitude, longitude
  ) 
  SELECT 
    test_masjid_id,
    'WLY01',
    'Kuala Lumpur',
    3.139003,
    101.686855
  WHERE NOT EXISTS (
    SELECT 1 FROM prayer_time_config WHERE masjid_id = test_masjid_id
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
  RAISE NOTICE 'Associated with masjid: %', test_masjid_id;

END $$;
EOL
    
    # Execute the TV display seed data
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f /tmp/tv_display_seed.sql 2>&1 | tee /tmp/tv_display_output.log
    
    # Check for errors
    if grep -q "ERROR" /tmp/tv_display_output.log; then
        echo -e "${RED}❌ Errors occurred while loading TV display data:${NC}"
        grep "ERROR" /tmp/tv_display_output.log
        return 1
    fi
    
    # Clean up temporary file
    rm -f /tmp/tv_display_seed.sql /tmp/tv_display_output.log
    
    echo -e "${GREEN}✅ TV display test data created successfully!${NC}"
}

# Function to create environment files
create_env_files() {
    local env_type="$1"
    local super_admin_email="$2"
    local super_admin_password="$3"
    local super_admin_id="$4"
    
    if [ "$env_type" = "development" ]; then
        NODE_ENV="development"
        ENABLE_DEV_TOOLS="true"
        SHOW_LOGGER="true"
    else
        NODE_ENV="test"
        ENABLE_DEV_TOOLS="false"
        SHOW_LOGGER="false"
    fi
    
    # Skip creating root template file - it should not be auto-generated
    echo -e "${BLUE}Skipping .env.local.template update (preserving existing file)...${NC}"

    # Create Hub App .env.local
    local HUB_ENV_FILE="apps/hub/.env.local"
    echo -e "${BLUE}Creating $HUB_ENV_FILE...${NC}"
    
    cat > "$HUB_ENV_FILE" << EOL
# Environment Variables for Hub App (Vite + React)
# Generated automatically by setup script on $(date)

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Client-side variables (VITE_ prefix for client-side access)
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=$NODE_ENV
VITE_APP_URL=http://localhost:3000
VITE_TV_DISPLAY_BASE_URL=http://localhost:3001/display

# ===========================================
# ADMIN CONFIGURATION
# ===========================================
SUPER_ADMIN_EMAIL=$super_admin_email
SUPER_ADMIN_PASSWORD=$super_admin_password
EOL

    # Add admin ID if provided
    if [ -n "$super_admin_id" ]; then
        cat >> "$HUB_ENV_FILE" << EOL
SUPER_ADMIN_ID=$super_admin_id
EOL
    fi

    cat >> "$HUB_ENV_FILE" << EOL

# ===========================================
# DEVELOPMENT FLAGS
# ===========================================
VITE_ENABLE_DEV_TOOLS=$ENABLE_DEV_TOOLS
VITE_SHOW_LOGGER=$SHOW_LOGGER
EOL

    # Create TV Display App .env.local
    local TV_DISPLAY_ENV_FILE="apps/tv-display/.env.local"
    echo -e "${BLUE}Creating $TV_DISPLAY_ENV_FILE...${NC}"
    
    cat > "$TV_DISPLAY_ENV_FILE" << EOL
# Environment Variables for TV Display App (Next.js)
# Generated automatically by setup script on $(date)

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Next.js client-side variables (NEXT_PUBLIC_ prefix for Next.js client-side access)
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=$NODE_ENV
NEXT_PUBLIC_APP_URL=http://localhost:3001

# TV Display specific configuration
NEXT_PUBLIC_DISPLAY_NAME=Default TV Display
NEXT_PUBLIC_MASJID_ID=550e8400-e29b-41d4-a716-446655440000
NEXT_PUBLIC_FULLSCREEN_MODE=false
NEXT_PUBLIC_KIOSK_MODE=false
NEXT_PUBLIC_AUTO_REFRESH=true
NEXT_PUBLIC_REFRESH_INTERVAL=3600000
NEXT_PUBLIC_PRAYER_LOCATION=JOHOR
NEXT_PUBLIC_PRAYER_ZONE=JHR01
NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL=300000
NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL=60000
NEXT_PUBLIC_APP_ENV=$NODE_ENV

# ===========================================
# DEVELOPMENT FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_DEV_TOOLS=$ENABLE_DEV_TOOLS
NEXT_PUBLIC_SHOW_LOGGER=$SHOW_LOGGER
EOL

    # Add test-specific variables if this is a test environment
    if [ "$env_type" = "test" ]; then
        # Add test variables to hub app
        cat >> "$HUB_ENV_FILE" << EOL

# ===========================================
# TEST-SPECIFIC CONFIGURATION
# ===========================================
TEST_SUPER_ADMIN_EMAIL=$super_admin_email
TEST_SUPER_ADMIN_PASSWORD=$super_admin_password
TEST_SUPER_ADMIN_ID=$super_admin_id
EOL

        # Add additional test user IDs if provided
        if [ -n "$MASJID_ADMIN_ID" ]; then
            cat >> "$HUB_ENV_FILE" << EOL
TEST_MASJID_ADMIN_EMAIL=masjid.admin@test.com
TEST_MASJID_ADMIN_PASSWORD=TestPassword123!
TEST_MASJID_ADMIN_ID=$MASJID_ADMIN_ID
EOL
        fi
        
        if [ -n "$USER1_ID" ]; then
            cat >> "$HUB_ENV_FILE" << EOL
TEST_USER_EMAIL=user1@test.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_ID=$USER1_ID
EOL
        fi
        
        # Create .env.test.local for testing by copying the hub config
        local TEST_ENV_FILE=".env.test.local"
        cp "$HUB_ENV_FILE" "$TEST_ENV_FILE"
        echo -e "${GREEN}✅ $TEST_ENV_FILE created from hub app configuration${NC}"
    fi
    
    echo -e "${GREEN}✅ All environment files created successfully${NC}"
    echo -e "${BLUE}   • Hub app: $HUB_ENV_FILE${NC}"
    echo -e "${BLUE}   • TV Display app: $TV_DISPLAY_ENV_FILE${NC}"
}

if [ "$SETUP_TYPE" = "test" ]; then
    echo -e "${BLUE}3. Creating test auth users...${NC}"
    
    # Create super admin user
    SUPER_ADMIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "super.admin@test.com",
        "password": "TestPassword123!",
        "email_confirm": true
      }')
    
    if ! echo "$SUPER_ADMIN_RESPONSE" | grep -q '"id"'; then
        echo -e "${RED}❌ Failed to create super admin test user${NC}"
        echo "Response: $SUPER_ADMIN_RESPONSE"
        exit 1
    fi
    
    SUPER_ADMIN_ID=$(echo "$SUPER_ADMIN_RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✅ Super admin user created with ID: $SUPER_ADMIN_ID${NC}"
      
    # Create masjid admin user
    MASJID_ADMIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "masjid.admin@test.com",
        "password": "TestPassword123!",
        "email_confirm": true
      }')
    
    if ! echo "$MASJID_ADMIN_RESPONSE" | grep -q '"id"'; then
        echo -e "${RED}❌ Failed to create masjid admin test user${NC}"
        echo "Response: $MASJID_ADMIN_RESPONSE"
        exit 1
    fi
    
    MASJID_ADMIN_ID=$(echo "$MASJID_ADMIN_RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✅ Masjid admin user created with ID: $MASJID_ADMIN_ID${NC}"
      
    # Create regular user
    USER1_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "user1@test.com",
        "password": "TestPassword123!",
        "email_confirm": true
      }')
    
    if ! echo "$USER1_RESPONSE" | grep -q '"id"'; then
        echo -e "${RED}❌ Failed to create regular user${NC}"
        echo "Response: $USER1_RESPONSE"
        exit 1
    fi
    
    USER1_ID=$(echo "$USER1_RESPONSE" | jq -r '.id')
    echo -e "${GREEN}✅ Regular user created with ID: $USER1_ID${NC}"
    
    # Create more users
    USER2_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "user2@test.com",
        "password": "TestPassword123!",
        "email_confirm": true
      }')
    
    USER2_ID=$(echo "$USER2_RESPONSE" | jq -r '.id')
    
    USER3_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "user3@test.com",
        "password": "TestPassword123!",
        "email_confirm": false
      }')
    
    USER3_ID=$(echo "$USER3_RESPONSE" | jq -r '.id')
    
    INCOMPLETE_USER_RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "incompleteuser@test.com",
        "password": "TestPassword123!",
        "email_confirm": true
      }')
    
    INCOMPLETE_USER_ID=$(echo "$INCOMPLETE_USER_RESPONSE" | jq -r '.id')
    
    echo -e "${GREEN}✅ All test auth users created successfully!${NC}"
    
    echo -e "${BLUE}4. Creating dynamic test data SQL file...${NC}"
    
    # Generate the test data SQL with the actual user IDs
    TEST_DATA_TEMPLATE="apps/hub/tests/test-data.sql"
    TEST_DATA_FILE="apps/hub/tests/test-data-generated.sql"
    
    if [ ! -f "$TEST_DATA_TEMPLATE" ]; then
        echo -e "${RED}Error: Test data template file not found: $TEST_DATA_TEMPLATE${NC}"
        exit 1
    fi
    
    # Create a temporary SQL file with the actual IDs
    cat > "$TEST_DATA_FILE" << EOL
-- Generated test data SQL using actual user IDs
-- Generated on: $(date)

-- Update users table with roles
UPDATE public.users 
SET role = 'super_admin'
WHERE id = '$SUPER_ADMIN_ID';

-- Set other users to registered role first (they'll be promoted to masjid_admin by triggers)
UPDATE public.users 
SET role = 'registered'
WHERE id IN ('$MASJID_ADMIN_ID', '$USER1_ID', '$USER2_ID', '$USER3_ID', '$INCOMPLETE_USER_ID');

-- Update existing profiles (they were auto-created by triggers)
UPDATE public.profiles 
SET full_name = 'Super Admin', phone_number = '+60123456789', preferred_language = 'en', is_complete = true
WHERE user_id = '$SUPER_ADMIN_ID';

UPDATE public.profiles 
SET full_name = 'Masjid Admin', phone_number = '+60123456790', preferred_language = 'ms', is_complete = true
WHERE user_id = '$MASJID_ADMIN_ID';

UPDATE public.profiles 
SET full_name = 'Regular User 1', phone_number = '+60123456791', preferred_language = 'en', is_complete = true
WHERE user_id = '$USER1_ID';

UPDATE public.profiles 
SET full_name = 'Regular User 2', phone_number = '+60123456792', preferred_language = 'en', is_complete = true
WHERE user_id = '$USER2_ID';

UPDATE public.profiles 
SET full_name = 'Unverified User', phone_number = '+60123456793', preferred_language = 'zh', is_complete = true
WHERE user_id = '$USER3_ID';

UPDATE public.profiles 
SET full_name = 'Incomplete User', phone_number = NULL, preferred_language = 'en', is_complete = false
WHERE user_id = '$INCOMPLETE_USER_ID';

-- Add addresses for profiles
INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
SELECT 
  id, '123 Admin Street', 'Admin Tower', 'Kuala Lumpur', 'Kuala Lumpur', '50100', 'MYS', true
FROM public.profiles 
WHERE user_id = '$SUPER_ADMIN_ID';

INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
SELECT 
  id, '456 Masjid Road', 'Unit 7', 'Shah Alam', 'Selangor', '40100', 'MYS', true
FROM public.profiles 
WHERE user_id = '$MASJID_ADMIN_ID';

INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
SELECT 
  id, '789 User Lane', 'Apt 12', 'Subang Jaya', 'Selangor', '47500', 'MYS', true
FROM public.profiles 
WHERE user_id = '$USER1_ID';

INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
SELECT 
  id, '101 Test Avenue', NULL, 'Petaling Jaya', 'Selangor', '46000', 'MYS', true
FROM public.profiles 
WHERE user_id = '$USER2_ID';

INSERT INTO public.profile_addresses (
  profile_id, address_line_1, address_line_2, city, state, postcode, country, is_primary
)
SELECT 
  id, '202 Verify Road', 'Block B', 'Johor Bahru', 'Johor', '80100', 'MYS', true
FROM public.profiles 
WHERE user_id = '$USER3_ID';

-- Note: No address for incomplete user to keep them incomplete

-- Update profile completion status after addresses are added
UPDATE public.profiles 
SET is_complete = (
    full_name IS NOT NULL AND 
    length(trim(full_name)) > 0 AND
    phone_number IS NOT NULL AND
    EXISTS(
        SELECT 1 FROM public.profile_addresses 
        WHERE profile_id = profiles.id AND is_primary = true
    )
)
WHERE user_id IN ('$SUPER_ADMIN_ID', '$MASJID_ADMIN_ID', '$USER1_ID', '$USER2_ID', '$USER3_ID', '$INCOMPLETE_USER_ID');

  -- Create test masjids
INSERT INTO public.masjids (
  id, name, registration_number, email, phone_number, description, 
  address, status, created_by
)
VALUES
  (
    gen_random_uuid(), 
    'Masjid Al-Test', 
    'MSJ-TEST-001', 
    'admin@altest.com', 
    '+60312345678', 
    'Test mosque for unit tests',
    '{"address_line_1": "10 Masjid Lane", "city": "Kuala Lumpur", "state": "Kuala Lumpur", "postcode": "50100", "country": "MYS"}',
    'active',
    '$SUPER_ADMIN_ID'
  );

-- Store first masjid ID
DO \$\$
DECLARE
  first_masjid_id UUID;
BEGIN
  SELECT id INTO first_masjid_id FROM public.masjids WHERE name = 'Masjid Al-Test';
  
  -- Create second masjid
  INSERT INTO public.masjids (
    id, name, registration_number, email, phone_number, description, 
    address, status, created_by
  )
  VALUES
    (
      gen_random_uuid(), 
      'Masjid Unit-Test', 
      'MSJ-TEST-002', 
      'admin@unittest.com', 
      '+60312345679', 
      'Another test mosque',
      '{"address_line_1": "20 Testing Road", "city": "Shah Alam", "state": "Selangor", "postcode": "40100", "country": "MYS"}',
      'active',
      '$SUPER_ADMIN_ID'
    );
  
  -- Create third masjid
  INSERT INTO public.masjids (
    id, name, registration_number, email, phone_number, description, 
    address, status, created_by
  )
  VALUES
    (
      gen_random_uuid(), 
      'Masjid Pending', 
      'MSJ-TEST-003', 
      'admin@pending.com', 
      '+60312345680', 
      'Pending verification masjid',
      '{"address_line_1": "30 Pending Street", "city": "Ipoh", "state": "Perak", "postcode": "30000", "country": "MYS"}',
      'pending_verification',
      '$SUPER_ADMIN_ID'
    );  -- Associate profiles with home masjids
  UPDATE public.profiles 
  SET home_masjid_id = first_masjid_id
  WHERE user_id IN ('$MASJID_ADMIN_ID', '$USER1_ID');
  
  -- Get second masjid ID
  UPDATE public.profiles
  SET home_masjid_id = (SELECT id FROM public.masjids WHERE name = 'Masjid Unit-Test')
  WHERE user_id = '$USER2_ID';
  
  -- Create masjid admin assignments (only for users with complete profiles)
  INSERT INTO public.masjid_admins (
    user_id, masjid_id, status, approved_by, approved_at
  )
  SELECT
    '$MASJID_ADMIN_ID', 
    first_masjid_id,
    'active',
    '$SUPER_ADMIN_ID',
    NOW()
  WHERE EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = '$MASJID_ADMIN_ID' AND is_complete = true
  );
    
  -- Create another masjid admin assignment
  INSERT INTO public.masjid_admins (
    user_id, masjid_id, status, approved_by, approved_at
  )
  SELECT
    '$USER1_ID', 
    (SELECT id FROM public.masjids WHERE name = 'Masjid Unit-Test'),
    'active',
    '$SUPER_ADMIN_ID',
    NOW()
  WHERE EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = '$USER1_ID' AND is_complete = true
  );
    
  -- Create admin applications
  INSERT INTO public.admin_applications (
    user_id, masjid_id, application_message, status, review_notes, reviewed_by, reviewed_at
  )
  VALUES
    (
      '$USER2_ID', 
      first_masjid_id,
      'I would like to help manage this masjid. I am active in the community.',
      'pending',
      NULL,
      NULL,
      NULL
    );
    
  -- Create approved admin application
  INSERT INTO public.admin_applications (
    user_id, masjid_id, application_message, status, review_notes, reviewed_by, reviewed_at
  )
  VALUES
    (
      '$USER3_ID', 
      first_masjid_id,
      'Please consider my application to help manage this masjid.',
      'approved',
      'Approved based on community recommendation',
      '$SUPER_ADMIN_ID',
      NOW() - INTERVAL '7 days'
    );
    
  -- Create rejected admin application
  INSERT INTO public.admin_applications (
    user_id, masjid_id, application_message, status, review_notes, reviewed_by, reviewed_at
  )
  VALUES
    (
      '$USER1_ID', 
      (SELECT id FROM public.masjids WHERE name = 'Masjid Pending'),
      'I want to help manage this masjid.',
      'rejected',
      'Masjid is still pending verification',
      '$SUPER_ADMIN_ID',
      NOW() - INTERVAL '14 days'
    );
END \$\$;
EOL
    
    # Load generated test data into the database
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" << 'EOSQL'
-- Fix the trigger function to not call another trigger function
CREATE OR REPLACE FUNCTION public.validate_masjid_address_with_zone()
RETURNS TRIGGER AS $$
DECLARE
    suggested_zone VARCHAR(10);
BEGIN
    -- Inline address validation instead of calling another trigger function
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
        RAISE EXCEPTION 'Invalid Malaysian postcode range';
    END IF;
    
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the sync_prayer_time_config function to properly cast JSON values
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
                COALESCE((NEW.address->>'city')::text, '') || ', ' || COALESCE((NEW.address->>'state')::text, '')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOSQL
    
    # Load generated test data into the database
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f "$TEST_DATA_FILE" 2>&1 | tee /tmp/psql_output.log
    
    # Check for errors
    if grep -q "ERROR" /tmp/psql_output.log; then
        echo -e "${RED}❌ Errors occurred while loading test data:${NC}"
        grep "ERROR" /tmp/psql_output.log
        exit 1
    fi
    
    echo -e "${GREEN}✅ Test data loaded successfully!${NC}"
    
    # Create TV display test data
    create_tv_display_data "$USER1_ID" "$MASJID_ADMIN_ID"
    
    # Generate and store API keys for tests
    echo -e "${BLUE}5. Generating environment files...${NC}"
    
    # Create .env.test.local file with test credentials
    create_env_files "test" "super.admin@test.com" "TestPassword123!" "$SUPER_ADMIN_ID"
    
    # Also create a comprehensive development environment
    create_env_files "development" "admin@e-masjid.my" "SuperAdmin123!" "$SUPER_ADMIN_ID"

else
    # Default setup - create super admin user
    echo -e "${BLUE}3. Creating super admin user...${NC}"

    # Create super admin user
    RESPONSE=$(curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@e-masjid.my",
        "password": "SuperAdmin123!",
        "email_confirm": true
      }')

    # Check if user creation was successful
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}✅ Super admin user created successfully!${NC}"
        
        # Extract user ID
        USER_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null || echo "")
        
        if [ -n "$USER_ID" ]; then
            echo -e "${BLUE}4. Updating user role to super_admin...${NC}"
            
            # Update user role
            psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "
            UPDATE public.users 
            SET role = 'super_admin'
            WHERE id = '$USER_ID';
            
            UPDATE public.profiles 
            SET full_name = 'Super Admin',
                is_complete = true
            WHERE user_id = '$USER_ID';
            " >/dev/null
            
            echo -e "${GREEN}✅ User role updated to super_admin!${NC}"
            
            echo -e "${BLUE}5. Verifying setup...${NC}"
            
            # Verify the setup
            VERIFICATION=$(psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -t -c "
            SELECT 
                u.email,
                u.role,
                p.full_name
            FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
            WHERE u.email = 'admin@e-masjid.my';
            ")
            
            if echo "$VERIFICATION" | grep -q "super_admin"; then
                echo -e "${GREEN}✅ Setup verification successful!${NC}"
                
                # Create TV display test data for default setup
                echo -e "${BLUE}6. Creating sample TV display data...${NC}"
                create_tv_display_data "$USER_ID" "$USER_ID"
                
                # Generate environment files
                echo -e "${BLUE}7. Generating environment files...${NC}"
                create_env_files "development" "admin@e-masjid.my" "SuperAdmin123!" "$USER_ID"
                create_env_files "test" "admin@e-masjid.my" "SuperAdmin123!" "$USER_ID"
            else
                echo -e "${RED}❌ Setup verification failed!${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Could not extract user ID from response${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Failed to create super admin user${NC}"
        echo "Response: $RESPONSE"
        exit 1
    fi
fi

echo ""
if [ "$SETUP_TYPE" = "test" ]; then
    echo -e "${GREEN}🎉 Test setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "   • Database reset and migrations applied"
    echo "   • Test auth users created with dynamically generated IDs"
    echo "   • Test data generated and loaded with proper references"
    echo "   • TV display test data created"
    echo "   • Environment files created:"
    echo "     - .env.test.local (test configuration)"
    echo "     - apps/hub/.env.local (Hub app configuration)"
    echo "     - apps/tv-display/.env.local (TV Display app configuration)"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "   1. Start both applications: pnpm dev"
    echo "   2. Run the unit tests with: pnpm test"
    echo "   3. Check the environment files for credentials and configuration"
    echo "   4. If needed, review generated SQL in apps/hub/tests/test-data-generated.sql"
    echo ""
    echo -e "${BLUE}🔗 Application URLs:${NC}"
    echo "   • Hub App (Vite): http://localhost:3000"
    echo "   • TV Display App (Next.js): http://localhost:3001"
else
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "   • Database reset and migrations applied"
    echo "   • Super admin user created: admin@e-masjid.my"
    echo "   • Password: SuperAdmin123!"
    echo "   • User role: super_admin"
    echo "   • Environment files created:"
    echo "     - apps/hub/.env.local (Hub app configuration)"
    echo "     - apps/tv-display/.env.local (TV Display app configuration)"
    echo ""
    echo -e "${BLUE}🔗 Access Points:${NC}"
    echo "   • Hub App (Vite): http://localhost:3000"
    echo "   • TV Display App (Next.js): http://localhost:3001"
    echo "   • Supabase Studio: http://localhost:54323"
    echo "   • API URL: http://localhost:54321"
    echo "   • Database: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "   1. Start both applications: pnpm dev"
    echo "   2. Open Supabase Studio: http://localhost:54323"
    echo "   3. Test creating additional users via Authentication > Users"
    echo "   4. Review the SETUP_GUIDE.md for detailed documentation"
    echo "   5. Start developing your application!"
fi

echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • Run this script with the --test flag to load test data for unit tests"
echo "   • Both apps now use separate .env.local files for their specific configurations"
echo "   • The existing .env.local.template file serves as a reference for all available variables"
