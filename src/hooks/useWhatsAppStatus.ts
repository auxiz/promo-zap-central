
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

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
      return null;
    }
  };

  const handleCheckStatus = async () => {
    setIsStatusLoading(true);
    try {
      const status = await fetchWhatsappStatus();
      
      if (status) {
        toast({
          title: status.connected ? "WhatsApp Conectado" : "WhatsApp Desconectado",
          description: status.connected 
            ? `Conectado ao dispositivo ${status.device}` 
            : "Nenhuma conexão ativa no momento",
          variant: status.connected ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível verificar o status do WhatsApp. Servidor offline?",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
      toast({
        title: "Falha na Verificação",
        description: "Ocorreu um erro ao verificar o status do WhatsApp.",
        variant: "destructive",
      });
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
