/**
 * Performance Monitor
 * 
 * Comprehensive performance monitoring and optimization system for TV display.
 * Tracks metrics, detects bottlenecks, and provides optimization recommendations.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  unit: string;
  category: 'loading' | 'rendering' | 'memory' | 'network' | 'user-interaction';
}

interface PerformanceThresholds {
  initialLoad: number; // Maximum acceptable page load time (ms)
  contentTransition: number; // Maximum content transition time (ms)
  memoryUsage: number; // Maximum memory usage (MB)
  frameRate: number; // Minimum FPS
  networkLatency: number; // Maximum acceptable API response time (ms)
}

interface OptimizationRecommendation {
  type: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  solution: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;

  private readonly thresholds: PerformanceThresholds = {
    initialLoad: 3000, // 3 seconds
    contentTransition: 500, // 0.5 seconds
    memoryUsage: 512, // 512 MB
    frameRate: 50, // 50 FPS minimum (TV displays)
    networkLatency: 2000 // 2 seconds
  };

  constructor() {
    this.initializeObservers();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.recordMetric('monitoring-started', performance.now(), 'timestamp', 'loading');

    // Start frame rate monitoring
    this.monitorFrameRate();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor network performance
    this.monitorNetworkPerformance();

    // Track page load performance
    this.trackPageLoadMetrics();

    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    this.recordMetric('monitoring-stopped', performance.now(), 'timestamp', 'loading');
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, unit: string, category: PerformanceMetric['category']): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      unit,
      category
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for threshold violations
    this.checkThresholds(metric);
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    summary: Record<string, any>;
    recommendations: OptimizationRecommendation[];
  } {
    const summary = this.calculateSummary();
    const recommendations = this.generateRecommendations();

    return {
      metrics: [...this.metrics],
      summary,
      recommendations
    };
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordNavigationMetrics(navEntry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Observer for resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetric(entry as PerformanceResourceTiming);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }

      // Observer for paint metrics
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric(entry.name, entry.startTime, 'ms', 'rendering');
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint timing observer not supported:', error);
      }
    }
  }

  /**
   * Record navigation timing metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    this.recordMetric('dns-lookup', entry.domainLookupEnd - entry.domainLookupStart, 'ms', 'network');
    this.recordMetric('tcp-connect', entry.connectEnd - entry.connectStart, 'ms', 'network');
    this.recordMetric('request-response', entry.responseEnd - entry.requestStart, 'ms', 'network');
    this.recordMetric('dom-processing', entry.domComplete - entry.domContentLoadedEventStart, 'ms', 'loading');
    this.recordMetric('page-load', entry.loadEventEnd - entry.fetchStart, 'ms', 'loading');
  }

  /**
   * Record resource timing metrics
   */
  private recordResourceMetric(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const category = this.categorizeResource(entry.name);
    
    this.recordMetric(`resource-load-${category}`, duration, 'ms', 'network');

    // Check for slow resources
    if (duration > 3000) {
      console.warn(`Slow resource detected: ${entry.name} (${duration.toFixed(2)}ms)`);
    }
  }

  /**
   * Categorize resource by URL
   */
  private categorizeResource(url: string): string {
    if (url.includes('/api/')) return 'api';
    if (url.match(/\.(js|ts)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(mp4|webm|ogg)$/)) return 'video';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    const measureFrameRate = () => {
      if (!this.isMonitoring) return;

      const now = performance.now();
      if (this.lastFrameTime) {
        const fps = 1000 / (now - this.lastFrameTime);
        this.recordMetric('frame-rate', fps, 'fps', 'rendering');
        
        if (fps < this.thresholds.frameRate) {
          console.warn(`Low frame rate detected: ${fps.toFixed(2)} FPS`);
        }
      }
      this.lastFrameTime = now;
      this.frameCount++;

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    const measureMemory = () => {
      if (!this.isMonitoring) return;

      // @ts-ignore - memory API is experimental
      if (performance.memory) {
        // @ts-ignore
        const memInfo = performance.memory;
        const usedMemoryMB = memInfo.usedJSHeapSize / (1024 * 1024);
        const totalMemoryMB = memInfo.totalJSHeapSize / (1024 * 1024);
        const limitMemoryMB = memInfo.jsHeapSizeLimit / (1024 * 1024);

        this.recordMetric('memory-used', usedMemoryMB, 'MB', 'memory');
        this.recordMetric('memory-total', totalMemoryMB, 'MB', 'memory');
        this.recordMetric('memory-limit', limitMemoryMB, 'MB', 'memory');

        if (usedMemoryMB > this.thresholds.memoryUsage) {
          console.warn(`High memory usage detected: ${usedMemoryMB.toFixed(2)} MB`);
        }
      }

      setTimeout(measureMemory, 5000); // Check every 5 seconds
    };

    setTimeout(measureMemory, 1000);
  }

  /**
   * Monitor network performance
   */
  private monitorNetworkPerformance(): void {
    // Intercept fetch requests to measure API performance
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : 
                  args[0] instanceof URL ? args[0].href : 
                  (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api-request', duration, 'ms', 'network');
        
        if (duration > this.thresholds.networkLatency) {
          console.warn(`Slow API request: ${url} (${duration.toFixed(2)}ms)`);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.recordMetric('api-request-failed', duration, 'ms', 'network');
        throw error;
      }
    };
  }

  /**
   * Track page load metrics
   */
  private trackPageLoadMetrics(): void {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      this.recordInitialLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.recordInitialLoadMetrics(), 100);
      });
    }
  }

  /**
   * Record initial load metrics
   */
  private recordInitialLoadMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const totalLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.recordMetric('initial-load', totalLoadTime, 'ms', 'loading');
      
      if (totalLoadTime > this.thresholds.initialLoad) {
        console.warn(`Slow initial load: ${totalLoadTime.toFixed(2)}ms`);
      }
    }

    // Record Core Web Vitals if available
    this.recordCoreWebVitals();
  }

  /**
   * Record Core Web Vitals
   */
  private recordCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            this.recordMetric('lcp', lastEntry.startTime, 'ms', 'rendering');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              this.recordMetric('fid', entry.processingStart - entry.startTime, 'ms', 'user-interaction');
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric('cls', clsValue, 'score', 'rendering');
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  /**
   * Check metric thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const { name, value } = metric;

    switch (name) {
      case 'initial-load':
        if (value > this.thresholds.initialLoad) {
          this.reportThresholdViolation('Initial Load Time', value, this.thresholds.initialLoad, 'ms');
        }
        break;
      case 'frame-rate':
        if (value < this.thresholds.frameRate) {
          this.reportThresholdViolation('Frame Rate', value, this.thresholds.frameRate, 'fps');
        }
        break;
      case 'memory-used':
        if (value > this.thresholds.memoryUsage) {
          this.reportThresholdViolation('Memory Usage', value, this.thresholds.memoryUsage, 'MB');
        }
        break;
      case 'api-request':
        if (value > this.thresholds.networkLatency) {
          this.reportThresholdViolation('API Response Time', value, this.thresholds.networkLatency, 'ms');
        }
        break;
    }
  }

  /**
   * Report threshold violation
   */
  private reportThresholdViolation(metricName: string, actual: number, threshold: number, unit: string): void {
    console.warn(`⚠️ Performance threshold exceeded: ${metricName} = ${actual.toFixed(2)}${unit} (threshold: ${threshold}${unit})`);
  }

  /**
   * Calculate performance summary
   */
  private calculateSummary(): Record<string, any> {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute

    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      categories: {}
    };

    // Calculate averages by category
    const categories = ['loading', 'rendering', 'memory', 'network', 'user-interaction'] as const;
    
    categories.forEach(category => {
      const categoryMetrics = recentMetrics.filter(m => m.category === category);
      if (categoryMetrics.length > 0) {
        const avgValue = categoryMetrics.reduce((sum, m) => sum + m.value, 0) / categoryMetrics.length;
        summary.categories[category] = {
          count: categoryMetrics.length,
          average: avgValue,
          latest: categoryMetrics[categoryMetrics.length - 1]?.value || 0
        };
      }
    });

    return summary;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000);

    // Check for slow loading
    const loadMetrics = recentMetrics.filter(m => m.name === 'initial-load');
    if (loadMetrics.some(m => m.value > this.thresholds.initialLoad)) {
      recommendations.push({
        type: 'warning',
        category: 'Loading Performance',
        issue: 'Initial page load time exceeds threshold',
        solution: 'Implement code splitting and lazy loading',
        impact: 'high',
        implementation: 'Add React.lazy() for components and dynamic imports for heavy modules'
      });
    }

    // Check for low frame rate
    const frameMetrics = recentMetrics.filter(m => m.name === 'frame-rate');
    if (frameMetrics.some(m => m.value < this.thresholds.frameRate)) {
      recommendations.push({
        type: 'critical',
        category: 'Rendering Performance',
        issue: 'Frame rate below acceptable threshold for TV display',
        solution: 'Optimize rendering and reduce DOM manipulations',
        impact: 'high',
        implementation: 'Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders'
      });
    }

    // Check for high memory usage
    const memoryMetrics = recentMetrics.filter(m => m.name === 'memory-used');
    if (memoryMetrics.some(m => m.value > this.thresholds.memoryUsage)) {
      recommendations.push({
        type: 'warning',
        category: 'Memory Management',
        issue: 'Memory usage exceeds recommended limits',
        solution: 'Implement memory cleanup and object pooling',
        impact: 'medium',
        implementation: 'Add cleanup in useEffect hooks and limit data retention in caches'
      });
    }

    // Check for slow API responses
    const apiMetrics = recentMetrics.filter(m => m.name === 'api-request');
    if (apiMetrics.some(m => m.value > this.thresholds.networkLatency)) {
      recommendations.push({
        type: 'warning',
        category: 'Network Performance',
        issue: 'API response times are slow',
        solution: 'Implement request caching and parallel loading',
        impact: 'medium',
        implementation: 'Add response caching with TTL and use Promise.all for parallel requests'
      });
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.calculateSummary(),
      recommendations: this.generateRecommendations(),
      thresholds: this.thresholds
    };

    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.startMonitoring();
}

export default PerformanceMonitor;