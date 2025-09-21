/**
 * Performance Optimization Hook
 * 
 * React hook that provides performance optimization utilities including
 * lazy loading, code splitting, memoization, and resource optimization.
 */

import React, { useCallback, useContext, createContext, useEffect, useMemo, useRef, useState } from 'react';
import { performanceMonitor } from './performance-monitor';

interface UsePerformanceOptions {
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableMemoization?: boolean;
  trackComponentMetrics?: boolean;
  componentName?: string;
}

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface PerformanceHookReturn {
  // Component metrics
  renderCount: number;
  renderTime: number;
  
  // Optimization utilities
  memoizedCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
  memoizedValue: <T>(factory: () => T, deps: any[]) => T;
  
  // Lazy loading components
  LazyImage: React.FC<LazyImageProps>;
  LazyComponent: React.FC<{ component: () => Promise<{ default: React.ComponentType }> }>;
  
  // Resource management
  preloadResource: (url: string, type: 'image' | 'video' | 'audio' | 'script' | 'style') => void;
  prefetchRoute: (route: string) => void;
  
  // Performance actions
  measureRender: (name: string, fn: () => void) => void;
  reportMetric: (name: string, value: number, unit: string) => void;
}

export const usePerformance = (options: UsePerformanceOptions = {}): PerformanceHookReturn => {
  const {
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableMemoization = true,
    trackComponentMetrics = true,
    componentName = 'UnnamedComponent'
  } = options;

  // Component metrics tracking
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  // Track component renders
  useEffect(() => {
    if (trackComponentMetrics) {
      const now = performance.now();
      renderCountRef.current += 1;
      setRenderCount(renderCountRef.current);
      
      if (lastRenderTimeRef.current > 0) {
        const timeSinceLastRender = now - lastRenderTimeRef.current;
        setRenderTime(timeSinceLastRender);
        
        performanceMonitor.recordMetric(
          `component-render-${componentName}`,
          timeSinceLastRender,
          'ms',
          'rendering'
        );
      }
      
      lastRenderTimeRef.current = now;
    }
  });

  // Optimized memoization utilities
  const memoizedCallback = useCallback(
    function <T extends (...args: any[]) => any>(callback: T, deps: any[]): T {
      if (!enableMemoization) return callback;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useCallback(callback, deps);
    },
    [enableMemoization]
  );

  const memoizedValue = useCallback(
    function <T>(factory: () => T, deps: any[]): T {
      if (!enableMemoization) return factory();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(factory, deps);
    },
    [enableMemoization]
  );

  // Lazy Image Component with optimization
  const LazyImage = useMemo(() => {
    if (!enableLazyLoading) {
      return ({ src, alt, ...props }: LazyImageProps) => (
        <img src={src} alt={alt} {...props} />
      );
    }

    return ({ 
      src, 
      alt, 
      width, 
      height, 
      className = '', 
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMEYwRjAiLz48L3N2Zz4=',
      onLoad,
      onError
    }: LazyImageProps) => {
      const [imageSrc, setImageSrc] = useState(placeholder);
      const [isLoaded, setIsLoaded] = useState(false);
      const [hasError, setHasError] = useState(false);
      const imgRef = useRef<HTMLImageElement>(null);

      useEffect(() => {
        if (!enableLazyLoading || !imgRef.current) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !isLoaded && !hasError) {
                const img = new Image();
                
                img.onload = () => {
                  setImageSrc(src);
                  setIsLoaded(true);
                  onLoad?.();
                  
                  performanceMonitor.recordMetric(
                    'lazy-image-load',
                    performance.now(),
                    'timestamp',
                    'loading'
                  );
                };
                
                img.onerror = () => {
                  setHasError(true);
                  onError?.();
                  
                  performanceMonitor.recordMetric(
                    'lazy-image-error',
                    performance.now(),
                    'timestamp',
                    'loading'
                  );
                };
                
                img.src = src;
                observer.disconnect();
              }
            });
          },
          { 
            threshold: 0.1,
            rootMargin: '50px'
          }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
      }, [src, isLoaded, hasError, onLoad, onError]);

      return (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`}
          style={{
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0.7
          }}
        />
      );
    };
  }, [enableLazyLoading]);

  // Lazy Component Loader
  const LazyComponent = useMemo(() => {
    return ({ component }: { component: () => Promise<{ default: React.ComponentType }> }) => {
      const [Component, setComponent] = useState<React.ComponentType | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<Error | null>(null);

      useEffect(() => {
        const loadComponent = async () => {
          try {
            setIsLoading(true);
            const startTime = performance.now();
            
            const module = await component();
            const endTime = performance.now();
            
            performanceMonitor.recordMetric(
              'component-lazy-load',
              endTime - startTime,
              'ms',
              'loading'
            );
            
            setComponent(() => module.default);
          } catch (err) {
            setError(err as Error);
            performanceMonitor.recordMetric(
              'component-lazy-error',
              performance.now(),
              'timestamp',
              'loading'
            );
          } finally {
            setIsLoading(false);
          }
        };

        loadComponent();
      }, [component]);

      if (isLoading) {
        return (
          <div className="lazy-component-loading">
            <div className="loading-spinner" />
            <span>Loading...</span>
          </div>
        );
      }

      if (error) {
        return (
          <div className="lazy-component-error">
            <span>Failed to load component</span>
          </div>
        );
      }

      return Component ? <Component /> : null;
    };
  }, []);

  // Resource preloading utilities
  const preloadResource = useCallback((url: string, type: 'image' | 'video' | 'audio' | 'script' | 'style') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'video':
        link.as = 'video';
        break;
      case 'audio':
        link.as = 'audio';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    document.head.appendChild(link);
    
    performanceMonitor.recordMetric(
      `preload-${type}`,
      performance.now(),
      'timestamp',
      'loading'
    );
  }, []);

  // Route prefetching
  const prefetchRoute = useCallback((route: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
    
    performanceMonitor.recordMetric(
      'prefetch-route',
      performance.now(),
      'timestamp',
      'loading'
    );
  }, []);

  // Render measurement
  const measureRender = useCallback((name: string, fn: () => void) => {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    performanceMonitor.recordMetric(
      `render-${name}`,
      endTime - startTime,
      'ms',
      'rendering'
    );
  }, []);

  // Custom metric reporting
  const reportMetric = useCallback((name: string, value: number, unit: string) => {
    performanceMonitor.recordMetric(
      `custom-${name}`,
      value,
      unit,
      'user-interaction'
    );
  }, []);

  return {
    // Metrics
    renderCount,
    renderTime,
    
    // Optimization utilities
    memoizedCallback,
    memoizedValue,
    
    // Components
    LazyImage,
    LazyComponent,
    
    // Resource management
    preloadResource,
    prefetchRoute,
    
    // Performance actions
    measureRender,
    reportMetric
  };
};

// HOC for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const MemoizedComponent = React.memo(WrappedComponent);
  
  return function PerformanceTrackedComponent(props: P) {
    const { measureRender } = usePerformance({
      componentName: componentName || WrappedComponent.displayName || WrappedComponent.name,
      trackComponentMetrics: true
    });

    return React.createElement(MemoizedComponent, props as any);
  };
}

// Performance Provider for global optimization settings
interface PerformanceContextValue {
  globalOptimizations: boolean;
  setGlobalOptimizations: (enabled: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextValue>({
  globalOptimizations: true,
  setGlobalOptimizations: () => {}
});

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalOptimizations, setGlobalOptimizations] = useState(true);

  return (
    <PerformanceContext.Provider value={{ globalOptimizations, setGlobalOptimizations }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => useContext(PerformanceContext);

export { usePerformance as default };