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

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}Warning: Could not automatically get service role key.${NC}"
    echo -e "${YELLOW}Please run the following command manually:${NC}"
    echo ""
    echo "supabase status"
    echo ""
    echo -e "${YELLOW}Then use the service_role key to create the super admin user:${NC}"
    echo ""
    echo 'curl -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \'
    echo '  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \'
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{'
    echo '    "email": "admin@e-masjid.my",'
    echo '    "password": "SuperAdmin123!",'
    echo '    "email_confirm": true'
    echo '  }'"'"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Service role key obtained${NC}"

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

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "   • Database reset and migrations applied"
echo "   • Super admin user created: admin@e-masjid.my"
echo "   • Password: SuperAdmin123!"
echo "   • User role: super_admin"
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
echo ""
echo -e "${YELLOW}💡 Tip: You can now create users directly in Supabase Studio!${NC}"
