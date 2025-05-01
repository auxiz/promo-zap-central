
import { useState } from 'react';

// Mock QR code image (base64)
const mockQRCode = "data:image/png;base64,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";

export default function useWhatsAppConnection() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [qrCode, setQrCode] = useState(mockQRCode);
  const [deviceInfo, setDeviceInfo] = useState({ name: 'Samsung Galaxy S21', lastConnection: '01/05/2025 08:35' });
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setIsLoading(true);
    
    // Simulate API call to get QR code
    setTimeout(() => {
      setIsLoading(false);
      setQrCode(mockQRCode);
    }, 1500);
  };
  
  const handleQrCodeScanned = () => {
    setConnectionStatus('connected');
  };
  
  const handleDisconnect = () => {
    setIsLoading(true);
    
    // Simulate API call to disconnect
    setTimeout(() => {
      setConnectionStatus('disconnected');
      setIsLoading(false);
    }, 1500);
  };

  return {
    connectionStatus,
    qrCode,
    deviceInfo,
    isLoading,
    handleConnect,
    handleQrCodeScanned,
    handleDisconnect
  };
}
