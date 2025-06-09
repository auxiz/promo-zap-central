
import { useRef, useCallback } from 'react';
import { CONNECTION_CONFIG } from './config/connectionConfig';

interface UseWhatsAppPollingProps {
  backendError: boolean;
  connectionStatus: string;
  consecutiveErrors: number;
}

export function useWhatsAppPolling({ backendError, connectionStatus, consecutiveErrors }: UseWhatsAppPollingProps) {
  const pollingIntervalsRef = useRef<{
    status: number | null;
    qrCode: number | null;
  }>({
    status: null,
    qrCode: null
  });

  // Improved polling intervals for better QR scanning experience
  const getPollingIntervals = useCallback(() => {
    // If backend is having issues, drastically increase the interval
    if (backendError) {
      const calculatedDelay = CONNECTION_CONFIG.basePollingInterval * 5 * Math.pow(2, Math.min(consecutiveErrors, 4));
      const baseDelay = Math.min(calculatedDelay, CONNECTION_CONFIG.maxPollingInterval);
      
      return {
        statusInterval: baseDelay,
        qrInterval: baseDelay * 3 // Even less frequent for QR code
      };
    }
    
    // More responsive intervals when backend is responding
    switch (connectionStatus) {
      case 'connecting':
        return {
          statusInterval: CONNECTION_CONFIG.basePollingInterval, // 10 seconds when connecting
          qrInterval: CONNECTION_CONFIG.qrPollingInterval // 15 seconds for QR updates
        };
      
      case 'connected':
        return {
          statusInterval: CONNECTION_CONFIG.connectedPollingInterval, // 2 minutes when connected
          qrInterval: CONNECTION_CONFIG.connectedPollingInterval * 2 // 4 minutes for QR (not needed when connected)
        };
      
      default: // disconnected
        return {
          statusInterval: CONNECTION_CONFIG.basePollingInterval * 2, // 20 seconds when disconnected
          qrInterval: CONNECTION_CONFIG.basePollingInterval * 4 // 40 seconds for QR when disconnected
        };
    }
  }, [backendError, connectionStatus, consecutiveErrors]);

  // Clear existing intervals when changing states
  const clearPollingIntervals = useCallback(() => {
    if (pollingIntervalsRef.current.status) {
      window.clearInterval(pollingIntervalsRef.current.status);
      pollingIntervalsRef.current.status = null;
    }
    
    if (pollingIntervalsRef.current.qrCode) {
      window.clearInterval(pollingIntervalsRef.current.qrCode);
      pollingIntervalsRef.current.qrCode = null;
    }
  }, []);

  const setStatusPollingInterval = useCallback((callback: () => void, interval: number) => {
    clearPollingIntervals();
    pollingIntervalsRef.current.status = window.setInterval(callback, interval);
  }, [clearPollingIntervals]);

  const setQrCodePollingInterval = useCallback((callback: () => void, interval: number) => {
    if (pollingIntervalsRef.current.qrCode) {
      window.clearInterval(pollingIntervalsRef.current.qrCode);
    }
    pollingIntervalsRef.current.qrCode = window.setInterval(callback, interval);
  }, []);

  return {
    getPollingIntervals,
    clearPollingIntervals,
    setStatusPollingInterval,
    setQrCodePollingInterval
  };
}
