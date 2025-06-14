
import { useEffect, useCallback } from 'react';

interface BundleOptimizationConfig {
  enablePreloading?: boolean;
  enablePrefetching?: boolean;
  enableResourceHints?: boolean;
}

export const useBundleOptimization = ({
  enablePreloading = true,
  enablePrefetching = true,
  enableResourceHints = true
}: BundleOptimizationConfig = {}) => {

  // Add resource hints for better performance
  const addResourceHints = useCallback(() => {
    if (!enableResourceHints) return;

    const head = document.head;
    
    // DNS prefetch for external resources
    const dnsPrefetchUrls = [
      '//fonts.googleapis.com',
      '//cdn.jsdelivr.net',
    ];

    dnsPrefetchUrls.forEach(url => {
      if (!document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        head.appendChild(link);
      }
    });

    // Preconnect to critical third-party origins
    const preconnectUrls = [
      'https://fonts.googleapis.com',
    ];

    preconnectUrls.forEach(url => {
      if (!document.querySelector(`link[href="${url}"][rel="preconnect"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        head.appendChild(link);
      }
    });
  }, [enableResourceHints]);

  // Prefetch critical routes
  const prefetchCriticalRoutes = useCallback(() => {
    if (!enablePrefetching) return;

    const criticalRoutes = [
      '/static/js/pages/Index.js',
      '/static/js/pages/WhatsAppConexao.js',
    ];

    criticalRoutes.forEach(route => {
      if (!document.querySelector(`link[href="${route}"]`)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      }
    });
  }, [enablePrefetching]);

  // Dynamic import with retry logic
  const dynamicImport = useCallback(async <T>(
    importFn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        console.warn(`Retry ${i + 1}/${retries} for dynamic import`, error);
      }
    }
    throw new Error('All retries failed');
  }, []);

  // Monitor bundle size and performance
  const monitorPerformance = useCallback(() => {
    if (typeof window.performance === 'undefined') return;

    // Monitor navigation timing
    const navigationTiming = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationTiming) {
      const metrics = {
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
        loadComplete: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
      };

      // Get paint timing if available
      const paintTimings = window.performance.getEntriesByType('paint');
      paintTimings.forEach(timing => {
        if (timing.name === 'first-paint') {
          metrics.firstPaint = timing.startTime;
        } else if (timing.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = timing.startTime;
        }
      });

      console.log('📊 Performance Metrics:', metrics);
    }
  }, []);

  useEffect(() => {
    addResourceHints();
    
    // Add small delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      prefetchCriticalRoutes();
      monitorPerformance();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [addResourceHints, prefetchCriticalRoutes, monitorPerformance]);

  return {
    dynamicImport,
    addResourceHints,
    prefetchCriticalRoutes,
    monitorPerformance,
  };
};

// Hook para code splitting inteligente
export const useIntelligentCodeSplitting = () => {
  const isSlowConnection = useCallback(() => {
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      // Consider 2G/slow-2g as slow connections
      return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
    }
    
    // Fallback: assume slow connection if we can't detect
    return false;
  }, []);

  const shouldLazyLoad = useCallback((componentSize: 'small' | 'medium' | 'large') => {
    const isSlow = isSlowConnection();
    
    // Always lazy load large components
    if (componentSize === 'large') return true;
    
    // On slow connections, lazy load medium components too
    if (componentSize === 'medium' && isSlow) return true;
    
    // Small components - load immediately on fast connections
    return false;
  }, [isSlowConnection]);

  return {
    isSlowConnection,
    shouldLazyLoad,
  };
};
