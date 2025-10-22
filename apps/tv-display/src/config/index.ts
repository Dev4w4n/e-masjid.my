/**
 * Configuration exports for TV Display app
 * 
 * Note: Display-specific configuration (masjid, prayer times, settings) 
 * is fetched from database via display_id, not from environment variables.
 */
export { 
  API_CONFIG, 
  APP_ENV, 
  IS_DEVELOPMENT, 
  IS_PRODUCTION, 
  validateEnvironment,
  // Deprecated exports (kept for backward compatibility)
  DISPLAY_CONFIG,
  PRAYER_CONFIG,
  CONTENT_CONFIG
} from './env';