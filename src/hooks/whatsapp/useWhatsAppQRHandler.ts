
import { useState, useCallback } from 'react';
import { useWhatsAppQRCode } from './useWhatsAppQRCode';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CONNECTION_CONFIG } from './config/connectionConfig';

export function useWhatsAppQRHandler(instanceId: string, connectionStatus: string) {
  const [qrCode, setQrCode] = useState('');
  const [qrCodeAttempts, setQrCodeAttempts] = useState(0);
  const [lastQrFetchTime, setLastQrFetchTime] = useState(0);
  
  const { addNotification } = useNotificationContext();
  const { fetchQrCode } = useWhatsAppQRCode(instanceId);

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
            'silent'
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
          'silent'
        );
      }
    }
  }, [fetchQrCode, lastQrFetchTime, qrCodeAttempts, addNotification, connectionStatus]);

  const resetQrState = useCallback(() => {
    setQrCode('');
    setQrCodeAttempts(0);
  }, []);

  return {
    qrCode,
    qrCodeAttempts,
    fetchQrCodeWithRateLimit,
    resetQrState
  };
}
