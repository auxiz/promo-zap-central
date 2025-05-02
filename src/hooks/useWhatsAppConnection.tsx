
// Replace with your actual VPS IPv4 address and port
const API_BASE = 'http://168.231.98.177:4000';

import { useState, useEffect, useCallback } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';

// API endpoint base URL
const API_BASE_URL = `${API_BASE}/api/whatsapp`;

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [qrCode, setQrCode] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({ name: '', lastConnection: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState(false);
  
  const { addNotification } = useNotificationContext();

  // Function to fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status?instanceId=${instanceId}`);
      
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
          
          if (connectionStatus !== 'connected') {
            addNotification(
              'WhatsApp Conectado',
              `Conectado ao dispositivo ${data.device}`,
              'success',
              'high'
            );
          }
        }
      } else if (data.status === 'PENDING') {
        setConnectionStatus('connecting');
      } else {
        if (connectionStatus === 'connected') {
          addNotification(
            'WhatsApp Desconectado',
            'A conexão com o WhatsApp foi perdida',
            'error',
            'high'
          );
        }
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setBackendError(true);
      setConnectionStatus('disconnected');
      
      if (!backendError) {
        addNotification(
          'Erro de API',
          'Não foi possível conectar ao servidor WhatsApp',
          'error',
          'high'
        );
      }
    }
  }, [instanceId, connectionStatus, backendError, addNotification]);

  // Function to fetch QR code
  const fetchQrCode = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qrcode?instanceId=${instanceId}`);
      
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
      addNotification(
        'Erro no QR Code',
        'Não foi possível obter o QR code para conexão',
        'error',
        'high'
      );
    }
  }, [instanceId, addNotification]);

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
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instanceId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchQrCode();
      await fetchStatus();
      
      addNotification(
        'Conexão Iniciada',
        'Escaneie o código QR para conectar o WhatsApp',
        'info',
        'high'
      );
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      addNotification(
        'Falha na Conexão',
        'Não foi possível iniciar a conexão com WhatsApp',
        'error',
        'high'
      );
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
        },
        body: JSON.stringify({ instanceId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setConnectionStatus('disconnected');
      setQrCode('');
      setDeviceInfo({ name: '', lastConnection: '' });
      addNotification(
        'WhatsApp Desconectado',
        'WhatsApp desconectado com sucesso',
        'success',
        'high'
      );
      
      // Clear backend error if successful
      setBackendError(false);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      addNotification(
        'Falha ao Desconectar',
        'Falha ao desconectar WhatsApp',
        'error',
        'high'
      );
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
