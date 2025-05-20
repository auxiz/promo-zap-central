
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';

export type NotificationType = 'error' | 'warning' | 'info' | 'success';
export type NotificationPriority = 'high' | 'low' | 'silent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  priority: NotificationPriority;
}

// Configuration for notification behaviors
const notificationConfig = {
  deduplicationTime: 300000, // 5 minutes (300 seconds) in milliseconds
  maxNotificationsPerType: 3, // Maximum number of notifications of the same type in a session
  errorSnoozeTime: 1800000, // 30 minutes in milliseconds for "snoozing" error notifications
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use refs to track notification history for deduplication and rate limiting
  const lastNotificationRef = useRef<{
    title: string;
    type: string;
    timestamp: number;
  }>({ title: '', type: '', timestamp: 0 });
  
  // Track counts of each notification type to implement "snooze" after too many
  const notificationCountsRef = useRef<Record<string, number>>({});
  
  // Track if we're in a "snooze" period for specific notification types
  const snoozedNotificationsRef = useRef<Record<string, number>>({});

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Add a new notification
  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: NotificationType = 'info',
    priority: NotificationPriority = 'low'
  ) => {
    const now = Date.now();
    const notificationType = `${type}-${title}`;
    
    // Check if we're in a snooze period for this notification type
    if (snoozedNotificationsRef.current[notificationType] && 
        now < snoozedNotificationsRef.current[notificationType]) {
      // Skip notification during snooze period
      return '';
    }
    
    // Check for duplicate notifications (same title and type within deduplication time)
    if (
      title === lastNotificationRef.current.title &&
      type === lastNotificationRef.current.type &&
      now - lastNotificationRef.current.timestamp < notificationConfig.deduplicationTime
    ) {
      // Skip duplicate notification
      return '';
    }
    
    // Update last notification reference
    lastNotificationRef.current = {
      title, 
      type,
      timestamp: now
    };
    
    // Increment count for this notification type
    notificationCountsRef.current[notificationType] = 
      (notificationCountsRef.current[notificationType] || 0) + 1;
    
    // If we've shown too many of this notification, snooze it
    if (type === 'error' && 
        notificationCountsRef.current[notificationType] > notificationConfig.maxNotificationsPerType) {
      snoozedNotificationsRef.current[notificationType] = now + notificationConfig.errorSnoozeTime;
      console.log(`Snoozing "${title}" notifications for ${notificationConfig.errorSnoozeTime/60000} minutes`);
      return '';
    }
    
    const newNotification: Notification = {
      id: `notification-${now}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date(),
      priority
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep only last 20 notifications
    
    // Only show toast for high priority notifications
    if (priority === 'high') {
      if (type === 'error') {
        toast.error(title, { description: message });
      } else if (type === 'success') {
        toast.success(title, { description: message });
      } else if (type === 'warning') {
        toast.warning(title, { description: message });
      } else {
        toast.info(title, { description: message });
      }
    }
    
    return newNotification.id;
  }, []);
  
  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);
  
  // Clear a notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    // Also reset the notification counts and snooze states
    notificationCountsRef.current = {};
    snoozedNotificationsRef.current = {};
  }, []);
  
  // Reset the snooze state for a specific notification type
  const resetSnooze = useCallback((type: string, title: string) => {
    const notificationType = `${type}-${title}`;
    if (snoozedNotificationsRef.current[notificationType]) {
      delete snoozedNotificationsRef.current[notificationType];
      notificationCountsRef.current[notificationType] = 0;
      console.log(`Reset snooze for "${title}" notifications`);
    }
  }, []);
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    resetSnooze
  };
}
