/**
 * TV Display Performance Integration
 * 
 * Main integration point for performance optimizations in the TV display application.
 * Combines all performance features into a cohesive system.
 */

import { useEffect } from 'react';
import { performanceMonitor } from './performance-monitor';
import { cacheManager } from './cache-manager';
import { getPerformanceConfig } from './performance-config';
<<<<<<< HEAD
import { usePerformance, type PerformanceHookReturn } from './use-performance';
=======
import { usePerformance } from './use-performance';
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)

// Initialize performance system
export const initializePerformanceSystem = () => {
  const config = getPerformanceConfig(process.env.NODE_ENV as 'development' | 'production' | 'test');
  
  console.log('🚀 Initializing TV Display Performance System');
  
  // Start performance monitoring
  if (config.enablePerformanceMonitoring) {
    performanceMonitor.startMonitoring();
  }
  
  // Setup global error handling
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      performanceMonitor.recordMetric(
        'global-error',
        1,
        'count',
        'user-interaction'
      );
      console.error('Global error caught:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      performanceMonitor.recordMetric(
        'unhandled-promise-rejection',
        1,
        'count',
        'user-interaction'
      );
      console.error('Unhandled promise rejection:', event.reason);
    });
  }
  
  // Setup service worker for caching (if enabled)
  if (config.enableServiceWorker && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.warn('❌ Service Worker registration failed:', error);
      });
  }
  
  // Setup periodic optimization
  setInterval(() => {
    const cacheOptimization = cacheManager.optimize();
    console.log('🔧 Periodic optimization:', cacheOptimization);
  }, 5 * 60 * 1000); // Every 5 minutes
  
  return config;
};

// React hook for TV display performance optimization
<<<<<<< HEAD
export const useTVDisplayPerformance = (): PerformanceHookReturn => {
=======
export const useTVDisplayPerformance = () => {
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
  const performance = usePerformance({
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableMemoization: true,
    trackComponentMetrics: true,
    componentName: 'TVDisplay'
  });

  useEffect(() => {
    // Record TV display initialization
    performanceMonitor.recordMetric(
      'tv-display-init',
      globalThis.performance.now(),
      'timestamp',
      'loading'
    );

    // Preload critical resources
    performance.preloadResource('/api/displays', 'script');
    performance.preloadResource('/fonts/inter.woff2', 'style');

    return () => {
      // Cleanup on unmount
      performanceMonitor.recordMetric(
        'tv-display-unmount',
        globalThis.performance.now(),
        'timestamp',
        'loading'
      );
    };
  }, [performance]);

  return performance;
};

// Content optimization utilities
export const contentOptimizations = {
  /**
   * Optimize image for TV display
   */
  optimizeImage: (src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', '90'); // High quality for TV
    params.set('f', 'webp'); // Prefer WebP format
    
    return `${src}?${params.toString()}`;
  },

  /**
   * Optimize video for TV display
   */
  optimizeVideo: (src: string) => {
    // For YouTube videos, use high quality and disable related videos
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const url = new URL(src);
      url.searchParams.set('quality', 'hd1080');
      url.searchParams.set('rel', '0');
      url.searchParams.set('modestbranding', '1');
      url.searchParams.set('controls', '0');
      return url.toString();
    }
    
    return src;
  },

  /**
   * Preload content for smooth transitions
   */
  preloadContent: async (contentItems: any[]) => {
    const preloadPromises = contentItems.slice(0, 3).map(async (item) => {
      if (item.type === 'image') {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = contentOptimizations.optimizeImage(item.url, 1920, 1080);
        });
      }
      
      if (item.type === 'youtube_video') {
        // Preload YouTube thumbnail
        const videoId = contentOptimizations.extractYouTubeId(item.url);
        if (videoId) {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          });
        }
      }
      
      return Promise.resolve();
    });

    try {
      await Promise.allSettled(preloadPromises);
      performanceMonitor.recordMetric(
        'content-preload-complete',
        preloadPromises.length,
        'count',
        'loading'
      );
    } catch (error) {
      console.warn('Content preloading failed:', error);
    }
  },

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeId: (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
<<<<<<< HEAD
    return match && match[1] ? match[1] : null;
=======
    return match ? match[1] : null;
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
  }
};

// Prayer times optimization utilities
export const prayerTimesOptimizations = {
  /**
   * Cache prayer times with long TTL
   */
  cachePrayerTimes: async (masjidId: string, prayerTimes: any) => {
    await cacheManager.set(
      `prayer-times-${masjidId}`,
      prayerTimes,
      24 * 60 * 60 * 1000, // 24 hours
      ['prayer-times', masjidId]
    );
  },

  /**
   * Get cached prayer times
   */
  getCachedPrayerTimes: async (masjidId: string) => {
    return await cacheManager.get(`prayer-times-${masjidId}`);
  },

  /**
   * Invalidate prayer times cache
   */
  invalidatePrayerTimesCache: (masjidId?: string) => {
    if (masjidId) {
      cacheManager.delete(`prayer-times-${masjidId}`);
    } else {
      cacheManager.invalidateByTag('prayer-times');
    }
  },

  /**
   * Preload next day's prayer times
   */
  preloadNextDayPrayerTimes: async (masjidId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    try {
      const response = await fetch(`/api/prayer-times/${masjidId}?date=${dateStr}`);
      if (response.ok) {
        const prayerTimes = await response.json();
        await prayerTimesOptimizations.cachePrayerTimes(`${masjidId}-${dateStr}`, prayerTimes);
      }
    } catch (error) {
      console.warn('Failed to preload next day prayer times:', error);
    }
  }
};

// Network optimization utilities
export const networkOptimizations = {
  /**
   * Batch API requests
   */
  batchRequests: (() => {
    const requestQueue: Array<{
      url: string;
      options?: RequestInit;
      resolve: (value: any) => void;
      reject: (error: any) => void;
    }> = [];
    
    let batchTimeout: NodeJS.Timeout | null = null;

    const processBatch = async () => {
      if (requestQueue.length === 0) return;
      
      const batch = requestQueue.splice(0, 5); // Process 5 requests at a time
      
      const promises = batch.map(async ({ url, options, resolve, reject }) => {
        try {
          const response = await fetch(url, options);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
      
      await Promise.allSettled(promises);
      
      // Process remaining requests
      if (requestQueue.length > 0) {
        batchTimeout = setTimeout(processBatch, 50);
      }
    };

    return (url: string, options?: RequestInit): Promise<Response> => {
      return new Promise((resolve, reject) => {
<<<<<<< HEAD
        requestQueue.push({ 
          url, 
          ...(options ? { options } : {}), 
          resolve, 
          reject 
        });
=======
        requestQueue.push({ url, options, resolve, reject });
>>>>>>> 37fcc95 (feat: Implement TV Display Database Schema and Seed Data)
        
        if (!batchTimeout) {
          batchTimeout = setTimeout(processBatch, 100);
        }
      });
    };
  })(),

  /**
   * Retry mechanism with exponential backoff
   */
  retryRequest: async (
    url: string,
    options?: RequestInit,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<Response> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.ok) {
          return response;
        }
        
        if (response.status >= 400 && response.status < 500) {
          // Client error, don't retry
          throw new Error(`Client error: ${response.status}`);
        }
        
        throw new Error(`Server error: ${response.status}`);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          performanceMonitor.recordMetric(
            'network-retry',
            attempt + 1,
            'count',
            'network'
          );
        }
      }
    }
    
    throw lastError!;
  }
};

// Memory optimization utilities
export const memoryOptimizations = {
  /**
   * Clean up unused resources
   */
  cleanup: () => {
    // Clear expired cache entries
    const cleaned = cacheManager.cleanup();
    
    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
    
    // Clear old performance entries
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    
    performanceMonitor.recordMetric(
      'memory-cleanup',
      cleaned,
      'count',
      'memory'
    );
    
    return cleaned;
  },

  /**
   * Monitor memory usage
   */
  getMemoryUsage: () => {
    // @ts-ignore - memory API is experimental
    if (performance.memory) {
      // @ts-ignore
      const memInfo = performance.memory;
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        percentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };
    }
    
    return null;
  },

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring: () => {
    setInterval(() => {
      const memUsage = memoryOptimizations.getMemoryUsage();
      
      if (memUsage && memUsage.percentage > 80) {
        console.warn('⚠️ High memory usage detected:', memUsage);
        memoryOptimizations.cleanup();
      }
    }, 30 * 1000); // Check every 30 seconds
  }
};

// Export all utilities
export {
  performanceMonitor,
  cacheManager,
  usePerformance,
  getPerformanceConfig
};

// Export main performance system
export default {
  initialize: initializePerformanceSystem,
  useTVDisplayPerformance,
  contentOptimizations,
  prayerTimesOptimizations,
  networkOptimizations,
  memoryOptimizations
};