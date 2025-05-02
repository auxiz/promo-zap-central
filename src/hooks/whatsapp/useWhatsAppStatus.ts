
import { useState, useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface WhatsAppStatusData {
  status: string;
  connected: boolean;
  device?: string;
  since?: number | null;
}

export interface WhatsAppMetricsData {
  uptime: number;
  connectionState: string;
  messages: {
    sent: number;
    received: number;
    failed: number;
  };
  rateLimits: {
    isThrottled: boolean;
  };
}

export function useWhatsAppStatus(instanceId: string = 'default') {
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatusData>({
    connected: false,
    status: 'DISCONNECTED',
  });
  const [metricsData, setMetricsData] = useState<WhatsAppMetricsData | null>(null);
  
  const { addNotification } = useNotificationContext();

  const fetchWhatsappStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/status?instanceId=${instanceId}`);
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
  }, [instanceId, addNotification]);
  
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/metrics?instanceId=${instanceId}`);
      if (response.ok) {
        const data = await response.json();
        setMetricsData(data.metrics);
        return data.metrics;
      }
      return null;
    } catch (error) {
      console.error('Error fetching WhatsApp metrics:', error);
      return null;
    }
  }, [instanceId]);

  const handleCheckStatus = useCallback(async () => {
    setIsStatusLoading(true);
    try {
      const status = await fetchWhatsappStatus();
      await fetchMetrics();
      
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
  }, [fetchWhatsappStatus, fetchMetrics, addNotification]);

  return {
    isStatusLoading,
    whatsappStatus,
    metricsData,
    fetchWhatsappStatus,
    fetchMetrics,
    handleCheckStatus
  };
}
