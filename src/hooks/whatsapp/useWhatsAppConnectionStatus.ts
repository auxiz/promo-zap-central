
import { useState, useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppConnectionStatus(instanceId: string = 'default') {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [deviceInfo, setDeviceInfo] = useState({ name: '', lastConnection: '' });
  const [backendError, setBackendError] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  
  const { addNotification } = useNotificationContext();

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances/${instanceId}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch status for instance ${instanceId}`);
      }
      
      const data = await response.json();
      
      // Map backend status to frontend status
      let status = 'disconnected';
      if (data.connected) {
        status = 'connected';
      } else if (data.status === 'PENDING' || data.status === 'CONNECTING') {
        status = 'connecting';
      } else if (data.status === 'RECONNECTING') {
        status = 'connecting';
      }
      
      setConnectionStatus(status);
      setDeviceInfo({
        name: data.device || '',
        lastConnection: data.since ? new Date(data.since).toLocaleString() : ''
      });
      
      // Reset error state on successful fetch
      setBackendError(false);
      setConsecutiveErrors(0);
      
    } catch (error) {
      console.error(`Error fetching status for instance ${instanceId}:`, error);
      
      setBackendError(true);
      setConsecutiveErrors(prev => prev + 1);
      
      // Show error notification only for the first few errors to avoid spam
      if (consecutiveErrors < 2) {
        addNotification(
          `Erro de Status - ${instanceId}`,
          `Não foi possível verificar o status da instância ${instanceId}`,
          'error',
          'silent'
        );
      }
    }
  }, [instanceId, consecutiveErrors, addNotification]);

  return {
    connectionStatus,
    deviceInfo,
    backendError,
    consecutiveErrors,
    fetchStatus,
    setConnectionStatus
  };
}
