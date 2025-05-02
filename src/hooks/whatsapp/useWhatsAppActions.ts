
import { useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppActions(instanceId: string = 'default') {
  const { addNotification } = useNotificationContext();

  // Function to initiate WhatsApp connection
  const initiateConnection = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error initiating WhatsApp connection:', error);
      addNotification(
        'Erro de Conexão',
        'Não foi possível iniciar a conexão com WhatsApp',
        'error',
        'high'
      );
      return false;
    }
  }, [instanceId, addNotification]);

  // Function to disconnect WhatsApp
  const disconnectWhatsApp = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.status === 'DISCONNECTED';
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      addNotification(
        'Erro ao Desconectar',
        'Ocorreu um erro ao tentar desconectar o WhatsApp',
        'error',
        'high'
      );
      return false;
    }
  }, [instanceId, addNotification]);

  return { initiateConnection, disconnectWhatsApp };
}
