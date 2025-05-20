
import { useState, useCallback, useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface WhatsAppStatusData {
  status: string;
  connected?: boolean;
  device?: string;
  since?: string;
}

export function useWhatsAppConnectionStatus(instanceId: string = 'default') {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [deviceInfo, setDeviceInfo] = useState({ name: '', lastConnection: '' });
  const [backendError, setBackendError] = useState(false);
  
  // References to track notification times and backend status
  const lastErrorNotificationRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const lastNotificationTypeRef = useRef<string>('');
  
  const { addNotification } = useNotificationContext();

  // Function to fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/status?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend is responsive, reset error counters
      consecutiveErrorsRef.current = 0;
      setBackendError(false);

      if (data.status === 'CONNECTED') {
        setConnectionStatus('connected');
        if (data.device) {
          setDeviceInfo({
            name: `WhatsApp (${data.device})`,
            lastConnection: new Date().toLocaleString()
          });
          
          if (connectionStatus !== 'connected') {
            addNotification(
              'WhatsApp Conectado',
              `Conectado ao dispositivo ${data.device}`,
              'success',
              'high'
            );
            lastNotificationTypeRef.current = 'connected';
          }
        }
      } else if (data.status === 'PENDING') {
        setConnectionStatus('connecting');
      } else {
        if (connectionStatus === 'connected') {
          addNotification(
            'WhatsApp Desconectado',
            'A conexão com o WhatsApp foi perdida',
            'error',
            'high'
          );
          lastNotificationTypeRef.current = 'disconnected';
        }
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      
      // Increment consecutive errors counter
      consecutiveErrorsRef.current += 1;
      setBackendError(true);
      setConnectionStatus('disconnected');
      
      const now = Date.now();
      const timeSinceLastNotification = now - lastErrorNotificationRef.current;
      
      // Only show notification if it's been more than 60 seconds since the last one
      // or if this is the first error after successful connection
      if (
        (timeSinceLastNotification > 60000 || consecutiveErrorsRef.current === 1) && 
        lastNotificationTypeRef.current !== 'backend-error'
      ) {
        addNotification(
          'Erro de API',
          'Não foi possível conectar ao servidor WhatsApp',
          'error',
          'high'
        );
        lastNotificationTypeRef.current = 'backend-error';
        lastErrorNotificationRef.current = now;
      }
    }
  }, [instanceId, connectionStatus, addNotification]);

  return {
    connectionStatus,
    deviceInfo,
    backendError,
    fetchStatus,
    setConnectionStatus,
    setDeviceInfo,
    setBackendError,
    consecutiveErrors: consecutiveErrorsRef.current
  };
}
