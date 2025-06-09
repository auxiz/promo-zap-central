
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

  // Function to fetch QR code with improved rate limiting for better UX
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
    
    // Rate limiting - reduced to 15 seconds for better QR refresh experience
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
        console.log(`QR code updated for instance ${instanceId}, attempt ${qrCodeAttempts + 1}`);
      } else if (connectionStatus === 'connecting') {
        // Only show info if still in connecting state and no QR after few attempts
        if (qrCodeAttempts > 3) {
          addNotification(
            'Verificando sessão existente',
            'Sistema está verificando se existe uma sessão salva. O QR code ficará disponível por 5 minutos.',
            'info',
            'silent'
          );
        }
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      if (qrCodeAttempts > 3) {
        addNotification(
          'QR Code em preparação',
          'Aguarde alguns segundos. O QR code ficará disponível por 5 minutos para escaneamento confortável.',
          'warning',
          'silent'
        );
      }
    }
  }, [fetchQrCode, lastQrFetchTime, qrCodeAttempts, addNotification, connectionStatus, instanceId]);

  const resetQrState = useCallback(() => {
    setQrCode('');
    setQrCodeAttempts(0);
    setLastQrFetchTime(0);
  }, []);

  return {
    qrCode,
    qrCodeAttempts,
    fetchQrCodeWithRateLimit,
    resetQrState
  };
}
