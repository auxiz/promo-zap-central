
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWhatsAppConnectionStatus } from './whatsapp/useWhatsAppConnectionStatus';
import { useWhatsAppQRHandler } from './whatsapp/useWhatsAppQRHandler';
import { useWhatsAppActions } from './whatsapp/useWhatsAppActions';
import { useWhatsAppPolling } from './whatsapp/useWhatsAppPolling';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CONNECTION_CONFIG } from './whatsapp/config/connectionConfig';

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [isLoading, setIsLoading] = useState(false);
  const [statusAttempts, setStatusAttempts] = useState(0);
  
  const reconnectAttemptsRef = useRef<number>(0);
  const { addNotification } = useNotificationContext();
  
  const { 
    connectionStatus, 
    deviceInfo, 
    backendError, 
    fetchStatus,
    setConnectionStatus,
    consecutiveErrors
  } = useWhatsAppConnectionStatus(instanceId);
  
  const { 
    qrCode, 
    fetchQrCodeWithRateLimit,
    resetQrState
  } = useWhatsAppQRHandler(instanceId, connectionStatus);

  const { initiateConnection, disconnectWhatsApp } = useWhatsAppActions(instanceId);

  const { 
    getPollingIntervals,
    clearPollingIntervals,
    setStatusPollingInterval,
    setQrCodePollingInterval 
  } = useWhatsAppPolling({ 
    backendError, 
    connectionStatus, 
    consecutiveErrors 
  });

  // Initial fetch only on mount or when instanceId changes
  useEffect(() => {
    fetchStatus();
    setStatusAttempts(0);
    resetQrState();
  }, [instanceId]);

  // Instance-specific polling with isolation
  useEffect(() => {
    clearPollingIntervals();
    
    // Stop polling after too many failed attempts to prevent server overload
    if (statusAttempts >= CONNECTION_CONFIG.maxStatusAttempts && backendError) {
      console.log(`Reached maximum status check attempts (${CONNECTION_CONFIG.maxStatusAttempts}) for instance ${instanceId}. Stopping polling to reduce server load.`);
      addNotification(
        `Instância ${instanceId} em Modo Conservação`,
        'Polling pausado para reduzir carga no servidor. Use "Atualizar" manualmente.',
        'warning',
        'high'
      );
      return;
    }
    
    const { statusInterval, qrInterval } = getPollingIntervals();
    console.log(`Conservative polling for instance ${instanceId}: status=${statusInterval}ms, qr=${qrInterval}ms`);
    
    // Only poll when absolutely necessary for this specific instance
    if (connectionStatus === 'connecting') {
      // Initial QR code fetch for this instance
      fetchQrCodeWithRateLimit();
      
      // Instance-specific status polling
      setStatusPollingInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
      
      setQrCodePollingInterval(fetchQrCodeWithRateLimit, qrInterval);
    } else if (connectionStatus === 'connected') {
      // Reset attempts counter when successfully connected
      setStatusAttempts(0);
      
      // Very infrequent polling when connected (every 2 minutes for this instance)
      setStatusPollingInterval(() => {
        fetchStatus();
      }, 120000);
    } else {
      // Minimal polling when disconnected to check if server comes back for this instance
      setStatusPollingInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
    }

    return clearPollingIntervals;
  }, [connectionStatus, backendError, fetchStatus, fetchQrCodeWithRateLimit, clearPollingIntervals, 
      consecutiveErrors, statusAttempts, addNotification, getPollingIntervals, setStatusPollingInterval, 
      setQrCodePollingInterval, instanceId]);

  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    setStatusAttempts(0);
    reconnectAttemptsRef.current = 0;
    
    try {
      await initiateConnection();
      await fetchStatus();
      await fetchQrCodeWithRateLimit();
    } catch (error) {
      console.error(`Error in connect flow for instance ${instanceId}:`, error);
      setConnectionStatus('disconnected');
      addNotification(
        `Erro de Conexão - ${instanceId}`,
        `Não foi possível iniciar a conexão com WhatsApp para a instância ${instanceId}. O servidor pode estar sobrecarregado.`,
        'error',
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQrCodeScanned = async () => {
    await fetchStatus();
  };
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      const success = await disconnectWhatsApp();
      if (success) {
        setConnectionStatus('disconnected');
        resetQrState();
        setStatusAttempts(0);
        addNotification(
          `WhatsApp Desconectado - ${instanceId}`,
          `WhatsApp foi desconectado com sucesso da instância ${instanceId}`,
          'success',
          'high'
        );
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error(`Error disconnecting WhatsApp instance ${instanceId}:`, error);
      addNotification(
        `Erro ao Desconectar - ${instanceId}`,
        `Não foi possível desconectar o WhatsApp da instância ${instanceId}. Tente novamente.`,
        'error',
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual refresh with rate limiting for specific instance
  const refreshStatus = useCallback(async () => {
    setStatusAttempts(0);
    await fetchStatus();
  }, [fetchStatus]);

  return {
    connectionStatus,
    qrCode,
    deviceInfo,
    isLoading,
    backendError,
    handleConnect,
    handleQrCodeScanned,
    handleDisconnect,
    refreshStatus,
    statusAttempts,
    instanceId // Return instanceId for reference
  };
}
