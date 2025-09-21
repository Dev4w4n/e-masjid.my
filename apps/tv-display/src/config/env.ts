/**
 * TV Display Environment Configuration
 * Validates and provides typed access to environment variables
 */

// Display Configuration
export const DISPLAY_CONFIG = {
  name: process.env.NEXT_PUBLIC_DISPLAY_NAME || 'TV Display',
  masjidId: process.env.NEXT_PUBLIC_MASJID_ID || '',
  
  // TV Display Settings
  fullscreenMode: process.env.NEXT_PUBLIC_FULLSCREEN_MODE === 'true',
  kioskMode: process.env.NEXT_PUBLIC_KIOSK_MODE === 'true',
  autoRefresh: process.env.NEXT_PUBLIC_AUTO_REFRESH === 'true',
  refreshInterval: parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '3600000'),
} as const;

// API Configuration
export const API_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  jakimApiUrl: process.env.NEXT_PUBLIC_JAKIM_API_URL || 'https://www.e-solat.gov.my/index.php',
  baseApiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
} as const;

// Prayer Times Configuration
export const PRAYER_CONFIG = {
  location: process.env.NEXT_PUBLIC_PRAYER_LOCATION || 'JOHOR',
  zone: process.env.NEXT_PUBLIC_PRAYER_ZONE || 'JHR01',
  updateInterval: parseInt(process.env.NEXT_PUBLIC_PRAYER_UPDATE_INTERVAL || '300000'),
} as const;

// Content Configuration
export const CONTENT_CONFIG = {
  refreshInterval: parseInt(process.env.NEXT_PUBLIC_CONTENT_REFRESH_INTERVAL || '60000'),
} as const;

// Environment
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

// Validation helper
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_MASJID_ID',
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName] || process.env[varName] === ''
  );
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}