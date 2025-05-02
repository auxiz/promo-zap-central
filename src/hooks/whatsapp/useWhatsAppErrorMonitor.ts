
import { useState, useCallback, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export interface WhatsAppErrorStats {
  qrCodeErrors: number;
  connectionErrors: number;
  disconnectionErrors: number;
  retryAttempts: number;
  lastError: {
    timestamp: number;
    type: string;
    message: string;
    details?: string;
  } | null;
  errorHistory: Array<{
    timestamp: number;
    type: string;
    message: string;
    details?: string;
  }>;
}

export interface GlobalErrorStats {
  qrCodeErrors: number;
  connectionErrors: number;
  disconnectionErrors: number;
  totalErrors: number;
  lastError: {
    timestamp: number;
    type: string;
    message: string;
    details?: string;
  } | null;
}

export function useWhatsAppErrorMonitor(instanceId: string = 'default', autoRefresh: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorStats, setErrorStats] = useState<WhatsAppErrorStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalErrorStats | null>(null);
  
  const { addNotification } = useNotificationContext();

  // Fetch error stats for the instance
  const fetchErrorStats = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/errors?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setErrorStats(data.errors);
      
      return data.errors;
    } catch (error) {
      console.error('Error fetching WhatsApp error stats:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);

  // Fetch global error stats
  const fetchGlobalErrorStats = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/errors`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGlobalStats(data.global);
      
      return data;
    } catch (error) {
      console.error('Error fetching global WhatsApp error stats:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error history
  const clearErrorHistory = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/errors`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh stats after clearing
      await fetchErrorStats();
      
      addNotification(
        'Histórico Limpo',
        'O histórico de erros foi limpo com sucesso',
        'success',
        'low'
      );
      
      return true;
    } catch (error) {
      console.error('Error clearing error history:', error);
      
      addNotification(
        'Erro ao Limpar',
        'Não foi possível limpar o histórico de erros',
        'error',
        'high'
      );
      
      return false;
    }
  }, [instanceId, fetchErrorStats, addNotification]);

  // Auto refresh error stats if enabled
  useEffect(() => {
    if (autoRefresh) {
      const fetchData = async () => {
        await fetchErrorStats();
      };

      fetchData();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Fetch once on mount if not auto refreshing
      fetchErrorStats();
    }
  }, [autoRefresh, fetchErrorStats, instanceId]);

  return {
    isLoading,
    errorStats,
    globalStats,
    fetchErrorStats,
    fetchGlobalErrorStats,
    clearErrorHistory
  };
}
