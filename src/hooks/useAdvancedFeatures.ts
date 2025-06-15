
import { useEffect, useRef, useCallback } from 'react';
import { usePWA } from './usePWA';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { useAnalytics } from './useAnalytics';
import { useLocation } from 'react-router-dom';

export const useAdvancedFeatures = () => {
  const pwa = usePWA();
  const analytics = useAnalytics();
  const location = useLocation();
  
  // Refs to prevent multiple executions
  const initializedRef = useRef(false);
  const lastPathRef = useRef<string>('');
  const pwaTrackedRef = useRef(false);
  
  // Initialize real-time notifications only once
  useRealtimeNotifications();

  // Stable callback for tracking page views
  const trackPageViewStable = useCallback((path: string) => {
    analytics.trackPageView(path);
  }, []); // No dependencies to prevent recreation

  // Track page changes with optimization - removed problematic dependencies
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip if same path or already processing
    if (lastPathRef.current === currentPath) return;
    
    lastPathRef.current = currentPath;
    
    // Use timeout to debounce and prevent rapid calls
    const timeoutId = setTimeout(() => {
      trackPageViewStable(currentPath);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Only depend on pathname

  // Track PWA install events only once - fixed dependencies
  useEffect(() => {
    if (!pwaTrackedRef.current && pwa.isInstalled && analytics.trackEvent) {
      pwaTrackedRef.current = true;
      // Use timeout to ensure analytics is ready
      setTimeout(() => {
        analytics.trackEvent('pwa_installed');
      }, 100);
    }
  }, [pwa.isInstalled]); // Removed analytics.trackEvent dependency

  // App initialization tracking - only once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      // Delay to ensure all systems are ready
      setTimeout(() => {
        if (analytics.trackEvent) {
          analytics.trackEvent('app_initialized', {
            isPWAInstalled: pwa.isInstalled,
            isOffline: pwa.isOffline,
          });
        }
      }, 1000);
    }
  }, []); // No dependencies - run only once

  return {
    pwa,
    analytics,
  };
};
