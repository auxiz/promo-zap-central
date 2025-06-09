
import { useCallback } from 'react';
import { WHATSAPP_API_BASE_URL } from '@/utils/api-constants';

export function useWhatsAppQRCode(instanceId: string = 'default') {
  const fetchQrCode = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE_URL}/instances/${instanceId}/qrcode`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch QR code for instance ${instanceId}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.warn(`QR code error for instance ${instanceId}:`, data.error);
        return null;
      }
      
      return data.qr || null;
    } catch (error) {
      console.error(`Error fetching QR code for instance ${instanceId}:`, error);
      return null;
    }
  }, [instanceId]);

  return { fetchQrCode };
}
