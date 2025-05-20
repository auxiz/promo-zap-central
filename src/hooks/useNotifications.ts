
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';

export type NotificationType = 'error' | 'warning' | 'info' | 'success';
export type NotificationPriority = 'high' | 'low';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  priority: NotificationPriority;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Use a ref to track the last notification for deduplication
  const lastNotificationRef = useRef<{
    title: string;
    timestamp: number;
  }>({ title: '', timestamp: 0 });

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
    
    // Check for duplicate notifications (same title within 60 seconds)
    if (
      title === lastNotificationRef.current.title && 
      now - lastNotificationRef.current.timestamp < 60000
    ) {
      // Skip duplicate notification
      return '';
    }
    
    // Update last notification reference
    lastNotificationRef.current = {
      title, 
      timestamp: now
    };
    
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
  }, []);
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  };
}
