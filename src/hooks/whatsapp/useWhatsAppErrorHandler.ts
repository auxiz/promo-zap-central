
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
  const maxApiErrorsRef = useRef<number>(CONNECTION_CONFIG.maxErrorNotifications || 3);
  const apiErrorCountRef = useRef<number>(0);
  
  const handleBackendError = (wasConnected: boolean = false) => {
    consecutiveErrorsRef.current += 1;
    
    const now = Date.now();
    const timeSinceLastNotification = now - lastErrorNotificationRef.current;
    
    // Only show notification if we haven't shown too many and enough time has passed
    if (
      apiErrorCountRef.current < maxApiErrorsRef.current &&
      ((timeSinceLastNotification > CONNECTION_CONFIG.maxPollingInterval) ||
       (consecutiveErrorsRef.current === 1 && lastNotificationTypeRef.current !== 'backend-error'))
    ) {
      addNotification(
        'Conectando ao servidor',
        'Configurando conexão com WhatsApp via Supabase...',
        'info',
        'silent'
      );
      lastNotificationTypeRef.current = 'backend-error';
      lastErrorNotificationRef.current = now;
      apiErrorCountRef.current += 1;
    }
  };
  
  const handleConnectionChanged = (newStatus: string, deviceName?: string) => {
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
