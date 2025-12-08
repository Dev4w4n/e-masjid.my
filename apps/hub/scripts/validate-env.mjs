#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Hub App Environment Variables Validation ===\n');

// Check if .env.local exists and has required variables
const envPath = resolve(__dirname, '../.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  console.log('✅ .env.local file found');
  
  // Check for required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const foundVars = [];
  const missingVars = [];
  
  for (const variable of requiredVars) {
    if (envContent.includes(`${variable}=`)) {
      foundVars.push(variable);
    } else {
      missingVars.push(variable);
    }
  }
  
  console.log(`✅ Found variables: ${foundVars.join(', ')}`);
  if (missingVars.length > 0) {
    console.log(`❌ Missing variables: ${missingVars.join(', ')}`);
  }
  
  console.log('\n=== Vite Configuration Check ===');
  
  // Check vite.config.ts
  const viteConfigPath = resolve(__dirname, '../vite.config.ts');
  const viteConfig = readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('envPrefix')) {
    console.log('✅ envPrefix configuration found in vite.config.ts');
    const envPrefixMatch = viteConfig.match(/envPrefix:\s*\[(.*?)\]/s);
    if (envPrefixMatch) {
      console.log(`   Prefixes: ${envPrefixMatch[1]}`);
    }
  } else {
    console.log('❌ envPrefix configuration not found in vite.config.ts');
  }
  
  console.log('\n=== Recommendations ===');
  console.log('1. The hub app should now load environment variables from .env.local');
  console.log('2. Check browser console for environment variable values');
  console.log('3. If issues persist, restart the dev server');
  
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
}
