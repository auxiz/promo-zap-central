
import { useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppQRCode(instanceId: string = 'default') {
  const { addNotification } = useNotificationContext();

  // Function to fetch QR code
  const fetchQrCode = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/qrcode?instanceId=${instanceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.qr) {
        return data.qr;
      }
      return '';
    } catch (error) {
      console.error('Error fetching QR code:', error);
      addNotification(
        'Erro no QR Code',
        'Não foi possível obter o QR code para conexão',
        'error',
        'high'
      );
      return '';
    }
  }, [instanceId, addNotification]);

  return { fetchQrCode };
}
