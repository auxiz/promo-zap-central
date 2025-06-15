
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  
  // Stable references that don't change
  const sessionStartRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPageViewRef = useRef<string>('');
  const trackingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(0);
  const performanceTrackedRef = useRef<boolean>(false);

  // Stable session ID using useMemo
  const sessionId = useMemo(() => sessionStartRef.current, []);

  // Stable user ID reference
  const userId = useMemo(() => user?.id, [user?.id]);

  // Track page view with debounce and rate limiting
  const trackPageView = useCallback((path: string) => {
    // Skip if same path was just tracked
    if (lastPageViewRef.current === path) return;
    
    // Clear any existing debounce
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
      console.log('📊 Page View:', { path, timestamp: now, user_id: userId });
    }, 200); // Increased debounce to 200ms
  }, [userId]); // Only depend on userId

  // Track custom event - stable reference with rate limiting
  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    const now = Date.now();
    
    // Rate limit: max 1 event per second for the same event type
    const lastEventKey = `${event}_${JSON.stringify(properties)}`;
    const lastEventTime = sessionStorage.getItem(`last_${lastEventKey}`);
    if (lastEventTime && now - parseInt(lastEventTime) < 1000) {
      return; // Skip if too frequent
    }
    sessionStorage.setItem(`last_${lastEventKey}`, now.toString());

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        user_id: userId,
        session_id: sessionId,
      },
      timestamp: now,
    };

    setEvents(prev => [...prev, analyticsEvent].slice(-100)); // Keep last 100 events

    // Send to analytics service (placeholder)
    console.log('📊 Event:', analyticsEvent);
  }, [userId, sessionId]); // Stable dependencies

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
    if (typeof window.performance === 'undefined' || performanceTrackedRef.current) return;
    performanceTrackedRef.current = true;

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
    if (performanceTrackedRef.current) return;
    
    const handlePerformanceTracking = () => {
      trackPerformance();
    };

    if (document.readyState === 'complete') {
      handlePerformanceTracking();
    } else {
      window.addEventListener('load', handlePerformanceTracking, { once: true });
    }

    return () => {
      window.removeEventListener('load', handlePerformanceTracking);
    };
  }, []); // No dependencies - run only once

  // Session heartbeat - optimized with longer intervals
  useEffect(() => {
    // Clear any existing interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Only set up heartbeat if user exists and we haven't sent one recently
    if (userId) {
      const now = Date.now();
      
      // Don't start heartbeat immediately, wait a bit
      const startHeartbeat = () => {
        heartbeatIntervalRef.current = setInterval(() => {
          const currentTime = Date.now();
          // Rate limit: only send heartbeat if 5 minutes have passed
          if (currentTime - lastHeartbeatRef.current >= 300000) { // 5 minutes
            lastHeartbeatRef.current = currentTime;
            trackEvent('session_heartbeat', {
              session_duration: currentTime - sessionId,
            });
          }
        }, 300000); // Every 5 minutes instead of 60 seconds
      };

      // Start heartbeat after 2 minutes to avoid initial rush
      const delayTimeout = setTimeout(startHeartbeat, 120000);

      return () => {
        clearTimeout(delayTimeout);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      };
    }
  }, [userId, sessionId, trackEvent]); // Minimal dependencies

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
