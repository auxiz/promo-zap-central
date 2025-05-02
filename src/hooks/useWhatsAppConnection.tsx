
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
    // Rate limiting - only fetch QR code every 10 seconds maximum
    const now = Date.now();
    if (now - lastQrFetchTime < 10000) {
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
      } else {
        // Handle empty QR code
        if (qrCodeAttempts > 3) {
          addNotification(
            'QR Code não disponível',
            'Não foi possível obter um novo QR code. Tente novamente mais tarde.',
            'warning',
            'high'
          );
        }
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      if (qrCodeAttempts > 3) {
        addNotification(
          'Erro ao gerar QR Code',
          'Houve um erro ao gerar o QR code. O sistema pode estar sobrecarregado.',
          'error',
          'high'
        );
      }
    }
  }, [fetchQrCode, lastQrFetchTime, qrCodeAttempts, addNotification]);

  // Periodic status check when in connecting state
  useEffect(() => {
    let statusInterval: number | undefined;
    let qrInterval: number | undefined;

    if (connectionStatus === 'connecting') {
      // Initial QR code fetch
      fetchQrCodeWithRateLimit();
      
      // Poll for QR code every 20 seconds (reduced frequency)
      qrInterval = window.setInterval(fetchQrCodeWithRateLimit, 20000);
      
      // Poll for status to detect connection
      statusInterval = window.setInterval(fetchStatus, 5000);
      
      // After 2 minutes (120000ms), slow down polling to reduce load
      setTimeout(() => {
        if (qrInterval) {
          window.clearInterval(qrInterval);
          qrInterval = window.setInterval(fetchQrCodeWithRateLimit, 30000); // 30 seconds
        }
        if (statusInterval) {
          window.clearInterval(statusInterval);
          statusInterval = window.setInterval(fetchStatus, 10000); // 10 seconds
        }
      }, 120000);
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
      await fetchQrCodeWithRateLimit();
      await fetchStatus();
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
    // This is a no-op in the real implementation as the backend
    // will automatically detect when the QR code is scanned
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
