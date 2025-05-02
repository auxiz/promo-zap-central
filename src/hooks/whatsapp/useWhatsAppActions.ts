
import { useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppActions(instanceId: string = 'default') {
  const { addNotification } = useNotificationContext();

  const initiateConnection = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instanceId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      addNotification(
        'Conexão Iniciada',
        'Escaneie o código QR para conectar o WhatsApp',
        'info',
        'high'
      );
      
      return true;
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      addNotification(
        'Falha na Conexão',
        'Não foi possível iniciar a conexão com WhatsApp',
        'error',
        'high'
      );
      return false;
    }
  }, [instanceId, addNotification]);
  
  const disconnectWhatsApp = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instanceId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      addNotification(
        'WhatsApp Desconectado',
        'WhatsApp desconectado com sucesso',
        'success',
        'high'
      );
      
      return true;
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      addNotification(
        'Falha ao Desconectar',
        'Falha ao desconectar WhatsApp',
        'error',
        'high'
      );
      return false;
    }
  }, [instanceId, addNotification]);

  return {
    initiateConnection,
    disconnectWhatsApp
  };
}
