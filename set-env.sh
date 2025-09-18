#!/bin/bash

# This script is a convenience wrapper to run the setup-supabase.sh script with the --test flag
# It helps set up the database with test data for running unit tests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Move to project root directory (script is already in root)
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}Error: supabase/config.toml not found. Please run this script from the project root or scripts directory.${NC}"
    exit 1
fi

echo -e "${BLUE}Setting up test environment for unit tests...${NC}"
echo ""

# Run the setup-supabase.sh script with the --test flag
scripts/setup-supabase.sh --test

echo ""
echo -e "${GREEN}Ready to run tests!${NC}"
echo -e "${YELLOW}You can now run the tests with: cd apps/profile && npm run test${NC}"