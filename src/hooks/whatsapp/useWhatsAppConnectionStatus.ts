
import { useState, useCallback } from 'react';
import { buildInstanceUrl } from '@/utils/api-constants';

export function useWhatsAppConnectionStatus(instanceId: string = 'default') {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [deviceInfo, setDeviceInfo] = useState({ name: '', lastConnection: '' });
  const [backendError, setBackendError] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${buildInstanceUrl(instanceId)}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status for instance ${instanceId}`);
      }
      
      const data = await response.json();
      
      // Map backend status to frontend status
      let frontendStatus = 'disconnected';
      if (data.status === 'CONNECTED') {
        frontendStatus = 'connected';
      } else if (data.status === 'PENDING' || data.status === 'RECONNECTING') {
        frontendStatus = 'connecting';
      } else if (data.status === 'CIRCUIT_OPEN') {
        frontendStatus = 'disconnected';
      }
      
      setConnectionStatus(frontendStatus);
      setDeviceInfo({
        name: data.device || '',
        lastConnection: data.since ? new Date(data.since).toLocaleString() : ''
      });
      setBackendError(false);
      setConsecutiveErrors(0);
      
      return data;
    } catch (error) {
      console.error(`Error fetching status for instance ${instanceId}:`, error);
      setBackendError(true);
      setConsecutiveErrors(prev => prev + 1);
      throw error;
    }
  }, [instanceId]);

  return {
    connectionStatus,
    deviceInfo,
    backendError,
    consecutiveErrors,
    fetchStatus,
    setConnectionStatus
  };
}
