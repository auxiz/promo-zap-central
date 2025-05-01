
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

// API endpoint base URL
const API_BASE_URL = 'http://localhost:4000/api/whatsapp';

export default function useWhatsAppConnection() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [qrCode, setQrCode] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({ name: '', lastConnection: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState(false);

  // Function to fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clear any backend error if we got a successful response
      setBackendError(false);

      if (data.status === 'CONNECTED') {
        setConnectionStatus('connected');
        if (data.device) {
          setDeviceInfo({
            name: `WhatsApp (${data.device})`,
            lastConnection: new Date().toLocaleString()
          });
        }
      } else if (data.status === 'PENDING') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setBackendError(true);
      setConnectionStatus('disconnected');
    }
  }, []);

  // Function to fetch QR code
  const fetchQrCode = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qrcode`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clear backend error if successful
      setBackendError(false);
      
      if (data.qr) {
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      setBackendError(true);
    }
  }, []);

  // Initial fetch of status on component mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Periodic status check when in connecting state
  useEffect(() => {
    let statusInterval: number | undefined;
    let qrInterval: number | undefined;

    if (connectionStatus === 'connecting') {
      // Poll for QR code every 5 seconds
      fetchQrCode();
      qrInterval = window.setInterval(fetchQrCode, 5000);
      
      // Also poll for status to detect connection
      statusInterval = window.setInterval(fetchStatus, 3000);
    }

    return () => {
      if (statusInterval) window.clearInterval(statusInterval);
      if (qrInterval) window.clearInterval(qrInterval);
    };
  }, [connectionStatus, fetchQrCode, fetchStatus]);

  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      await fetchQrCode();
      await fetchStatus();
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      toast.error('Falha ao iniciar conexão com WhatsApp');
      setConnectionStatus('disconnected');
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
      const response = await fetch(`${API_BASE_URL}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setConnectionStatus('disconnected');
      setQrCode('');
      setDeviceInfo({ name: '', lastConnection: '' });
      toast.success('WhatsApp desconectado com sucesso');
      
      // Clear backend error if successful
      setBackendError(false);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error('Falha ao desconectar WhatsApp');
      setBackendError(true);
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
