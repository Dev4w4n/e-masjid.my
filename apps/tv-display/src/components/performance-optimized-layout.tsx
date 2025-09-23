/**
 * Performance-Optimized Display Layout
 * 
 * Main layout component with integrated performance optimizations for TV display.
 * Includes lazy loading, caching, monitoring, and resource optimization.
 */

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useTVDisplayPerformance, contentOptimizations, memoryOptimizations } from '../lib/performance';
import { performanceMonitor } from '../lib/performance/performance-monitor';

// Lazy loaded components for better performance
const ContentCarousel = React.lazy(() => import('./ContentCarousel'));
const PrayerTimesOverlay = React.lazy(() => import('./PrayerTimesOverlay'));
const StatusIndicator = React.lazy(() => import('./DisplayStatus'));

interface PerformanceOptimizedLayoutProps {
  displayId: string;
  children?: React.ReactNode;
  enableOptimizations?: boolean;
}

// Loading component for Suspense
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  </div>
);

// Error boundary for graceful error handling
class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Error Boundary caught an error:', error, errorInfo);
    performanceMonitor.recordMetric('error-boundary-trigger', 1, 'count', 'user-interaction');
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || (() => (
        <div className="flex items-center justify-center min-h-screen bg-red-900 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ralat Teknikal</h2>
            <p className="text-lg mb-4">Paparan sedang dimuat semula...</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-700 hover:bg-red-600 px-6 py-2 rounded"
            >
              Muat Semula
            </button>
          </div>
        </div>
      ));
      
      return <Fallback />;
    }

    return this.props.children;
  }
}

export const PerformanceOptimizedLayout: React.FC<PerformanceOptimizedLayoutProps> = ({
  displayId,
  children,
  enableOptimizations = true
}) => {
  const performance = useTVDisplayPerformance();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [memoryWarning, setMemoryWarning] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      performanceMonitor.recordMetric('network-online', 1, 'count', 'network');
    };

    const handleOffline = () => {
      setIsOnline(false);
      performanceMonitor.recordMetric('network-offline', 1, 'count', 'network');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    if (!enableOptimizations) return;

    const memoryCheckInterval = setInterval(() => {
      const memUsage = memoryOptimizations.getMemoryUsage();
      
      if (memUsage && memUsage.percentage > 85) {
        setMemoryWarning(true);
        performanceMonitor.recordMetric('memory-warning', memUsage.percentage, 'percent', 'memory');
        
        // Automatic cleanup
        setTimeout(() => {
          memoryOptimizations.cleanup();
          setMemoryWarning(false);
        }, 5000);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(memoryCheckInterval);
  }, [enableOptimizations]);

  // Preload critical resources
  useEffect(() => {
    if (!enableOptimizations) return;

    // Preload critical fonts
    performance.preloadResource('/fonts/inter-var.woff2', 'style');
    performance.preloadResource('/fonts/arabic.woff2', 'style');
    
    // Preload API endpoints
    performance.prefetchRoute(`/api/displays/${displayId}/content`);
    performance.prefetchRoute(`/api/displays/${displayId}/prayer-times`);
  }, [displayId, performance, enableOptimizations]);

  // Memoized layout classes for performance
  const layoutClasses = useMemo(() => ({
    container: `
      relative w-full h-screen overflow-hidden bg-gray-900 text-white
      ${!isOnline ? 'border-t-4 border-red-500' : ''}
      ${memoryWarning ? 'border-b-4 border-yellow-500' : ''}
    `.trim(),
    content: 'relative z-10 w-full h-full',
    overlay: 'absolute inset-0 z-20 pointer-events-none',
    warning: `
      absolute top-0 left-0 right-0 z-30 bg-yellow-600 text-black px-4 py-2 text-center
      transform transition-transform duration-300
      ${memoryWarning ? 'translate-y-0' : '-translate-y-full'}
    `.trim()
  }), [isOnline, memoryWarning]);

  // Optimized error handling
  const handleComponentError = performance.memoizedCallback((error: Error, component: string) => {
    console.error(`Component error in ${component}:`, error);
    performanceMonitor.recordMetric(`component-error-${component}`, 1, 'count', 'user-interaction');
  }, []);

  return (
    <PerformanceErrorBoundary>
      <div className={layoutClasses.container} data-testid="display-container">
        {/* Memory warning */}
        <div className={layoutClasses.warning}>
          ⚠️ Mengoptimumkan prestasi sistem...
        </div>

        {/* Network status indicator */}
        {!isOnline && (
          <div className="absolute top-0 left-0 right-0 z-30 bg-red-600 text-white px-4 py-2 text-center">
            📡 Tiada sambungan internet - Menggunakan data cache
          </div>
        )}

        {/* Main content area */}
        <div className={layoutClasses.content}>
          <Suspense fallback={<LoadingSpinner message="Memuatkan kandungan..." />}>
            <ContentCarousel 
              displayId={displayId}
              config={{
                carouselInterval: 30,
                contentTransitionType: 'fade',
                maxContentItems: 10,
                showSponsorshipAmounts: true,
                sponsorshipTierColors: {
                  bronze: '#CD7F32',
                  silver: '#C0C0C0',
                  gold: '#FFD700',
                  platinum: '#E5E4E2'
                }
              }}
              onError={(error) => handleComponentError(error, 'ContentCarousel')}
            />
          </Suspense>
        </div>

        {/* Prayer times overlay */}
        <div className={layoutClasses.overlay}>
          <Suspense fallback={null}>
            <PrayerTimesOverlay 
              prayerTimes={{
                id: `prayer-${Date.now()}`,
                masjid_id: displayId,
                prayer_date: new Date().toISOString().split('T')[0] || '',
                fajr_time: '05:30',
                sunrise_time: '07:00', 
                dhuhr_time: '13:15',
                asr_time: '16:30',
                maghrib_time: '19:45',
                isha_time: '21:00',
                source: 'CACHED_FALLBACK' as const,
                fetched_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }}
              config={{
                masjid_id: displayId,
                zone_code: 'WLY01',
                location_name: 'Kuala Lumpur',
                latitude: 3.139,
                longitude: 101.6869,
                show_seconds: false,
                highlight_current_prayer: true,
                next_prayer_countdown: true,
                adjustments: {
                  fajr: 0,
                  sunrise: 0,
                  dhuhr: 0,
                  asr: 0,
                  maghrib: 0,
                  isha: 0
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }}
            />
          </Suspense>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-4 right-4 z-40">
          <Suspense fallback={null}>
            <StatusIndicator 
              displayId={displayId}
              showDebugInfo={process.env.NODE_ENV === 'development'}
              autoRefresh={true}
              refreshInterval={300}
            />
          </Suspense>
        </div>

        {/* Performance overlay for development */}
        {process.env.NODE_ENV === 'development' && (
          <PerformanceOverlay performance={performance} />
        )}

        {/* Additional children */}
        {children}
      </div>
    </PerformanceErrorBoundary>
  );
};

// Development performance overlay
const PerformanceOverlay: React.FC<{ performance: any }> = ({ performance }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const updateStats = () => {
      const perfSummary = performanceMonitor.getPerformanceSummary();
      const memUsage = memoryOptimizations.getMemoryUsage();
      
      setStats({
        renders: performance.renderCount,
        renderTime: performance.renderTime,
        memory: memUsage,
        summary: perfSummary
      });
    };

    if (showOverlay) {
      updateStats();
      const interval = setInterval(updateStats, 1000);
      return () => clearInterval(interval);
    }
  }, [showOverlay, performance]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowOverlay(!showOverlay)}
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        {showOverlay ? 'Hide' : 'Show'} Perf
      </button>

      {/* Performance overlay */}
      {showOverlay && (
        <div className="fixed top-16 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded max-w-sm text-sm">
          <h3 className="font-bold mb-2">Performance Stats</h3>
          
          {stats && (
            <div className="space-y-2">
              <div>Renders: {stats.renders}</div>
              <div>Render Time: {stats.renderTime.toFixed(2)}ms</div>
              
              {stats.memory && (
                <div>
                  <div>Memory: {(stats.memory.used / 1024 / 1024).toFixed(1)}MB</div>
                  <div>Usage: {stats.memory.percentage.toFixed(1)}%</div>
                </div>
              )}
              
              {stats.summary && (
                <div>
                  <div>Cache Hit Rate: {stats.summary.summary.categories?.loading?.average?.toFixed(1) || 'N/A'}%</div>
                  <div>Metrics: {stats.summary.metrics.length}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceOptimizedLayout;