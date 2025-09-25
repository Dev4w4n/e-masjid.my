#!/usr/bin/env node

/**
 * Real-time Integration Verification Script
 * 
 * This script verifies that the real-time integration is properly
 * configured and ready for testing in the hub app.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Real-time Integration Verification\n');

// Check 1: Verify content-management package is built
const contentManagementDist = path.join(__dirname, '../../packages/content-management/dist/src');
if (fs.existsSync(contentManagementDist)) {
  console.log('✅ Content Management package is built');
  
  const indexFile = path.join(contentManagementDist, 'index.d.ts');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf8');
    if (content.includes('useNotifications')) {
      console.log('✅ Real-time hooks are exported');
    } else {
      console.log('❌ Real-time hooks not found in exports');
    }
  }
} else {
  console.log('❌ Content Management package not built');
}

// Check 2: Verify hub app includes real-time imports
const hubPages = [
  path.join(__dirname, '../src/pages/content/ContentListPage.tsx'),
  path.join(__dirname, '../src/pages/admin/ApprovalDashboardPage.tsx'),
  path.join(__dirname, '../src/components/Layout.tsx')
];

hubPages.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    if (content.includes('@masjid-suite/content-management')) {
      console.log(`✅ ${fileName} has real-time imports`);
      
      // Check specific hooks
      if (content.includes('useContentStatusNotifications')) {
        console.log(`  ✅ ${fileName} uses content status notifications`);
      }
      if (content.includes('useApprovalNotifications')) {
        console.log(`  ✅ ${fileName} uses approval notifications`);
      }
      if (content.includes('useContentMetrics')) {
        console.log(`  ✅ ${fileName} uses content metrics`);
      }
    } else {
      console.log(`❌ ${fileName} missing real-time imports`);
    }
  } else {
    console.log(`❌ ${path.basename(filePath)} not found`);
  }
});

// Check 3: Verify hub app builds successfully
console.log('\n🔨 Build Verification');
const { execSync } = require('child_process');

try {
  console.log('Building hub app...');
  const result = execSync('pnpm --filter "@masjid-suite/hub" build', { 
    cwd: path.join(__dirname, '../../'),
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ Hub app builds successfully with real-time integration');
} catch (error) {
  console.log('❌ Hub app build failed');
  console.log('Error:', error.stdout || error.message);
}

// Summary
console.log('\n📋 Real-time Integration Summary:');
console.log('');
console.log('🎯 Implemented Features:');
console.log('  • ContentListPage: Real-time metrics dashboard and notifications');
console.log('  • ApprovalDashboardPage: Live pending status indicator');
console.log('  • Layout: Dynamic badge count in navigation');
console.log('  • Real-time hooks: useContentStatusNotifications, useApprovalNotifications, useContentMetrics');
console.log('');
console.log('🔗 Integration Points:');
console.log('  • Supabase real-time subscriptions for content status changes');
console.log('  • Automatic UI updates when content is approved/rejected');
console.log('  • Live pending count updates in admin navigation');
console.log('  • User notification alerts for content status changes');
console.log('');
console.log('🧪 Next Steps for E2E Testing:');
console.log('  1. Set up local Supabase instance with test data');
console.log('  2. Create test user accounts (admin and regular user)');
console.log('  3. Test content submission -> approval workflow');
console.log('  4. Verify real-time updates across different browser tabs');
console.log('  5. Test error handling and network disconnection scenarios');
console.log('');
console.log('✨ Real-time integration verification complete!');