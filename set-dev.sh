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

echo -e "${BLUE}Reseting dev environment ...${NC}"
echo ""

# Run the setup-supabase.sh script with the --test flag
pnpm clean && pnpm install && pnpm build:clean && pnpm dev

echo ""
echo -e "${GREEN}Ready!${NC}"