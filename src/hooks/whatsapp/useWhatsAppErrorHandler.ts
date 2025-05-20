
import { useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CONNECTION_CONFIG } from './config/connectionConfig';

interface UseWhatsAppErrorHandlerProps {
  addNotification: (title: string, message: string, type?: string, priority?: string) => string;
}

export function useWhatsAppErrorHandler({ addNotification }: UseWhatsAppErrorHandlerProps) {
  // References to track notification times and backend status
  const lastErrorNotificationRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const lastNotificationTypeRef = useRef<string>('');
  const maxApiErrorsRef = useRef<number>(CONNECTION_CONFIG.maxErrorNotifications || 3); // Maximum API error notifications to show per session
  const apiErrorCountRef = useRef<number>(0); // Count of API error notifications shown
  
  const handleBackendError = (wasConnected: boolean = false) => {
    // Increment consecutive errors counter
    consecutiveErrorsRef.current += 1;
    
    const now = Date.now();
    const timeSinceLastNotification = now - lastErrorNotificationRef.current;
    
    // Only show notification if:
    // 1. It's been more than 5 minutes since the last one OR
    // 2. This is the first error after successful connection
    // 3. We haven't shown too many API error notifications
    if (
      apiErrorCountRef.current < maxApiErrorsRef.current &&
      ((timeSinceLastNotification > CONNECTION_CONFIG.maxPollingInterval) || // 5 minutes
       (consecutiveErrorsRef.current === 1 && lastNotificationTypeRef.current !== 'backend-error'))
    ) {
      addNotification(
        'Erro de API',
        'Não foi possível conectar ao servidor WhatsApp',
        'error',
        'silent'
      );
      lastNotificationTypeRef.current = 'backend-error';
      lastErrorNotificationRef.current = now;
      apiErrorCountRef.current += 1;
    }
  };
  
  const handleConnectionChanged = (newStatus: string, deviceName?: string) => {
    // Reset consecutive errors counter when connection is successful
    if (newStatus === 'connected') {
      consecutiveErrorsRef.current = 0;
      
      addNotification(
        'WhatsApp Conectado',
        `Conectado ao dispositivo ${deviceName || 'WhatsApp'}`,
        'success',
        'high'
      );
      lastNotificationTypeRef.current = 'connected';
    } else if (newStatus === 'disconnected' && lastNotificationTypeRef.current === 'connected') {
      addNotification(
        'WhatsApp Desconectado',
        'A conexão com o WhatsApp foi perdida',
        'error',
        'high'
      );
      lastNotificationTypeRef.current = 'disconnected';
    }
  };
  
  const resetErrorCounter = () => {
    consecutiveErrorsRef.current = 0;
  };
  
  return {
    handleBackendError,
    handleConnectionChanged,
    resetErrorCounter,
    consecutiveErrors: consecutiveErrorsRef.current,
    apiErrorCount: apiErrorCountRef.current
  };
}
