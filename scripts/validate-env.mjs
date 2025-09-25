#!/usr/bin/env node

/**
 * Comprehensive environment variable validation script for Masjid Suite
 * This script validates environment variables across the entire turborepo workspace
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Masjid Suite Environment Variables Validation\n');

// Helper function to check if a file exists and read it
function readEnvFile(path) {
  try {
    if (!existsSync(path)) {
      return null;
    }
    return readFileSync(path, 'utf8');
  } catch (error) {
    return null;
  }
}

// Helper function to parse environment variables from content
function parseEnvVars(content) {
  if (!content) return {};
  
  const vars = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      vars[key.trim()] = valueParts.join('=').trim();
    }
  }
  
  return vars;
}

// Define required environment variables by category
const requiredVars = {
  supabase: {
    server: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    client: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
  },
  app: {
    server: ['SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD'],
    client: ['VITE_APP_URL'],
    universal: ['NODE_ENV'],
  },
};

// Check root .env.local file
console.log('📁 Checking environment files...');

// Check for template file
const rootTemplatePath = resolve(__dirname, '../.env.local.template');
const rootTemplateContent = readEnvFile(rootTemplatePath);

// Check for app-specific files
const hubEnvPath = resolve(__dirname, '../apps/hub/.env.local');
const hubEnvContent = readEnvFile(hubEnvPath);

const tvDisplayEnvPath = resolve(__dirname, '../apps/tv-display/.env.local');
const tvDisplayEnvContent = readEnvFile(tvDisplayEnvPath);

// Check if at least one valid configuration exists
if (!rootTemplateContent && !hubEnvContent && !tvDisplayEnvContent) {
  console.log('❌ No environment files found');
  console.log(`   Expected one of:`);
  console.log(`   - ${rootTemplatePath}`);
  console.log(`   - ${hubEnvPath}`);
  console.log(`   - ${tvDisplayEnvPath}`);
  console.log('   Please run the setup script: ./scripts/setup-supabase.sh\n');
  process.exit(1);
} 

// Use hub environment for validation if available, otherwise use template
let rootVars = {};
if (hubEnvContent) {
  rootVars = parseEnvVars(hubEnvContent);
  console.log('✅ Using Hub app .env.local for validation');
} else if (rootTemplateContent) {
  rootVars = parseEnvVars(rootTemplateContent);
  console.log('✅ Using .env.local.template for validation');
} else if (tvDisplayEnvContent) {
  rootVars = parseEnvVars(tvDisplayEnvContent);
  console.log('✅ Using TV Display app .env.local for validation');
}

// Report on file status
console.log('\n📋 Environment file status:');
console.log(`   Template file: ${rootTemplateContent ? '✅ Found' : '❌ Missing'}`);
console.log(`   Hub app .env.local: ${hubEnvContent ? '✅ Found' : '❌ Missing'}`);
console.log(`   TV Display app .env.local: ${tvDisplayEnvContent ? '✅ Found' : '❌ Missing'}`);

if (!hubEnvContent) {
  console.log('⚠️  Warning: Hub app .env.local not found - Hub app may not work properly');
}

if (!tvDisplayEnvContent) {
  console.log('⚠️  Warning: TV Display app .env.local not found - TV Display app may not work properly');
}

// Validate required variables
console.log('🔐 Validating required environment variables...');
let hasErrors = false;

function validateCategory(category, vars, prefix = '') {
  console.log(`\n${prefix}${category.charAt(0).toUpperCase() + category.slice(1)} Variables:`);
  
  for (const [subcategory, varList] of Object.entries(vars)) {
    console.log(`  ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}:`);
    
    for (const varName of varList) {
      const hasVar = rootVars.hasOwnProperty(varName);
      const hasValue = hasVar && rootVars[varName] && rootVars[varName].length > 0;
      
      if (hasValue) {
        console.log(`    ✅ ${varName}`);
      } else if (hasVar) {
        console.log(`    ⚠️  ${varName} (empty value)`);
        hasErrors = true;
      } else {
        console.log(`    ❌ ${varName} (missing)`);
        hasErrors = true;
      }
    }
  }
}

validateCategory('supabase', requiredVars.supabase);
validateCategory('application', requiredVars.app);

// Check Turbo configuration
console.log('\n🚀 Checking Turbo configuration...');
const turboConfigPath = resolve(__dirname, '../turbo.json');
const turboConfig = readEnvFile(turboConfigPath);

if (turboConfig) {
  try {
    const config = JSON.parse(turboConfig);
    
    if (config.globalEnv) {
      console.log('✅ globalEnv configuration found');
      console.log(`   Variables: ${config.globalEnv.join(', ')}`);
    } else {
      console.log('⚠️  globalEnv configuration missing');
    }
    
    if (config.globalDependencies && config.globalDependencies.includes('**/.env.*local')) {
      console.log('✅ globalDependencies includes .env files');
    } else {
      console.log('⚠️  globalDependencies missing .env files tracking');
    }
  } catch (e) {
    console.log('❌ Failed to parse turbo.json');
  }
} else {
  console.log('❌ turbo.json not found');
}

// Check Vite configuration
console.log('\n⚡ Checking Vite configuration...');
const viteConfigPath = resolve(__dirname, '../apps/hub/vite.config.ts');
const viteConfig = readEnvFile(viteConfigPath);

if (viteConfig) {
  if (viteConfig.includes('envPrefix')) {
    console.log('✅ envPrefix configuration found in hub app');
    const envPrefixMatch = viteConfig.match(/envPrefix:\s*\[(.*?)\]/s);
    if (envPrefixMatch) {
      console.log(`   Prefixes: ${envPrefixMatch[1]}`);
    }
  } else {
    console.log('⚠️  envPrefix configuration not found in hub app');
  }
} else {
  console.log('❌ Hub app vite.config.ts not found');
}

// Check supabase client configuration
console.log('\n🔗 Checking Supabase client configuration...');
const supabaseClientPath = resolve(__dirname, '../packages/supabase-client/src/index.ts');
const supabaseClient = readEnvFile(supabaseClientPath);

if (supabaseClient) {
  if (supabaseClient.includes('getEnvironmentVariables')) {
    console.log('✅ Environment variable access function found');
  } else {
    console.log('⚠️  Environment variable access pattern might be outdated');
  }
  
  if (supabaseClient.includes('import.meta.env') && supabaseClient.includes('process.env')) {
    console.log('✅ Both browser and Node.js environment support detected');
  } else {
    console.log('⚠️  Missing universal environment variable support');
  }
} else {
  console.log('❌ Supabase client not found');
}

// Security check
console.log('\n🔒 Security validation...');
const sensitivePrefixes = ['VITE_'];
const serverOnlyVars = ['SUPABASE_SERVICE_ROLE_KEY', 'SUPER_ADMIN_PASSWORD'];

for (const varName of serverOnlyVars) {
  const hasVitePrefix = sensitivePrefixes.some(prefix => varName.startsWith(prefix));
  if (hasVitePrefix) {
    console.log(`⚠️  Security risk: ${varName} has client-side prefix`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is server-only`);
  }
}

// Final summary
console.log('\n📋 Validation Summary:');
if (hasErrors) {
  console.log('❌ Issues found - please review the errors above');
  console.log('\n💡 Next steps:');
  console.log('1. Run the setup script: ./scripts/setup-supabase.sh');
  console.log('2. Or manually create app-specific .env.local files:');
  console.log('   - apps/hub/.env.local (for Hub app)');
  console.log('   - apps/tv-display/.env.local (for TV Display app)');
  console.log('3. Fill in missing environment variables');
  console.log('4. Ensure sensitive variables are not exposed to client');
  console.log('5. Run this script again to verify fixes');
  process.exit(1);
} else {
  console.log('✅ All environment variables are properly configured!');
  console.log('\n🎉 Your turborepo environment setup is ready for development');
  console.log('\n📱 Application URLs:');
  console.log('   • Hub App (Vite): http://localhost:3000');
  console.log('   • TV Display App (Next.js): http://localhost:3001');
}

console.log('\n📚 For more information, see ENVIRONMENT_VARIABLES.md');
