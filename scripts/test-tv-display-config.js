#!/usr/bin/env node
/**
 * TV Display URL Configuration Test Script
 * 
 * This script verifies that the new TV display URL configuration works correctly
 * in both development and production environments.
 */

const path = require('path');

// Add the project root to the Node.js module resolution path
const projectRoot = path.resolve(__dirname, '..');
require('module').globalPaths.unshift(path.join(projectRoot, 'node_modules'));

// Test different environment scenarios
function testConfiguration() {
  console.log('🔧 Testing TV Display URL Configuration...\n');

  // Test 1: Development environment (current setup)
  console.log('📍 Test 1: Development Environment');
  process.env.NODE_ENV = 'development';
  process.env.NEXT_PUBLIC_TV_DISPLAY_URL = 'http://localhost:3001/display';
  
  try {
    const config = require('../packages/shared-types/dist/config.js');
    
    const baseUrl = config.getTvDisplayUrl();
    const displayUrl = config.getTvDisplayUrlForDisplay('test-display-123');
    
    console.log('✅ Base URL:', baseUrl);
    console.log('✅ Display URL:', displayUrl);
    
    // Verify URLs are correct for development
    if (baseUrl === 'http://localhost:3001/display' && 
        displayUrl === 'http://localhost:3001/display/test-display-123') {
      console.log('✅ Development URLs are correct!\n');
    } else {
      console.log('❌ Development URLs are incorrect!\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error loading configuration:', error.message, '\n');
    return false;
  }

  // Test 2: Production environment simulation
  console.log('📍 Test 2: Production Environment (simulated)');
  process.env.NODE_ENV = 'production';
  delete process.env.NEXT_PUBLIC_TV_DISPLAY_URL; // Force fallback to production default
  
  try {
    // Clear require cache to reload the module with new environment
    delete require.cache[require.resolve('../packages/shared-types/dist/config.js')];
    const config = require('../packages/shared-types/dist/config.js');
    
    const baseUrl = config.getTvDisplayUrl();
    const displayUrl = config.getTvDisplayUrlForDisplay('test-display-123');
    
    console.log('✅ Base URL:', baseUrl);
    console.log('✅ Display URL:', displayUrl);
    
    // Verify URLs fallback to production
    if (baseUrl === 'https://tv.emasjid.my/display' && 
        displayUrl === 'https://tv.emasjid.my/display/test-display-123') {
      console.log('✅ Production URLs are correct!\n');
    } else {
      console.log('❌ Production URLs are incorrect!\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error loading configuration:', error.message, '\n');
    return false;
  }

  // Test 3: Custom environment variable
  console.log('📍 Test 3: Custom Environment Variable');
  process.env.NODE_ENV = 'development';
  process.env.NEXT_PUBLIC_TV_DISPLAY_URL = 'https://custom.tv.example.com/display';
  
  try {
    delete require.cache[require.resolve('../packages/shared-types/dist/config.js')];
    const config = require('../packages/shared-types/dist/config.js');
    
    const baseUrl = config.getTvDisplayUrl();
    const displayUrl = config.getTvDisplayUrlForDisplay('test-display-123');
    
    console.log('✅ Base URL:', baseUrl);
    console.log('✅ Display URL:', displayUrl);
    
    if (baseUrl === 'https://custom.tv.example.com/display' && 
        displayUrl === 'https://custom.tv.example.com/display/test-display-123') {
      console.log('✅ Custom environment variable works!\n');
    } else {
      console.log('❌ Custom environment variable failed!\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error loading configuration:', error.message, '\n');
    return false;
  }

  return true;
}

// Test configuration availability
function testConfigurationAvailability() {
  console.log('📦 Testing Configuration Package Availability...\n');
  
  try {
    const config = require('../packages/shared-types/dist/config.js');
    const availableFunctions = Object.keys(config);
    
    console.log('✅ Available functions:', availableFunctions.join(', '));
    
    const requiredFunctions = [
      'getTvDisplayUrl',
      'getTvDisplayUrlForDisplay', 
      'getHubUrl',
      'getPublicUrl',
      'APP_CONFIG'
    ];
    
    const missingFunctions = requiredFunctions.filter(fn => !availableFunctions.includes(fn));
    
    if (missingFunctions.length === 0) {
      console.log('✅ All required functions are available!\n');
      return true;
    } else {
      console.log('❌ Missing functions:', missingFunctions.join(', '), '\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Configuration package not available:', error.message, '\n');
    return false;
  }
}

// Main test execution
function runTests() {
  console.log('🚀 Open E Masjid TV Display URL Configuration Tests\n');
  
  const availabilityTest = testConfigurationAvailability();
  if (!availabilityTest) {
    console.log('💥 Configuration package tests failed. Please run `pnpm run build:clean` first.');
    process.exit(1);
  }
  
  const configTest = testConfiguration();
  if (!configTest) {
    console.log('💥 Configuration tests failed.');
    process.exit(1);
  }
  
  console.log('🎉 All tests passed! TV Display URL configuration is working correctly.');
  console.log('\n📋 Summary:');
  console.log('   • Development: Links point to localhost:3001');
  console.log('   • Production: Links point to tv.emasjid.my');
  console.log('   • Environment variables override defaults');
  console.log('   • All apps use the same shared configuration\n');
  
  console.log('🔗 Next Steps:');
  console.log('   1. Start your apps with `pnpm dev`');
  console.log('   2. Click any "Paparan TV" link in the hub app');
  console.log('   3. Verify it opens the correct localhost URL');
  console.log('   4. For production, set NEXT_PUBLIC_TV_DISPLAY_URL to production URL\n');
}

if (require.main === module) {
  runTests();
}

module.exports = { testConfiguration, testConfigurationAvailability };