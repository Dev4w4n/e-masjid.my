/**
 * Shared Configuration for Cross-App URLs
 * 
 * This module provides environment-aware configuration for TV display URLs
 * and other cross-app navigation. Works with both Vite (hub) and Next.js (public) apps.
 */

// Type guard for Vite environment
function hasViteEnv(): boolean {
  try {
    return typeof import.meta !== 'undefined' && 
           typeof (import.meta as any).env !== 'undefined';
  } catch {
    return false;
  }
}

// Safe getter for Vite environment variables
function getViteEnv(key: string): string | undefined {
  try {
    if (hasViteEnv()) {
      return (import.meta as any).env[key];
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

/**
 * Get the appropriate TV display URL based on environment
 * Supports both local development and production
 */
export function getTvDisplayUrl(): string {
  // For browser environments (client-side)
  if (typeof window !== 'undefined') {
    // Vite app (hub) - uses VITE_ prefix
    const viteUrl = getViteEnv('VITE_TV_DISPLAY_BASE_URL');
    if (viteUrl) {
      return viteUrl;
    }
    
    // Next.js app (public) - uses NEXT_PUBLIC_ prefix
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TV_DISPLAY_URL) {
      return process.env.NEXT_PUBLIC_TV_DISPLAY_URL;
    }
  }
  
  // For server environments (SSR/Node.js)
  if (typeof process !== 'undefined' && process.env) {
    // Check Next.js public variable first
    if (process.env.NEXT_PUBLIC_TV_DISPLAY_URL) {
      return process.env.NEXT_PUBLIC_TV_DISPLAY_URL;
    }
    
    // Fallback to Vite variable (for build/dev tools)
    if (process.env.VITE_TV_DISPLAY_BASE_URL) {
      return process.env.VITE_TV_DISPLAY_BASE_URL;
    }
  }
  
  return getDefaultTvDisplayUrl();
}

/**
 * Get default TV display URL based on environment detection
 */
function getDefaultTvDisplayUrl(): string {
  // Try to detect environment
  const isProduction = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
  
  if (isProduction) {
    return 'https://tv.emasjid.my/display';
  } else {
    return 'http://localhost:3001/display';
  }
}

/**
 * Get full TV display URL for a specific display ID
 */
export function getTvDisplayUrlForDisplay(displayId: string): string {
  const baseUrl = getTvDisplayUrl();
  return `${baseUrl}/${displayId}`;
}

/**
 * Get the hub app URL based on environment
 */
export function getHubUrl(): string {
  // For browser environments
  if (typeof window !== 'undefined') {
    // Vite app internal navigation
    const viteAppUrl = getViteEnv('VITE_APP_URL');
    if (viteAppUrl) {
      return viteAppUrl;
    }
    
    // Next.js app cross-navigation
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_HUB_URL) {
      return process.env.NEXT_PUBLIC_HUB_URL;
    }
  }
  
  // For server environments
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_HUB_URL) {
      return process.env.NEXT_PUBLIC_HUB_URL;
    }
    if (process.env.VITE_APP_URL) {
      return process.env.VITE_APP_URL;
    }
  }
  
  return 'http://localhost:3000';
}

/**
 * Get the public app URL based on environment
 */
export function getPublicUrl(): string {
  // For browser environments
  if (typeof window !== 'undefined') {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
  }
  
  // For server environments
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  return 'http://localhost:3002';
}

/**
 * Configuration object with all app URLs
 */
export const APP_CONFIG = {
  tvDisplay: {
    getUrl: getTvDisplayUrl,
    getDisplayUrl: getTvDisplayUrlForDisplay,
  },
  hub: {
    getUrl: getHubUrl,
  },
  public: {
    getUrl: getPublicUrl,
  },
} as const;

export default APP_CONFIG;