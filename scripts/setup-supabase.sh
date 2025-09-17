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
SERVICE_ROLE_KEY=$(supabase status 2>/dev/null | grep "service_role key:" | cut -d' ' -f3- | tr -d '[:space:]')
ANON_KEY=$(supabase status 2>/dev/null | grep "anon key:" | awk '{print $3}')
API_URL=$(supabase status 2>/dev/null | grep "API URL:" | awk '{print $3}')

if [ -z "$SERVICE_ROLE_KEY" ] || [ -z "$ANON_KEY" ] || [ -z "$API_URL" ]; then
    echo -e "${RED}Error: Could not retrieve Supabase configuration. Please ensure Supabase is running.${NC}"
    echo -e "${YELLOW}Run 'supabase status' to check the current state.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase configuration obtained${NC}"
echo -e "${BLUE}   • API URL: $API_URL${NC}"
echo -e "${BLUE}   • Anon Key: ${ANON_KEY:0:20}...${NC}"
echo -e "${BLUE}   • Service Role Key: ${SERVICE_ROLE_KEY:0:20}...${NC}"

# Function to create environment files
create_env_files() {
    local env_type="$1"
    local super_admin_email="$2"
    local super_admin_password="$3"
    local super_admin_id="$4"
    
    if [ "$env_type" = "development" ]; then
        ENV_FILE=".env.local"
        NODE_ENV="development"
        ENABLE_DEV_TOOLS="true"
        SHOW_LOGGER="true"
    else
        ENV_FILE=".env.test.local"
        NODE_ENV="test"
        ENABLE_DEV_TOOLS="false"
        SHOW_LOGGER="false"
    fi
    
    echo -e "${BLUE}Creating $ENV_FILE...${NC}"
    
    cat > "$ENV_FILE" << EOL
# Environment Variables for Masjid Suite
# Generated automatically by setup script on $(date)

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Browser-accessible Supabase variables (VITE_ prefix required for client-side access)
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=$NODE_ENV
VITE_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# ADMIN CONFIGURATION
# ===========================================
SUPER_ADMIN_EMAIL=$super_admin_email
SUPER_ADMIN_PASSWORD=$super_admin_password
EOL

    # Add admin ID if provided (for test environment)
    if [ -n "$super_admin_id" ]; then
        cat >> "$ENV_FILE" << EOL
SUPER_ADMIN_ID=$super_admin_id
EOL
    fi
    
    cat >> "$ENV_FILE" << EOL

# ===========================================
# DEVELOPMENT FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_DEV_TOOLS=$ENABLE_DEV_TOOLS
NEXT_PUBLIC_SHOW_LOGGER=$SHOW_LOGGER

# ===========================================
# OPTIONAL: OAUTH PROVIDERS
# ===========================================
# Google OAuth (optional)
# SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
# SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret

# ===========================================
# OPTIONAL: SMS PROVIDER
# ===========================================
# Twilio for SMS verification (optional)
# SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=your-twilio-auth-token
EOL

    # Add test-specific variables if this is a test environment
    if [ "$env_type" = "test" ]; then
        cat >> "$ENV_FILE" << EOL

# ===========================================
# TEST-SPECIFIC CONFIGURATION
# ===========================================
TEST_SUPER_ADMIN_EMAIL=$super_admin_email
TEST_SUPER_ADMIN_PASSWORD=$super_admin_password
TEST_SUPER_ADMIN_ID=$super_admin_id
EOL

        # Add additional test user IDs if provided
        if [ -n "$MASJID_ADMIN_ID" ]; then
            cat >> "$ENV_FILE" << EOL
TEST_MASJID_ADMIN_EMAIL=masjid.admin@test.com
TEST_MASJID_ADMIN_PASSWORD=TestPassword123!
TEST_MASJID_ADMIN_ID=$MASJID_ADMIN_ID
EOL
        fi
        
        if [ -n "$USER1_ID" ]; then
            cat >> "$ENV_FILE" << EOL
TEST_USER_EMAIL=user1@test.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_ID=$USER1_ID
EOL
        fi
    fi
    
    echo -e "${GREEN}✅ $ENV_FILE created successfully${NC}"
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
    TEST_DATA_TEMPLATE="apps/profile/tests/test-data.sql"
    TEST_DATA_FILE="apps/profile/tests/test-data-generated.sql"
    
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
    );
    
  -- Associate profiles with home masjids
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
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f "$TEST_DATA_FILE" 2>&1 | tee /tmp/psql_output.log
    
    # Check for errors
    if grep -q "ERROR" /tmp/psql_output.log; then
        echo -e "${RED}❌ Errors occurred while loading test data:${NC}"
        grep "ERROR" /tmp/psql_output.log
        exit 1
    fi
    
    echo -e "${GREEN}✅ Test data loaded successfully!${NC}"
    
    # Generate and store API keys for tests
    echo -e "${BLUE}5. Generating environment files...${NC}"
    
    # Create .env.test.local file with test credentials
    create_env_files "test" "super.admin@test.com" "TestPassword123!" "$SUPER_ADMIN_ID"
    
    # Also create a comprehensive .env.local for development
    create_env_files "development" "admin@e-masjid.my" "SuperAdmin123!" "$SUPER_ADMIN_ID"
    
    # Create app-specific .env file for profile app (backward compatibility)
    ENV_FILE="apps/profile/.env"
    cat > "$ENV_FILE" << EOL
# Test environment variables for profile app
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
TEST_SUPER_ADMIN_EMAIL=super.admin@test.com
TEST_SUPER_ADMIN_PASSWORD=TestPassword123!
TEST_SUPER_ADMIN_ID=$SUPER_ADMIN_ID
TEST_MASJID_ADMIN_EMAIL=masjid.admin@test.com
TEST_MASJID_ADMIN_PASSWORD=TestPassword123!
TEST_MASJID_ADMIN_ID=$MASJID_ADMIN_ID
TEST_USER_EMAIL=user1@test.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_ID=$USER1_ID
EOL
    
    echo -e "${GREEN}✅ All environment files created successfully${NC}"

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
                
                # Generate environment files
                echo -e "${BLUE}6. Generating environment files...${NC}"
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
    echo "   • Environment files created: .env.local, .env.test.local, and apps/profile/.env"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "   1. Run the unit tests with: cd apps/profile && npm run test"
    echo "   2. Check the environment files for credentials and configuration"
    echo "   3. If needed, review generated SQL in apps/profile/tests/test-data-generated.sql"
else
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "   • Database reset and migrations applied"
    echo "   • Super admin user created: admin@e-masjid.my"
    echo "   • Password: SuperAdmin123!"
    echo "   • User role: super_admin"
    echo "   • Environment files created: .env.local and .env.test.local"
    echo ""
    echo -e "${BLUE}🔗 Access Points:${NC}"
    echo "   • Supabase Studio: http://localhost:54323"
    echo "   • API URL: http://localhost:54321"
    echo "   • Database: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "   1. Open Supabase Studio: http://localhost:54323"
    echo "   2. Test creating additional users via Authentication > Users"
    echo "   3. Review the SETUP_GUIDE.md for detailed documentation"
    echo "   4. Start developing your application!"
fi

echo ""
echo -e "${YELLOW}💡 Tip: Run this script with the --test flag to load test data for unit tests${NC}"
