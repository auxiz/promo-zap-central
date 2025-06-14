
import { useEffect, useCallback } from 'react';
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

  const sendBrowserNotification = useCallback((title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'promozap-notification',
      });
    }
  }, []);

  const handleNotification = useCallback((notification: RealtimeNotification) => {
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
    // Request notification permission on first load
    requestNotificationPermission();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        (payload) => {
          handleNotification(payload.new as RealtimeNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNotification, requestNotificationPermission]);

  return {
    sendBrowserNotification,
  };
};
