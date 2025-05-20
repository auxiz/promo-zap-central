
import { useRef, useCallback } from 'react';
import { CONNECTION_CONFIG } from './config/connectionConfig';

interface UseWhatsAppPollingProps {
  backendError: boolean;
  connectionStatus: string;
  consecutiveErrors: number;
}

export function useWhatsAppPolling({ backendError, connectionStatus, consecutiveErrors }: UseWhatsAppPollingProps) {
  // Use refs to track polling state and intervals
  const pollingIntervalsRef = useRef<{
    status: number | null;
    qrCode: number | null;
  }>({
    status: null,
    qrCode: null
  });

  // Calculate polling intervals based on backend status and connection state
  const getPollingIntervals = useCallback(() => {
    // If backend is having issues, increase the interval based on consecutive errors
    if (backendError) {
      // Start with 15 seconds, then increase exponentially up to maximum interval
      const calculatedDelay = CONNECTION_CONFIG.basePollingInterval * 3 * Math.pow(2, Math.min(consecutiveErrors, 6));
      const baseDelay = Math.min(calculatedDelay, CONNECTION_CONFIG.maxPollingInterval);
      
      return {
        statusInterval: baseDelay,
        qrInterval: baseDelay * 2
      };
    }
    
    // Normal intervals when backend is responding
    return {
      statusInterval: connectionStatus === 'connecting' ? 
        CONNECTION_CONFIG.basePollingInterval : 
        CONNECTION_CONFIG.basePollingInterval * 6,
      qrInterval: CONNECTION_CONFIG.basePollingInterval * 6
    };
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
