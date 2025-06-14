
import { useEffect, useRef } from 'react';
import { usePWA } from './usePWA';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { useAnalytics } from './useAnalytics';
import { useLocation } from 'react-router-dom';

export const useAdvancedFeatures = () => {
  const pwa = usePWA();
  const analytics = useAnalytics();
  const location = useLocation();
  const initializedRef = useRef(false);
  const lastPathRef = useRef<string>('');
  
  // Initialize real-time notifications only once
  useRealtimeNotifications();

  // Track page changes with optimization
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Skip if same path or already processing
    if (lastPathRef.current === currentPath) return;
    
    lastPathRef.current = currentPath;
    analytics.trackPageView(currentPath);
  }, [location.pathname, analytics.trackPageView]);

  // Track PWA install events only once
  useEffect(() => {
    if (!initializedRef.current && pwa.isInstalled) {
      initializedRef.current = true;
      analytics.trackEvent('pwa_installed');
    }
  }, [pwa.isInstalled, analytics.trackEvent]);

  return {
    pwa,
    analytics,
  };
};
