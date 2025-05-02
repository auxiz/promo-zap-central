
import { useState, useEffect } from 'react';
import { useWhatsAppConnectionStatus } from './whatsapp/useWhatsAppConnectionStatus';
import { useWhatsAppQRCode } from './whatsapp/useWhatsAppQRCode';
import { useWhatsAppActions } from './whatsapp/useWhatsAppActions';

export default function useWhatsAppConnection(instanceId: string = 'default') {
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    connectionStatus, 
    deviceInfo, 
    backendError, 
    fetchStatus,
    setConnectionStatus
  } = useWhatsAppConnectionStatus(instanceId);
  
  const { fetchQrCode } = useWhatsAppQRCode(instanceId);
  const { initiateConnection, disconnectWhatsApp } = useWhatsAppActions(instanceId);

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
      const updateQRCode = async () => {
        const newQrCode = await fetchQrCode();
        if (newQrCode) {
          setQrCode(newQrCode);
        }
      };
      
      updateQRCode();
      qrInterval = window.setInterval(updateQRCode, 5000);
      
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
      await initiateConnection();
      const newQrCode = await fetchQrCode();
      if (newQrCode) {
        setQrCode(newQrCode);
      }
      await fetchStatus();
    } catch (error) {
      console.error('Error in connect flow:', error);
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
      const success = await disconnectWhatsApp();
      if (success) {
        setConnectionStatus('disconnected');
        setQrCode('');
      }
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
