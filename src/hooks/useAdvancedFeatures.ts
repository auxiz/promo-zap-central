
import { useEffect } from 'react';
import { usePWA } from './usePWA';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { useAnalytics } from './useAnalytics';
import { useLocation } from 'react-router-dom';

export const useAdvancedFeatures = () => {
  const pwa = usePWA();
  const analytics = useAnalytics();
  const location = useLocation();
  
  // Initialize real-time notifications
  useRealtimeNotifications();

  // Track page changes
  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location.pathname, analytics]);

  // Track PWA install events
  useEffect(() => {
    if (pwa.isInstalled) {
      analytics.trackEvent('pwa_installed');
    }
  }, [pwa.isInstalled, analytics]);

  return {
    pwa,
    analytics,
  };
};
