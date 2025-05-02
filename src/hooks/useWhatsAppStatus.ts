
import { useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';

// API base URL (using the same as other components)
const API_BASE = 'http://168.231.98.177:4000';

export interface WhatsAppStatus {
  connected: boolean;
  device: string;
  since: number | null;
  status: string;
}

export function useWhatsAppStatus() {
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    connected: false,
    device: '',
    since: null,
    status: 'DISCONNECTED'
  });
  
  const { addNotification } = useNotificationContext();

  const fetchWhatsappStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      if (response.ok) {
        const data = await response.json();
        setWhatsappStatus(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      addNotification(
        'Erro na API',
        'Não foi possível obter o status do WhatsApp. Verifique a conexão com o servidor.',
        'error',
        'high'
      );
      return null;
    }
  };

  const handleCheckStatus = async () => {
    setIsStatusLoading(true);
    try {
      const status = await fetchWhatsappStatus();
      
      if (status) {
        if (status.connected) {
          addNotification(
            'WhatsApp Conectado',
            `Conectado ao dispositivo ${status.device}`,
            'success',
            'low' // Low priority for regular status checks
          );
        } else {
          addNotification(
            'WhatsApp Desconectado',
            'Nenhuma conexão ativa no momento',
            'error',
            'high' // High priority for disconnection status
          );
        }
      } else {
        addNotification(
          'Erro de Conexão',
          'Não foi possível verificar o status do WhatsApp. Servidor offline?',
          'error',
          'high'
        );
      }
    } catch (error) {
      console.error('Error checking status:', error);
      addNotification(
        'Falha na Verificação',
        'Ocorreu um erro ao verificar o status do WhatsApp.',
        'error',
        'high'
      );
    } finally {
      setIsStatusLoading(false);
    }
  };

  return {
    isStatusLoading,
    whatsappStatus,
    fetchWhatsappStatus,
    handleCheckStatus
  };
}
