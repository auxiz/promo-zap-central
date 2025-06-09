
import { useCallback } from 'react';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppActions(instanceId: string = 'default') {
  const initiateConnection = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances/${instanceId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to connect instance ${instanceId}`);
      }
      
      console.log(`Connection initiated for instance ${instanceId}`);
    } catch (error) {
      console.error(`Error initiating connection for instance ${instanceId}:`, error);
      throw error;
    }
  }, [instanceId]);

  const disconnectWhatsApp = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances/${instanceId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to disconnect instance ${instanceId}`);
      }
      
      console.log(`Successfully disconnected instance ${instanceId}`);
      return true;
    } catch (error) {
      console.error(`Error disconnecting instance ${instanceId}:`, error);
      return false;
    }
  }, [instanceId]);

  return {
    initiateConnection,
    disconnectWhatsApp
  };
}
