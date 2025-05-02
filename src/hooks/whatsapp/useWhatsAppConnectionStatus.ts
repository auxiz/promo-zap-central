
import { useState, useCallback } from 'react';
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
  
  const { addNotification } = useNotificationContext();

  // Function to fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/status?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clear any backend error if we got a successful response
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
        }
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setBackendError(true);
      setConnectionStatus('disconnected');
      
      if (!backendError) {
        addNotification(
          'Erro de API',
          'Não foi possível conectar ao servidor WhatsApp',
          'error',
          'high'
        );
      }
    }
  }, [instanceId, connectionStatus, backendError, addNotification]);

  return {
    connectionStatus,
    deviceInfo,
    backendError,
    fetchStatus,
    setConnectionStatus,
    setDeviceInfo,
    setBackendError
  };
}
