
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWhatsAppConnectionStatus } from './whatsapp/useWhatsAppConnectionStatus';
import { useWhatsAppQRCode } from './whatsapp/useWhatsAppQRCode';
import { useWhatsAppActions } from './whatsapp/useWhatsAppActions';
import { useNotificationContext } from '@/contexts/NotificationContext';

// Configuration for connection attempts
const CONNECTION_CONFIG = {
  maxStatusAttempts: 30,      // Maximum number of times to check status before giving up
  maxQrAttempts: 10,          // Maximum number of QR code fetch attempts
  basePollingInterval: 5000,  // Base polling interval when everything is normal (5 seconds)
  maxPollingInterval: 300000, // Maximum polling interval when backend is down (5 minutes)
  reconnectLimit: 5,          // Number of automatic reconnection attempts
};

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeAttempts, setQrCodeAttempts] = useState(0);
  const [lastQrFetchTime, setLastQrFetchTime] = useState(0);
  const [statusAttempts, setStatusAttempts] = useState(0);
  
  // Use refs to track polling state and intervals
  const pollingIntervalsRef = useRef<{
    status: number | null,
    qrCode: number | null,
  }>({
    status: null,
    qrCode: null
  });
  
  // Track reconnection attempts
  const reconnectAttemptsRef = useRef<number>(0);
  
  const { addNotification, resetSnooze } = useNotificationContext();
  
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
    // Only fetch QR code when in connecting state
    if (connectionStatus !== 'connecting') {
      return;
    }
    
    // Check if we've reached the maximum number of attempts
    if (qrCodeAttempts >= CONNECTION_CONFIG.maxQrAttempts) {
      console.log(`Reached maximum QR code fetch attempts (${CONNECTION_CONFIG.maxQrAttempts}). Giving up.`);
      return;
    }
    
    // Rate limiting - only fetch QR code every 30 seconds maximum
    const now = Date.now();
    if (now - lastQrFetchTime < 30000) {
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
          addNotification(
            'Verificando sessão existente',
            'Sistema está verificando se existe uma sessão salva. Aguarde um momento.',
            'info',
            'silent'  // Changed from 'low' to 'silent' to prevent toasts
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
          'silent'  // Changed from 'low' to 'silent' to prevent toasts
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
        // Start with 15 seconds, then increase exponentially up to maximum interval
        const calculatedDelay = CONNECTION_CONFIG.basePollingInterval * 3 * Math.pow(2, Math.min(consecutiveErrors, 6));
        const baseDelay = Math.min(calculatedDelay, CONNECTION_CONFIG.maxPollingInterval);
        
        return {
          statusInterval: baseDelay,
          qrInterval: baseDelay * 2
        };
      }
      
      // Normal intervals when backend is responding
      return {
        statusInterval: connectionStatus === 'connecting' ? 
          CONNECTION_CONFIG.basePollingInterval : 
          CONNECTION_CONFIG.basePollingInterval * 6,
        qrInterval: CONNECTION_CONFIG.basePollingInterval * 6
      };
    };
    
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
      pollingIntervalsRef.current.status = window.setInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
      
      pollingIntervalsRef.current.qrCode = window.setInterval(fetchQrCodeWithRateLimit, qrInterval);
    } else if (connectionStatus === 'connected') {
      // When connected, only poll status occasionally to verify connection
      setStatusAttempts(0); // Reset attempts counter when successfully connected
      resetSnooze('error', 'Erro de API'); // Reset API error snooze when connected
      
      pollingIntervalsRef.current.status = window.setInterval(() => {
        fetchStatus();
      }, 60000); // Check once per minute when connected
    } else {
      // When disconnected, check status occasionally in case backend comes back
      pollingIntervalsRef.current.status = window.setInterval(() => {
        setStatusAttempts(prev => prev + 1);
        fetchStatus();
      }, statusInterval);
    }

    return clearPollingIntervals;
  }, [connectionStatus, backendError, fetchStatus, fetchQrCodeWithRateLimit, clearPollingIntervals, consecutiveErrors, statusAttempts, addNotification, resetSnooze]);

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
        setQrCode(''); // Clear QR code after disconnection
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
