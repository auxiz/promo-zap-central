
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { usePWA } from './usePWA';

interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user_id: string;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { addNotification } = useNotificationContext();
  const { requestNotificationPermission } = usePWA();
  const channelRef = useRef<any>(null);
  const permissionRequestedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const sendBrowserNotification = useCallback((title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Rate limit browser notifications
      const lastNotificationKey = `last_browser_notification_${title}`;
      const lastTime = sessionStorage.getItem(lastNotificationKey);
      const now = Date.now();
      
      if (lastTime && now - parseInt(lastTime) < 5000) { // 5 second cooldown
        return;
      }
      
      sessionStorage.setItem(lastNotificationKey, now.toString());
      
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'promozap-notification',
      });
    }
  }, []);

  const handleNotification = useCallback((notification: RealtimeNotification) => {
    // Rate limit notifications processing
    const lastProcessedKey = `last_processed_${notification.id}`;
    if (sessionStorage.getItem(lastProcessedKey)) {
      return; // Already processed
    }
    sessionStorage.setItem(lastProcessedKey, Date.now().toString());

    // Add to internal notification system
    addNotification(
      notification.title,
      notification.message,
      notification.type,
      'high'
    );

    // Send browser notification if permission granted
    sendBrowserNotification(notification.title, notification.message);
  }, [addNotification, sendBrowserNotification]);

  useEffect(() => {
    // Request notification permission only once
    if (!permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      // Delay to avoid blocking app startup
      setTimeout(() => {
        requestNotificationPermission();
      }, 3000);
    }

    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Get current user and subscribe to notifications
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id !== userIdRef.current) {
          userIdRef.current = user.id;
          
          // Subscribe to real-time notifications
          channelRef.current = supabase
            .channel(`notifications_${user.id}`) // Unique channel per user
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                handleNotification(payload.new as RealtimeNotification);
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };

    // Delay setup to avoid blocking app initialization
    const timeoutId = setTimeout(setupRealtimeSubscription, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [handleNotification, requestNotificationPermission]);

  return {
    sendBrowserNotification,
  };
};
