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
const safeProcessEnv: Record<string, string | undefined> | undefined =
  typeof globalThis !== 'undefined' &&
  'process' in globalThis &&
  (globalThis as any).process?.env
    ? ((globalThis as any).process.env as Record<string, string | undefined>)
    : undefined;

export const API_CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || safeProcessEnv?.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || safeProcessEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  jakimApiUrl: import.meta.env.VITE_JAKIM_API_URL || safeProcessEnv?.NEXT_PUBLIC_JAKIM_API_URL || 'https://www.e-solat.gov.my/index.php',
  baseApiUrl: import.meta.env.VITE_API_BASE_URL || safeProcessEnv?.NEXT_PUBLIC_API_BASE_URL || '',
} as const;

// Environment
export const APP_ENV = import.meta.env.VITE_APP_ENV || safeProcessEnv?.NEXT_PUBLIC_APP_ENV || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

// Validation helper - Only validates infrastructure config
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredVars.filter(
    varName => !(import.meta.env as Record<string, string | undefined>)[varName] || (import.meta.env as Record<string, string | undefined>)[varName] === ''
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