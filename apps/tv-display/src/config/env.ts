/**
 * TV Display Environment Configuration
 * 
 * IMPORTANT: TV Display configuration (masjid_id, prayer times, display settings, etc.)
 * is fetched dynamically from the database via /api/displays/[id]/config endpoint.
 * This file only contains infrastructure configuration (API endpoints, etc.)
 * 
 * Each TV display has a unique display_id in the URL which determines all its settings.
 */

// API Configuration - Required for connecting to backend services
export const API_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  jakimApiUrl: process.env.NEXT_PUBLIC_JAKIM_API_URL || 'https://www.e-solat.gov.my/index.php',
  baseApiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
} as const;

// Environment
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

// Validation helper - Only validates infrastructure config
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName] || process.env[varName] === ''
  );
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

// DEPRECATED: These exports are kept for backward compatibility but are not used.
// All display configuration comes from the database via display_id.
export const DISPLAY_CONFIG = {} as const;
export const PRAYER_CONFIG = {} as const;
export const CONTENT_CONFIG = {} as const;