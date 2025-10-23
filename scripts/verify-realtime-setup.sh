#!/bin/bash

# Real-time Updates Verification Script
# This script helps verify that real-time updates are properly configured

set -e

echo "=========================================="
echo "Real-time Updates Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase is running
echo "1. Checking Supabase status..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found${NC}"
    echo "  Please install: https://supabase.com/docs/guides/cli"
    exit 1
fi

if ! supabase status &> /dev/null; then
    echo -e "${RED}✗ Supabase is not running${NC}"
    echo "  Start with: supabase start"
    exit 1
fi

echo -e "${GREEN}✓ Supabase is running${NC}"
echo ""

# Check real-time configuration
echo "2. Checking real-time configuration..."
REALTIME_ENABLED=$(grep -A 2 "\[realtime\]" supabase/config.toml | grep "enabled" | grep "true" || echo "")

if [ -z "$REALTIME_ENABLED" ]; then
    echo -e "${RED}✗ Real-time not enabled in config.toml${NC}"
    echo "  Please enable real-time in supabase/config.toml"
    exit 1
fi

echo -e "${GREEN}✓ Real-time is enabled in config${NC}"
echo ""

# Check if migration exists
echo "3. Checking real-time migration..."
if [ ! -f "supabase/migrations/025_enable_realtime_for_tv_displays.sql" ]; then
    echo -e "${RED}✗ Real-time migration not found${NC}"
    echo "  Missing: supabase/migrations/025_enable_realtime_for_tv_displays.sql"
    exit 1
fi

echo -e "${GREEN}✓ Real-time migration found${NC}"
echo ""

# Check if tables are in publication
echo "4. Verifying real-time publication..."
PUBLICATION_CHECK=$(supabase db exec "
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('tv_displays', 'display_content');
" 2>/dev/null || echo "error")

if [ "$PUBLICATION_CHECK" = "error" ]; then
    echo -e "${YELLOW}⚠ Could not verify publication (database might not be initialized)${NC}"
    echo "  Run: supabase db reset"
elif echo "$PUBLICATION_CHECK" | grep -q "tv_displays" && echo "$PUBLICATION_CHECK" | grep -q "display_content"; then
    echo -e "${GREEN}✓ Tables are in real-time publication${NC}"
    echo "  - tv_displays: enabled"
    echo "  - display_content: enabled"
else
    echo -e "${RED}✗ Tables not in real-time publication${NC}"
    echo "  Run: supabase db reset"
    echo "  Or: supabase migration up"
fi
echo ""

# Check replica identity
echo "5. Checking replica identity..."
REPLICA_CHECK=$(supabase db exec "
SELECT tablename, 
       CASE 
         WHEN relreplident = 'f' THEN 'FULL'
         WHEN relreplident = 'd' THEN 'DEFAULT'
         WHEN relreplident = 'n' THEN 'NOTHING'
         WHEN relreplident = 'i' THEN 'INDEX'
       END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('tv_displays', 'display_content');
" 2>/dev/null || echo "error")

if [ "$REPLICA_CHECK" != "error" ]; then
    if echo "$REPLICA_CHECK" | grep -q "FULL"; then
        echo -e "${GREEN}✓ Replica identity set to FULL${NC}"
    else
        echo -e "${YELLOW}⚠ Replica identity not set to FULL${NC}"
        echo "  This might affect real-time payload data"
    fi
else
    echo -e "${YELLOW}⚠ Could not check replica identity${NC}"
fi
echo ""

# Check for required packages
echo "6. Checking implementation files..."
FILES=(
    "apps/tv-display/src/app/display/[id]/page.tsx"
    "apps/tv-display/src/components/ContentCarousel.tsx"
    "apps/tv-display/src/lib/services/enhanced-supabase.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if file contains real-time subscription code
        if grep -q "subscribeToDisplayChanges\|subscribeToContentChanges" "$file" 2>/dev/null; then
            echo -e "${GREEN}✓ $file (with subscriptions)${NC}"
        else
            echo -e "${YELLOW}⚠ $file (no subscriptions found)${NC}"
        fi
    else
        echo -e "${RED}✗ $file (not found)${NC}"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="

if [ "$ALL_FILES_EXIST" = true ] && [ ! -z "$REALTIME_ENABLED" ]; then
    echo -e "${GREEN}✓ Real-time updates implementation looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the development servers:"
    echo "   pnpm dev"
    echo ""
    echo "2. Test the real-time updates:"
    echo "   - Open TV Display: http://localhost:3001/display/{displayId}"
    echo "   - Open Hub App: http://localhost:3000"
    echo "   - Make changes in Hub App"
    echo "   - Observe immediate updates in TV Display"
    echo ""
    echo "3. Check browser console for real-time logs:"
    echo "   - Look for: '[DisplayPage] Setting up real-time subscriptions'"
    echo "   - Look for: '[ContentCarousel] Content updated via real-time'"
else
    echo -e "${RED}✗ Some issues found${NC}"
    echo ""
    echo "Please fix the issues above and run this script again"
fi
echo ""

exit 0
