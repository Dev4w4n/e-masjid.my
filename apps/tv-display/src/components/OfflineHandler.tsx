/**
 * OfflineHandler Component
 * 
 * Manages offline functionality, local storage caching, retry logic,
 * fallback content display, and network status detection for TV displays
 */

'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { DisplayContent, PrayerTimes, DisplayConfig, OfflineCache } from '@masjid-suite/shared-types';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastOnline: Date | null;
  connectionType: string | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface OfflineState {
  networkStatus: NetworkStatus;
  cacheStatus: {
    hasContent: boolean;
    hasPrayerTimes: boolean;
    hasConfig: boolean;
    lastSync: Date | null;
    cacheSize: number; // bytes
  };
  retryAttempts: {
    content: number;
    prayerTimes: number;
    config: number;
  };
  fallbackMode: boolean;
  syncInProgress: boolean;
}

interface OfflineContextValue {
  state: OfflineState;
  cached: {
    content: DisplayContent[] | null;
    prayerTimes: PrayerTimes | null;
    config: DisplayConfig | null;
  };
  actions: {
    updateCache: <T>(key: string, data: T, ttlHours?: number) => void;
    clearCache: (key?: string) => void;
    retrySync: () => Promise<void>;
    getCachedData: <T>(key: string) => T | null;
    setCachedData: <T>(key: string, data: T, ttlHours?: number) => void;
    isDataStale: (key: string) => boolean;
  };
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineHandlerProps {
  displayId: string;
  children: React.ReactNode;
  maxCacheAge?: number; // hours
  maxRetries?: number;
  retryDelay?: number; // seconds
  enableFallbackContent?: boolean;
}

export function OfflineHandler({
  displayId,
  children,
  maxCacheAge = 24,
  maxRetries = 5,
  retryDelay = 30,
  enableFallbackContent = true
}: OfflineHandlerProps) {
  const [state, setState] = useState<OfflineState>({
    networkStatus: {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSlowConnection: false,
      lastOnline: new Date(),
      connectionType: null
    },
    cacheStatus: {
      hasContent: false,
      hasPrayerTimes: false,
      hasConfig: false,
      lastSync: null,
      cacheSize: 0
    },
    retryAttempts: {
      content: 0,
      prayerTimes: 0,
      config: 0
    },
    fallbackMode: false,
    syncInProgress: false
  });

  const [cached, setCached] = useState<OfflineContextValue['cached']>({
    content: null,
    prayerTimes: null,
    config: null
  });

  // Initialize cache and network status
  useEffect(() => {
    loadCachedData();
    initializeNetworkMonitoring();
    checkCacheStatus();
  }, []);

  // Load cached data from localStorage
  const loadCachedData = useCallback(() => {
    try {
      const contentCache = localStorage.getItem(`display_cache_${displayId}_content`);
      const prayerTimesCache = localStorage.getItem(`display_cache_${displayId}_prayer_times`);
      const configCache = localStorage.getItem(`display_cache_${displayId}_config`);

      setCached({
        content: contentCache ? JSON.parse(contentCache).data : null,
        prayerTimes: prayerTimesCache ? JSON.parse(prayerTimesCache).data : null,
        config: configCache ? JSON.parse(configCache).data : null
      });

      setState(prev => ({
        ...prev,
        cacheStatus: {
          ...prev.cacheStatus,
          hasContent: !!contentCache,
          hasPrayerTimes: !!prayerTimesCache,
          hasConfig: !!configCache,
          lastSync: contentCache ? new Date(JSON.parse(contentCache).timestamp) : null
        }
      }));
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }, [displayId]);

  // Network status monitoring
  const initializeNetworkMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      
      setState(prev => ({
        ...prev,
        networkStatus: {
          ...prev.networkStatus,
          isOnline,
          lastOnline: isOnline ? new Date() : prev.networkStatus.lastOnline
        }
      }));
    };

    // Basic online/offline detection
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Connection speed detection (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateConnectionInfo = () => {
        setState(prev => ({
          ...prev,
          networkStatus: {
            ...prev.networkStatus,
            isSlowConnection: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g',
            connectionType: connection.effectiveType || 'unknown'
          }
        }));
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Check cache status and calculate size
  const checkCacheStatus = useCallback(() => {
    let totalSize = 0;
    const cacheKeys = [
      `display_cache_${displayId}_content`,
      `display_cache_${displayId}_prayer_times`,
      `display_cache_${displayId}_config`
    ];

    cacheKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    });

    setState(prev => ({
      ...prev,
      cacheStatus: {
        ...prev.cacheStatus,
        cacheSize: totalSize
      }
    }));
  }, [displayId]);

  // Cache management functions
  const updateCache = useCallback(<T,>(key: string, data: T, ttlHours: number = maxCacheAge) => {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + (ttlHours * 60 * 60 * 1000),
        version: '1.0'
      };

      const cacheKey = `display_cache_${displayId}_${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

      // Update cached state
      setCached(prev => ({
        ...prev,
        [key]: data
      }));

      checkCacheStatus();
    } catch (error) {
      console.error(`Failed to cache ${key}:`, error);
    }
  }, [displayId, maxCacheAge, checkCacheStatus]);

  const clearCache = useCallback((key?: string) => {
    try {
      if (key) {
        const cacheKey = `display_cache_${displayId}_${key}`;
        localStorage.removeItem(cacheKey);
        setCached(prev => ({
          ...prev,
          [key]: null
        }));
      } else {
        // Clear all cache for this display
        const cacheKeys = [
          `display_cache_${displayId}_content`,
          `display_cache_${displayId}_prayer_times`,
          `display_cache_${displayId}_config`
        ];
        cacheKeys.forEach(k => localStorage.removeItem(k));
        setCached({
          content: null,
          prayerTimes: null,
          config: null
        });
      }

      checkCacheStatus();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, [displayId, checkCacheStatus]);

  const getCachedData = useCallback(<T,>(key: string): T | null => {
    try {
      const cacheKey = `display_cache_${displayId}_${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheEntry.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.error(`Failed to get cached data for ${key}:`, error);
      return null;
    }
  }, [displayId]);

  const setCachedData = useCallback(<T,>(key: string, data: T, ttlHours: number = maxCacheAge) => {
    updateCache(key, data, ttlHours);
  }, [updateCache, maxCacheAge]);

  const isDataStale = useCallback((key: string): boolean => {
    try {
      const cacheKey = `display_cache_${displayId}_${key}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return true;

      const cacheEntry = JSON.parse(cached);
      const ageHours = (Date.now() - cacheEntry.timestamp) / (1000 * 60 * 60);
      
      return ageHours > (maxCacheAge / 2); // Consider stale if older than half the max age
    } catch (error) {
      return true;
    }
  }, [displayId, maxCacheAge]);

  // Retry mechanism with exponential backoff
  const retrySync = useCallback(async () => {
    if (state.syncInProgress || !state.networkStatus.isOnline) {
      return;
    }

    setState(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Try to fetch fresh data for each type
      const promises = [];

      if (state.retryAttempts.content < maxRetries) {
        promises.push(
          fetch(`/api/displays/${displayId}/content`)
            .then(res => res.json())
            .then(data => {
              updateCache('content', data.data);
              setState(prev => ({
                ...prev,
                retryAttempts: { ...prev.retryAttempts, content: 0 }
              }));
            })
            .catch(() => {
              setState(prev => ({
                ...prev,
                retryAttempts: { 
                  ...prev.retryAttempts, 
                  content: prev.retryAttempts.content + 1 
                }
              }));
            })
        );
      }

      if (state.retryAttempts.prayerTimes < maxRetries) {
        promises.push(
          fetch(`/api/displays/${displayId}/prayer-times`)
            .then(res => res.json())
            .then(data => {
              updateCache('prayerTimes', data.data);
              setState(prev => ({
                ...prev,
                retryAttempts: { ...prev.retryAttempts, prayerTimes: 0 }
              }));
            })
            .catch(() => {
              setState(prev => ({
                ...prev,
                retryAttempts: { 
                  ...prev.retryAttempts, 
                  prayerTimes: prev.retryAttempts.prayerTimes + 1 
                }
              }));
            })
        );
      }

      if (state.retryAttempts.config < maxRetries) {
        promises.push(
          fetch(`/api/displays/${displayId}/config`)
            .then(res => res.json())
            .then(data => {
              updateCache('config', data.data);
              setState(prev => ({
                ...prev,
                retryAttempts: { ...prev.retryAttempts, config: 0 }
              }));
            })
            .catch(() => {
              setState(prev => ({
                ...prev,
                retryAttempts: { 
                  ...prev.retryAttempts, 
                  config: prev.retryAttempts.config + 1 
                }
              }));
            })
        );
      }

      await Promise.allSettled(promises);

      setState(prev => ({
        ...prev,
        cacheStatus: {
          ...prev.cacheStatus,
          lastSync: new Date()
        }
      }));

    } catch (error) {
      console.error('Sync retry failed:', error);
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  }, [state, displayId, maxRetries, updateCache]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (state.networkStatus.isOnline && !state.syncInProgress) {
      const hasFailedRetries = Object.values(state.retryAttempts).some(attempts => attempts > 0);
      
      if (hasFailedRetries) {
        const timeout = setTimeout(retrySync, retryDelay * 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [state.networkStatus.isOnline, state.syncInProgress, state.retryAttempts, retrySync, retryDelay]);

  // Fallback mode detection
  useEffect(() => {
    const shouldEnterFallbackMode = 
      !state.networkStatus.isOnline || 
      Object.values(state.retryAttempts).some(attempts => attempts >= maxRetries);

    setState(prev => ({
      ...prev,
      fallbackMode: shouldEnterFallbackMode && enableFallbackContent
    }));
  }, [state.networkStatus.isOnline, state.retryAttempts, maxRetries, enableFallbackContent]);

  const contextValue: OfflineContextValue = {
    state,
    cached,
    actions: {
      updateCache,
      clearCache,
      retrySync,
      getCachedData,
      setCachedData,
      isDataStale
    }
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
      
      {/* Offline status indicator */}
      {!state.networkStatus.isOnline && (
        <div className="fixed top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            <span className="font-medium">Offline Mode</span>
          </div>
          <div className="text-sm opacity-90">
            Using cached content
          </div>
        </div>
      )}

      {/* Fallback mode indicator */}
      {state.fallbackMode && state.networkStatus.isOnline && (
        <div className="fixed top-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            <span className="font-medium">Limited Connectivity</span>
          </div>
          <div className="text-sm opacity-90">
            Retrying... ({Object.values(state.retryAttempts).reduce((a, b) => a + b, 0)}/{maxRetries * 3})
          </div>
        </div>
      )}

      {/* Sync in progress indicator */}
      {state.syncInProgress && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Syncing...</span>
          </div>
        </div>
      )}
    </OfflineContext.Provider>
  );
}

// Hook for using offline context
export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineHandler');
  }
  return context;
}

// Fallback content component
export function FallbackContent({ 
  message = "Content temporarily unavailable",
  showRetryButton = true 
}: { 
  message?: string; 
  showRetryButton?: boolean; 
}) {
  const { actions } = useOffline();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
      <div className="text-6xl mb-4">📡</div>
      <h2 className="text-2xl font-bold mb-4">Connection Issue</h2>
      <p className="text-lg text-gray-300 mb-6 text-center">{message}</p>
      
      {showRetryButton && (
        <button
          onClick={actions.retrySync}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Retry Connection
        </button>
      )}
      
      <div className="mt-8 text-sm text-gray-400 text-center">
        <p>Please check your internet connection</p>
        <p>Displaying cached content when available</p>
      </div>
    </div>
  );
}

export default OfflineHandler;