/**
 * Performance Configuration
 * 
 * Configuration settings for performance optimizations across the TV display application.
 * Includes caching strategies, lazy loading settings, and resource optimization parameters.
 */

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  enablePersistence: boolean;
  compressionEnabled: boolean;
}

export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number; // Intersection observer threshold
  rootMargin: string; // Root margin for intersection observer
  enableImageOptimization: boolean;
  enableComponentSplitting: boolean;
}

export interface ResourceOptimizationConfig {
  enablePreloading: boolean;
  enablePrefetching: boolean;
  maxConcurrentRequests: number;
  enableCompression: boolean;
  enableCDN: boolean;
}

export interface PerformanceThresholds {
  pageLoadTime: number; // Maximum acceptable page load time (ms)
  componentRenderTime: number; // Maximum component render time (ms)
  apiResponseTime: number; // Maximum API response time (ms)
  memoryUsage: number; // Maximum memory usage (MB)
  frameRate: number; // Minimum frame rate (FPS)
  networkLatency: number; // Maximum network latency (ms)
}

export interface PerformanceConfig {
  // Feature flags
  enablePerformanceMonitoring: boolean;
  enableLazyLoading: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
  enableResourceOptimization: boolean;
  
  // Environment-specific settings
  development: {
    enableDebugMode: boolean;
    enableDetailedLogging: boolean;
    enablePerformanceOverlay: boolean;
  };
  
  production: {
    enableErrorReporting: boolean;
    enableAnalytics: boolean;
    enableOptimizations: boolean;
  };
  
  // Configuration objects
  cache: CacheConfig;
  lazyLoading: LazyLoadingConfig;
  resourceOptimization: ResourceOptimizationConfig;
  thresholds: PerformanceThresholds;
}

// Default performance configuration
export const defaultPerformanceConfig: PerformanceConfig = {
  // Feature flags
  enablePerformanceMonitoring: true,
  enableLazyLoading: true,
  enableCodeSplitting: true,
  enableServiceWorker: false, // Disabled for TV displays initially
  enableResourceOptimization: true,
  
  // Environment settings
  development: {
    enableDebugMode: true,
    enableDetailedLogging: true,
    enablePerformanceOverlay: true
  },
  
  production: {
    enableErrorReporting: true,
    enableAnalytics: false, // Privacy consideration for masjid displays
    enableOptimizations: true
  },
  
  // Cache configuration
  cache: {
    maxSize: 100, // Maximum number of cached items
    ttl: 5 * 60 * 1000, // 5 minutes
    enablePersistence: true,
    compressionEnabled: true
  },
  
  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    threshold: 0.1, // Load when 10% visible
    rootMargin: '50px', // Start loading 50px before visible
    enableImageOptimization: true,
    enableComponentSplitting: true
  },
  
  // Resource optimization
  resourceOptimization: {
    enablePreloading: true,
    enablePrefetching: true,
    maxConcurrentRequests: 6, // Standard browser limit
    enableCompression: true,
    enableCDN: false // No CDN for local masjid networks
  },
  
  // Performance thresholds
  thresholds: {
    pageLoadTime: 3000, // 3 seconds
    componentRenderTime: 16, // 16ms for 60fps
    apiResponseTime: 2000, // 2 seconds
    memoryUsage: 512, // 512 MB
    frameRate: 50, // 50 FPS minimum for TV displays
    networkLatency: 1000 // 1 second
  }
};

// TV-specific optimizations
export const tvDisplayOptimizations: Partial<PerformanceConfig> = {
  // TV displays need smooth animations
  thresholds: {
    pageLoadTime: 2000, // Faster load for TV
    componentRenderTime: 16, // Maintain 60fps
    apiResponseTime: 1500, // Faster API responses
    memoryUsage: 1024, // More memory available on TV hardware
    frameRate: 55, // Higher frame rate requirement
    networkLatency: 800 // Lower latency tolerance
  },
  
  // Enhanced caching for TV displays
  cache: {
    maxSize: 200, // More cache entries
    ttl: 10 * 60 * 1000, // 10 minutes TTL
    enablePersistence: true,
    compressionEnabled: true
  },
  
  // Aggressive lazy loading for large content
  lazyLoading: {
    enabled: true,
    threshold: 0.05, // Load earlier for smooth experience
    rootMargin: '100px', // Larger margin for TV viewing
    enableImageOptimization: true,
    enableComponentSplitting: true
  }
};

// Prayer times specific optimizations
export const prayerTimesOptimizations: Partial<PerformanceConfig> = {
  cache: {
    maxSize: 50,
    ttl: 24 * 60 * 60 * 1000, // 24 hours for prayer times
    enablePersistence: true,
    compressionEnabled: false // Small data, compression overhead not worth it
  },
  
  thresholds: {
    apiResponseTime: 500, // Very fast for critical prayer time data
    pageLoadTime: 1000, // Quick load for time-sensitive information
    componentRenderTime: 8, // Very smooth updates
    memoryUsage: 64, // Minimal memory for prayer times
    frameRate: 60, // Smooth countdown animations
    networkLatency: 300
  }
};

// Content carousel optimizations
export const contentCarouselOptimizations: Partial<PerformanceConfig> = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '200px', // Preload more content for smooth transitions
    enableImageOptimization: true,
    enableComponentSplitting: false // Keep carousel components loaded
  },
  
  cache: {
    maxSize: 150,
    ttl: 15 * 60 * 1000, // 15 minutes for content
    enablePersistence: true,
    compressionEnabled: true
  },
  
  resourceOptimization: {
    enablePreloading: true,
    enablePrefetching: true,
    maxConcurrentRequests: 8, // More concurrent requests for media
    enableCompression: true,
    enableCDN: false
  }
};

// Memory management configurations
export const memoryManagementConfig = {
  // Garbage collection hints
  enablePeriodicCleanup: true,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  
  // Object pooling for frequently created objects
  enableObjectPooling: true,
  pooledObjectTypes: ['APIResponse', 'CacheEntry', 'MetricData'],
  
  // Memory thresholds
  warningThreshold: 0.7, // 70% of available memory
  criticalThreshold: 0.9, // 90% of available memory
  
  // Cleanup strategies
  strategies: {
    lru: true, // Least Recently Used
    ttl: true, // Time To Live
    size: true // Size-based cleanup
  }
};

// Network optimization configurations
export const networkOptimizationConfig = {
  // Request batching
  enableRequestBatching: true,
  batchSize: 5,
  batchTimeout: 100, // ms
  
  // Retry strategies
  maxRetries: 3,
  retryDelayMs: 1000,
  exponentialBackoff: true,
  
  // Connection management
  maxConnections: 6,
  connectionTimeout: 5000, // ms
  enableKeepAlive: true,
  
  // Compression
  enableGzipCompression: true,
  enableBrotliCompression: false, // Not widely supported
  
  // Caching headers
  enableETags: true,
  enableLastModified: true,
  defaultCacheControl: 'public, max-age=300' // 5 minutes
};

// Image optimization configurations
export const imageOptimizationConfig = {
  // Format preferences (in order of preference)
  formats: ['webp', 'avif', 'jpg', 'png'],
  
  // Quality settings
  quality: {
    webp: 85,
    avif: 80,
    jpg: 90,
    png: 90
  },
  
  // Responsive images
  breakpoints: [320, 640, 768, 1024, 1280, 1920],
  enableResponsiveImages: true,
  
  // Lazy loading
  enableLazyLoading: true,
  placeholderType: 'blur', // 'blur', 'skeleton', 'solid'
  
  // Progressive loading
  enableProgressiveJPEG: true,
  enableInterlacedPNG: false
};

// Export function to get environment-specific config
export const getPerformanceConfig = (environment: 'development' | 'production' | 'test'): PerformanceConfig => {
  const baseConfig = { ...defaultPerformanceConfig };
  
  // Apply TV display optimizations
  Object.assign(baseConfig, tvDisplayOptimizations);
  
  // Environment-specific overrides
  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        enablePerformanceMonitoring: true,
        development: {
          ...baseConfig.development,
          enableDebugMode: true,
          enableDetailedLogging: true,
          enablePerformanceOverlay: true
        }
      };
      
    case 'production':
      return {
        ...baseConfig,
        enablePerformanceMonitoring: true,
        production: {
          ...baseConfig.production,
          enableErrorReporting: true,
          enableAnalytics: false, // Privacy first
          enableOptimizations: true
        }
      };
      
    case 'test':
      return {
        ...baseConfig,
        enablePerformanceMonitoring: false,
        cache: {
          ...baseConfig.cache,
          ttl: 100, // Short TTL for tests
          enablePersistence: false
        }
      };
      
    default:
      return baseConfig;
  }
};

export default defaultPerformanceConfig;