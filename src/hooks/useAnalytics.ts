
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

interface PageView {
  path: string;
  timestamp: number;
  duration?: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const sessionStartRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPageViewRef = useRef<string>('');
  const trackingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Stable session ID that doesn't change
  const sessionId = sessionStartRef.current;

  // Track page view with debounce to prevent excessive calls
  const trackPageView = useCallback((path: string) => {
    // Skip if same path was just tracked
    if (lastPageViewRef.current === path) return;
    
    // Debounce to prevent rapid successive calls
    if (trackingDebounceRef.current) {
      clearTimeout(trackingDebounceRef.current);
    }
    
    trackingDebounceRef.current = setTimeout(() => {
      const now = Date.now();
      lastPageViewRef.current = path;
      
      setPageViews(prev => {
        const updated = [...prev];
        // Update previous page view duration
        if (updated.length > 0) {
          const lastView = updated[updated.length - 1];
          if (!lastView.duration && lastView.path !== path) {
            lastView.duration = now - lastView.timestamp;
          }
        }
        
        // Add new page view only if different from last
        if (updated.length === 0 || updated[updated.length - 1].path !== path) {
          updated.push({ path, timestamp: now });
        }
        
        return updated.slice(-50); // Keep last 50 page views
      });

      // Send to analytics service (placeholder)
      console.log('📊 Page View:', { path, timestamp: now, user_id: user?.id });
    }, 100); // 100ms debounce
  }, [user?.id]);

  // Track custom event - stable reference
  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        user_id: user?.id,
        session_id: sessionId,
      },
      timestamp: Date.now(),
    };

    setEvents(prev => [...prev, analyticsEvent].slice(-100)); // Keep last 100 events

    // Send to analytics service (placeholder)
    console.log('📊 Event:', analyticsEvent);
  }, [user?.id, sessionId]);

  // Track user interaction
  const trackInteraction = useCallback((element: string, action: string, context?: string) => {
    trackEvent('user_interaction', {
      element,
      action,
      context,
    });
  }, [trackEvent]);

  // Track performance metrics - only once per session
  const trackPerformance = useCallback(() => {
    if (typeof window.performance === 'undefined') return;

    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      trackEvent('performance_metrics', {
        load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      });
    }
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }, [trackEvent]);

  // Initialize performance tracking only once
  useEffect(() => {
    let performanceTracked = false;
    
    const handlePerformanceTracking = () => {
      if (!performanceTracked) {
        performanceTracked = true;
        trackPerformance();
      }
    };

    if (document.readyState === 'complete') {
      handlePerformanceTracking();
    } else {
      window.addEventListener('load', handlePerformanceTracking, { once: true });
    }

    return () => {
      window.removeEventListener('load', handlePerformanceTracking);
    };
  }, [trackPerformance]);

  // Session heartbeat - with proper cleanup
  useEffect(() => {
    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Set up new interval only if user exists
    if (user?.id) {
      heartbeatIntervalRef.current = setInterval(() => {
        trackEvent('session_heartbeat', {
          session_duration: Date.now() - sessionId,
        });
      }, 60000); // Reduced to every 60 seconds instead of 30
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [user?.id, trackEvent, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingDebounceRef.current) {
        clearTimeout(trackingDebounceRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackInteraction,
    trackError,
    pageViews,
    events,
    sessionDuration: Date.now() - sessionId,
  };
};
