#!/bin/bash

# Super Admin Permissions Verification Script
# This script verifies that super_admin role has full access to all tables

set -e

echo "🔍 Verifying Super Admin Permissions..."
echo ""

# Database connection string
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Function to run SQL query
run_query() {
    psql "$DB_URL" -t -c "$1"
}

# Count total super_admin policies
echo "📊 Total super_admin policies:"
TOTAL=$(run_query "SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE '%super_admin%';")
echo "   Found: $TOTAL policies"
echo ""

# Check critical tables
echo "✅ Checking critical tables:"
echo ""

TABLES=("users" "masjids" "masjid_admins" "tv_displays" "display_content" "user_approvals" "admin_applications" "prayer_times" "prayer_time_config")

for table in "${TABLES[@]}"; do
    count=$(run_query "SELECT COUNT(*) FROM pg_policies WHERE tablename = '$table' AND policyname LIKE '%super_admin%';")
    echo "   📁 $table: $count super_admin policies"
done

echo ""
echo "🔐 Checking storage bucket policies:"
count=$(run_query "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND policyname LIKE '%super_admin%';")
echo "   📦 storage.objects: $count super_admin policies"

echo ""
echo "📋 Detailed policy breakdown by table:"
echo ""

psql "$DB_URL" -c "
SELECT 
    tablename, 
    COUNT(*) as policy_count,
    STRING_AGG(cmd::text, ', ') as operations
FROM pg_policies 
WHERE policyname LIKE '%super_admin%' 
GROUP BY tablename 
ORDER BY tablename;
"

echo ""
echo "✅ Verification complete!"
echo ""
echo "Expected: 52 total super_admin policies"
echo "Critical tables should have SELECT, INSERT, UPDATE, DELETE policies"
echo "Some tables may have 'ALL' policy which covers all operations"
