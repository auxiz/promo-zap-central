
import { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationUtils = useNotifications();
  
  return (
    <NotificationContext.Provider value={notificationUtils}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}
