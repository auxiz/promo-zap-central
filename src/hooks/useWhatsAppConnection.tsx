
import { useState, useEffect, useCallback } from 'react';
import { useWhatsAppConnectionStatus } from './whatsapp/useWhatsAppConnectionStatus';
import { useWhatsAppQRCode } from './whatsapp/useWhatsAppQRCode';
import { useWhatsAppActions } from './whatsapp/useWhatsAppActions';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeAttempts, setQrCodeAttempts] = useState(0);
  const [lastQrFetchTime, setLastQrFetchTime] = useState(0);
  
  const { addNotification } = useNotificationContext();
  
  const { 
    connectionStatus, 
    deviceInfo, 
    backendError, 
    fetchStatus,
    setConnectionStatus
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

  // Periodic status check when in connecting state - optimized for WPPConnect
  useEffect(() => {
    let statusInterval: number | undefined;
    let qrInterval: number | undefined;

    if (connectionStatus === 'connecting') {
      // Initial QR code fetch
      fetchQrCodeWithRateLimit();
      
      // Poll for QR code every 30 seconds (reduced frequency for WPPConnect)
      // WPPConnect has better session management so we don't need to poll as frequently
      qrInterval = window.setInterval(fetchQrCodeWithRateLimit, 30000);
      
      // Poll for status to detect connection
      statusInterval = window.setInterval(fetchStatus, 5000);
      
      // After 1 minute (60000ms), slow down polling to reduce load
      // Reduced from 2 minutes since WPPConnect resolves sessions faster
      setTimeout(() => {
        if (qrInterval) {
          window.clearInterval(qrInterval);
          qrInterval = window.setInterval(fetchQrCodeWithRateLimit, 60000); // 60 seconds
        }
        if (statusInterval) {
          window.clearInterval(statusInterval);
          statusInterval = window.setInterval(fetchStatus, 15000); // 15 seconds
        }
      }, 60000);
    }

    return () => {
      if (statusInterval) window.clearInterval(statusInterval);
      if (qrInterval) window.clearInterval(qrInterval);
    };
  }, [connectionStatus, fetchQrCodeWithRateLimit, fetchStatus]);

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
