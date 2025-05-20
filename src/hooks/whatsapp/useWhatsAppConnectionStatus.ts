
import { useState, useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';
import { useWhatsAppErrorHandler } from './useWhatsAppErrorHandler';
import { useWhatsAppDeviceInfo } from './useWhatsAppDeviceInfo';

export interface WhatsAppStatusData {
  status: string;
  connected?: boolean;
  device?: string;
  since?: string;
}

export function useWhatsAppConnectionStatus(instanceId: string = 'default') {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [backendError, setBackendError] = useState(false);
  
  const { addNotification } = useNotificationContext();
  const { deviceInfo, updateDeviceInfo, setDeviceInfo } = useWhatsAppDeviceInfo();
  const { 
    handleBackendError, 
    handleConnectionChanged,
    resetErrorCounter,
    consecutiveErrors
  } = useWhatsAppErrorHandler({ addNotification });

  // Function to fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/status?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend is responsive, reset error counters
      resetErrorCounter();
      setBackendError(false);

      if (data.status === 'CONNECTED') {
        setConnectionStatus('connected');
        if (data.device) {
          updateDeviceInfo(data.device);
          
          if (connectionStatus !== 'connected') {
            handleConnectionChanged('connected', data.device);
          }
        }
      } else if (data.status === 'PENDING') {
        setConnectionStatus('connecting');
      } else {
        if (connectionStatus === 'connected') {
          handleConnectionChanged('disconnected');
        }
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      
      // Handle the error through our error handler
      setBackendError(true);
      setConnectionStatus('disconnected');
      handleBackendError(connectionStatus === 'connected');
    }
  }, [instanceId, connectionStatus, resetErrorCounter, updateDeviceInfo, handleConnectionChanged, handleBackendError]);

  return {
    connectionStatus,
    deviceInfo,
    backendError,
    fetchStatus,
    setConnectionStatus,
    setDeviceInfo,
    setBackendError,
    consecutiveErrors
  };
}
