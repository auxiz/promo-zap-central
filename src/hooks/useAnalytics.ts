
import { useState, useEffect, useCallback } from 'react';
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
  const [sessionStart, setSessionStart] = useState<number>(Date.now());

  // Track page view
  const trackPageView = useCallback((path: string) => {
    const now = Date.now();
    
    // Update previous page view duration
    setPageViews(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastView = updated[updated.length - 1];
        if (!lastView.duration) {
          lastView.duration = now - lastView.timestamp;
        }
      }
      
      // Add new page view
      updated.push({
        path,
        timestamp: now,
      });
      
      return updated.slice(-50); // Keep last 50 page views
    });

    // Send to analytics service (placeholder)
    console.log('📊 Page View:', { path, timestamp: now, user_id: user?.id });
  }, [user?.id]);

  // Track custom event
  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        user_id: user?.id,
        session_id: sessionStart,
      },
      timestamp: Date.now(),
    };

    setEvents(prev => [...prev, analyticsEvent].slice(-100)); // Keep last 100 events

    // Send to analytics service (placeholder)
    console.log('📊 Event:', analyticsEvent);
  }, [user?.id, sessionStart]);

  // Track user interaction
  const trackInteraction = useCallback((element: string, action: string, context?: string) => {
    trackEvent('user_interaction', {
      element,
      action,
      context,
    });
  }, [trackEvent]);

  // Track performance metrics
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

  // Auto-track page views on route changes
  useEffect(() => {
    const path = window.location.pathname;
    trackPageView(path);

    // Track performance on initial load
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
      return () => window.removeEventListener('load', trackPerformance);
    }
  }, [trackPageView, trackPerformance]);

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      trackEvent('session_heartbeat', {
        session_duration: Date.now() - sessionStart,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [sessionStart, trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackInteraction,
    trackError,
    pageViews,
    events,
    sessionDuration: Date.now() - sessionStart,
  };
};
