
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

  // Initial fetch only on mount
  useEffect(() => {
    fetchStatus();
  }, [instanceId]);

  // Much more conservative polling to reduce server load
  useEffect(() => {
    clearPollingIntervals();
    
    // Stop polling after too many failed attempts to prevent server overload
    if (statusAttempts >= CONNECTION_CONFIG.maxStatusAttempts && backendError) {
      console.log(`Reached maximum status check attempts (${CONNECTION_CONFIG.maxStatusAttempts}). Stopping polling to reduce server load.`);
      addNotification(
        'Sistema em Modo Conservação',
        'Polling pausado para reduzir carga no servidor. Use "Atualizar" manualmente.',
        'warning',
        'high'
      );
      return;
    }
    
    const { statusInterval, qrInterval } = getPollingIntervals();
    console.log(`Conservative polling: status=${statusInterval}ms, qr=${qrInterval}ms`);
    
    // Only poll when absolutely necessary
    if (connectionStatus === 'connecting') {
      // Initial QR code fetch
      fetchQrCodeWithRateLimit();
      
      // Much less frequent polling when connecting
      setStatusPollingInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
      
      setQrCodePollingInterval(fetchQrCodeWithRateLimit, qrInterval);
    } else if (connectionStatus === 'connected') {
      // Reset attempts counter when successfully connected
      setStatusAttempts(0);
      
      // Very infrequent polling when connected (every 2 minutes)
      setStatusPollingInterval(() => {
        fetchStatus();
      }, 120000);
    } else {
      // Minimal polling when disconnected to check if server comes back
      setStatusPollingInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
    }

    return clearPollingIntervals;
  }, [connectionStatus, backendError, fetchStatus, fetchQrCodeWithRateLimit, clearPollingIntervals, 
      consecutiveErrors, statusAttempts, addNotification, getPollingIntervals, setStatusPollingInterval, 
      setQrCodePollingInterval]);

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
      console.error('Error in connect flow:', error);
      setConnectionStatus('disconnected');
      addNotification(
        'Erro de Conexão',
        'Não foi possível iniciar a conexão com WhatsApp. O servidor pode estar sobrecarregado.',
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
          'WhatsApp Desconectado',
          'WhatsApp foi desconectado com sucesso',
          'success',
          'high'
        );
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      addNotification(
        'Erro ao Desconectar',
        'Não foi possível desconectar o WhatsApp. Tente novamente.',
        'error',
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual refresh with rate limiting
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
    statusAttempts
  };
}
