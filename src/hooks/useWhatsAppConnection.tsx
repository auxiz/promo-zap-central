
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWhatsAppConnectionStatus } from './whatsapp/useWhatsAppConnectionStatus';
import { useWhatsAppQRCode } from './whatsapp/useWhatsAppQRCode';
import { useWhatsAppActions } from './whatsapp/useWhatsAppActions';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeAttempts, setQrCodeAttempts] = useState(0);
  const [lastQrFetchTime, setLastQrFetchTime] = useState(0);
  
  // Use a ref to track the backend status for interval adjustments
  const pollingIntervalsRef = useRef<{
    status: number | null,
    qrCode: number | null,
  }>({
    status: null,
    qrCode: null
  });
  
  const { addNotification } = useNotificationContext();
  
  const { 
    connectionStatus, 
    deviceInfo, 
    backendError, 
    fetchStatus,
    setConnectionStatus,
    consecutiveErrors
  } = useWhatsAppConnectionStatus(instanceId);
  
  const { fetchQrCode } = useWhatsAppQRCode(instanceId);
  const { initiateConnection, disconnectWhatsApp } = useWhatsAppActions(instanceId);

  // Initial fetch of status on component mount - only once
  useEffect(() => {
    fetchStatus();
    // We're intentionally only running this on mount and instanceId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  // Function to fetch QR code with rate limiting and error handling
  const fetchQrCodeWithRateLimit = useCallback(async () => {
    // WPPConnect optimization: Only fetch QR code when in connecting state
    if (connectionStatus !== 'connecting') {
      return;
    }
    
    // Rate limiting - only fetch QR code every 15 seconds maximum
    // (Increased from 10 seconds since WPPConnect has better session persistence)
    const now = Date.now();
    if (now - lastQrFetchTime < 15000) {
      return;
    }
    
    setLastQrFetchTime(now);
    setQrCodeAttempts(prev => prev + 1);
    
    try {
      const newQrCode = await fetchQrCode();
      if (newQrCode) {
        setQrCode(newQrCode);
        // Reset attempts on success
        setQrCodeAttempts(0);
      } else if (connectionStatus === 'connecting') {
        // Only show warning if still in connecting state and no QR after multiple attempts
        if (qrCodeAttempts > 2) {
          // Reduced from 3 to 2 attempts since WPPConnect may be restoring session
          addNotification(
            'Verificando sessão existente',
            'Sistema está verificando se existe uma sessão salva. Aguarde um momento.',
            'info',
            'low'  // Changed from 'medium' to 'low'
          );
        }
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      if (qrCodeAttempts > 2) {
        addNotification(
          'Erro ao gerar QR Code',
          'Houve um erro ao gerar o QR code. O sistema pode estar restaurando uma sessão anterior.',
          'warning',
          'low'  // Changed from 'medium' to 'low'
        );
      }
    }
  }, [fetchQrCode, lastQrFetchTime, qrCodeAttempts, addNotification, connectionStatus]);

  // Clear existing intervals when changing states
  const clearPollingIntervals = useCallback(() => {
    if (pollingIntervalsRef.current.status) {
      window.clearInterval(pollingIntervalsRef.current.status);
      pollingIntervalsRef.current.status = null;
    }
    
    if (pollingIntervalsRef.current.qrCode) {
      window.clearInterval(pollingIntervalsRef.current.qrCode);
      pollingIntervalsRef.current.qrCode = null;
    }
  }, []);

  // Adaptive polling based on backend status and connection state
  useEffect(() => {
    // Clear any existing intervals when state changes
    clearPollingIntervals();
    
    // Calculate polling intervals based on backend status and consecutive errors
    const getPollingIntervals = () => {
      // If backend is having issues, increase the interval based on consecutive errors
      if (backendError) {
        // Start with 15 seconds, then increase up to 60 seconds maximum
        const baseDelay = Math.min(15000 * Math.pow(1.5, consecutiveErrors), 60000);
        return {
          statusInterval: baseDelay,
          qrInterval: baseDelay * 2
        };
      }
      
      // Normal intervals when backend is responding
      return {
        statusInterval: connectionStatus === 'connecting' ? 5000 : 30000,
        qrInterval: 30000
      };
    };
    
    const { statusInterval, qrInterval } = getPollingIntervals();
    
    // Set up new intervals based on connection status and backend health
    if (connectionStatus === 'connecting') {
      // Initial QR code fetch
      fetchQrCodeWithRateLimit();
      
      // Set new polling intervals
      pollingIntervalsRef.current.status = window.setInterval(fetchStatus, statusInterval);
      pollingIntervalsRef.current.qrCode = window.setInterval(fetchQrCodeWithRateLimit, qrInterval);
      
      // After 1 minute, adjust polling frequency to reduce load
      setTimeout(() => {
        clearPollingIntervals();
        
        const slowIntervals = getPollingIntervals();
        const slowStatusInterval = Math.min(slowIntervals.statusInterval * 2, 60000); // Max 60 seconds
        const slowQrInterval = Math.min(slowIntervals.qrInterval * 2, 120000); // Max 2 minutes
        
        pollingIntervalsRef.current.status = window.setInterval(fetchStatus, slowStatusInterval);
        pollingIntervalsRef.current.qrCode = window.setInterval(fetchQrCodeWithRateLimit, slowQrInterval);
      }, 60000);
    } else if (connectionStatus === 'connected') {
      // When connected, only poll status occasionally to verify connection
      pollingIntervalsRef.current.status = window.setInterval(fetchStatus, 30000);
    } else {
      // When disconnected, check status occasionally in case backend comes back
      pollingIntervalsRef.current.status = window.setInterval(fetchStatus, statusInterval);
    }

    return clearPollingIntervals;
  }, [connectionStatus, backendError, fetchStatus, fetchQrCodeWithRateLimit, clearPollingIntervals, consecutiveErrors]);

  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
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
        setQrCode(''); // Clear QR code after disconnection
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

  return {
    connectionStatus,
    qrCode,
    deviceInfo,
    isLoading,
    backendError,
    handleConnect,
    handleQrCodeScanned,
    handleDisconnect
  };
}
