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
  
  // Track reconnection attempts
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

  // Initial fetch of status on component mount - only once
  useEffect(() => {
    fetchStatus();
    // We're intentionally only running this on mount and instanceId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  // Adaptive polling based on backend status and connection state
  useEffect(() => {
    // Clear any existing intervals when state changes
    clearPollingIntervals();
    
    // Check if we should stop polling due to too many failed attempts
    if (statusAttempts >= CONNECTION_CONFIG.maxStatusAttempts && backendError) {
      console.log(`Reached maximum status check attempts (${CONNECTION_CONFIG.maxStatusAttempts}). Pausing automatic checks.`);
      addNotification(
        'API Indisponível',
        'As verificações automáticas foram pausadas devido a falhas consecutivas. Tente novamente mais tarde.',
        'warning',
        'low'
      );
      return; // Don't set up new intervals
    }
    
    const { statusInterval, qrInterval } = getPollingIntervals();
    console.log(`Setting polling intervals: status=${statusInterval}ms, qr=${qrInterval}ms`);
    
    // Set up new intervals based on connection status and backend health
    if (connectionStatus === 'connecting') {
      // Initial QR code fetch
      fetchQrCodeWithRateLimit();
      
      // Set new polling intervals
      setStatusPollingInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
      
      setQrCodePollingInterval(fetchQrCodeWithRateLimit, qrInterval);
    } else if (connectionStatus === 'connected') {
      // When connected, only poll status occasionally to verify connection
      setStatusAttempts(0); // Reset attempts counter when successfully connected
      
      setStatusPollingInterval(() => {
        fetchStatus();
      }, 60000); // Check once per minute when connected
    } else {
      // When disconnected, check status occasionally in case backend comes back
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
    setStatusAttempts(0); // Reset attempts counter when manually connecting
    reconnectAttemptsRef.current = 0; // Reset reconnection attempts
    
    try {
      await initiateConnection();
      // WPPConnect may restore session without needing QR code
      await fetchStatus();
      await fetchQrCodeWithRateLimit();
    } catch (error) {
      console.error('Error in connect flow:', error);
      setConnectionStatus('disconnected');
      addNotification(
        'Erro de Conexão',
        'Não foi possível iniciar a conexão com WhatsApp. Tente novamente mais tarde.',
        'error',
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQrCodeScanned = async () => {
    // With WPPConnect this is handled automatically on the backend
    await fetchStatus();
  };
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      const success = await disconnectWhatsApp();
      if (success) {
        setConnectionStatus('disconnected');
        resetQrState(); // Clear QR code after disconnection
        setStatusAttempts(0); // Reset attempts counter when manually disconnecting
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
  
  // Function to manually trigger a status check (for UI refresh button)
  const refreshStatus = useCallback(async () => {
    setStatusAttempts(0); // Reset attempts counter on manual refresh
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
